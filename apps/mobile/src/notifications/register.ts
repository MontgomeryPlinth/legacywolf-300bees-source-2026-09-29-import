import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as SecureStore from "../storage/secure";
import { deviceId } from "../motion/heartbeat";

export async function registerPushNotifications(apiUrl: string) {
  if (Platform.OS === "web") return;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!projectId) return;
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return;
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("protection", { name: "Protection alerts", importance: Notifications.AndroidImportance.HIGH });
  const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const accessToken = await SecureStore.getItemAsync("legacy-wolf-access-token");
  if (!accessToken) return;
  await fetch(`${apiUrl}/v1/notifications/device`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ deviceId: await deviceId(), pushToken }) });
}
