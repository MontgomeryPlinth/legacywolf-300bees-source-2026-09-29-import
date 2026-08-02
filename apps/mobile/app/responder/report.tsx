import { useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Button, Card, Input, Label } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { ResponderScreen } from "../../src/responder/screen";
import { useOperationsApi } from "../../src/auth/session";
export default function Report() {
  const [narrative, setNarrative] = useState("");
  const [incidentId, setIncidentId] = useState("");
  const [status, setStatus] = useState("safe");
  const [emergencyCalled, setEmergencyCalled] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(false);
  const api = useOperationsApi();
  async function submit() { await api.report(incidentId, { outcome: status, notes: narrative, actions: [emergencyCalled ? "Emergency services called" : "Emergency services not called", contactsNotified ? "Contacts notified" : "Contacts not notified"] }); setNarrative(""); }
  return (
    <ResponderScreen
      title="INCIDENT REPORT"
      body="Reports attach to an accepted incident and become part of the immutable audit record."
    >
      <Card>
        <Text style={s.heading}>Complete an accepted incident.</Text>
        <View style={s.stack}>
          <Label>Incident ID</Label>
          <Input onChangeText={setIncidentId} value={incidentId} />
          <Label>Scene narrative</Label>
          <Input multiline onChangeText={setNarrative} value={narrative} />
          <Label>User status on arrival</Label><View style={s.wrap}>{["safe", "needs_assistance", "hospital_transfer", "deceased"].map((value) => <Button key={value} onPress={() => setStatus(value)} variant={status === value ? "primary" : "secondary"}>{value.replaceAll("_", " ")}</Button>)}</View>
          <Label>Emergency services called</Label><Button onPress={() => setEmergencyCalled(!emergencyCalled)} variant={emergencyCalled ? "primary" : "secondary"}>{emergencyCalled ? "Yes" : "No"}</Button>
          <Label>Contacts notified</Label><Button onPress={() => setContactsNotified(!contactsNotified)} variant={contactsNotified ? "primary" : "secondary"}>{contactsNotified ? "Yes" : "No"}</Button>
          <Button disabled={!incidentId || !narrative} onPress={() => void submit()}>Submit report</Button>
        </View>
      </Card>
    </ResponderScreen>
  );
}
const s = StyleSheet.create({
  heading: { ...typography.heading, color: colors.white },
  stack: { gap: spacing[3], marginTop: spacing[4] },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
});
