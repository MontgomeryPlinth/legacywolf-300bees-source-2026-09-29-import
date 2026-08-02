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
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import type { Person } from "@legacy-wolf/core";
import { useSession } from "../../src/auth/session";

export default function PeopleManagementScreen() {
  const { client } = useSession();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instructions, setInstructions] = useState("");
  const [roles, setRoles] = useState<Person["roles"]>(["nominated_contact"]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  async function load() {
    setPeople(await client.peopleApi.list());
  }
  useEffect(() => {
    void load();
  }, []);
  async function save() {
    const plan = await client.plans.get();
    const input = {
      plan_id: plan.id,
      linked_account: editing?.linked_account ?? null,
      name: name.trim(),
      relationship: relationship.trim() || null,
      phone_e164: phone.trim() || null,
      email: email.trim() || null,
      roles,
      escalation_order: editing?.escalation_order ?? (people?.length ?? 0) + 1,
      instructions: instructions.trim() || null,
      verification: editing?.verification ?? "pending" as const,
      invited_at: editing?.invited_at ?? null,
      verified_at: editing?.verified_at ?? null,
    };
    if (editing) await client.peopleApi.update({ ...input, id: editing.id });
    else await client.peopleApi.create(input);
    setOpen(false);
    setName("");
    setRelationship("");
    setPhone("");
    setEmail("");
    setInstructions("");
    setRoles(["nominated_contact"]); setEditing(null);
    await load();
  }
  function edit(person: Person) { setEditing(person); setSelected(null); setName(person.name); setRelationship(person.relationship ?? ""); setPhone(person.phone_e164 ?? ""); setEmail(person.email ?? ""); setInstructions(person.instructions ?? ""); setRoles(person.roles); setOpen(true); }
  function toggleRole(role: Person["roles"][number]) { setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]); }
  async function remove(id: string) {
    await client.peopleApi.remove(id);
    await load();
  }
  if (!people) return <Loading />;
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>NOMINATED PEOPLE</Text>
            <Text style={styles.title}>PEOPLE</Text>
          </View>
          <Button onPress={() => setOpen(true)}>Add person</Button>
        </View>
        <Text style={styles.body}>
          Add the people your response may contact. They see only what you
          authorize, when your plan requires it.
        </Text>
        {people.length === 0 ? (
          <Card>
            <Text style={styles.cardTitle}>No people added yet.</Text>
            <Text style={styles.body}>
              Add a nominated contact to arm Friend Alert.
            </Text>
          </Card>
        ) : (
          people.map((person) => (
            <Pressable key={person.id} onPress={() => setSelected(person)}><Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{person.name}</Text>
                  <Text style={styles.body}>
                    {person.relationship || "Relationship not set"}
                  </Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <View style={styles.statusItem}><Text style={styles.statusLabel}>ADVANCE NOTICE</Text><Badge>{notificationStatus(person)}</Badge></View>
                <View style={styles.statusItem}><Text style={styles.statusLabel}>RESPONSE</Text><Badge>{responseStatus(person)}</Badge></View>
              </View>
              <Text style={styles.meta}>
                {person.phone_e164 || person.email || "Contact detail not set"}
              </Text>
              <Text style={styles.meta}>
                {person.roles.map(roleLabel).join(" · ")}
              </Text>
              {person.instructions ? (
                <Text style={styles.instructions}>“{person.instructions}”</Text>
              ) : null}
              <Text style={styles.openHint}>VIEW DETAILS  ›</Text>
            </Card></Pressable>
          ))
        )}
      </ScrollView>
      <Modal onClose={() => setOpen(false)} open={open} title="Add person">
        <View style={styles.stack}>
          <Field label="Full name" onChange={setName} value={name} />
          <Field
            label="Relationship"
            onChange={setRelationship}
            value={relationship}
          />
          <Field label="Mobile number" onChange={setPhone} value={phone} />
          <Field label="Email — optional" onChange={setEmail} value={email} />
          <Field
            label="Instructions — optional"
            onChange={setInstructions}
            value={instructions}
          />
          <Label>Roles</Label><View style={styles.roleWrap}>{roleOptions.map(([value, label]) => <Pressable key={value} onPress={() => toggleRole(value)} style={[styles.roleChip, roles.includes(value) && styles.roleChipSelected]}><Text style={[styles.roleText, roles.includes(value) && styles.roleTextSelected]}>{label}</Text></Pressable>)}</View>
          <Button
            disabled={!name.trim() || (!phone.trim() && !email.trim()) || !roles.length}
            onPress={save}
          >
            {editing ? "Save changes" : "Save person"}
          </Button>
        </View>
      </Modal>
      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={selected?.name ?? "Person details"}>{selected ? <View style={styles.stack}><Card><View style={styles.statusRow}><View style={styles.statusItem}><Text style={styles.statusLabel}>ADVANCE NOTICE</Text><Badge>{notificationStatus(selected)}</Badge></View><View style={styles.statusItem}><Text style={styles.statusLabel}>RESPONSE</Text><Badge>{responseStatus(selected)}</Badge></View></View>{selected.invited_at ? <Text style={styles.body}>Notified {new Date(selected.invited_at).toLocaleString()}</Text> : <Text style={styles.body}>This person has not been sent an advance notification.</Text>}</Card><Card><Text style={styles.sectionLabel}>CONTACT INFORMATION</Text><Text style={styles.cardTitle}>{selected.phone_e164 || "No phone"}</Text><Text style={styles.body}>{selected.email || "No email"}</Text></Card><Card><Text style={styles.sectionLabel}>ROLES</Text><Text style={styles.body}>{selected.roles.map(roleLabel).join(" · ")}</Text></Card>{selected.instructions ? <Card><Text style={styles.sectionLabel}>SPECIAL INSTRUCTIONS</Text><Text style={styles.body}>{selected.instructions}</Text></Card> : null}{selected.verification === "pending" && selected.invited_at ? <><Card><Text style={styles.body}>Notification sent. This contact has not accepted or declined yet.</Text></Card><Button disabled variant="secondary">Resend invite · integration required</Button></> : null}<Button onPress={() => edit(selected)}>Edit details</Button><Button onPress={() => { void remove(selected.id); setSelected(null); }} variant="secondary">Remove contact</Button></View> : null}</Modal>
    </View>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
}) {
  return (
    <View>
      <Label>{label}</Label>
      <Input onChangeText={onChange} value={value} />
    </View>
  );
}
function Loading() {
  return (
    <View style={styles.loading}>
      <Skeleton height={44} />
      <Skeleton height={180} />
    </View>
  );
}
function roleLabel(value: string) {
  return value.replaceAll("_", " ");
}
function notificationStatus(person: Person) {
  return person.invited_at ? "Notified" : "Not notified";
}
function responseStatus(person: Person) {
  if (person.verification === "verified") return "Accepted";
  if (person.verification === "declined") return "Declined";
  if (person.verification === "unreachable") return "Unreachable";
  return person.invited_at ? "Awaiting response" : "Not requested";
}
const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  loading: {
    backgroundColor: colors.obsidian,
    flex: 1,
    gap: spacing[4],
    padding: spacing[4],
  },
  content: {
    alignSelf: "center",
    gap: spacing[4],
    maxWidth: 640,
    padding: spacing[4],
    paddingBottom: spacing[16],
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: { ...typography.label, color: colors.guardianGreen },
  title: { ...typography.displayM, color: colors.white },
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[1] },
  cardTitle: { ...typography.heading, color: colors.white },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing[3], marginTop: spacing[3] },
  statusItem: { alignItems: "flex-start", gap: spacing[1], minWidth: 130 },
  statusLabel: { ...typography.label, color: colors.slate, fontSize: 9 },
  flex: { flex: 1 },
  meta: {
    ...typography.label,
    color: colors.mist,
    marginTop: spacing[3],
    textTransform: "uppercase",
  },
  instructions: {
    ...typography.body,
    color: colors.white,
    marginVertical: spacing[3],
  },
  stack: { gap: spacing[3] },
  openHint: { ...typography.label, color: colors.guardianGreen, marginTop: spacing[3] },
  roleWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  roleChip: { borderColor: colors.coal, borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  roleChipSelected: { backgroundColor: colors.guardianGreen, borderColor: colors.guardianGreen },
  roleText: { ...typography.label, color: colors.mist, fontSize: 10 },
  roleTextSelected: { color: colors.obsidian },
  sectionLabel: { ...typography.label, color: colors.mist, marginBottom: spacing[2] },
  center: { alignItems: "center" },
});
const roleOptions: Array<[Person["roles"][number], string]> = [["nominated_contact", "Nominated Contact"], ["pet_guardian_primary", "Pet Guardian"], ["pet_guardian_backup", "Backup Pet Guardian"], ["estate_recipient", "Estate Recipient"]];
