import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";

export function AuthShell({
  children,
  eyebrow = "Legacy Wolf",
  onBack,
  footer,
  headerAccessory,
  scrollResetKey,
}: PropsWithChildren<{
  eyebrow?: string;
  onBack?: () => void;
  footer?: ReactNode;
  headerAccessory?: ReactNode;
  scrollResetKey?: string | number;
}>) {
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ animated: false, y: 0 });
  }, [scrollResetKey]);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onBack ?? (() => router.back())}
          style={styles.back}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <View style={styles.spacer} />
      </View>
      {headerAccessory}
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

export function Choice({
  selected,
  title,
  body,
  onPress,
}: {
  selected: boolean;
  title: string;
  body?: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <View style={styles.choiceText}>
        <Text style={styles.choiceTitle}>{title}</Text>
        {body ? <Text style={styles.choiceBody}>{body}</Text> : null}
      </View>
    </Pressable>
  );
}

export const authStyles = StyleSheet.create({
  title: {
    ...typography.displayM,
    color: colors.white,
    marginBottom: spacing[3],
  },
  heading: { ...typography.heading, color: colors.white },
  body: { ...typography.body, color: colors.mist },
  small: { ...typography.bodySmall, color: colors.mist },
  error: { ...typography.bodySmall, color: colors.ember },
  stack: { gap: spacing[4] },
  compactStack: { gap: spacing[3] },
  actions: { gap: spacing[3], marginTop: spacing[6] },
});
const styles = StyleSheet.create({
  safe: { backgroundColor: colors.obsidian, flex: 1 },
  top: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: spacing[3],
    maxWidth: 480,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    width: "100%",
  },
  back: {
    alignItems: "center",
    borderColor: colors.coal,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  backText: { color: colors.mist, fontSize: 20, lineHeight: 24 },
  eyebrow: {
    ...typography.label,
    color: colors.guardianGreen,
    flex: 1,
    textAlign: "left",
    textTransform: "uppercase",
  },
  spacer: { width: 40 },
  content: {
    alignSelf: "center",
    maxWidth: 480,
    padding: spacing[6],
    paddingBottom: spacing[16],
    width: "100%",
  },
  choice: {
    alignItems: "center",
    backgroundColor: colors.graphite,
    borderColor: colors.coal,
    borderRadius: radii.card,
    borderWidth: 2,
    flexDirection: "row",
    gap: spacing[3],
    padding: spacing[4],
  },
  choiceSelected: { borderColor: colors.guardianGreen },
  radio: {
    borderColor: colors.slate,
    borderRadius: radii.pill,
    borderWidth: 2,
    height: 20,
    width: 20,
  },
  radioSelected: {
    backgroundColor: colors.guardianGreen,
    borderColor: colors.guardianGreen,
  },
  choiceText: { flex: 1 },
  choiceTitle: { ...typography.heading, color: colors.white },
  choiceBody: {
    ...typography.bodySmall,
    color: colors.mist,
    marginTop: spacing[1],
  },
});
