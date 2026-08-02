import * as SecureStore from "../storage/secure";
import * as Network from "expo-network";
export type SignalType = "motion" | "checkin" | "app_open";
export interface QueuedHeartbeat {
  deviceId: string;
  recordedAt: string;
  signalType: SignalType;
  nonce: string;
  signature: string;
}
const QUEUE_KEY = "legacy-wolf-heartbeats";
const DEVICE_KEY = "legacy-wolf-device-id";
const PRIVATE_KEY = "legacy-wolf-device-private-key";
const PUBLIC_KEY = "legacy-wolf-device-public-key";
async function readQueue() {
  const raw = await SecureStore.getItemAsync(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedHeartbeat[];
  } catch {
    return [];
  }
}
async function writeQueue(value: QueuedHeartbeat[]) {
  await SecureStore.setItemAsync(QUEUE_KEY, JSON.stringify(value.slice(-200)));
}
export async function deviceId() {
  const current = await SecureStore.getItemAsync(DEVICE_KEY);
  if (current) return current;
  const value =
    globalThis.crypto?.randomUUID?.() ??
    `00000000-0000-4000-8000-${String(Date.now()).slice(-12)}`;
  await SecureStore.setItemAsync(DEVICE_KEY, value);
  return value;
}
function base64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary);
}
function fromBase64(value: string) {
  const binary = globalThis.atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
async function keys() {
  const storedPrivate = await SecureStore.getItemAsync(PRIVATE_KEY);
  const storedPublic = await SecureStore.getItemAsync(PUBLIC_KEY);
  if (storedPrivate && storedPublic) {
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      fromBase64(storedPrivate),
      { name: "Ed25519" },
      false,
      ["sign"],
    );
    return { privateKey, publicKeyPem: storedPublic };
  }
  const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ]);
  const privateBytes = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", pair.privateKey),
  );
  const publicBytes = new Uint8Array(
    await crypto.subtle.exportKey("spki", pair.publicKey),
  );
  const encoded = base64(publicBytes);
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${encoded.match(/.{1,64}/g)?.join("\n") ?? encoded}\n-----END PUBLIC KEY-----`;
  await SecureStore.setItemAsync(PRIVATE_KEY, base64(privateBytes));
  await SecureStore.setItemAsync(PUBLIC_KEY, publicKeyPem);
  return { privateKey: pair.privateKey, publicKeyPem };
}
export async function devicePublicKey() {
  return (await keys()).publicKeyPem;
}
async function sign(payload: string) {
  const { privateKey } = await keys();
  return base64(
    new Uint8Array(
      await crypto.subtle.sign(
        "Ed25519",
        privateKey,
        new TextEncoder().encode(payload),
      ),
    ),
  );
}
export async function enqueueHeartbeat(signalType: SignalType) {
  const id = await deviceId();
  const recordedAt = new Date().toISOString();
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const payload = `${id}.${recordedAt}.${signalType}.${nonce}`;
  const item = {
    deviceId: id,
    recordedAt,
    signalType,
    nonce,
    signature: await sign(payload),
  };
  await writeQueue([...(await readQueue()), item]);
  await flushHeartbeats();
}
export async function flushHeartbeats() {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) return false;
  const base = process.env.EXPO_PUBLIC_API_URL;
  const token = await SecureStore.getItemAsync("legacy-wolf-access-token");
  if (!base || !token) return false;
  const queue = await readQueue();
  const retained: QueuedHeartbeat[] = [];
  for (const item of queue) {
    try {
      const response = await fetch(`${base}/v1/timer/heartbeat`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(item),
      });
      if (!response.ok) retained.push(item);
    } catch {
      retained.push(item);
    }
  }
  await writeQueue(retained);
  return retained.length === 0;
}
