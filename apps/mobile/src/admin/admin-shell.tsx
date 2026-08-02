import { useState, type PropsWithChildren } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { router, usePathname } from "expo-router";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
const nav = [
  ["Dashboard", "/admin/dashboard"],
  ["Users", "/admin/users"],
  ["Responders", "/admin/responders"],
  ["Incidents", "/admin/incidents"],
] as const;
export function AdminShell({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  const path = usePathname();
  if (width < 1280)
    return (
      <View style={styles.gate}>
        <Text style={styles.title}>ADMIN REQUIRES A DESKTOP BROWSER</Text>
        <Text style={styles.body}>
          Use a viewport at least 1280 pixels wide.
        </Text>
      </View>
    );
  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>LEGACY WOLF</Text>
        <Text style={styles.kicker}>OPERATIONS</Text>
        {nav.map(([label, href]) => (
          <Pressable
            key={href}
            onPress={() => router.push(href)}
            style={[styles.nav, path === href && styles.navActive]}
          >
            <Text
              style={[styles.navText, path === href && styles.navTextActive]}
            >
              {label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}
export function AdminHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View>
      <Text style={styles.kicker}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1, flexDirection: "row" },
  sidebar: {
    backgroundColor: colors.graphite,
    borderRightColor: colors.coal,
    borderRightWidth: 1,
    gap: spacing[2],
    padding: spacing[6],
    width: 280,
  },
  brand: {
    ...typography.heading,
    color: colors.white,
    marginBottom: spacing[1],
  },
  kicker: {
    ...typography.label,
    color: colors.guardianGreen,
    marginBottom: spacing[6],
  },
  nav: { borderRadius: 8, padding: spacing[4] },
  navActive: { backgroundColor: colors.guardianGreen },
  navText: { ...typography.label, color: colors.mist },
  navTextActive: { color: colors.obsidian },
  content: { gap: spacing[6], padding: spacing[8], width: "100%" },
  gate: {
    alignItems: "center",
    backgroundColor: colors.obsidian,
    flex: 1,
    justifyContent: "center",
    padding: spacing[8],
  },
  title: { ...typography.displayM, color: colors.white },
  body: {
    ...typography.body,
    color: colors.mist,
    marginTop: spacing[2],
    maxWidth: 720,
  },
});
