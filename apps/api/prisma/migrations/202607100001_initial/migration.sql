-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('user', 'nominated_contact', 'responder', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'suspended', 'deletion_pending');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('friend_alert', 'attend_check', 'attend_check_pet', 'full');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('setup', 'protected', 'paused', 'trip_mode', 'alert_active');

-- CreateEnum
CREATE TYPE "TimerMode" AS ENUM ('active', 'paused', 'trip', 'sick', 'drill');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('motion', 'checkin', 'app_open', 'dtmf', 'sms_reply');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('grace', 'outreach', 'queue_executing', 'dispatched', 'on_scene', 'resolved', 'false_positive', 'deceased');

-- CreateEnum
CREATE TYPE "IncidentTrigger" AS ENUM ('timer_expiry', 'sick_mode', 'manual_help', 'drill', 'admin');

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "email" CITEXT,
    "phone_e164" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "legal_name" TEXT,
    "preferred_name" TEXT,
    "dob" DATE,
    "google_sub" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "accounts_identity_required" CHECK ("email" IS NOT NULL OR "phone_e164" IS NOT NULL)
);

-- CreateTable
CREATE TABLE "account_roles" (
    "account_id" UUID NOT NULL,
    "role" "AccountRole" NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_roles_pkey" PRIMARY KEY ("account_id","role")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "push_token" TEXT,
    "device_pubkey" TEXT NOT NULL,
    "biometric_bound" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "device_id" UUID,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" UUID NOT NULL,
    "identity" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'setup',
    "health_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motion_timers" (
    "plan_id" UUID NOT NULL,
    "interval_hours" INTEGER NOT NULL,
    "grace_minutes" INTEGER NOT NULL DEFAULT 5,
    "last_signal_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_expiry_at" TIMESTAMP(3) NOT NULL,
    "mode" "TimerMode" NOT NULL DEFAULT 'active',
    "mode_until" TIMESTAMP(3),
    "mode_reason" TEXT,

    CONSTRAINT "motion_timers_pkey" PRIMARY KEY ("plan_id"),
    CONSTRAINT "motion_timer_interval_range" CHECK ("interval_hours" BETWEEN 1 AND 72),
    CONSTRAINT "motion_timer_grace_range" CHECK ("grace_minutes" BETWEEN 1 AND 60)
);

-- CreateTable
CREATE TABLE "heartbeats" (
    "id" BIGSERIAL NOT NULL,
    "account_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "signal_type" "SignalType" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nonce" TEXT NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "linked_account" UUID,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone_e164" TEXT,
    "email" CITEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "escalation_order" INTEGER,
    "instructions" TEXT,
    "verification" TEXT NOT NULL DEFAULT 'pending',
    "invited_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "breed" TEXT,
    "medical" JSONB,
    "routine" JSONB,
    "guardian_primary" UUID,
    "guardian_backup" UUID,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "address" JSONB NOT NULL,
    "property_type" TEXT,
    "unit_details" TEXT,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_details" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "key_version" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response_queue_steps" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "channel" TEXT NOT NULL,
    "target_person" UUID,
    "wait_minutes" INTEGER NOT NULL DEFAULT 5,
    "message_template" TEXT,

    CONSTRAINT "response_queue_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "trigger" "IncidentTrigger" NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'grace',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "outcome" TEXT,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_decryptions" (
    "id" UUID NOT NULL,
    "access_detail_id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "actor_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "revealed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "access_decryptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reputation_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "key_version" INTEGER NOT NULL,
    "delivery_trigger" TEXT NOT NULL,
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reputation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatches" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "responder_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'offered',
    "offered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "arrived_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responder_shifts" (
    "id" UUID NOT NULL,
    "responder_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "last_lat" DECIMAL(9,6),
    "last_lng" DECIMAL(9,6),
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "responder_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "responder_id" UUID NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "actions" JSONB NOT NULL DEFAULT '[]',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorizations" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "provider_customer_id" TEXT,
    "provider_subscription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "tier" "PlanTier" NOT NULL,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_attempts" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "step_id" UUID,
    "channel" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "provider_sid" TEXT,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "response" TEXT,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalation_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handoff_letters" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "recipient" UUID,
    "ciphertext" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "key_version" INTEGER NOT NULL,
    "delivery_trigger" TEXT NOT NULL,
    "released_at" TIMESTAMP(3),

    CONSTRAINT "handoff_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_memos" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "recipient" UUID,
    "object_key" TEXT NOT NULL,
    "delivery_trigger" TEXT NOT NULL,
    "released_at" TIMESTAMP(3),

    CONSTRAINT "voice_memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" UUID,
    "actor_role" TEXT,
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "prev_hash" BYTEA,
    "row_hash" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_e164_key" ON "accounts"("phone_e164");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_google_sub_key" ON "accounts"("google_sub");

-- CreateIndex
CREATE INDEX "otp_challenges_identity_expires_at_idx" ON "otp_challenges"("identity", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "plans_account_id_key" ON "plans"("account_id");

-- CreateIndex
CREATE INDEX "motion_timers_next_expiry_at_mode_idx" ON "motion_timers"("next_expiry_at", "mode");

-- CreateIndex
CREATE INDEX "heartbeats_account_id_received_at_idx" ON "heartbeats"("account_id", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "heartbeats_device_id_nonce_key" ON "heartbeats"("device_id", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "properties_plan_id_key" ON "properties"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_details_property_id_field_name_key" ON "access_details"("property_id", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "response_queue_steps_plan_id_position_key" ON "response_queue_steps"("plan_id", "position");

-- CreateIndex
CREATE INDEX "incidents_status_opened_at_idx" ON "incidents"("status", "opened_at");

-- CreateIndex
CREATE INDEX "access_decryptions_incident_id_revealed_at_idx" ON "access_decryptions"("incident_id", "revealed_at");

-- CreateIndex
CREATE INDEX "dispatches_responder_id_status_idx" ON "dispatches"("responder_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "dispatches_incident_id_responder_id_key" ON "dispatches"("incident_id", "responder_id");

-- CreateIndex
CREATE INDEX "responder_shifts_responder_id_ended_at_idx" ON "responder_shifts"("responder_id", "ended_at");

-- CreateIndex
CREATE UNIQUE INDEX "incident_reports_incident_id_key" ON "incident_reports"("incident_id");

-- CreateIndex
CREATE INDEX "authorizations_account_id_kind_status_idx" ON "authorizations"("account_id", "kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_account_id_key" ON "subscriptions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_customer_id_key" ON "subscriptions"("provider_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_provider_subscription_key" ON "subscriptions"("provider_subscription");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "account_roles" ADD CONSTRAINT "account_roles_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "motion_timers" ADD CONSTRAINT "motion_timers_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "heartbeats" ADD CONSTRAINT "heartbeats_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "people" ADD CONSTRAINT "people_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_guardian_primary_fkey" FOREIGN KEY ("guardian_primary") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_guardian_backup_fkey" FOREIGN KEY ("guardian_backup") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_details" ADD CONSTRAINT "access_details_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_queue_steps" ADD CONSTRAINT "response_queue_steps_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response_queue_steps" ADD CONSTRAINT "response_queue_steps_target_person_fkey" FOREIGN KEY ("target_person") REFERENCES "people"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_decryptions" ADD CONSTRAINT "access_decryptions_access_detail_id_fkey" FOREIGN KEY ("access_detail_id") REFERENCES "access_details"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_decryptions" ADD CONSTRAINT "access_decryptions_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_decryptions" ADD CONSTRAINT "access_decryptions_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reputation_items" ADD CONSTRAINT "reputation_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatches" ADD CONSTRAINT "dispatches_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responder_shifts" ADD CONSTRAINT "responder_shifts_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_responder_id_fkey" FOREIGN KEY ("responder_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorizations" ADD CONSTRAINT "authorizations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_attempts" ADD CONSTRAINT "escalation_attempts_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_attempts" ADD CONSTRAINT "escalation_attempts_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "response_queue_steps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handoff_letters" ADD CONSTRAINT "handoff_letters_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_memos" ADD CONSTRAINT "voice_memos_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Audit records are append-only, including for direct database access.
CREATE FUNCTION reject_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_no_update BEFORE UPDATE ON "audit_log"
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

CREATE TRIGGER audit_log_no_delete BEFORE DELETE ON "audit_log"
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();
