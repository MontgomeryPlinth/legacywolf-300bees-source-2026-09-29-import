import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Badge, Button, Card, Input, Label, Modal } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { useSession } from "../../src/auth/session";
import * as ImagePicker from "expo-image-picker";
import type { Plan } from "@legacy-wolf/core";
import type { MotionTimer } from "@legacy-wolf/core";
type Panel =
  | "profile"
  | "subscription"
  | "legal"
  | "notifications"
  | "security"
  | "history"
  | "role"
  | null;
export default function AccountSettingsScreen() {
  const { account, biometricEnabled, logout, client, completeAuthentication } = useSession();
  const [panel, setPanel] = useState<Panel>(null);
  const [preferred, setPreferred] = useState(account?.preferred_name ?? "");
  const [legalName, setLegalName] = useState(account?.legal_name ?? "");
  const [dob, setDob] = useState(account?.dob ?? "");
  const [push, setPush] = useState(true);
  const [sms, setSms] = useState(true);
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [authorizations, setAuthorizations] = useState<Record<string, unknown>[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [timerPreferences, setTimerPreferences] = useState<MotionTimer | null>(null);
  const [devices, setDevices] = useState<Record<string, unknown>[]>([]);
  const [authorizationKind, setAuthorizationKind] = useState("property_access");
  const [signerName, setSignerName] = useState(account?.legal_name ?? "");
  const [legalDocuments, setLegalDocuments] = useState<Record<string, unknown>[]>([]);
  const [documentName, setDocumentName] = useState("");
  useEffect(() => {
    if (panel === "history") void client.accountApi.history().then(setHistory);
    if (panel === "legal") { void client.accountApi.authorizations().then(setAuthorizations); void client.accountApi.legalDocuments().then(setLegalDocuments); }
    if (panel === "subscription") void client.plans.get().then(setPlan);
    if (panel === "notifications") void client.timerApi.get().then(setTimerPreferences);
    if (panel === "security") void client.accountApi.devices().then(setDevices);
  }, [client, panel]);
  async function handleLogout() {
    await logout();
    router.replace("/");
  }
  async function captureLegalDocument(source: "camera" | "library") { const result = source === "camera" ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], base64: true, quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.8 }); const asset = result.canceled ? null : result.assets[0]; if (!asset?.base64 || !documentName.trim()) return; await client.accountApi.addLegalDocument({ name: documentName.trim(), category: "Legal Documents", notes: null, mimeType: asset.mimeType ?? "image/jpeg", dataUrl: `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}` }); setDocumentName(""); setLegalDocuments(await client.accountApi.legalDocuments()); }
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>ONE ACCOUNT</Text>
          <Text style={styles.title}>ACCOUNT</Text>
          <Text style={styles.body}>
            Manage your identity, authorizations, notifications, security, and
            linked roles.
          </Text>
        </View>
        <Card>
          <View style={styles.row}>
            <View>
              <Text style={styles.cardTitle}>
                {account?.preferred_name ||
                  account?.legal_name ||
                  "Legacy Wolf member"}
              </Text>
              <Text style={styles.body}>
                {account?.phone_e164 || account?.email || "Verified account"}
              </Text>
            </View>
            <Badge>{account?.status || "active"}</Badge>
          </View>
        </Card>
        {items.map((item) => (
          <Button
            key={item.id}
            onPress={() => setPanel(item.id)}
            variant="secondary"
          >
            {item.title}
          </Button>
        ))}
        <Button onPress={handleLogout} variant="ghost">
          Log out
        </Button>
        <Button
          onPress={() => router.push("/user/my-role")}
          variant="secondary"
        >
          Open nominated-contact role
        </Button>
      </ScrollView>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "profile"}
        title="Profile"
      >
        <View style={styles.stack}>
          <Label>Preferred name</Label>
          <Input onChangeText={setPreferred} value={preferred} />
          <Label>Legal name</Label><Input onChangeText={setLegalName} value={legalName} />
          <Label>Date of birth</Label><Input onChangeText={setDob} placeholder="YYYY-MM-DD" value={dob} />
          <Label>Verified identity</Label>
          <Text style={styles.body}>
            {account?.phone_e164 || account?.email}
          </Text>
          <Button onPress={async () => { const updated = await client.accountApi.update({ preferredName: preferred, legalName, dob: dob || null }); completeAuthentication(updated); setPanel(null); }}>Save profile</Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "subscription"}
        title="Subscription"
      >
        <View style={styles.stack}>
          <Badge>{plan?.status ?? "Loading"}</Badge>
          <Text style={styles.cardTitle}>{plan ? plan.tier.replaceAll("_", " ").toUpperCase() : "Your selected response plan"}</Text>
          <Text style={styles.body}>Manage the services your Active Instruction authorizes. Billing checkout becomes available when Stripe products are configured.</Text>
          <Button onPress={() => router.push("/user/plan")}>Review plan</Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "legal"}
        title="Legal authorizations"
      >
        <View style={styles.stack}>
          {authorizations.length ? authorizations.map((item) => <Card key={String(item.id)}><View style={styles.row}><View><Text style={styles.cardTitle}>{String(item.kind).replaceAll("_", " ").toUpperCase()}</Text><Text style={styles.body}>{String(item.provider ?? "In-app authorization")} · {String(item.status ?? "active")}</Text></View><Badge>{String(item.status ?? "active")}</Badge></View></Card>) : <Text style={styles.body}>No active authorizations.</Text>}
          <Text style={styles.body}>
            Active Instructions and authorizations are immutable and audit-linked.
          </Text>
          <Text style={styles.sectionLabel}>COMPLETE AN AUTHORIZATION IN APP</Text>
          {[["property_access", "Property access"], ["responder_attendance", "Responder attendance"], ["pet_care", "Pet care"], ["emergency_services", "Emergency services coordination"], ["wishes_release", "Wishes release"]].map(([value, label]) => <Button key={value} onPress={() => setAuthorizationKind(value!)} variant={authorizationKind === value ? "primary" : "secondary"}>{label}</Button>)}
          <Label>Legal signature name</Label><Input onChangeText={setSignerName} value={signerName} />
          <Text style={styles.body}>By signing, you confirm that you understand and authorize this instruction. The signed version and timestamp are retained in the audit history.</Text>
          <Button disabled={!signerName.trim()} onPress={async () => { await client.accountApi.authorize({ kind: authorizationKind, signerName: signerName.trim(), accepted: true }); setAuthorizations(await client.accountApi.authorizations()); }}>Sign and authorize</Button>
          <Text style={styles.sectionLabel}>LEGAL DOCUMENTS</Text>
          {legalDocuments.map((document) => <Card key={String(document.id)}><Text style={styles.cardTitle}>{String(document.name)}</Text><Text style={styles.body}>{String(document.category)} · Encrypted</Text></Card>)}
          <Label>Document name</Label><Input onChangeText={setDocumentName} placeholder="Enduring Power of Attorney" value={documentName} />
          <Button disabled={!documentName.trim()} onPress={() => void captureLegalDocument("camera")} variant="secondary">Scan with camera</Button>
          <Button disabled={!documentName.trim()} onPress={() => void captureLegalDocument("library")} variant="secondary">Choose an image</Button>
          <Text style={styles.body}>Documents are encrypted at rest. They are reference copies and do not replace legal execution requirements.</Text>
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "notifications"}
        title="Notifications"
      >
        <View style={styles.stack}>
          <Text style={styles.sectionLabel}>MONITORING MODE</Text>
          <Toggle label="Motion Timer" onPress={() => timerPreferences && setTimerPreferences({ ...timerPreferences, monitoring_strategy: "motion" })} value={timerPreferences?.monitoring_strategy === "motion"} />
          <Toggle label="Manual check-ins" onPress={() => timerPreferences && setTimerPreferences({ ...timerPreferences, monitoring_strategy: "check_in" })} value={timerPreferences?.monitoring_strategy === "check_in"} />
          <Text style={styles.body}>{timerPreferences?.monitoring_strategy === "motion" ? "Motion signals reset your timer automatically. Manual check-in controls are unavailable in this mode." : "You must confirm you’re okay at the selected interval. We’ll alert you before your next check-in is due."}</Text>
          <Toggle
            label="Push notifications"
            onPress={() => setPush(!push)}
            value={push}
          />
          <Toggle label="SMS alerts" onPress={() => setSms(!sms)} value={sms} />
          <Authorization title={timerPreferences?.monitoring_strategy === "check_in" ? "Alerts before your next check-in is due" : "Alerts before Motion Timer triggers escalation"} />
          <View style={timerPreferences?.monitoring_strategy === "motion" ? styles.disabledSetting : undefined}><Authorization title="Manual check-in confirmations" /></View>
          <Toggle label="Cancel escalation if movement resumes" onPress={() => timerPreferences && setTimerPreferences({ ...timerPreferences, cancel_escalation_on_movement: !timerPreferences.cancel_escalation_on_movement })} value={timerPreferences?.cancel_escalation_on_movement ?? true} />
          <Text style={styles.body}>If enabled, verified movement after an escalation begins confirms activity and safely cancels the remaining response steps.</Text>
          <Authorization title="Trial conversion reminder" />
          <Text style={styles.body}>
            Critical response messages follow your authorized queue and cannot
            be replaced by marketing preferences.
          </Text>
          <Button onPress={async () => { if (timerPreferences) await client.timerApi.update({ monitoring_strategy: timerPreferences.monitoring_strategy, cancel_escalation_on_movement: timerPreferences.cancel_escalation_on_movement }); setPanel(null); }}>Save preferences</Button>
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "security"}
        title="Security"
      >
        <View style={styles.stack}>
          <Authorization
            title={
              biometricEnabled
                ? "Biometric quick unlock enabled"
                : "Biometric quick unlock not enabled"
            }
          />
          <Text style={styles.body}>
            Biometrics unlock a device-bound session. OTP remains your primary
            credential.
          </Text>
          <Authorization title="Rotating session token" />
          <Text style={styles.sectionLabel}>MONITORING DEVICE</Text>
          {devices.map((device) => <Card key={String(device.id)}><View style={styles.row}><View><Text style={styles.cardTitle}>{String(device.platform).toUpperCase()}</Text><Text style={styles.body}>{device.lastSeenAt ? `Last active ${new Date(String(device.lastSeenAt)).toLocaleString()}` : "Not active yet"}</Text></View>{device.monitoringSource ? <Badge>Source of truth</Badge> : <Badge>Account access only</Badge>}</View></Card>)}
          <Text style={styles.body}>Only one phone supplies motion signals. You can still use other phones or the desktop portal to manage your account.</Text>
          <Authorization title="Privacy PIN · Property and Wishes" />
          <Text style={styles.body}>The privacy PIN cannot be unlocked with biometrics. PIN setup and verified reset controls will live only here.</Text>
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "history"}
        title="History"
      >
        <View style={styles.stack}>
          <Text style={styles.cardTitle}>{history.length ? `${history.length} recent account events` : "No account events yet."}</Text>
          {history.length ? history.map((item) => <Card key={String(item.id)}><Text style={styles.cardTitle}>{String(item.eventType).replaceAll("_", " ").toUpperCase()}</Text><Text style={styles.body}>{String(item.entityType ?? "Account")} · {new Date(String(item.createdAt)).toLocaleString()}</Text></Card>) : <Text style={styles.body}>Check-ins, plan changes, authorizations, notifications, and incidents appear here when recorded.</Text>}
        </View>
      </Modal>
      <Modal
        onClose={() => setPanel(null)}
        open={panel === "role"}
        title="My Role"
      >
        <View style={styles.stack}>
          <Badge>Nominated contact</Badge>
          <Text style={styles.cardTitle}>Plans I’m nominated in</Text>
          <Text style={styles.body}>
            Open My Role to review plans linked to this verified identity.
          </Text>
          <Card>
            <Text style={styles.cardTitle}>During an active alert</Text>
            <Text style={styles.body}>
              You see only the information the plan owner authorized for your
              role.
            </Text>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
const items: { id: Exclude<Panel, null>; title: string }[] = [
  { id: "profile", title: "Profile" },
  { id: "subscription", title: "Subscription" },
  { id: "legal", title: "Legal authorizations" },
  { id: "notifications", title: "Notifications" },
  { id: "security", title: "Security" },
  { id: "history", title: "History" },
  { id: "role", title: "Switch role · My Role" },
];
function Authorization({ title }: { title: string }) {
  return (
    <Card>
      <View style={styles.row}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Badge>Prepared</Badge>
      </View>
    </Card>
  );
}
function Toggle({
  label,
  value,
  onPress,
}: {
  label: string;
  value: boolean;
  onPress(): void;
}) {
  return (
    <Button onPress={onPress} variant={value ? "primary" : "secondary"}>
      {label}: {value ? "On" : "Off"}
    </Button>
  );
}
const styles = StyleSheet.create({
  root: { backgroundColor: colors.obsidian, flex: 1 },
  content: {
    alignSelf: "center",
    gap: spacing[3],
    maxWidth: 640,
    padding: spacing[4],
    paddingBottom: spacing[16],
    width: "100%",
  },
  eyebrow: { ...typography.label, color: colors.guardianGreen },
  title: { ...typography.displayM, color: colors.white },
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[2] },
  cardTitle: { ...typography.heading, color: colors.white },
  sectionLabel: { ...typography.label, color: colors.mist },
  disabledSetting: { opacity: 0.35 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stack: { gap: spacing[3] },
});
