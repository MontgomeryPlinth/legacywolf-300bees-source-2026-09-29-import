import { z } from "zod";

const id = z.string().uuid();
const isoDateTime = z.string().datetime({ offset: true });

export const AccountRoleSchema = z.enum([
  "user",
  "nominated_contact",
  "responder",
  "admin",
]);
export const AccountSchema = z.object({
  id,
  email: z.string().email().nullable(),
  phone_e164: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .nullable(),
  email_verified: z.boolean(),
  phone_verified: z.boolean(),
  legal_name: z.string().nullable(),
  preferred_name: z.string().nullable(),
  dob: z.string().date().nullable(),
  kyc_status: z.enum(["none", "pending", "verified"]),
  status: z.enum(["active", "suspended", "deletion_pending"]),
  roles: z.array(AccountRoleSchema),
  created_at: isoDateTime,
  updated_at: isoDateTime,
});

export const PlanSchema = z.object({
  id,
  account_id: id,
  tier: z.enum(["friend_alert", "attend_check", "attend_check_pet", "full"]),
  status: z.enum(["setup", "protected", "paused", "trip_mode", "alert_active"]),
  health_score: z.number().int().min(0).max(100),
  created_at: isoDateTime,
  updated_at: isoDateTime,
});

export const MotionTimerSchema = z.object({
  plan_id: id,
  interval_hours: z.number().int().min(4).max(72),
  grace_minutes: z.number().int().min(1).max(240),
  last_signal_at: isoDateTime,
  next_expiry_at: isoDateTime,
  mode: z.enum(["active", "paused", "trip", "sick", "drill"]),
  mode_until: isoDateTime.nullable(),
  mode_reason: z.string().nullable(),
  battery_rule_enabled: z.boolean(),
  battery_behaviour: z.enum(["suppress", "respond", "alert_contact"]),
  offline_escalation_hours: z.number().int().min(4).max(168),
  monitoring_strategy: z.enum(["motion", "check_in"]),
  cancel_escalation_on_movement: z.boolean(),
});

export const QueueChannelSchema = z.enum([
  "sms",
  "call",
  "push",
  "dispatch",
  "notify_contact",
]);
export const ResponseQueueStepSchema = z.object({
  id,
  plan_id: id,
  position: z.number().int().positive(),
  channel: QueueChannelSchema,
  target_person: id.nullable(),
  wait_minutes: z.number().int().min(0),
  message_template: z.string().nullable(),
});

export const PersonRoleSchema = z.enum([
  "nominated_contact",
  "pet_guardian_primary",
  "pet_guardian_backup",
  "estate_recipient",
]);
export const PersonSchema = z.object({
  id,
  plan_id: id,
  linked_account: id.nullable(),
  name: z.string().min(1),
  relationship: z.string().nullable(),
  phone_e164: z.string().nullable(),
  email: z.string().email().nullable(),
  roles: z.array(PersonRoleSchema),
  escalation_order: z.number().int().positive().nullable(),
  instructions: z.string().nullable(),
  verification: z.enum(["pending", "verified", "declined", "unreachable"]),
  invited_at: isoDateTime.nullable(),
  verified_at: isoDateTime.nullable(),
});

export const PetSchema = z.object({
  id,
  plan_id: id,
  name: z.string().min(1),
  species: z.string().nullable(),
  breed: z.string().nullable(),
  age_years: z.number().int().min(0).nullable(),
  sex: z.string().nullable(),
  weight_kg: z.number().nonnegative().nullable(),
  microchip_id: z.string().nullable(),
  photo_key: z.string().nullable(),
  vet_contact: z.record(z.unknown()).nullable(),
  medical: z.record(z.unknown()).nullable(),
  routine: z.record(z.unknown()).nullable(),
  preferences: z.record(z.unknown()).nullable(),
  guardian_primary: id.nullable(),
  guardian_backup: id.nullable(),
  emergency_fund_cents: z.number().int().nonnegative().nullable(),
});

export const AddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().nullable(),
  suburb: z.string().min(1),
  region: z.string().min(1),
  postal_code: z.string().min(1),
  country_code: z.string().length(2),
});
export const PropertySchema = z.object({
  id,
  plan_id: id,
  address: AddressSchema,
  property_type: z.string().nullable(),
  unit_details: z.string().nullable(),
});
export const AccessDetailSchema = z.object({
  id,
  property_id: id,
  field_name: z.string().min(1),
  masked_value: z.literal("••••"),
  updated_at: isoDateTime,
});
export const IncidentSchema = z.object({
  id,
  plan_id: id,
  trigger: z.enum([
    "timer_expiry",
    "sick_mode",
    "manual_help",
    "drill",
    "admin",
  ]),
  status: z.enum([
    "grace",
    "outreach",
    "queue_executing",
    "dispatched",
    "on_scene",
    "resolved",
    "false_positive",
    "deceased",
  ]),
  opened_at: isoDateTime,
  closed_at: isoDateTime.nullable(),
  outcome: z.string().nullable(),
});
export const DeliveryTriggerSchema = z.enum([
  "on_activation",
  "on_confirmed_death",
  "on_family_arrival",
]);
export const HandoffLetterSchema = z.object({
  id,
  plan_id: id,
  recipient: id.nullable(),
  delivery_trigger: DeliveryTriggerSchema,
  released_at: isoDateTime.nullable(),
});
export const VoiceMemoSchema = z.object({
  id,
  plan_id: id,
  recipient: id.nullable(),
  object_key: z.string(),
  delivery_trigger: DeliveryTriggerSchema,
  released_at: isoDateTime.nullable(),
});

export type AccountRole = z.infer<typeof AccountRoleSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type MotionTimer = z.infer<typeof MotionTimerSchema>;
export type ResponseQueueStep = z.infer<typeof ResponseQueueStepSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type Property = z.infer<typeof PropertySchema>;
export type AccessDetail = z.infer<typeof AccessDetailSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
export type HandoffLetter = z.infer<typeof HandoffLetterSchema>;
export type VoiceMemo = z.infer<typeof VoiceMemoSchema>;
