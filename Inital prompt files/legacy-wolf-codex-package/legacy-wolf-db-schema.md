# Legacy Wolf — Data Schema (PostgreSQL 16 / Prisma-ready) v0.1

Principles: one account per email; roles attach to accounts; server-side timer authoritative; access details field-encrypted; append-only audit. `citext` extension for case-insensitive email uniqueness.

```sql
-- ==== IDENTITY ==========================================================
CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE,                  -- one account per email (case-insensitive)
  phone_e164      TEXT UNIQUE,                    -- one account per verified phone
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  legal_name      TEXT,
  preferred_name  TEXT,
  dob             DATE,
  google_sub      TEXT UNIQUE,                    -- Google OIDC subject
  kyc_status      TEXT NOT NULL DEFAULT 'none',   -- none|pending|verified
  status          TEXT NOT NULL DEFAULT 'active', -- active|suspended|deletion_pending
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone_e164 IS NOT NULL)
);

-- Roles are attached to one account (User + Nominated Contact coexist here)
CREATE TABLE account_roles (
  account_id  UUID REFERENCES accounts(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','nominated_contact','responder','admin')),
  granted_by  UUID REFERENCES accounts(id),       -- admin provisioning for responder/admin
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, role)
);

CREATE TABLE devices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform       TEXT NOT NULL CHECK (platform IN ('ios','android','web')),
  push_token     TEXT,
  device_pubkey  TEXT NOT NULL,                   -- verifies signed heartbeats
  biometric_bound BOOLEAN NOT NULL DEFAULT FALSE, -- "remember with Face ID/fingerprint"
  last_seen_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id   UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id    UUID REFERENCES devices(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  family_id    UUID NOT NULL,                     -- rotation family; reuse detection
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE otp_challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity    TEXT NOT NULL,                      -- email or phone
  channel     TEXT NOT NULL CHECK (channel IN ('sms','email')),
  code_hash   TEXT NOT NULL,
  attempts    INT NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

-- ==== PLAN ==============================================================
CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL CHECK (tier IN ('friend_alert','attend_check','attend_check_pet','full')),
  status        TEXT NOT NULL DEFAULT 'setup',    -- setup|protected|paused|trip_mode|alert_active
  health_score  INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE motion_timers (
  plan_id         UUID PRIMARY KEY REFERENCES plans(id) ON DELETE CASCADE,
  interval_hours  INT NOT NULL CHECK (interval_hours BETWEEN 6 AND 72),
  grace_minutes   INT NOT NULL DEFAULT 5,
  last_signal_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_expiry_at  TIMESTAMPTZ NOT NULL,           -- SOURCE OF TRUTH
  mode            TEXT NOT NULL DEFAULT 'active'  -- active|paused|trip|sick|drill
    CHECK (mode IN ('active','paused','trip','sick','drill')),
  mode_until      TIMESTAMPTZ,                    -- trip/pause auto-resume
  mode_reason     TEXT
);

CREATE TABLE heartbeats (                          -- partitioned by month in production
  id          BIGSERIAL PRIMARY KEY,
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  device_id   UUID NOT NULL REFERENCES devices(id),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('motion','checkin','app_open','dtmf','sms_reply')),
  recorded_at TIMESTAMPTZ NOT NULL,               -- device timestamp
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nonce       TEXT NOT NULL,
  UNIQUE (device_id, nonce)                       -- replay protection
);

-- Response Queue: ordered execution plan ("you instruct, we execute")
CREATE TABLE response_queue_steps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id        UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  position       INT NOT NULL,
  channel        TEXT NOT NULL CHECK (channel IN ('sms','call','push','dispatch','notify_contact')),
  target_person  UUID REFERENCES people(id),
  wait_minutes   INT NOT NULL DEFAULT 5,
  message_template TEXT,                          -- user-authored copy
  UNIQUE (plan_id, position)
);

-- ==== PEOPLE / PETS / PROPERTY =========================================
CREATE TABLE people (                              -- nominated humans in a user's plan
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  linked_account  UUID REFERENCES accounts(id),   -- set when their email/phone matches an account
  name            TEXT NOT NULL,
  relationship    TEXT,
  phone_e164      TEXT,
  email           CITEXT,
  roles           TEXT[] NOT NULL DEFAULT '{}',   -- nominated_contact|pet_guardian_primary|pet_guardian_backup|estate_recipient
  escalation_order INT,
  instructions    TEXT,                           -- user-authored, for this person
  verification    TEXT NOT NULL DEFAULT 'pending' CHECK (verification IN ('pending','verified','declined','unreachable')),
  invited_at      TIMESTAMPTZ,
  verified_at     TIMESTAMPTZ
);

CREATE TABLE pets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  species      TEXT, breed TEXT, age_years INT, sex TEXT, weight_kg NUMERIC,
  microchip_id TEXT,
  photo_key    TEXT,                              -- S3 object key
  vet_contact  JSONB,
  medical      JSONB,                             -- meds, allergies, conditions
  routine      JSONB,                             -- feeding, walks, sleep
  preferences  JSONB,
  guardian_primary UUID REFERENCES people(id),
  guardian_backup  UUID REFERENCES people(id),
  emergency_fund_cents INT
);

CREATE TABLE properties (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL UNIQUE REFERENCES plans(id) ON DELETE CASCADE,
  address     JSONB NOT NULL,
  property_type TEXT,
  unit_details  TEXT
);

-- Field-level encrypted. Values are AES-256-GCM ciphertext; keys in KMS.
CREATE TABLE access_details (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  field_name    TEXT NOT NULL,                    -- keysafe_code|lobby|elevator|unit|alarm_code
  ciphertext    BYTEA NOT NULL,
  key_version   INT NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, field_name)
);

-- Every decryption is recorded. Required for trust posture.
CREATE TABLE access_decryptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_id    UUID NOT NULL REFERENCES access_details(id),
  actor_id     UUID NOT NULL REFERENCES accounts(id),
  incident_id  UUID REFERENCES incidents(id),
  reason       TEXT NOT NULL,
  decrypted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reputation Guard / Pants On inventory (encrypted like access details)
CREATE TABLE reputation_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  ciphertext  BYTEA NOT NULL,                     -- {location, description, action, courier_to}
  key_version INT NOT NULL,
  position    INT NOT NULL
);

-- ==== LAST WISHES =======================================================
CREATE TABLE handoff_letters (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  recipient     UUID REFERENCES people(id),        -- NULL = "whoever opens this"
  ciphertext    BYTEA NOT NULL,
  key_version   INT NOT NULL,
  delivery_trigger TEXT NOT NULL CHECK (delivery_trigger IN ('on_activation','on_confirmed_death','on_family_arrival')),
  released_at   TIMESTAMPTZ
);

CREATE TABLE voice_memos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  recipient     UUID REFERENCES people(id),
  object_key    TEXT NOT NULL,                    -- SSE-encrypted S3 object
  delivery_trigger TEXT NOT NULL,
  released_at   TIMESTAMPTZ
);

-- ==== INCIDENTS & ESCALATION ===========================================
CREATE TABLE incidents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id      UUID NOT NULL REFERENCES plans(id),
  trigger      TEXT NOT NULL CHECK (trigger IN ('timer_expiry','sick_mode','manual_help','drill','admin')),
  status       TEXT NOT NULL DEFAULT 'grace'      -- grace|outreach|queue_executing|dispatched|on_scene|resolved|false_positive|deceased
    CHECK (status IN ('grace','outreach','queue_executing','dispatched','on_scene','resolved','false_positive','deceased')),
  opened_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at    TIMESTAMPTZ,
  outcome      TEXT
);

CREATE TABLE escalation_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id  UUID NOT NULL REFERENCES incidents(id),
  step_id      UUID REFERENCES response_queue_steps(id),
  channel      TEXT NOT NULL,
  target       TEXT NOT NULL,                     -- E.164 or push token ref
  provider_sid TEXT,                              -- Twilio SID
  status       TEXT NOT NULL DEFAULT 'queued',    -- queued|sent|delivered|failed|answered|no_answer
  response     TEXT,                              -- DTMF digit, SMS reply
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dispatches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id   UUID NOT NULL REFERENCES incidents(id),
  responder_id  UUID NOT NULL REFERENCES accounts(id),
  status        TEXT NOT NULL DEFAULT 'offered',  -- offered|accepted|declined|en_route|arrived|complete
  offered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at   TIMESTAMPTZ, arrived_at TIMESTAMPTZ, completed_at TIMESTAMPTZ
);

CREATE TABLE incident_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id  UUID NOT NULL UNIQUE REFERENCES incidents(id),
  responder_id UUID NOT NULL REFERENCES accounts(id),
  user_status  TEXT,                              -- alive_responsive|alive_unresponsive|deceased|not_home|other
  narrative    TEXT,
  photo_keys   TEXT[],
  submitted_at TIMESTAMPTZ,
  approved_by  UUID REFERENCES accounts(id),
  approved_at  TIMESTAMPTZ
);

-- ==== LEGAL / BILLING / AUDIT ==========================================
CREATE TABLE authorizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id),
  doc_type    TEXT NOT NULL CHECK (doc_type IN ('property_access','pet_care','info_sharing','liability_waiver','estate_release')),
  doc_version TEXT NOT NULL,
  signed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address  INET,
  superseded_by UUID REFERENCES authorizations(id)
);

CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL UNIQUE REFERENCES accounts(id),
  provider    TEXT NOT NULL DEFAULT 'stripe',
  provider_id TEXT,
  tier        TEXT NOT NULL,
  status      TEXT NOT NULL,                      -- active|past_due|canceled|cooling_off
  renews_at   TIMESTAMPTZ
);

-- Append-only, hash-chained. No UPDATE/DELETE grants on this table.
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID,
  actor_role  TEXT,
  event_type  TEXT NOT NULL,                      -- plan_change|auth_signed|decryption|notification|scene_action|admin_override|login|role_granted...
  entity_type TEXT, entity_id UUID,
  payload     JSONB NOT NULL DEFAULT '{}',
  prev_hash   BYTEA,
  row_hash    BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Key invariants
1. `accounts.email` and `accounts.phone_e164` unique → duplicate accounts impossible at the DB layer.
2. `people.linked_account` is how "User and Nominated Contact share one account" works: the invite matches an existing account and links it; the contact sees the plans referencing them via that link.
3. `motion_timers.next_expiry_at` is the only expiry authority. Heartbeats (any `signal_type`, including raw motion) update `last_signal_at` and recompute it.
4. `access_details` / `reputation_items` / `handoff_letters` are never stored or returned in plaintext; decryption requires an incident context or an audited admin reveal, always writing `access_decryptions` + `audit_log`.
5. `audit_log` is append-only and hash-chained (`row_hash = H(prev_hash || row)`).
