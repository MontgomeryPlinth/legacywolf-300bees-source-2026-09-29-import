import { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Button, Card, Badge } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { ResponderScreen } from "../../src/responder/screen";
import { useOperationsApi } from "../../src/auth/session";
export default function Shift() {
  const api = useOperationsApi();
  const [shift, setShift] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [dispatches, setDispatches] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { void Promise.all([api.shift(), api.dispatches()]).then(([nextShift, nextDispatches]) => { setShift(nextShift); setDispatches(nextDispatches); }); }, [api]);
  async function toggle() {
    setBusy(true);
    try { setShift(shift ? null : await api.startShift()); if (shift) await api.endShift(); } finally { setBusy(false); }
  }
  return (
    <ResponderScreen
      title="SHIFT"
      body="Go available only when you are ready to accept an authorized dispatch."
    >
      <Card>
        <Badge>{shift ? "On shift" : "Off shift"}</Badge>
        <Text style={s.heading}>{dispatches.some((item) => item.status === "offered") ? "Dispatch waiting for response" : "Ready for dispatch"}</Text>
        <Text style={s.body}>
          Your location and availability are shared only while you are on shift.
        </Text>
        <Button disabled={busy} onPress={() => void toggle()}>{shift ? "End shift" : "Start shift"}</Button>
      </Card>
      <Card><Text style={s.section}>TODAY’S COVERAGE ZONE</Text><View style={s.metrics}><Metric value={shift ? "Active" : "Offline"} label="Availability" /><Metric value={String(dispatches.filter((item) => item.status !== "completed").length)} label="Open dispatches" /></View></Card>
      <Card><Text style={s.section}>TODAY’S ACTIVITY</Text><View style={s.metrics}><Metric value={String(dispatches.length)} label="Offered" /><Metric value={String(dispatches.filter((item) => item.status === "completed").length)} label="Completed" /><Metric value={String(dispatches.filter((item) => item.status === "declined").length)} label="Declined" /></View></Card>
      <Card><Text style={s.section}>SHIFT BRIEFING</Text><Text style={s.body}>Review every user brief before accepting. Property access remains sealed until the dispatch and incident permissions allow an audited reveal.</Text></Card>
    </ResponderScreen>
  );
}
function Metric({ value, label }: { value: string; label: string }) { return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label.toUpperCase()}</Text></View>; }
const s = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.white,
    marginTop: spacing[4],
  },
  body: { ...typography.body, color: colors.mist, marginVertical: spacing[3] },
  section: { ...typography.label, color: colors.white, marginBottom: spacing[3] },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: spacing[3] },
  metric: { backgroundColor: colors.onyx, borderRadius: 8, flex: 1, minWidth: 100, padding: spacing[3] },
  metricValue: { ...typography.heading, color: colors.guardianGreen },
  metricLabel: { ...typography.label, color: colors.mist, fontSize: 9, marginTop: spacing[1] },
});
