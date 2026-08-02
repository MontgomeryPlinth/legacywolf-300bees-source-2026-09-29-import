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
  VoiceMemoSchema,
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
} from "./schemas";

const ids = {
  account: "10000000-0000-4000-8000-000000000001",
  plan: "20000000-0000-4000-8000-000000000001",
  property: "30000000-0000-4000-8000-000000000001",
};

export interface MockClientOptions {
  latencyMs?: number;
  now?: () => Date;
}

export class MockApiClient {
  private readonly latencyMs: number;
  private readonly now: () => Date;
  private account: Account | null = null;
  private plan: Plan;
  private timer: MotionTimer;
  private people: Person[] = [];
  private pets: Pet[] = [];
  private property: Property | null = null;
  private accessDetails: AccessDetail[] = [];
  private queue: ResponseQueueStep[] = [];
  private letters: HandoffLetter[] = [];
  private memos: VoiceMemo[] = [];
  private pendingIdentity: string | null = null;
  private readonly knownIdentities = new Set<string>();
  private idCounter = 10;

  constructor(options: MockClientOptions = {}) {
    this.latencyMs = options.latencyMs ?? 120;
    this.now = options.now ?? (() => new Date());
    const now = this.now();
    const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.plan = PlanSchema.parse({
      id: ids.plan,
      account_id: ids.account,
      tier: "friend_alert",
      status: "setup",
      health_score: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });
    this.timer = MotionTimerSchema.parse({
      plan_id: ids.plan,
      interval_hours: 24,
      grace_minutes: 5,
      last_signal_at: now.toISOString(),
      next_expiry_at: next.toISOString(),
      mode: "active",
      mode_until: null,
      mode_reason: null,
      battery_rule_enabled: true,
      battery_behaviour: "suppress",
      offline_escalation_hours: 48,
      monitoring_strategy: "motion",
      cancel_escalation_on_movement: true,
    });
  }

  private async respond<T>(value: T): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return structuredClone(value);
  }
  private makeId(): string {
    this.idCounter += 1;
    return `00000000-0000-4000-8000-${String(this.idCounter).padStart(12, "0")}`;
  }
  private stamp(): string {
    return this.now().toISOString();
  }

  auth = {
    requestOtp: async (
      identity: string,
    ): Promise<{ challenge_id: string; expires_at: string }> => {
      if (!identity.trim())
        throw new Error("Enter a phone number or email address.");
      this.pendingIdentity = identity.trim();
      return this.respond({
        challenge_id: this.makeId(),
        expires_at: new Date(this.now().getTime() + 10 * 60_000).toISOString(),
      });
    },
    requestSignupOtp: async (
      identity: string,
    ): Promise<{ challenge_id: string; expires_at: string }> => {
      const normalized = identity.trim().toLowerCase();
      if (this.knownIdentities.has(normalized))
        throw new Error(
          "An account with this identity already exists—log in instead.",
        );
      return this.auth.requestOtp(identity);
    },
    verifyOtp: async (code: string): Promise<Account> => {
      if (!this.pendingIdentity)
        throw new Error("Request a new verification code.");
      if (!/^\d{6}$/.test(code))
        throw new Error("Enter the six-digit verification code.");
      return this.auth.login(this.pendingIdentity);
    },
    login: async (identity: string): Promise<Account> => {
      const isEmail = identity.includes("@");
      this.account = AccountSchema.parse({
        id: ids.account,
        email: isEmail ? identity : null,
        phone_e164: isEmail ? null : identity,
        email_verified: isEmail,
        phone_verified: !isEmail,
        legal_name: null,
        preferred_name: null,
        dob: null,
        kyc_status: "none",
        status: "active",
        roles: ["user"],
        created_at: this.stamp(),
        updated_at: this.stamp(),
      });
      this.knownIdentities.add(identity.trim().toLowerCase());
      return this.respond(this.account);
    },
    current: async (): Promise<Account | null> => this.respond(this.account),
    logout: async (): Promise<void> => {
      this.account = null;
      this.pendingIdentity = null;
      await this.respond(undefined);
    },
  };

  plans = {
    get: async (): Promise<Plan> => this.respond(this.plan),
    update: async (
      patch: Partial<Pick<Plan, "tier" | "status">>,
    ): Promise<Plan> => {
      this.plan = PlanSchema.parse({
        ...this.plan,
        ...patch,
        updated_at: this.stamp(),
      });
      return this.respond(this.plan);
    },
  };

  timerApi = {
    get: async (): Promise<MotionTimer> => this.respond(this.timer),
    update: async (
      patch: Partial<Pick<MotionTimer, "interval_hours" | "grace_minutes" | "monitoring_strategy" | "cancel_escalation_on_movement">>,
    ): Promise<MotionTimer> => {
      this.timer = MotionTimerSchema.parse({ ...this.timer, ...patch });
      return this.respond(this.timer);
    },
    checkIn: async (): Promise<MotionTimer> => {
      const now = this.now();
      this.timer = MotionTimerSchema.parse({
        ...this.timer,
        last_signal_at: now.toISOString(),
        next_expiry_at: new Date(
          now.getTime() + this.timer.interval_hours * 3_600_000,
        ).toISOString(),
      });
      return this.respond(this.timer);
    },
    setMode: async (
      mode: MotionTimer["mode"],
      options: {
        until?: string;
        reason?: string;
        interval_hours?: number;
      } = {},
    ): Promise<MotionTimer> => {
      const nextInterval = options.interval_hours ?? this.timer.interval_hours;
      this.timer = MotionTimerSchema.parse({
        ...this.timer,
        interval_hours: nextInterval,
        mode,
        mode_until: options.until ?? null,
        mode_reason: options.reason ?? null,
      });
      this.plan = PlanSchema.parse({
        ...this.plan,
        status:
          mode === "active"
            ? "protected"
            : mode === "trip"
              ? "trip_mode"
              : "paused",
        updated_at: this.stamp(),
      });
      return this.respond(this.timer);
    },
  };

  peopleApi = this.crud(
    () => this.people,
    (value) => {
      this.people = value;
    },
    PersonSchema,
  );
  petsApi = this.crud(
    () => this.pets,
    (value) => {
      this.pets = value;
    },
    PetSchema,
  );
  responseQueue = this.crud(
    () => this.queue,
    (value) => {
      this.queue = value.sort((a, b) => a.position - b.position);
    },
    ResponseQueueStepSchema,
  );
  handoffLetters = this.crud(
    () => this.letters,
    (value) => {
      this.letters = value;
    },
    HandoffLetterSchema,
  );
  voiceMemos = this.crud(
    () => this.memos,
    (value) => {
      this.memos = value;
    },
    VoiceMemoSchema,
  );

  propertyApi = {
    get: async (): Promise<Property | null> => this.respond(this.property),
    save: async (
      input: Omit<Property, "id" | "plan_id">,
    ): Promise<Property> => {
      this.property = PropertySchema.parse({
        ...input,
        id: ids.property,
        plan_id: ids.plan,
      });
      return this.respond(this.property);
    },
    saveAccessDetail: async (
      field_name: string,
      plaintext: string,
    ): Promise<AccessDetail> => {
      if (!plaintext.trim()) throw new Error("Access detail cannot be empty.");
      const detail = AccessDetailSchema.parse({
        id: this.makeId(),
        property_id: ids.property,
        field_name,
        masked_value: "••••",
        updated_at: this.stamp(),
      });
      this.accessDetails = [
        ...this.accessDetails.filter((item) => item.field_name !== field_name),
        detail,
      ];
      return this.respond(detail);
    },
    listAccessDetails: async (): Promise<AccessDetail[]> =>
      this.respond(this.accessDetails),
  };

  private crud<T extends { id: string }>(
    get: () => T[],
    set: (value: T[]) => void,
    schema: { parse(value: unknown): T },
  ) {
    return {
      list: async (): Promise<T[]> => this.respond(get()),
      create: async (input: Omit<T, "id">): Promise<T> => {
        const item = schema.parse({ ...input, id: this.makeId() });
        set([...get(), item]);
        return this.respond(item);
      },
      update: async (item: T): Promise<T> => {
        const parsed = schema.parse(item);
        set(get().map((value) => (value.id === parsed.id ? parsed : value)));
        return this.respond(parsed);
      },
      remove: async (id: string): Promise<void> => {
        set(get().filter((value) => value.id !== id));
        await this.respond(undefined);
      },
    };
  }
}
