import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge, Button, Card } from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { useSession } from "../../src/auth/session";

type ViewName = "invite" | "role" | "alert" | "drill";
const views: { id: ViewName; label: string }[] = [
  { id: "invite", label: "Invite" },
  { id: "role", label: "My Role" },
  { id: "alert", label: "Active Alert" },
  { id: "drill", label: "Drill" },
];

// NC* — nominated-contact views rendered inside the existing account shell.
export default function MyRoleScreen() {
  const [view, setView] = useState<ViewName>("role");
  const { client } = useSession();
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [incidents, setIncidents] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { void Promise.all([client.nominated.plans(), client.nominated.incidents()]).then(([nextPlans, nextIncidents]) => { setPlans(nextPlans); setIncidents(nextIncidents); }).catch(() => undefined); }, [client]);
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>LINKED ROLE</Text>
          <Text style={styles.title}>MY ROLE</Text>
          <Text style={styles.body}>
            Review plans that nominate this account. Information remains limited
            to what each plan owner authorized.
          </Text>
        </View>
        <View style={styles.tabs}>
          {views.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setView(item.id)}
              style={[styles.tab, view === item.id && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  view === item.id && styles.tabTextActive,
                ]}
              >
                {item.label.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        {view === "invite" ? <InviteLanding /> : null}
        {view === "role" ? <RoleOverview plans={plans} /> : null}
        {view === "alert" ? <ActiveAlert incidents={incidents} onSafe={async (id) => { await client.nominated.confirmSafe(id); setIncidents(await client.nominated.incidents()); }} /> : null}
        {view === "drill" ? <DrillNotice /> : null}
      </ScrollView>
    </View>
  );
}

function InviteLanding() {
  return (
    <Card>
      <Badge>Invitation</Badge>
      <Text style={styles.cardTitle}>No pending invitations.</Text>
      <Text style={styles.body}>
        An invitation appears here when its verified email or mobile matches
        this account. Accepting it adds a role; it never creates another
        account.
      </Text>
    </Card>
  );
}
function RoleOverview({ plans }: { plans: Record<string, unknown>[] }) {
  return (
    <Card>
      <Badge>Nominated contact</Badge>
      <Text style={styles.cardTitle}>{plans.length ? `${plans.length} linked plan${plans.length === 1 ? "" : "s"}.` : "No linked plans yet."}</Text>
      <Text style={styles.body}>
        When someone nominates you, their authorized contact instructions and
        verification status appear here.
      </Text>
    </Card>
  );
}
function ActiveAlert({ incidents, onSafe }: { incidents: Record<string, unknown>[]; onSafe(id: string): Promise<void> }) {
  const incident = incidents[0];
  return (
    <Card style={styles.alertCard}>
      <Badge critical>Active alert</Badge>
      <Text style={styles.cardTitle}>{incident ? `Alert ${String(incident.status)}` : "No active alert."}</Text>
      <Text style={styles.body}>
        During an incident, this view shows the actions the plan owner
        instructed you to take. Property or pet details appear only when
        authorized.
      </Text>
      <Button disabled={!incident} onPress={() => incident ? void onSafe(String(incident.id)) : undefined} variant="critical">
        Confirm they are safe
      </Button>
    </Card>
  );
}
function DrillNotice() {
  return (
    <Card>
      <Badge>Drill mode</Badge>
      <Text style={styles.cardTitle}>No drill scheduled.</Text>
      <Text style={styles.body}>
        Drills verify the response without contacting emergency services or
        dispatching a responder.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
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
  cardTitle: {
    ...typography.heading,
    color: colors.white,
    marginTop: spacing[4],
  },
  tabs: {
    backgroundColor: colors.graphite,
    borderRadius: radii.card,
    flexDirection: "row",
    padding: spacing[1],
  },
  tab: {
    alignItems: "center",
    borderRadius: radii.input,
    flex: 1,
    padding: spacing[3],
  },
  tabActive: { backgroundColor: colors.guardianGreen },
  tabText: { ...typography.label, color: colors.mist, fontSize: 9 },
  tabTextActive: { color: colors.obsidian },
  alertCard: { borderColor: colors.ember },
});
