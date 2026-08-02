import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { AdminHeading, AdminShell } from "../../src/admin/admin-shell";
import { useOperationsApi } from "../../src/auth/session";
export default function AdminDashboard() {
  const api = useOperationsApi();
  const [data, setData] = useState({ activeIncidents: 0, responders: 0, protectedPlans: 0, users: 0 });
  const [incidents, setIncidents] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { void Promise.all([api.dashboard(), api.incidents()]).then(([nextData, nextIncidents]) => { setData(nextData); setIncidents(nextIncidents); }); }, [api]);
  const stats: ReadonlyArray<readonly [string, string]> = [
    ["Active incidents", String(data.activeIncidents)],
    ["Responders", String(data.responders)],
    ["Protected plans", String(data.protectedPlans)],
    ["Users", String(data.users)],
  ];
  return (
    <AdminShell>
      <AdminHeading
        eyebrow="Live operations"
        title="DASHBOARD"
        body="Monitor incidents, users, responders, and service health without exposing unnecessary personal data."
      />
      <View style={styles.grid}>
        {stats.map(([label, value]) => (
          <Card key={label} style={styles.card}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label.toUpperCase()}</Text>
          </Card>
        ))}
      </View>
      <Card><Text style={styles.heading}>ACTIVE INCIDENTS</Text>{incidents.filter((item) => !["resolved", "false_positive", "deceased"].includes(String(item.status))).length ? incidents.filter((item) => !["resolved", "false_positive", "deceased"].includes(String(item.status))).map((item) => <View key={String(item.id)} style={styles.incident}><View><Text style={styles.heading}>#{String(item.id).slice(0, 8).toUpperCase()}</Text><Text style={styles.body}>{String(item.trigger).replaceAll("_", " ")}</Text></View><Text style={styles.status}>{String(item.status).toUpperCase()}</Text></View>) : <Text style={styles.body}>No active incidents.</Text>}</Card>
      <Card><Text style={styles.heading}>TODAY’S ACTIVITY</Text><Text style={styles.body}>{incidents.length} incident records available · {data.protectedPlans} protected plans · {data.responders} responders provisioned.</Text></Card>
    </AdminShell>
  );
}
const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: spacing[4] },
  card: { flex: 1 },
  value: { ...typography.displayM, color: colors.white },
  label: { ...typography.label, color: colors.mist, marginTop: spacing[2] },
  heading: { ...typography.heading, color: colors.white },
  body: { ...typography.body, color: colors.mist, marginTop: spacing[2] },
  incident: { alignItems: "center", borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing[3] },
  status: { ...typography.label, color: colors.guardianGreen },
});
