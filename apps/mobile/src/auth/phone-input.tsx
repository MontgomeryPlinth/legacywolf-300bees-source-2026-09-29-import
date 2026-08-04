import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, Search, X } from "lucide-react-native";
import { getLocales } from "expo-localization";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { getCountryForTimezone } from "countries-and-timezones";
import { colors, radii, spacing, typography } from "@legacy-wolf/tokens";
import { Label } from "@legacy-wolf/ui";
export { toE164, validPhone } from "./phone-utils";

const countries = getCountries();

export function detectedCountry(): CountryCode {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneCountry = timezone ? getCountryForTimezone(timezone)?.id : null;
  if (timezoneCountry && countries.includes(timezoneCountry as CountryCode)) return timezoneCountry as CountryCode;
  const region = getLocales()[0]?.regionCode?.toUpperCase();
  return countries.includes(region as CountryCode) ? region as CountryCode : "AU";
}

export function InternationalPhoneInput({ value, country, onChange, onCountryChange, label = "Mobile number" }: { value: string; country: CountryCode; onChange(value: string): void; onCountryChange(country: CountryCode): void; label?: string }) {
  const [open, setOpen] = useState(false);
  const [callingCode, setCallingCode] = useState(getCountryCallingCode(country));
  useEffect(() => setCallingCode(getCountryCallingCode(country)), [country]);
  function changeCallingCode(next: string) {
    const digits = next.replace(/\D/g, "").slice(0, 4);
    setCallingCode(digits);
    const match = countries.find((code) => getCountryCallingCode(code) === digits);
    if (match) onCountryChange(match);
  }
  function changeNumber(next: string) {
    if (next.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(next);
      if (parsed?.country) {
        onCountryChange(parsed.country);
        setCallingCode(parsed.countryCallingCode);
        onChange(parsed.nationalNumber);
        return;
      }
    }
    onChange(next.replace(/[^\d\s()+-]/g, ""));
  }
  return (
    <View>
      <Label>{label}</Label>
      <View style={styles.inputRow}>
        <Pressable accessibilityLabel="Choose country code" onPress={() => setOpen(true)} style={styles.flagButton}>
          <Text style={styles.flag}>{flag(country)}</Text>
          <ChevronDown color={colors.mist} size={15} />
        </Pressable>
        <View style={styles.codeField}><Text style={styles.plus}>+</Text><TextInput accessibilityLabel="Country calling code" keyboardType="number-pad" maxLength={4} onChangeText={changeCallingCode} selectTextOnFocus style={styles.codeInput} value={callingCode} /></View>
        <View style={styles.divider} />
        <TextInput accessibilityLabel={`${label} without country code`} keyboardType="phone-pad" onChangeText={changeNumber} placeholder="Mobile number" placeholderTextColor={colors.slate} style={styles.input} value={value} />
      </View>
      <CountryPicker open={open} selected={country} onClose={() => setOpen(false)} onSelect={(next) => { onCountryChange(next); setCallingCode(getCountryCallingCode(next)); setOpen(false); }} />
    </View>
  );
}

function CountryPicker({ open, selected, onClose, onSelect }: { open: boolean; selected: CountryCode; onClose(): void; onSelect(country: CountryCode): void }) {
  const [query, setQuery] = useState("");
  const names = useMemo(() => typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames([getLocales()[0]?.languageCode ?? "en"], { type: "region" }) : null, []);
  const rows = useMemo(() => countries.map((code) => ({ code, name: names?.of(code) ?? code, callingCode: getCountryCallingCode(code) })).filter((item) => `${item.name} ${item.code} ${item.callingCode}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)), [names, query]);
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={open}>
      <SafeAreaView style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>SELECT COUNTRY</Text><Pressable accessibilityLabel="Close country picker" onPress={onClose}><X color={colors.white} size={22} /></Pressable></View>
          <View style={styles.searchRow}><Search color={colors.slate} size={18} /><TextInput autoFocus onChangeText={setQuery} placeholder="Search country or code" placeholderTextColor={colors.slate} style={styles.searchInput} value={query} /></View>
          <FlatList data={rows} keyboardShouldPersistTaps="handled" keyExtractor={(item) => item.code} renderItem={({ item }) => <Pressable onPress={() => onSelect(item.code)} style={[styles.countryRow, item.code === selected && styles.selectedRow]}><Text style={styles.rowFlag}>{flag(item.code)}</Text><Text numberOfLines={1} style={styles.countryName}>{item.name}</Text><Text style={styles.callingCode}>+{item.callingCode}</Text></Pressable>} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function flag(country: CountryCode) {
  return String.fromCodePoint(...country.split("").map((letter) => 127397 + letter.charCodeAt(0)));
}

const styles = StyleSheet.create({
  inputRow: { alignItems: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderRadius: radii.input, borderWidth: 1, flexDirection: "row", minHeight: 52 },
  flagButton: { alignItems: "center", flexDirection: "row", flexGrow: 0, flexShrink: 0, gap: 2, height: 52, justifyContent: "center", paddingLeft: spacing[2], width: 50 },
  flag: { fontSize: 20 },
  codeField: { alignItems: "center", flexDirection: "row", flexGrow: 0, flexShrink: 0, justifyContent: "center", paddingRight: spacing[2], width: 46 },
  plus: { ...typography.bodySmall, color: colors.white, fontWeight: "600" },
  codeInput: { ...typography.bodySmall, color: colors.white, fontWeight: "600", height: 48, outlineWidth: 0, padding: 0, textAlign: "left", width: 24 },
  divider: { backgroundColor: colors.coal, height: 28, width: 1 },
  input: { ...typography.body, color: colors.white, flex: 1, minHeight: 52, paddingHorizontal: spacing[3], outlineStyle: "none" } as never,
  modalBackdrop: { backgroundColor: colors.obsidian, flex: 1, justifyContent: "flex-end" },
  sheet: { alignSelf: "center", backgroundColor: colors.graphite, borderColor: colors.coal, borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card, borderWidth: 1, height: "82%", maxWidth: 520, padding: spacing[4], width: "100%" },
  sheetHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: spacing[4] },
  sheetTitle: { ...typography.heading, color: colors.white, fontWeight: "900" },
  searchRow: { alignItems: "center", backgroundColor: colors.onyx, borderRadius: radii.input, flexDirection: "row", gap: spacing[2], marginBottom: spacing[3], paddingHorizontal: spacing[3] },
  searchInput: { ...typography.body, color: colors.white, flex: 1, minHeight: 48, outlineStyle: "none" } as never,
  countryRow: { alignItems: "center", borderBottomColor: colors.coal, borderBottomWidth: 1, flexDirection: "row", gap: spacing[3], minHeight: 52, paddingHorizontal: spacing[2] },
  selectedRow: { backgroundColor: colors.onyx },
  rowFlag: { fontSize: 22 },
  countryName: { ...typography.body, color: colors.white, flex: 1 },
  callingCode: { ...typography.bodySmall, color: colors.guardianGreen, fontWeight: "700" },
});
