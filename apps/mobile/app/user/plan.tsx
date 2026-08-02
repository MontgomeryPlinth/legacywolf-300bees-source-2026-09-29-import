import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  Modal,
  Skeleton,
} from "@legacy-wolf/ui";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import type { Plan, ResponseQueueStep } from "@legacy-wolf/core";
import { useSession } from "../../src/auth/session";

type Tier = Plan["tier"];
type Channel = ResponseQueueStep["channel"];
const tiers: { id: Tier; title: string; body: string }[] = [
  {
    id: "friend_alert",
    title: "Friend Alert",
    body: "We contact your nominated friend or police to check on you.",
  },
  {
    id: "attend_check",
    title: "Attend & Check",
    body: "A Security-Accredited Agent attends your address under your instruction.",
  },
  {
    id: "attend_check_pet",
    title: "Pet Guardian",
    body: "Attendance plus immediate on-site pet care and guardian handover.",
  },
];
const channels: Channel[] = [
  "push",
  "sms",
  "call",
  "notify_contact",
  "dispatch",
];

export default function PlanManagementScreen() {
  const { client } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [queue, setQueue] = useState<ResponseQueueStep[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [channel, setChannel] = useState<Channel>("push");
  const [wait, setWait] = useState("5");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  async function load() {
    const [p, q] = await Promise.all([
      client.plans.get(),
      client.responseQueue.list(),
    ]);
    setPlan(p);
    setQueue(q);
  }
  useEffect(() => {
    void load();
  }, []);
  async function selectTier(tier: Tier) {
    if (!plan) return;
    const rank: Record<Tier, number> = { friend_alert: 0, attend_check: 1, attend_check_pet: 2, full: 3 };
    if (rank[tier] > rank[plan.tier]) { setPendingTier(tier); return; }
    await applyTier(tier);
  }
  async function applyTier(tier: Tier) {
    setSaving(true);
    setPlan(await client.plans.update({ tier }));
    setSaving(false);
    setPendingTier(null);
  }
  async function addStep() {
    if (!plan || !queue) return;
    setSaving(true);
    await client.responseQueue.create({
      plan_id: plan.id,
      position: queue.length + 1,
      channel,
      target_person: null,
      wait_minutes: Math.max(0, Number(wait) || 0),
      message_template: message.trim() || null,
    });
    await load();
    setShowAdd(false);
    setMessage("");
    setSaving(false);
  }
  async function remove(id: string) {
    if (!queue) return;
    await client.responseQueue.remove(id);
    const next = (await client.responseQueue.list()).map((step, index) => ({
      ...step,
      position: index + 1,
    }));
    await Promise.all(next.map((step) => client.responseQueue.update(step)));
    setQueue(await client.responseQueue.list());
  }
  async function move(step: ResponseQueueStep, direction: -1 | 1) {
    if (!queue) return;
    const other = queue.find(
      (item) => item.position === step.position + direction,
    );
    if (!other) return;
    await Promise.all([
      client.responseQueue.update({ ...step, position: other.position }),
      client.responseQueue.update({ ...other, position: step.position }),
    ]);
    setQueue(await client.responseQueue.list());
  }
  if (!plan || !queue)
    return (
      <View style={styles.loading}>
        <Skeleton height={40} width="60%" />
        <Skeleton height={180} />
        <Skeleton height={180} />
      </View>
    );
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>YOUR INSTRUCTION</Text>
          <Text style={styles.title}>PLAN</Text>
          <Text style={styles.body}>
            Choose the response and order the steps Legacy Wolf is authorized to
            execute.
          </Text>
        </View>
        <View style={styles.stack}>
          {tiers.map((tier) => (
            <Pressable key={tier.id} onPress={() => selectTier(tier.id)}>
              <Card style={plan.tier === tier.id ? styles.selected : undefined}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle}>{tier.title}</Text>
                  {plan.tier === tier.id ? <Badge>Active</Badge> : null}
                </View>
                <Text style={styles.body}>{tier.body}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.section}>RESPONSE QUEUE</Text>
            <Text style={styles.small}>
              Executed in order after your grace window.
            </Text>
          </View>
          <Button onPress={() => setShowAdd(true)}>Add step</Button>
        </View>
        {queue.length === 0 ? (
          <Card>
            <Text style={styles.cardTitle}>No response steps yet.</Text>
            <Text style={styles.body}>
              Add the first action Legacy Wolf should take if you do not
              respond.
            </Text>
          </Card>
        ) : (
          queue.map((step) => (
            <Card key={step.id}>
              <View style={styles.row}>
                <View style={styles.position}>
                  <Text style={styles.positionText}>{step.position}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>
                    {channelLabel(step.channel)}
                  </Text>
                  <Text style={styles.small}>
                    {step.wait_minutes === 0
                      ? "Immediately"
                      : `Wait ${step.wait_minutes} minutes`}{" "}
                    · {step.message_template || "Standard Inside-voice message"}
                  </Text>
                </View>
              </View>
              <View style={styles.controls}>
                <Button
                  disabled={step.position === 1}
                  onPress={() => move(step, -1)}
                  variant="ghost"
                >
                  Move up
                </Button>
                <Button
                  disabled={step.position === queue.length}
                  onPress={() => move(step, 1)}
                  variant="ghost"
                >
                  Move down
                </Button>
                <Button onPress={() => remove(step.id)} variant="secondary">
                  Remove
                </Button>
              </View>
            </Card>
          ))
        )}
        <Card>
          <Text style={styles.cardTitle}>Battery behaviour</Text>
          <Text style={styles.body}>
            An offline phone does not prove you are unresponsive. Outreach
            happens before your authorized queue advances.
          </Text>
        </Card>
      </ScrollView>
      <Modal
        onClose={() => setShowAdd(false)}
        open={showAdd}
        title="Add queue step"
      >
        <View style={styles.stack}>
          <Label>Channel</Label>
          <View style={styles.wrap}>
            {channels.map((item) => (
              <Pressable
                key={item}
                onPress={() => setChannel(item)}
                style={[styles.chip, channel === item && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipText,
                    channel === item && styles.chipTextSelected,
                  ]}
                >
                  {channelLabel(item)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Label>Wait before next step — minutes</Label>
          <Input
            keyboardType="number-pad"
            onChangeText={setWait}
            value={wait}
          />
          <Label>Your message — optional</Label>
          <Input
            multiline
            onChangeText={setMessage}
            placeholder="Write the message you authorize us to send."
            value={message}
          />
          <Button loading={saving} onPress={addStep}>
            Add to queue
          </Button>
        </View>
      </Modal>
      <Modal onClose={() => setPendingTier(null)} open={Boolean(pendingTier)} title="Upgrade required"><View style={styles.stack}><Text style={styles.cardTitle}>{tiers.find((item) => item.id === pendingTier)?.title} requires a higher attendance tier.</Text><Text style={styles.body}>Upgrade now to enable this service. Your four-week upgrade trial starts without a charge today; billing begins only after the trial unless you cancel.</Text><Button loading={saving} onPress={() => pendingTier && void applyTier(pendingTier)}>Start four-week upgrade trial</Button><Button onPress={() => setPendingTier(null)} variant="secondary">Not now</Button></View></Modal>
    </View>
  );
}
function channelLabel(channel: Channel) {
  return {
    push: "App notification",
    sms: "SMS",
    call: "Automated call",
    notify_contact: "Notify contact",
    dispatch: "Dispatch responder",
  }[channel];
}
const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  loading: {
    backgroundColor: colors.obsidian,
    flex: 1,
    gap: spacing[4],
    padding: spacing[6],
  },
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
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[2] },
  small: { ...typography.bodySmall, color: colors.mist },
  stack: { gap: spacing[3] },
  selected: { borderColor: colors.guardianGreen, borderWidth: 2 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing[3],
    justifyContent: "space-between",
  },
  cardTitle: { ...typography.heading, color: colors.white },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing[4],
  },
  section: { ...typography.label, color: colors.white },
  position: {
    alignItems: "center",
    backgroundColor: colors.guardianGreen,
    borderRadius: radii.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  positionText: { ...typography.label, color: colors.obsidian },
  flex: { flex: 1 },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[1],
    marginTop: spacing[3],
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  chip: {
    borderColor: colors.coal,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  chipSelected: {
    backgroundColor: colors.guardianGreen,
    borderColor: colors.guardianGreen,
  },
  chipText: { ...typography.label, color: colors.mist },
  chipTextSelected: { color: colors.obsidian },
});
