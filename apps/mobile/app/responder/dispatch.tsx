import { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { Badge, Button, Card } from "@legacy-wolf/ui";
import { colors, spacing, typography } from "@legacy-wolf/tokens";
import { ResponderScreen } from "../../src/responder/screen";
import { useOperationsApi } from "../../src/auth/session";
export default function Dispatch() {
  const api = useOperationsApi();
  const [dispatch, setDispatch] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { void api.dispatches().then((rows) => setDispatch(rows.find((row) => row.status !== "completed") ?? null)); }, [api]);
  async function advance() {
    if (!dispatch) return;
    if (dispatch.status === "offered") await api.acceptDispatch(String(dispatch.id));
    else if (dispatch.status === "accepted") await api.arrive(String(dispatch.id));
    const rows = await api.dispatches(); setDispatch(rows.find((row) => row.status !== "completed") ?? null);
  }
  return (
    <ResponderScreen
      title="ACTIVE DISPATCH"
      body="Incident information appears only after you accept a dispatch."
    >
      {dispatch ? <DispatchDetails dispatch={dispatch} onAdvance={() => void advance()} /> : <Card><Text style={s.heading}>No active dispatch.</Text><Text style={s.body}>New authorized incidents appear here while you are on shift.</Text></Card>}
    </ResponderScreen>
  );
}
function DispatchDetails({ dispatch, onAdvance }: { dispatch: Record<string, unknown>; onAdvance(): void }) {
  const incident = dispatch.incident as Record<string, unknown> | undefined;
  const plan = incident?.plan as Record<string, unknown> | undefined;
  const property = plan?.property as Record<string, unknown> | undefined;
  const address = property?.address as Record<string, unknown> | undefined;
  const people = Array.isArray(plan?.people) ? plan.people as Record<string, unknown>[] : [];
  const pets = Array.isArray(plan?.pets) ? plan.pets as Record<string, unknown>[] : [];
  return <View style={s.stack}><Card><View style={s.row}><View><Text style={s.label}>DISPATCH ID</Text><Text style={s.heading}>#{String(dispatch.id).slice(0, 8).toUpperCase()}</Text></View><Badge>{String(dispatch.status)}</Badge></View><Text style={s.body}>Service tier: {String(plan?.tier ?? "Authorized response")}</Text></Card><Card><Text style={s.section}>USER BRIEF</Text><Text style={s.body}>{people.length ? `${people.length} authorized contact${people.length === 1 ? "" : "s"}` : "No nominated contacts supplied."}</Text></Card><Card><Text style={s.section}>PROPERTY ACCESS</Text><Text style={s.heading}>{address ? [address.line1, address.suburb, address.region].filter(Boolean).join(", ") : "Address pending"}</Text><Text style={s.body}>Encrypted access details remain sealed until the incident permits an audited reveal.</Text></Card>{pets.map((pet) => <Card key={String(pet.id)}><Text style={s.section}>PET: {String(pet.name).toUpperCase()}</Text><Text style={s.body}>{[pet.species, pet.breed].filter(Boolean).join(" · ") || "Care details not supplied"}</Text></Card>)}<Button onPress={onAdvance}>{dispatch.status === "offered" ? "Accept dispatch" : dispatch.status === "accepted" ? "Mark on scene" : "Dispatch active"}</Button></View>;
}
const s = StyleSheet.create({
  heading: { ...typography.heading, color: colors.white },
  body: { ...typography.body, color: colors.mist, marginTop: spacing[2] },
  stack: { gap: spacing[3] },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  label: { ...typography.label, color: colors.mist },
  section: { ...typography.label, color: colors.white, marginBottom: spacing[2] },
});
