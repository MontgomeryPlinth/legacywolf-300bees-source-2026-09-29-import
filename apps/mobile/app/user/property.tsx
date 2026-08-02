import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Building2, Camera, Home, Info, Plus, Shield, Trash2, Video } from "lucide-react-native";
import { Badge, Button, Card, Input, Label, Modal, OtpInput, Skeleton } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import type { AccessDetail, Property } from "@legacy-wolf/core";
import { useSession } from "../../src/auth/session";
export default function PropertyAccessScreen() {
  const { account, client, requestOtp, verifyOtp, completeAuthentication, developmentOtpCode } = useSession();
  const [property, setProperty] = useState<Property | null | undefined>(
    undefined,
  );
  const [details, setDetails] = useState<AccessDetail[]>([]);
  const [line1, setLine1] = useState("");
  const [suburb, setSuburb] = useState("");
  const [region, setRegion] = useState("");
  const [postal, setPostal] = useState("");
  const [keysafe, setKeysafe] = useState("");
  const [alarm, setAlarm] = useState("");
  const [notice, setNotice] = useState("");
  const [resetField, setResetField] = useState<"keysafe_code" | "alarm_code" | null>(null);
  const [resetChannel, setResetChannel] = useState<"sms" | "email" | null>(null);
  const [resetCode, setResetCode] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [unlockedField, setUnlockedField] = useState<"keysafe_code" | "alarm_code" | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessTab, setAccessTab] = useState<"building" | "unit" | "alarm">("building");
  const [accessMethod, setAccessMethod] = useState("keysafe");
  const [accessValues, setAccessValues] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Array<{ id: string; section: "building" | "unit" | "alarm"; mediaType: "image" | "video"; dataUrl: string; label: string }>>([]);
  async function load() {
    const [p, d, m] = await Promise.all([
      client.propertyApi.get(),
      client.propertyApi.listAccessDetails(),
      client.propertyApi.listAccessMedia(),
    ]);
    setProperty(p);
    setDetails(d);
    setMedia(m);
    if (p) {
      setLine1(p.address.line1);
      setSuburb(p.address.suburb);
      setRegion(p.address.region);
      setPostal(p.address.postal_code);
    }
  }
  function updateAccess(field: string, value: string) { setAccessValues((current) => ({ ...current, [field]: value })); }
  async function saveAccessEditor() {
    if (!property) { setNotice("Save the property address before adding access details."); return; }
    const entries = Object.entries({ ...accessValues, unit_access_method: accessMethod }).filter(([, value]) => value.trim());
    await Promise.all(entries.map(([field, value]) => client.propertyApi.saveAccessDetail(field, value)));
    setAccessValues({}); setAccessOpen(false); await load(); setNotice("Access instructions encrypted and saved.");
  }
  async function addMedia(type: "image" | "video") {
    if (!property) { setNotice("Save the property address before adding media."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: type === "image" ? ["images"] : ["videos"], allowsMultipleSelection: true, base64: type === "image", quality: 0.8 });
    if (result.canceled) return;
    await Promise.all(result.assets.map((asset) => client.propertyApi.addAccessMedia({ section: accessTab, mediaType: type, dataUrl: asset.base64 ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}` : asset.uri, label: asset.fileName ?? "" })));
    setMedia(await client.propertyApi.listAccessMedia());
  }
  async function removeMedia(id: string) { await client.propertyApi.removeAccessMedia(id); setMedia((current) => current.filter((item) => item.id !== id)); }
  useEffect(() => {
    void load();
  }, []);
  async function saveAddress() {
    const saved = await client.propertyApi.save({
      address: {
        line1,
        line2: null,
        suburb,
        region,
        postal_code: postal,
        country_code: "AU",
      },
      property_type: null,
      unit_details: null,
    });
    setProperty(saved);
    setNotice("Property address saved.");
  }
  async function saveSecret(field: string, value: string, clear: () => void) {
    if (!property) {
      setNotice("Save the property address before adding access details.");
      return;
    }
    await client.propertyApi.saveAccessDetail(field, value);
    clear();
    setUnlockedField(null);
    await load();
    setNotice("Access detail encrypted and saved.");
  }
  async function beginReset(field: "keysafe_code" | "alarm_code", channel: "sms" | "email") {
    const identity = channel === "sms" ? account?.phone_e164 : account?.email;
    if (!identity) return;
    setResetLoading(true); setResetError("");
    try {
      await requestOtp(identity, channel);
      setResetField(field); setResetChannel(channel); setResetCode("");
    } catch (reason) { setResetError(reason instanceof Error ? reason.message : "We could not send the verification code."); }
    finally { setResetLoading(false); }
  }
  async function confirmReset() {
    if (!resetField) return;
    setResetLoading(true); setResetError("");
    try {
      const verified = await verifyOtp(resetCode);
      completeAuthentication(verified);
      setUnlockedField(resetField); setResetField(null); setResetChannel(null); setResetCode("");
      setNotice("Identity verified. Enter the replacement code and save it.");
    } catch (reason) { setResetError(reason instanceof Error ? reason.message : "We could not verify that code."); }
    finally { setResetLoading(false); }
  }
  if (property === undefined)
    return (
      <View style={styles.loading}>
        <Skeleton height={48} />
        <Skeleton height={220} />
      </View>
    );
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.eyebrow}>WRITE-ONLY ACCESS</Text>
          <Text style={styles.title}>PROPERTY</Text>
          <Text style={styles.body}>
            You instruct us how an assigned responder may reach your address.
            Saved codes are never returned to this device.
          </Text>
        </View>
        {notice ? (
          <Card style={styles.notice}>
            <Text style={styles.noticeText}>{notice}</Text>
          </Card>
        ) : null}
        <Card>
          <Text style={styles.cardTitle}>Registered address</Text>
          <View style={styles.stack}>
            <Button onPress={() => setAccessOpen(true)} variant="secondary">Edit all access details</Button>
            <Field label="Street address" onChange={setLine1} value={line1} />
            <Field label="Suburb" onChange={setSuburb} value={suburb} />
            <Field
              label="State or territory"
              onChange={setRegion}
              value={region}
            />
            <Field label="Postcode" onChange={setPostal} value={postal} />
            <Button
              disabled={!line1 || !suburb || !region || !postal}
              onPress={saveAddress}
            >
              Save address
            </Button>
          </View>
        </Card>
        <Card>
          <View style={styles.row}>
            <Text style={styles.cardTitle}>Encrypted access details</Text>
            <Badge>Audited</Badge>
          </View>
          <Text style={styles.body}>
            After saving, only •••• is shown. Enter a new value to replace an
            existing one.
          </Text>
          <View style={styles.stack}>
            {!details.some((d) => d.field_name === "keysafe_code") || unlockedField === "keysafe_code" ? <><Field
              label="Key safe code"
              onChange={setKeysafe}
              secure
              value={keysafe}
            />
            {details.some((d) => d.field_name === "keysafe_code") ? (
              <Text style={styles.masked}>SAVED: ••••</Text>
            ) : null}
            <Button
              disabled={!keysafe}
              onPress={() =>
                saveSecret("keysafe_code", keysafe, () => setKeysafe(""))
              }
            >
              Save key safe code
            </Button>
            </> : <ResetActions label="key safe code" account={account} loading={resetLoading} onReset={(channel) => void beginReset("keysafe_code", channel)} />}
            {!details.some((d) => d.field_name === "alarm_code") || unlockedField === "alarm_code" ? <><Field
              label="Alarm code"
              onChange={setAlarm}
              secure
              value={alarm}
            />
            {details.some((d) => d.field_name === "alarm_code") ? (
              <Text style={styles.masked}>SAVED: ••••</Text>
            ) : null}
            <Button
              disabled={!alarm}
              onPress={() =>
                saveSecret("alarm_code", alarm, () => setAlarm(""))
              }
            >
              Save alarm code
            </Button>
            </> : <ResetActions label="alarm code" account={account} loading={resetLoading} onReset={(channel) => void beginReset("alarm_code", channel)} />}
          </View>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Responder access rule</Text>
          <Text style={styles.body}>
            Access details can be released only during a verified incident or an
            audited admin reveal. Every decryption is recorded.
          </Text>
        </Card>
      </ScrollView>
      <Modal onClose={() => setAccessOpen(false)} open={accessOpen} title="Edit Access Details">
        <ScrollView contentContainerStyle={styles.accessEditor}>
          <Text style={styles.body}>Update your property access information for emergency responders</Text>
          <View style={styles.tabs}><AccessTab icon={Building2} label="Building" active={accessTab === "building"} onPress={() => setAccessTab("building")} /><AccessTab icon={Home} label="Unit" active={accessTab === "unit"} onPress={() => setAccessTab("unit")} /><AccessTab icon={Shield} label="Alarm" active={accessTab === "alarm"} onPress={() => setAccessTab("alarm")} /></View>
          {accessTab === "building" ? <><AccessField field="building_intercom" label="Intercom Instructions" hint="How responders should use the intercom to gain building access" placeholder="Press 7B, speak to concierge" values={accessValues} update={updateAccess} /><AccessField field="building_concierge" label="Concierge Information" hint="Details about building staff who can assist" placeholder="24/7 concierge desk in main lobby" values={accessValues} update={updateAccess} /><AccessField field="building_after_hours_code" label="After Hours Access Code" hint="Code for building entry outside business hours" values={accessValues} update={updateAccess} /></> : null}
          {accessTab === "unit" ? <><Label>HOW MAY A RESPONDER ENTER?</Label><View style={styles.methodGrid}>{accessMethods.map((method) => <Pressable key={method.value} onPress={() => setAccessMethod(method.value)} style={[styles.method, accessMethod === method.value && styles.methodActive]}><Text style={[styles.methodText, accessMethod === method.value && styles.methodTextActive]}>{method.label}</Text></Pressable>)}</View><UnitBranch method={accessMethod} values={accessValues} update={updateAccess} /></> : null}
          {accessTab === "alarm" ? <><AccessField field="alarm_system" label="Alarm System" hint="The brand or type of alarm system installed" placeholder="ADT, SimpliSafe, or none" values={accessValues} update={updateAccess} /><AccessField field="alarm_code" label="Disarm Code" hint="The code to disarm your alarm system" secure values={accessValues} update={updateAccess} /><AccessField field="alarm_panel" label="Panel Location & Instructions" hint="Where the alarm panel is and how to disarm it" values={accessValues} update={updateAccess} /></> : null}
          <View style={styles.mediaHeader}><Text style={styles.sectionLabel}>PHOTOS & VIDEOS</Text><View style={styles.mediaActions}><Pressable onPress={() => void addMedia("image")}><Camera color={colors.guardianGreen} size={18} /></Pressable><Pressable onPress={() => void addMedia("video")}><Video color={colors.guardianGreen} size={18} /></Pressable></View></View>
          <View style={styles.info}><Info color={colors.guardianGreen} size={16} /><Text style={styles.infoText}>Photos and videos help responders locate access points quickly. Be as specific as possible.</Text></View>
          <Pressable onPress={() => void addMedia("image")} style={styles.addMedia}><Plus color={colors.mist} size={16} /><Text style={styles.body}>Add a photo or video</Text></Pressable>
          <View style={styles.mediaGrid}>{media.filter((item) => item.section === accessTab).map((item) => <View key={item.id} style={styles.mediaItem}>{item.mediaType === "image" ? <Image source={{ uri: item.dataUrl }} style={styles.mediaImage} /> : <View style={styles.videoPlaceholder}><Video color={colors.guardianGreen} size={24} /><Text style={styles.body}>{item.label || "Access video"}</Text></View>}<Pressable onPress={() => void removeMedia(item.id)} style={styles.mediaDelete}><Trash2 color={colors.white} size={14} /></Pressable></View>)}</View>
          <Card><Text style={styles.cardTitle}>Security Notice:</Text><Text style={styles.body}>This information is encrypted and only visible to authorized accredited Legacy Wolf responders during an active incident. Every access is logged and auditable.</Text></Card>
          <Button onPress={saveAccessEditor}>Save Changes</Button>
        </ScrollView>
      </Modal>
      <Modal onClose={() => { setResetField(null); setResetError(""); }} open={Boolean(resetField)} title="Verify before resetting">
        <View style={styles.stack}>
          <Text style={styles.body}>Enter the six-digit code sent by {resetChannel === "sms" ? "SMS" : "email"} to your verified {resetChannel === "sms" ? account?.phone_e164 : account?.email}.</Text>
          <OtpInput onChange={setResetCode} value={resetCode} />
          {developmentOtpCode ? <Text style={styles.devCode}>LOCAL CODE: {developmentOtpCode}</Text> : null}
          {resetError ? <Text accessibilityRole="alert" style={styles.error}>{resetError}</Text> : null}
          <Button disabled={resetCode.length !== 6} loading={resetLoading} onPress={confirmReset}>Verify and reset code</Button>
        </View>
      </Modal>
    </View>
  );
}
const accessMethods = [{ value: "keysafe", label: "Key safe" }, { value: "door_code", label: "Door code" }, { value: "neighbour", label: "Neighbour-held key" }, { value: "building_manager", label: "Building manager" }, { value: "caretaker", label: "Caretaker" }, { value: "locksmith", label: "Locksmith" }, { value: "force_entry", label: "Force-entry authorization" }];
function AccessTab({ icon: Icon, label, active, onPress }: { icon: typeof Home; label: string; active: boolean; onPress(): void }) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Icon color={active ? colors.guardianGreen : colors.mist} size={15} /><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }
function AccessField({ field, label, hint, placeholder, secure, values, update }: { field: string; label: string; hint: string; placeholder?: string; secure?: boolean; values: Record<string, string>; update(field: string, value: string): void }) { return <View><Label>{label}</Label><Input onChangeText={(value) => update(field, value)} placeholder={placeholder} secureTextEntry={secure} value={values[field] ?? ""} /><Text style={styles.hint}>{hint}</Text></View>; }
function UnitBranch({ method, values, update }: { method: string; values: Record<string, string>; update(field: string, value: string): void }) {
  const fields: Record<string, Array<[string, string, string]>> = {
    keysafe: [["keysafe_location", "Key safe location", "Describe its exact location"], ["keysafe_code", "Key safe code", "Combination or access code"], ["door_information", "Door & lock information", "Door, lock, and entry instructions"]],
    door_code: [["unit_door_code", "Door entry code", "Code used to unlock the unit"], ["door_information", "Door & lock information", "Any special lock instructions"]],
    neighbour: [["keyholder_name", "Neighbour’s full name", "Person authorized to hold the key"], ["keyholder_contact", "Neighbour’s phone", "How the responder contacts them"], ["keyholder_address", "Where to collect the key", "Unit or nearby address and instructions"]],
    building_manager: [["manager_name", "Building manager", "Manager or management company"], ["manager_contact", "Manager contact", "Phone and after-hours details"], ["manager_instructions", "Collection instructions", "How access will be released"]],
    caretaker: [["caretaker_name", "Caretaker name", "Authorized caretaker"], ["caretaker_contact", "Caretaker contact", "Phone and availability"], ["caretaker_instructions", "Access instructions", "How the responder receives the key"]],
    locksmith: [["locksmith_name", "Preferred locksmith", "Business or locksmith name"], ["locksmith_contact", "Locksmith contact", "Phone and account details"], ["locksmith_limit", "Authorized spending limit", "Maximum amount authorized"], ["locksmith_instructions", "Authorization instructions", "Conditions and nominated-contact approval"]],
    force_entry: [["force_entry_scope", "Authorized entry methods", "Specify doors, windows, locks, and prohibited methods"], ["force_entry_limit", "Damage or spending limit", "Maximum authorized cost or damage"], ["force_entry_conditions", "Authorization conditions", "When force may be used and who must be contacted first"]],
  };
  return <View style={styles.stack}>{(fields[method] ?? []).map(([field, label, hint]) => <AccessField key={field} field={field} label={label} hint={hint} secure={field.includes("code")} values={values} update={update} />)}{method === "force_entry" ? <View style={styles.warning}><Text style={styles.warningText}>Force entry is used only during a verified active incident and within the authorization recorded here. Every action is audited.</Text></View> : null}</View>;
}
function ResetActions({ label, account, loading, onReset }: { label: string; account: ReturnType<typeof useSession>["account"]; loading: boolean; onReset(channel: "sms" | "email"): void }) {
  return <View style={styles.resetBox}><Text style={styles.masked}>{label.toUpperCase()} SAVED: ••••</Text><Text style={styles.body}>Verify your identity before replacing this encrypted code.</Text>{account?.phone_e164 ? <Button loading={loading} onPress={() => onReset("sms")} variant="secondary">Reset with SMS</Button> : null}{account?.email ? <Button loading={loading} onPress={() => onReset("email")} variant="secondary">Reset with email</Button> : null}</View>;
}
function Field({
  label,
  value,
  onChange,
  secure = false,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  secure?: boolean;
}) {
  return (
    <View>
      <Label>{label}</Label>
      <Input onChangeText={onChange} secureTextEntry={secure} value={value} />
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
  eyebrow: { ...typography.label, color: colors.guardianGreen },
  title: { ...typography.displayM, color: colors.white },
  body: { ...typography.bodySmall, color: colors.mist, marginTop: spacing[2] },
  cardTitle: { ...typography.heading, color: colors.white },
  stack: { gap: spacing[3], marginTop: spacing[4] },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  masked: { ...typography.label, color: colors.guardianGreen },
  notice: { borderColor: colors.guardianGreen },
  noticeText: { ...typography.bodySmall, color: colors.white },
  resetBox: { borderColor: colors.coal, borderRadius: 12, borderWidth: 1, gap: spacing[2], padding: spacing[3] },
  devCode: { ...typography.label, color: colors.guardianGreen, textAlign: "center" },
  error: { ...typography.bodySmall, color: colors.ember },
  accessEditor: { gap: spacing[4], paddingBottom: spacing[6] },
  tabs: { backgroundColor: colors.graphite, borderRadius: 999, flexDirection: "row", padding: 3 },
  tab: { alignItems: "center", borderRadius: 999, flex: 1, flexDirection: "row", gap: spacing[1], justifyContent: "center", padding: spacing[2] },
  tabActive: { backgroundColor: colors.onyx },
  tabText: { ...typography.label, color: colors.mist, fontSize: 9 },
  tabTextActive: { color: colors.white },
  hint: { ...typography.bodySmall, color: colors.slate, marginTop: spacing[1] },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  method: { borderColor: colors.coal, borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
  methodActive: { backgroundColor: colors.guardianGreen, borderColor: colors.guardianGreen },
  methodText: { ...typography.label, color: colors.mist, fontSize: 9 },
  methodTextActive: { color: colors.obsidian },
  sectionLabel: { ...typography.label, color: colors.mist },
  mediaHeader: { alignItems: "center", borderTopColor: colors.coal, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: spacing[3] },
  mediaActions: { flexDirection: "row", gap: spacing[4] },
  info: { alignItems: "flex-start", backgroundColor: "rgba(181,196,44,0.08)", borderColor: "rgba(181,196,44,0.25)", borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: spacing[2], padding: spacing[3] },
  infoText: { ...typography.bodySmall, color: colors.mist, flex: 1 },
  addMedia: { alignItems: "center", borderColor: colors.coal, borderRadius: 12, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", gap: spacing[2], justifyContent: "center", padding: spacing[4] },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  mediaItem: { backgroundColor: colors.graphite, borderRadius: 12, height: 120, overflow: "hidden", position: "relative", width: "48%" },
  mediaImage: { height: "100%", width: "100%" },
  videoPlaceholder: { alignItems: "center", flex: 1, justifyContent: "center", padding: spacing[2] },
  mediaDelete: { backgroundColor: "rgba(0,0,0,0.7)", borderRadius: 999, padding: spacing[2], position: "absolute", right: spacing[2], top: spacing[2] },
  warning: { backgroundColor: "rgba(230,78,54,0.10)", borderColor: colors.ember, borderRadius: 12, borderWidth: 1, padding: spacing[3] },
  warningText: { ...typography.bodySmall, color: colors.white },
});
