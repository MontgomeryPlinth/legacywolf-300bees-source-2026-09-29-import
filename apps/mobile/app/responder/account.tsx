import { Text, StyleSheet, View } from "react-native";
import { Badge, Card } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { ResponderScreen } from "../../src/responder/screen";
import { useSession } from "../../src/auth/session";
export default function Account() {
  const { account } = useSession();
  return (
    <ResponderScreen
      title="ACCOUNT"
      body="Responder access is provisioned by an administrator."
    >
      <Card>
        <Badge>{account?.roles.includes("responder") ? "Provisioned" : "Not provisioned"}</Badge>
        <Text style={s.heading}>{account?.preferred_name || account?.legal_name || "Responder"}</Text>
        <Text style={s.body}>{account?.phone_e164 || account?.email || "Verified identity required"}</Text>
      </Card>
      <Card>
        <Text style={s.heading}>Vetting and credentials</Text>
        <Text style={s.body}>
          Australian National Character Check and clinical credentials must be
          verified before shifts can begin.
        </Text>
      </Card>
      <Text style={s.section}>YOUR PERFORMANCE</Text><View style={s.metrics}><Metric label="Dispatches" value="—" /><Metric label="This month" value="—" /><Metric label="Average response" value="—" /></View>
      <Card><Text style={s.heading}>Operations support</Text><Text style={s.body}>Support contact details appear here when the operations provider is configured.</Text></Card>
    </ResponderScreen>
  );
}
function Metric({ label, value }: { label: string; value: string }) { return <Card style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label.toUpperCase()}</Text></Card>; }
const s = StyleSheet.create({
  heading: {
    ...typography.heading,
    color: colors.white,
    marginTop: spacing[4],
  },
  body: { ...typography.body, color: colors.mist, marginTop: spacing[2] },
  section: { ...typography.label, color: colors.white },
  metrics: { flexDirection: "row", gap: spacing[2] },
  metric: { flex: 1 },
  metricValue: { ...typography.heading, color: colors.guardianGreen },
  metricLabel: { ...typography.label, color: colors.mist, fontSize: 8 },
});
