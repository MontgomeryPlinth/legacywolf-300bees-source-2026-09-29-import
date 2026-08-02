import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Button, Card } from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { AuthShell, authStyles } from "../src/auth/auth-shell";
import { useSession } from "../src/auth/session";

export default function BiometricOptInScreen() {
  const { account, completeBiometricPrompt } = useSession();
  const [available, setAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const capability =
    Platform.OS === "ios"
      ? "Face ID or Touch ID"
      : Platform.OS === "android"
        ? "fingerprint or face unlock"
        : "your device security";
  useEffect(() => {
    if (Platform.OS === "web") { setChecking(false); return; }
    void Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]).then(([hardware, enrolled]) => setAvailable(hardware && enrolled)).finally(() => setChecking(false));
  }, []);
  async function finish(enabled: boolean) {
    setError(null);
    if (enabled && available) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Enable biometric quick unlock",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      if (!result.success) { setError("Biometric confirmation was not completed. Try again or choose Not now."); return; }
    }
    completeBiometricPrompt(enabled && available);
    router.replace(account ? "/user/home" : "/login");
  }
  return (
    <AuthShell onBack={() => router.replace(account ? "/user/home" : "/login")}>
      <View style={authStyles.stack}>
        <View style={styles.shield}>
          <Text style={styles.shieldText}>✓</Text>
        </View>
        <View>
          <Text style={authStyles.title}>QUICK UNLOCK</Text>
          <Text style={authStyles.body}>
            Use {capability} to log in next time?
          </Text>
        </View>
        <Card>
          <Text style={styles.cardTitle}>
            Your credentials stay on this device.
          </Text>
          <Text style={authStyles.small}>
            Biometrics unlock a stored session. They are not your primary
            credential and are never sent to Legacy Wolf.
          </Text>
        </Card>
        <View style={authStyles.actions}>
          <Button disabled={checking || !available} onPress={() => finish(true)}>
            Yes, Use Biometrics
          </Button>
          {!available ? (
            <Text style={authStyles.small}>
              Biometric unlock is not enrolled on this device.
            </Text>
          ) : null}
          {error ? <Text accessibilityRole="alert" style={authStyles.error}>{error}</Text> : null}
          <Button onPress={() => finish(false)} variant="secondary">
            Not now
          </Button>
        </View>
      </View>
    </AuthShell>
  );
}
const styles = StyleSheet.create({
  shield: {
    alignItems: "center",
    alignSelf: "center",
    borderColor: colors.guardianGreen,
    borderRadius: radii.card,
    borderWidth: 2,
    height: 80,
    justifyContent: "center",
    width: 72,
  },
  shieldText: { color: colors.guardianGreen, fontSize: 36 },
  cardTitle: {
    ...typography.heading,
    color: colors.white,
    marginBottom: spacing[2],
  },
});
