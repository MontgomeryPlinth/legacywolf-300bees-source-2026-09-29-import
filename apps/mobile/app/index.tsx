import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Button } from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { useState } from "react";
import { useSession } from "../src/auth/session";
import { Check } from "lucide-react-native";

// Entry — replacement authorized by Phase 1 rule 3.
export default function EntryScreen() {
  const { biometricEnabled, quickUnlock } = useSession();
  const [error, setError] = useState<string | null>(null);
  async function unlock() {
    setError(null);
    try {
      await quickUnlock();
      router.replace("/user/home");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Quick unlock could not be completed.",
      );
    }
  }
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.brand}>LEGACY WOLF</Text>
        <View style={styles.hero}>
          <Text style={styles.title}>LEGACY{"\n"}WOLF</Text>
          <Text style={styles.tagline}>
            Protection for people who live alone. We act when you can’t.
          </Text>
        </View>
        <View style={styles.features}>
          {["Motion Timer — we check in on you daily", "Attend & Check — a responder at your door", "Pet Guardian — your pet is cared for too"].map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.checkCircle}><Check color={colors.guardianGreen} size={13} strokeWidth={3} /></View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.trial}>4-week free trial. No charge today.</Text>
        <View style={styles.actions}>
          {biometricEnabled ? (
            <Button onPress={unlock}>Quick unlock</Button>
          ) : null}
          <Button onPress={() => router.push("/signup")}>
            Sign up  →
          </Button>
          <Button onPress={() => router.push("/login")} variant="ghost">Already a member? Sign in</Button>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.obsidian, flex: 1 },
  content: { alignSelf: "center", flex: 1, maxWidth: 480, padding: spacing[6], width: "100%" },
  brand: { ...typography.label, color: colors.guardianGreen, fontWeight: "900" },
  hero: { marginTop: spacing[12] },
  title: { ...typography.displayL, color: colors.white },
  tagline: {
    ...typography.body,
    color: colors.mist,
    marginTop: spacing[3],
  },
  features: { gap: spacing[3], marginTop: spacing[8] },
  featureRow: { alignItems: "center", flexDirection: "row", gap: spacing[3] },
  checkCircle: { alignItems: "center", backgroundColor: colors.onyx, borderRadius: radii.pill, height: 20, justifyContent: "center", width: 20 },
  featureText: { ...typography.bodySmall, color: colors.mist, flex: 1 },
  trial: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[8] },
  actions: { gap: spacing[2], marginTop: "auto", paddingTop: spacing[8] },
  error: {
    ...typography.bodySmall,
    color: colors.ember,
    textAlign: "center",
  },
});
