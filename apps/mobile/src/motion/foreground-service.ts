import { NativeModules, Platform } from "react-native";

interface ForegroundServiceModule { start(): void; stop(): void }

const service = NativeModules.LegacyWolfForegroundService as ForegroundServiceModule | undefined;

export function startProtectionService() {
  if (Platform.OS === "android") service?.start();
}

export function stopProtectionService() {
  if (Platform.OS === "android") service?.stop();
}
