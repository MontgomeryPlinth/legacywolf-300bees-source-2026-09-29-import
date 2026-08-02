import { Slot, router, usePathname } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
const tabs = [
  ["Shift", "/responder/shift"],
  ["Dispatch", "/responder/dispatch"],
  ["Report", "/responder/report"],
  ["Account", "/responder/account"],
] as const;
export default function Layout() {
  const path = usePathname();
  return (
    <SafeAreaView style={s.root}>
      <View style={s.body}>
        <Slot />
      </View>
      <View style={s.nav}>
        {tabs.map(([label, href]) => (
          <Pressable key={href} onPress={() => router.push(href)} style={s.tab}>
            <Text style={[s.label, path === href && s.active]}>
              {label.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  body: { flex: 1 },
  nav: {
    backgroundColor: colors.graphite,
    borderTopColor: colors.coal,
    borderTopWidth: 1,
    flexDirection: "row",
  },
  tab: { alignItems: "center", flex: 1, padding: spacing[4] },
  label: { ...typography.label, color: colors.slate },
  active: { color: colors.guardianGreen },
});
