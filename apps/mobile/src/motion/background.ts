import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { flushHeartbeats } from "./heartbeat";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { enqueueHeartbeat } from "./heartbeat";
export const HEARTBEAT_SYNC_TASK = "legacy-wolf-heartbeat-sync";
export const SIGNIFICANT_LOCATION_TASK = "legacy-wolf-significant-location";
export const SILENT_PUSH_TASK = "legacy-wolf-silent-push";
if (!TaskManager.isTaskDefined(HEARTBEAT_SYNC_TASK)) {
  TaskManager.defineTask(HEARTBEAT_SYNC_TASK, async () =>
    (await flushHeartbeats())
      ? BackgroundTask.BackgroundTaskResult.Success
      : BackgroundTask.BackgroundTaskResult.Failed,
  );
}
if (!TaskManager.isTaskDefined(SIGNIFICANT_LOCATION_TASK)) {
  TaskManager.defineTask(SIGNIFICANT_LOCATION_TASK, async ({ error }) => {
    if (error) return;
    await enqueueHeartbeat("app_open");
  });
}
if (!TaskManager.isTaskDefined(SILENT_PUSH_TASK)) {
  TaskManager.defineTask(SILENT_PUSH_TASK, async () => {
    await enqueueHeartbeat("app_open");
    await flushHeartbeats();
  });
}
export async function registerHeartbeatSync() {
  const registered =
    await TaskManager.isTaskRegisteredAsync(HEARTBEAT_SYNC_TASK);
  if (!registered)
    await BackgroundTask.registerTaskAsync(HEARTBEAT_SYNC_TASK, {
      minimumInterval: 15,
    });
}
export async function registerAuxiliaryWakeSignals() {
  await Notifications.registerTaskAsync(SILENT_PUSH_TASK);
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return;
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted || await Location.hasStartedLocationUpdatesAsync(SIGNIFICANT_LOCATION_TASK)) return;
  await Location.startLocationUpdatesAsync(SIGNIFICANT_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 500,
    deferredUpdatesDistance: 500,
    deferredUpdatesInterval: 15 * 60_000,
    pausesUpdatesAutomatically: true,
    activityType: Location.ActivityType.Other,
    foregroundService: {
      notificationTitle: "Legacy Wolf protection is active",
      notificationBody: "Motion Timer wake signals are enabled.",
    },
  });
}
