import { Platform } from "react-native";
import * as NativeSecureStore from "expo-secure-store";

const memory = new Map<string, string>();

function webStorage() {
  return typeof globalThis.sessionStorage === "undefined"
    ? null
    : globalThis.sessionStorage;
}

export async function getItemAsync(key: string) {
  if (Platform.OS !== "web") {
    const scoped = await NativeSecureStore.getItemAsync(key, { keychainService: "com.legacywolf.app.session" });
    if (scoped !== null) return scoped;
    const legacy = await NativeSecureStore.getItemAsync(key);
    if (legacy !== null) {
      await setItemAsync(key, legacy);
      await NativeSecureStore.deleteItemAsync(key);
    }
    return legacy;
  }
  return webStorage()?.getItem(key) ?? memory.get(key) ?? null;
}

export async function setItemAsync(key: string, value: string) {
  if (Platform.OS !== "web") return NativeSecureStore.setItemAsync(key, value, {
    keychainAccessible: NativeSecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    keychainService: "com.legacywolf.app.session",
  });
  const storage = webStorage();
  if (storage) storage.setItem(key, value);
  else memory.set(key, value);
}

export async function deleteItemAsync(key: string) {
  if (Platform.OS !== "web") {
    await Promise.all([
      NativeSecureStore.deleteItemAsync(key, { keychainService: "com.legacywolf.app.session" }),
      NativeSecureStore.deleteItemAsync(key),
    ]);
    return;
  }
  webStorage()?.removeItem(key);
  memory.delete(key);
}
