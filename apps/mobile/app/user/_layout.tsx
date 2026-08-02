import { Slot, router, usePathname } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { Building2, Dog, FileText, Heart, Home, Settings, Users } from "lucide-react-native";

const tabs = [
  { label: "Nest", path: "/user/home", icon: Home },
  { label: "Plan", path: "/user/plan", icon: FileText },
  { label: "People", path: "/user/people", icon: Users },
  { label: "Property", path: "/user/property", icon: Building2 },
  { label: "Pets", path: "/user/pets", icon: Dog },
  { label: "Wishes", path: "/user/wishes", icon: Heart },
] as const;
export default function UserLayout() {
  const pathname = usePathname();
  const accountActive = pathname === "/user/account";
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topMenu}>
        <View style={styles.topSpacer} />
        <Text style={styles.topTitle}>USER</Text>
        <Pressable accessibilityLabel="Account settings" accessibilityRole="button" onPress={() => router.push("/user/account")} style={[styles.accountButton, accountActive && styles.accountButtonActive]}>
          <Settings color={accountActive ? colors.guardianGreen : colors.mist} size={22} strokeWidth={accountActive ? 2.5 : 1.5} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Slot />
      </View>
      <View style={styles.nav}>
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.path}
              onPress={() => router.push(tab.path)}
              style={styles.tab}
            >
              <Icon color={active ? colors.guardianGreen : colors.slate} size={20} strokeWidth={active ? 2.5 : 1.5} />
              <Text
                numberOfLines={1}
                style={[styles.label, active && styles.active]}
              >
                {tab.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  topMenu: { alignItems: "center", backgroundColor: colors.graphite, borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 58, paddingHorizontal: spacing[4] },
  topSpacer: { height: 40, width: 40 },
  topTitle: { ...typography.heading, color: colors.white, fontWeight: "900", letterSpacing: 1 },
  accountButton: { alignItems: "center", borderRadius: 8, height: 40, justifyContent: "center", width: 40 },
  accountButtonActive: { backgroundColor: colors.onyx },
  body: { flex: 1 },
  nav: {
    backgroundColor: colors.graphite,
    borderTopColor: colors.coal,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: spacing[2],
  },
  tab: { alignItems: "center", flex: 1, gap: spacing[1], minWidth: 0, paddingHorizontal: 1, paddingVertical: spacing[2] },
  label: { ...typography.label, color: colors.slate, fontSize: 8 },
  active: { color: colors.guardianGreen },
});
