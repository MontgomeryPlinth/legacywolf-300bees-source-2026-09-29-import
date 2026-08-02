import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { colors } from "@legacy-wolf/tokens";
import { SessionProvider } from "../src/auth/session";
import { MotionProvider } from "../src/motion/motion-provider";

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_900Black,
  });
  if (!loaded) return null;
  return (
    <SessionProvider>
      <MotionProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.obsidian },
            headerShown: false,
          }}
        />
      </MotionProvider>
    </SessionProvider>
  );
}
