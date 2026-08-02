import { type PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
export function ResponderScreen({
  title,
  body,
  children,
}: PropsWithChildren<{ title: string; body: string }>) {
  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View>
        <Text style={s.eyebrow}>RESPONDER</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.body}>{body}</Text>
      </View>
      {children}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  root: { backgroundColor: colors.obsidian },
  content: {
    alignSelf: "center",
    gap: spacing[4],
    maxWidth: 640,
    padding: spacing[4],
    paddingBottom: spacing[16],
    width: "100%",
  },
  eyebrow: { ...typography.label, color: colors.guardianGreen },
  title: { ...typography.displayM, color: colors.white },
  body: { ...typography.body, color: colors.mist, marginTop: spacing[2] },
});
