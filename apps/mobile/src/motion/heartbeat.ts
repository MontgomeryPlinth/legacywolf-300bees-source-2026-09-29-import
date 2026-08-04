import * as SecureStore from "../storage/secure";
import * as Crypto from "expo-crypto";
import * as Network from "expo-network";
import {
  base64,
  fromBase64,
  keyPairFromPrivateBytes,
  keyPairFromSeed,
  publicKeyPem,
  signPayload,
} from "./device-crypto";
export type SignalType = "motion" | "checkin" | "app_open";
export interface QueuedHeartbeat {
  deviceId: string;
  recordedAt: string;
  signalType: SignalType;
  nonce: string;
  signature: string;
}
export interface HeartbeatEvent {
  delivered: boolean;
  recordedAt: string;
  signalType: SignalType;
}
const listeners = new Set<(event: HeartbeatEvent) => void>();
const QUEUE_KEY = "legacy-wolf-heartbeats";
const DEVICE_KEY = "legacy-wolf-device-id";
const PRIVATE_KEY = "legacy-wolf-device-private-key";
const PUBLIC_KEY = "legacy-wolf-device-public-key";
export function subscribeToHeartbeats(listener: (event: HeartbeatEvent) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
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
  const value = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_KEY, value);
  return value;
}
async function keys() {
  const storedPrivate = await SecureStore.getItemAsync(PRIVATE_KEY);
  if (storedPrivate) {
    const pair = keyPairFromPrivateBytes(fromBase64(storedPrivate));
    if (pair) {
      const pem = publicKeyPem(pair.publicKey);
      await SecureStore.setItemAsync(PUBLIC_KEY, pem);
      return { secretKey: pair.secretKey, publicKeyPem: pem };
    }
  }

  const pair = keyPairFromSeed(Crypto.getRandomBytes(32));
  const pem = publicKeyPem(pair.publicKey);
  await SecureStore.setItemAsync(PRIVATE_KEY, base64(pair.secretKey));
  await SecureStore.setItemAsync(PUBLIC_KEY, pem);
  return { secretKey: pair.secretKey, publicKeyPem: pem };
}
export async function devicePublicKey() {
  return (await keys()).publicKeyPem;
}
async function sign(payload: string) {
  const { secretKey } = await keys();
  return signPayload(payload, secretKey);
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
  const delivered = await flushHeartbeats();
  const event = { delivered, recordedAt, signalType };
  for (const listener of listeners) listener(event);
  return delivered;
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
