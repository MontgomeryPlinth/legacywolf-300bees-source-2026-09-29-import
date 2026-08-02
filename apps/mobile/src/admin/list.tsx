import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Badge, Card, Input, Label } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { AdminHeading, AdminShell } from "./admin-shell";
import { useOperationsApi } from "../auth/session";
export function AdminList({
  eyebrow,
  title,
  empty,
  resource,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  resource: "incidents" | "users" | "responders";
}) {
  const api = useOperationsApi();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => { void api[resource]().then(setRows).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Records could not be loaded.")); }, [api, resource]);
  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.trim().toLowerCase())), [rows, search]);
  return (
    <AdminShell>
      <AdminHeading
        eyebrow={eyebrow}
        title={title}
        body="Search and review operational records. Sensitive fields remain masked until an authorized, audited reveal."
      />
      <Card>
        <Label>Search</Label>
        <Input onChangeText={setSearch} placeholder={`Search ${title.toLowerCase()}`} value={search} />
      </Card>
      <View style={styles.stats}><Stat label="Total" value={String(rows.length)} /><Stat label="Shown" value={String(filtered.length)} /><Stat label="Attention" value={String(rows.filter((row) => ["active", "suspended", "offered", "grace"].includes(String(row.status))).length)} /></View>
      {error ? <Card><Text style={styles.error}>{error}</Text></Card> : filtered.length ? <Card><View style={styles.tableHeader}><Text style={styles.headerCell}>RECORD</Text><Text style={styles.headerCell}>STATUS</Text><Text style={styles.headerCell}>DETAIL</Text></View>{filtered.map((row) => <View key={String(row.id)} style={styles.tableRow}><View style={styles.cell}><Text style={styles.heading}>{String(row.preferredName ?? row.legalName ?? row.id).slice(0, 40)}</Text><Text style={styles.body}>{String(row.email ?? row.trigger ?? "")}</Text></View><View style={styles.cell}><Badge>{String(row.status ?? "active")}</Badge></View><View style={styles.cell}><Text style={styles.body}>{String(row.phoneE164 ?? row.outcome ?? row.createdAt ?? "—")}</Text></View></View>)}</Card> : <Card><Text style={styles.heading}>{empty}</Text><Text style={styles.body}>Live records are loaded from the role-protected Admin API.</Text></Card>}
    </AdminShell>
  );
}
function Stat({ label, value }: { label: string; value: string }) { return <Card style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label.toUpperCase()}</Text></Card>; }
const styles = StyleSheet.create({
  heading: { ...typography.heading, color: colors.white },
  body: { ...typography.body, color: colors.mist, marginTop: spacing[2] },
  stats: { flexDirection: "row", gap: spacing[4] },
  stat: { flex: 1 },
  statValue: { ...typography.displayM, color: colors.guardianGreen },
  statLabel: { ...typography.label, color: colors.mist },
  tableHeader: { borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", paddingBottom: spacing[3] },
  headerCell: { ...typography.label, color: colors.mist, flex: 1 },
  tableRow: { alignItems: "center", borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", minHeight: 72, paddingVertical: spacing[3] },
  cell: { flex: 1, paddingRight: spacing[3] },
  error: { ...typography.body, color: colors.ember },
});
