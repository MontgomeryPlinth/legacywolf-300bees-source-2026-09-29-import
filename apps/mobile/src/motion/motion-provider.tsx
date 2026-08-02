import { useEffect, useRef, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import { Accelerometer, type AccelerometerMeasurement } from "expo-sensors";
import { enqueueHeartbeat } from "./heartbeat";
import { registerAuxiliaryWakeSignals, registerHeartbeatSync } from "./background";
import { startProtectionService } from "./foreground-service";
const BASELINE_MS = 5_000;
const BURST_MS = 100;
const THRESHOLD = 0.18;
export function MotionProvider({ children }: PropsWithChildren) {
  const previous = useRef<AccelerometerMeasurement | null>(null);
  const confirming = useRef(false);
  const burstHits = useRef(0);
  const lastSent = useRef(0);
  useEffect(() => {
    if (Platform.OS === "web") return;
    startProtectionService();
    void registerHeartbeatSync();
    void registerAuxiliaryWakeSignals();
    Accelerometer.setUpdateInterval(BASELINE_MS);
    const subscription = Accelerometer.addListener((sample) => {
      const before = previous.current;
      previous.current = sample;
      if (!before) return;
      const delta =
        Math.abs(sample.x - before.x) +
        Math.abs(sample.y - before.y) +
        Math.abs(sample.z - before.z);
      if (delta > THRESHOLD && !confirming.current) {
        confirming.current = true;
        burstHits.current = 0;
        Accelerometer.setUpdateInterval(BURST_MS);
        return;
      }
      if (confirming.current) {
        if (delta > THRESHOLD / 2) burstHits.current += 1;
        if (burstHits.current >= 2) {
          confirming.current = false;
          Accelerometer.setUpdateInterval(BASELINE_MS);
          if (Date.now() - lastSent.current > 30_000) {
            lastSent.current = Date.now();
            void enqueueHeartbeat("motion");
          }
        } else if (delta < THRESHOLD / 4) {
          confirming.current = false;
          Accelerometer.setUpdateInterval(BASELINE_MS);
        }
      }
    });
    return () => subscription.remove();
  }, []);
  return children;
}
