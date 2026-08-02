import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
import type { HandoffLetter, Person } from "@legacy-wolf/core";
import { useSession } from "../../src/auth/session";
export default function LastWishesScreen() {
  const { client, createHandoffLetter } = useSession();
  const [letters, setLetters] = useState<HandoffLetter[] | null>(null);
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [recipient, setRecipient] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [trigger, setTrigger] =
    useState<HandoffLetter["delivery_trigger"]>("on_confirmed_death");
  async function load() {
    const [nextLetters, nextPeople] = await Promise.all([client.handoffLetters.list(), client.peopleApi.list()]); setLetters(nextLetters); setPeople(nextPeople);
  }
  useEffect(() => {
    void load();
  }, []);
  async function add() {
    await createHandoffLetter(body, trigger, recipient);
    setBody("");
    setOpen(false);
    await load();
  }
  if (!letters)
    return (
      <View style={styles.loading}>
        <Skeleton height={48} />
        <Skeleton height={180} />
      </View>
    );
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HANDOFF</Text>
            <Text style={styles.title}>LAST WISHES</Text>
          </View>
          <Button onPress={() => setOpen(true)}>Add letter</Button>
        </View>
        <Text style={styles.body}>
          Prepare the messages and handoff instructions you authorize Legacy
          Wolf to release at the trigger you choose.
        </Text>
        {letters.length === 0 ? (
          <Card>
            <Text style={styles.cardTitle}>No handoff letters yet.</Text>
            <Text style={styles.body}>
              Add a letter when you are ready. Nothing is released before its
              authorized trigger.
            </Text>
          </Card>
        ) : (
          letters.map((letter) => (
            <Card key={letter.id}>
              <View style={styles.header}>
                <Text style={styles.cardTitle}>Handoff letter</Text>
                <Badge>{letter.released_at ? "Released" : "Sealed"}</Badge>
              </View>
              <Text style={styles.body}>
                Trigger: {letter.delivery_trigger.replaceAll("_", " ")}
              </Text>
              <Button
                onPress={async () => {
                  await client.handoffLetters.remove(letter.id);
                  await load();
                }}
                variant="secondary"
              >
                Remove
              </Button>
            </Card>
          ))
        )}
        <Card>
          <Text style={styles.cardTitle}>Voice memos</Text>
          <Text style={styles.body}>
            Voice memo upload becomes available when your deployment’s
            encrypted media storage is activated.
          </Text>
        </Card>
      </ScrollView>
      <Modal
        onClose={() => setOpen(false)}
        open={open}
        title="Add handoff letter"
      >
        <View style={styles.stack}>
          <Label>Letter</Label>
          <Input
            multiline
            onChangeText={setBody}
            placeholder="Write what you want delivered."
            value={body}
          />
          <Label>Delivery trigger</Label>
          {(
            [
              "on_activation",
              "on_confirmed_death",
              "on_family_arrival",
            ] as const
          ).map((value) => (
            <Button
              key={value}
              onPress={() => setTrigger(value)}
              variant={trigger === value ? "primary" : "secondary"}
            >
              {value.replaceAll("_", " ")}
            </Button>
          ))}
          <Label>Recipient</Label><View style={styles.recipients}>{people.filter((person) => person.roles.includes("estate_recipient") || person.roles.includes("nominated_contact")).map((person) => <Button key={person.id} onPress={() => setRecipient(person.id)} variant={recipient === person.id ? "primary" : "secondary"}>{person.name}</Button>)}</View>
          <Text style={styles.body}>Recipients are managed in People. Add the Estate Recipient role to anyone receiving a sealed item or letter.</Text>
          <Button disabled={!body.trim() || !recipient} onPress={add}>
            Seal letter
          </Button>
        </View>
      </Modal>
    </View>
  );
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
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[2] },
  cardTitle: { ...typography.heading, color: colors.white },
  stack: { gap: spacing[3] },
  recipients: { gap: spacing[2] },
});
