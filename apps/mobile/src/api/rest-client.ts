import * as SecureStore from "../storage/secure";
import {
  AccountSchema,
  AccessDetailSchema,
  HandoffLetterSchema,
  MotionTimerSchema,
  PersonSchema,
  PetSchema,
  PlanSchema,
  PropertySchema,
  ResponseQueueStepSchema,
  type Account,
  type AccessDetail,
  type HandoffLetter,
  type MotionTimer,
  type Person,
  type Pet,
  type Plan,
  type Property,
  type ResponseQueueStep,
  type VoiceMemo,
} from "@legacy-wolf/core";
import { deviceId } from "../motion/heartbeat";

export class RestApiClient {
  constructor(private readonly baseUrl: string) {}
  private async request(path: string, init?: RequestInit) {
    let token = await SecureStore.getItemAsync("legacy-wolf-access-token");
    let response = await fetch(`${this.baseUrl}/v1${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
    if (response.status === 401) {
      token = await this.refreshSession();
      response = await fetch(`${this.baseUrl}/v1${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      });
    }
    if (!response.ok) throw new Error(await responseMessage(response));
    if (response.status === 204) return undefined;
    const text = await response.text();
    return text ? JSON.parse(text) : undefined;
  }
  private async refreshSession() {
    const refreshToken = await SecureStore.getItemAsync(
      "legacy-wolf-refresh-token",
    );
    if (!refreshToken)
      throw new Error("Your session has expired. Log in again.");
    const response = await fetch(`${this.baseUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken, deviceId: await deviceId() }),
    });
    if (!response.ok) {
      await Promise.all([
        SecureStore.deleteItemAsync("legacy-wolf-access-token"),
        SecureStore.deleteItemAsync("legacy-wolf-refresh-token"),
      ]);
      throw new Error("Your session has expired. Log in again.");
    }
    const session = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    await Promise.all([
      SecureStore.setItemAsync("legacy-wolf-access-token", session.accessToken),
      SecureStore.setItemAsync(
        "legacy-wolf-refresh-token",
        session.refreshToken,
      ),
    ]);
    return session.accessToken;
  }
  auth = {
    requestOtp: async () => {
      throw new Error("Use the session authentication client.");
    },
    requestSignupOtp: async () => {
      throw new Error("Use the session authentication client.");
    },
    verifyOtp: async () => {
      throw new Error("Use the session authentication client.");
    },
    login: async () => {
      throw new Error("Use the session authentication client.");
    },
    current: async (): Promise<Account | null> =>
      mapAccount(await this.request("/account")),
    logout: async () => undefined,
  };
  operations = {
    dashboard: () => this.request("/admin/dashboard") as Promise<{ users: number; responders: number; activeIncidents: number; protectedPlans: number }>,
    incidents: () => this.request("/admin/incidents") as Promise<Record<string, unknown>[]>,
    users: (query = "") => this.request(`/admin/users?q=${encodeURIComponent(query)}`) as Promise<Record<string, unknown>[]>,
    responders: (query = "") => this.request(`/admin/responders?q=${encodeURIComponent(query)}`) as Promise<Record<string, unknown>[]>,
    shift: () => this.request("/responder/shift") as Promise<Record<string, unknown> | null>,
    startShift: () => this.request("/responder/shift/start", { method: "POST", body: "{}" }) as Promise<Record<string, unknown>>,
    endShift: () => this.request("/responder/shift/end", { method: "POST" }) as Promise<Record<string, unknown>>,
    dispatches: () => this.request("/responder/dispatches") as Promise<Record<string, unknown>[]>,
    acceptDispatch: (id: string) => this.request(`/responder/dispatches/${id}/accept`, { method: "POST" }),
    arrive: (id: string) => this.request(`/responder/dispatches/${id}/arrive`, { method: "POST" }),
    report: (incidentId: string, input: { outcome: string; notes: string; actions: string[] }) => this.request(`/responder/incidents/${incidentId}/report`, { method: "POST", body: JSON.stringify(input) }),
  };
  accountApi = {
    update: (input: { preferredName?: string | null; legalName?: string | null; dob?: string | null }) => this.request("/account", { method: "PATCH", body: JSON.stringify(input) }).then(mapAccount),
    history: () => this.request("/account/history") as Promise<Record<string, unknown>[]>,
    authorizations: () => this.request("/account/authorizations") as Promise<Record<string, unknown>[]>,
    authorize: (input: { kind: string; signerName: string; accepted: true }) => this.request("/account/authorizations", { method: "POST", body: JSON.stringify(input) }) as Promise<Record<string, unknown>>,
    devices: () => this.request("/account/devices") as Promise<Record<string, unknown>[]>,
    legalDocuments: () => this.request("/account/legal-documents") as Promise<Record<string, unknown>[]>,
    addLegalDocument: (input: { name: string; category: string; notes: string | null; mimeType: string; dataUrl: string }) => this.request("/account/legal-documents", { method: "POST", body: JSON.stringify(input) }) as Promise<Record<string, unknown>>,
  };
  nominated = {
    plans: () => this.request("/nominated/plans") as Promise<Record<string, unknown>[]>,
    incidents: () => this.request("/nominated/incidents") as Promise<Record<string, unknown>[]>,
    confirmSafe: (id: string) => this.request(`/nominated/incidents/${id}/safe`, { method: "POST" }),
  };
  plans = {
    get: async (): Promise<Plan> => mapPlan(await this.request("/plan")),
    update: async (
      patch: Partial<Pick<Plan, "tier" | "status">>,
    ): Promise<Plan> =>
      mapPlan(
        await this.request("/plan", {
          method: "PATCH",
          body: JSON.stringify(patch),
        }),
      ),
  };
  timerApi = {
    get: async (): Promise<MotionTimer> =>
      mapTimer(await this.request("/timer")),
    update: async (
      patch: Partial<Pick<MotionTimer, "interval_hours" | "grace_minutes" | "monitoring_strategy" | "cancel_escalation_on_movement">>,
    ): Promise<MotionTimer> =>
      mapTimer(
        await this.request("/timer", {
          method: "PATCH",
          body: JSON.stringify({
            intervalHours: patch.interval_hours,
            graceMinutes: patch.grace_minutes,
            monitoringStrategy: patch.monitoring_strategy,
            cancelEscalationOnMovement: patch.cancel_escalation_on_movement,
          }),
        }),
      ),
    checkIn: async (): Promise<MotionTimer> =>
      mapTimer(await this.request("/timer/check-in", { method: "POST" })),
    setMode: async (
      mode: MotionTimer["mode"],
      options: {
        until?: string;
        reason?: string;
        interval_hours?: number;
      } = {},
    ): Promise<MotionTimer> =>
      mapTimer(
        await this.request("/timer/mode", {
          method: "POST",
          body: JSON.stringify({
            mode,
            modeUntil: options.until,
            modeReason: options.reason,
            intervalHours: options.interval_hours,
          }),
        }),
      ),
    updateBatteryRule: async (input: { enabled: boolean; behaviour: "suppress" | "respond" | "alert_contact"; offlineEscalationHours: number }): Promise<MotionTimer> =>
      mapTimer(await this.request("/timer/battery-rule", { method: "PATCH", body: JSON.stringify(input) })),
  };
  peopleApi = crud<Person>(
    () =>
      this.request("/people").then((rows: unknown[]) => rows.map(mapPerson)),
    (input) =>
      this.request("/people", {
        method: "POST",
        body: JSON.stringify(personWrite(input)),
      }).then(mapPerson),
    (input) => this.request(`/people/${input.id}`, { method: "PUT", body: JSON.stringify(personWrite(input)) }).then(mapPerson),
    (id) => this.request(`/people/${id}`, { method: "DELETE" }),
  );
  petsApi = crud<Pet>(
    () => this.request("/pets").then((rows: unknown[]) => rows.map(mapPet)),
    (input) =>
      this.request("/pets", {
        method: "POST",
        body: JSON.stringify(petWrite(input)),
      }).then(mapPet),
    (input) =>
      this.request(`/pets/${input.id}`, {
        method: "PUT",
        body: JSON.stringify(petWrite(input)),
      }).then(mapPet),
    (id) => this.request(`/pets/${id}`, { method: "DELETE" }),
  );
  responseQueue = {
    ...crud<ResponseQueueStep>(
    () =>
      this.request("/response-queue").then((rows: unknown[]) =>
        rows.map(mapQueue),
      ),
    (input) =>
      this.request("/response-queue", {
        method: "POST",
        body: JSON.stringify(queueWrite(input)),
      }).then(mapQueue),
    (item) =>
      this.request(`/response-queue/${item.id}`, {
        method: "PUT",
        body: JSON.stringify(queueWrite(item)),
      }).then(mapQueue),
    (id) => this.request(`/response-queue/${id}`, { method: "DELETE" }),
    ),
    replace: (steps: Array<Omit<ResponseQueueStep, "id">>) =>
      this.request("/response-queue", { method: "PUT", body: JSON.stringify(steps.map(queueWrite)) }).then((rows: unknown[]) => rows.map(mapQueue)),
  };
  propertyApi = {
    get: async (): Promise<Property | null> => {
      const value = await this.request("/property");
      return value ? mapProperty(value) : null;
    },
    save: async (input: Omit<Property, "id" | "plan_id">): Promise<Property> =>
      mapProperty(
        await this.request("/property", {
          method: "PUT",
          body: JSON.stringify({
            address: input.address,
            propertyType: input.property_type,
            unitDetails: input.unit_details,
          }),
        }),
      ),
    saveAccessDetail: async (
      field_name: string,
      plaintext: string,
    ): Promise<AccessDetail> =>
      mapAccess(
        await this.request("/property/access", {
          method: "POST",
          body: JSON.stringify({ fieldName: field_name, plaintext }),
        }),
      ),
    listAccessDetails: async (): Promise<AccessDetail[]> => {
      const value = await this.request("/property");
      return Array.isArray(value?.accessDetails)
        ? value.accessDetails.map(mapAccess)
        : [];
    },
    listAccessMedia: async (): Promise<Array<{ id: string; section: "building" | "unit" | "alarm"; mediaType: "image" | "video"; dataUrl: string; label: string }>> => this.request("/property/access-media"),
    addAccessMedia: async (input: { section: "building" | "unit" | "alarm"; mediaType: "image" | "video"; dataUrl: string; label: string }) => this.request("/property/access-media", { method: "POST", body: JSON.stringify(input) }),
    removeAccessMedia: async (id: string) => this.request(`/property/access-media/${id}`, { method: "DELETE" }),
  };
  handoffLetters = crud<HandoffLetter>(
    () =>
      this.request("/wishes/letters").then((rows: unknown[]) =>
        rows.map(mapLetter),
      ),
    () =>
      Promise.reject(
        new Error("Use createHandoffLetter with encrypted letter content."),
      ),
    () => Promise.reject(new Error("Sealed letters cannot be edited.")),
    (id) => this.request(`/wishes/letters/${id}`, { method: "DELETE" }),
  );
  voiceMemos = crud<VoiceMemo>(
    async () => [],
    async () => {
      throw new Error("Voice storage is not configured.");
    },
    async () => {
      throw new Error("Voice storage is not configured.");
    },
    async () => undefined,
  );
  async createHandoffLetter(
    body: string,
    deliveryTrigger: HandoffLetter["delivery_trigger"],
    recipient: string | null = null,
  ) {
    return mapLetter(
      await this.request("/wishes/letters", {
        method: "POST",
        body: JSON.stringify({ body, recipient, deliveryTrigger }),
      }),
    );
  }
}

function crud<T extends { id: string }>(
  list: () => Promise<T[]>,
  create: (input: Omit<T, "id">) => Promise<T>,
  update: (item: T) => Promise<T>,
  remove: (id: string) => Promise<unknown>,
) {
  return {
    list,
    create,
    update,
    remove: async (id: string) => {
      await remove(id);
    },
  };
}
const iso = (value: unknown) => new Date(String(value)).toISOString();
function mapAccount(value: unknown) {
  const v = value as Record<string, unknown>;
  return AccountSchema.parse({
    id: v.id,
    email: v.email ?? null,
    phone_e164: v.phoneE164 ?? null,
    email_verified: v.emailVerified,
    phone_verified: v.phoneVerified,
    legal_name: v.legalName ?? null,
    preferred_name: v.preferredName ?? null,
    dob: typeof v.dob === "string" ? v.dob.slice(0, 10) : null,
    kyc_status: "none",
    status: v.status,
    roles: Array.isArray(v.roles) ? v.roles : [],
    created_at: iso(v.createdAt),
    updated_at: iso(v.updatedAt),
  });
}
function mapPlan(value: unknown) {
  const v = value as Record<string, unknown>;
  return PlanSchema.parse({
    id: v.id,
    account_id: v.accountId,
    tier: v.tier,
    status: v.status,
    health_score: v.healthScore,
    created_at: iso(v.createdAt),
    updated_at: iso(v.updatedAt),
  });
}
function mapTimer(value: unknown) {
  const v = value as Record<string, unknown>;
  return MotionTimerSchema.parse({
    plan_id: v.planId,
    interval_hours: v.intervalHours,
    grace_minutes: v.graceMinutes,
    last_signal_at: iso(v.lastSignalAt),
    next_expiry_at: iso(v.nextExpiryAt),
    mode: v.mode,
    mode_until: v.modeUntil ? iso(v.modeUntil) : null,
    mode_reason: v.modeReason ?? null,
    battery_rule_enabled: v.batteryRuleEnabled ?? true,
    battery_behaviour: v.batteryBehaviour ?? "suppress",
    offline_escalation_hours: v.offlineEscalationHours ?? 48,
    monitoring_strategy: v.monitoringStrategy ?? "motion",
    cancel_escalation_on_movement: v.cancelEscalationOnMovement ?? true,
  });
}
function mapPerson(value: unknown) {
  const v = value as Record<string, unknown>;
  return PersonSchema.parse({
    id: v.id,
    plan_id: v.planId,
    linked_account: v.linkedAccount ?? null,
    name: v.name,
    relationship: v.relationship ?? null,
    phone_e164: v.phoneE164 ?? null,
    email: v.email ?? null,
    roles: v.roles ?? [],
    escalation_order: v.escalationOrder ?? null,
    instructions: v.instructions ?? null,
    verification: v.verification,
    invited_at: v.invitedAt ? iso(v.invitedAt) : null,
    verified_at: v.verifiedAt ? iso(v.verifiedAt) : null,
  });
}
function mapPet(value: unknown) {
  const v = value as Record<string, unknown>;
  return PetSchema.parse({
    id: v.id,
    plan_id: v.planId,
    name: v.name,
    species: v.species ?? null,
    breed: v.breed ?? null,
    age_years: v.ageYears ?? null,
    sex: v.sex ?? null,
    weight_kg: v.weightKg ?? null,
    microchip_id: v.microchipId ?? null,
    photo_key: v.photoKey ?? null,
    vet_contact: v.vetContact ?? null,
    medical: v.medical ?? null,
    routine: v.routine ?? null,
    preferences: v.preferences ?? null,
    guardian_primary: v.guardianPrimary ?? null,
    guardian_backup: v.guardianBackup ?? null,
    emergency_fund_cents: v.emergencyFundCents ?? null,
  });
}
function mapQueue(value: unknown) {
  const v = value as Record<string, unknown>;
  return ResponseQueueStepSchema.parse({
    id: v.id,
    plan_id: v.planId,
    position: v.position,
    channel: v.channel,
    target_person: v.targetPerson ?? null,
    wait_minutes: v.waitMinutes,
    message_template: v.messageTemplate ?? null,
  });
}
function mapProperty(value: unknown) {
  const v = value as Record<string, unknown>;
  return PropertySchema.parse({
    id: v.id,
    plan_id: v.planId,
    address: v.address,
    property_type: v.propertyType ?? null,
    unit_details: v.unitDetails ?? null,
  });
}
function mapAccess(value: unknown) {
  const v = value as Record<string, unknown>;
  return AccessDetailSchema.parse({
    id: v.id,
    property_id: v.propertyId ?? "00000000-0000-4000-8000-000000000000",
    field_name: v.fieldName,
    masked_value: "••••",
    updated_at: iso(v.updatedAt),
  });
}
function mapLetter(value: unknown) {
  const v = value as Record<string, unknown>;
  return HandoffLetterSchema.parse({
    id: v.id,
    plan_id: v.planId ?? "00000000-0000-4000-8000-000000000000",
    recipient: v.recipient ?? null,
    delivery_trigger: v.deliveryTrigger,
    released_at: v.releasedAt ? iso(v.releasedAt) : null,
  });
}
function personWrite(input: Omit<Person, "id">) {
  return {
    name: input.name,
    relationship: input.relationship,
    phoneE164: input.phone_e164,
    email: input.email,
    roles: input.roles,
    instructions: input.instructions,
    verification: input.verification,
    invitedAt: input.invited_at,
    verifiedAt: input.verified_at,
  };
}
function petWrite(input: Omit<Pet, "id">) {
  return {
    name: input.name,
    species: input.species,
    breed: input.breed,
    ageYears: input.age_years,
    sex: input.sex,
    weightKg: input.weight_kg,
    microchipId: input.microchip_id,
    photoKey: input.photo_key,
    vetContact: input.vet_contact,
    medical: input.medical,
    routine: input.routine,
    preferences: input.preferences,
    guardianPrimary: input.guardian_primary,
    guardianBackup: input.guardian_backup,
    emergencyFundCents: input.emergency_fund_cents,
  };
}
function queueWrite(input: Omit<ResponseQueueStep, "id"> | ResponseQueueStep) {
  return {
    position: input.position,
    channel: input.channel,
    targetPerson: input.target_person,
    waitMinutes: input.wait_minutes,
    messageTemplate: input.message_template,
  };
}
async function responseMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };
    return Array.isArray(body.message)
      ? body.message.join(" ")
      : (body.message ?? "The request could not be completed.");
  } catch {
    return "The request could not be completed.";
  }
}
