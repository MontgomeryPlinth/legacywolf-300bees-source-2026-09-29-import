# Legacy Wolf — Product Requirements Document (v0.1 Outline)

Companion docs: `legacy-wolf-brand.md`, `legacy-wolf-app-architecture.md`, `legacy-wolf-db-schema.md`, `legacy-wolf-seo-schema.md`, `legacy-wolf-rn-master-prompt.md`.

---

## 1. Overview

**Product.** Legacy Wolf is a monitoring-and-response service for adults living solo. A phone-based dead-man's-switch (the Motion Timer) runs in the background; if the user stops responding, Legacy Wolf executes the instructions the user pre-authorized — from notifying a friend to dispatching a Registered Nurse Responder, caring for pets, and protecting the user's reputation before family arrive.

**Brand posture (binding).** *You instruct, we execute.* Legacy Wolf never acts on its own initiative. Any feature that acts without pre-authorization is out of scope by definition.

**This release.** Migration of the Figma Make React prototype to production: React Native (Expo) apps for iOS and Android, a web app, and a Node (NestJS) backend. Mobile-first: the User app ships first; Nominated Contact, Responder, and Admin surfaces follow on the same foundation.

## 2. Goals & non-goals

**Goals**
1. Ship the User app (iOS + Android + web) with a real backend replacing all demo behavior.
2. Motion Timer driven by the device accelerometer: **any phone movement resets the timer**; explicit check-in is the fallback.
3. Real escalation: automated SMS and voice calls executing the user's Response Queue in order.
4. Single-account identity: one email = one account; User and Nominated Contact are roles within the same account.
5. Modern auth: Google, phone/email OTP, and biometric quick unlock (Face ID / fingerprint) with an opt-in "remember this device" prompt.

**Non-goals (v1)**
- Couples/household plans (design as if coming in v2).
- Watch app beyond the reserved IA slot.
- Digital Vault (LW4) — placeholder only.
- New screens beyond the existing Figma shell.
- Light theme.

## 3. Users & roles

| Role | Surface | v1 scope |
|---|---|---|
| User | Mobile primary, web | Full |
| Nominated Contact | View inside their own account + SMS/call/push | Invite, verification, My Role, Active Alert |
| Responder | Mobile | Ported screens, functional dispatch loop |
| Admin | Web (desktop-first) | Ported screens, live incident command minimum |

**Identity rules**
- Unique account per email (and per verified phone). Duplicate signup is rejected at the API and DB layers.
- A Nominated Contact invite sent to an email/phone matching an existing account attaches a role + relationship to that account — never a second account. The person manages their nominated role from a view within their account (role switcher → My Role screens).
- Responder and Admin roles are provisioned by Admin only.

## 4. Core requirements

### 4.1 Authentication & session
- Single entry screen: logo, tagline, **Log In**, **Sign Up**. The 4-role card screen is removed.
- Methods: Google Sign-In (server-verified ID token), phone OTP (primary), email OTP (secondary).
- After first successful login, one-time prompt: enable Face ID / fingerprint for future logins. Accepting stores a device-bound refresh token in Keychain/Keystore, released only on successful biometric auth. Biometrics never replace the primary credential and never leave the device.
- JWT access (≤15 min) + rotating refresh with reuse detection. Re-authentication required to cancel an active incident.

### 4.2 Motion Timer (the mechanic)
- User sets interval 6h–72h (existing T1 screen).
- **Accelerometer liveness:** low-frequency baseline sampling with brief high-frequency confirmation bursts. Confirmed movement emits a signed heartbeat; every heartbeat resets the timer. App-open and manual check-in also count as heartbeats.
- **Server-side timer is the single source of truth.** Devices report signals; the server decides expiry and escalation.
- The system distinguishes "device offline" from "device online but motionless" and escalates per policy, not per raw silence.
- Modifiers on the same timer: Trip Mode (M1), Pause (M3), Test Run/Drill (M2), Sick Mode (M4: severity 9–10 + 3-minute silent countdown treats silence as expiry).
- Grace window (T3): full-screen countdown, "I'm OK" and "I need help" (immediate escalation).

### 4.3 Escalation & Response Queue
- The Response Queue is the user's ordered execution plan: steps of `{channel: sms | call | push, target, wait, on-no-response}`.
- Twilio Verify (OTP), Programmable SMS (alerts + delivery receipts), Programmable Voice (automated "are you OK?" calls with DTMF check-in; contact-notification calls using the user's own message templates).
- Failed delivery auto-advances the queue. Every attempt, status, and response is audit-logged immutably.
- Tiered notification criticality per architecture doc §8.2 (Tier 0–3).

### 4.4 Services (existing four tiers — unchanged)
Friend Alert · Attend & Check · Pet Guardian · Reputation Guard / Pants On Service. Requirements per existing P1–P6 screens; no new service surfaces.

### 4.5 Data protection
- Access details (keysafe, alarm, entry instructions): AES-256-GCM field-level encryption, KMS-held keys, decrypt only on triggered incident or audited admin reveal. Write-only in the UI after first save.
- Append-only, hash-chained audit log for all meaningful events.
- No PII in logs; data residency default Australia (open question — configurable).

### 4.6 Demo-data removal
- All fixtures, demo-mode auth, hardcoded users/timers/incidents removed from the app bundle. Designed empty states everywhere. Seed data only in backend dev seeding, blocked in production.

## 5. Platform requirements

| | iOS | Android | Web |
|---|---|---|---|
| Framework | Expo (RN) | Expo (RN) | Expo Web only (Admin renders as desktop layout) |
| Motion | Core Motion via expo-sensors; background fetch + silent push nudges (documented limits) | SensorManager via ForegroundService with persistent notification | No background motion — session activity + check-in only; web is a management surface, not a liveness source |
| Biometric | Face ID / Touch ID | BiometricPrompt (fingerprint/face) | WebAuthn passkey (stretch) |
| Store items | Privacy manifest, background-modes justification, review notes | Foreground-service + sensor permission declarations | Authenticated app only; SEO deferred (out of scope) |

## 6. Architecture summary

(Full detail in master prompt §1, §8 and DB schema doc.)

- **Monorepo** (pnpm + Turborepo): `apps/mobile`, `apps/api` (Expo Web serves the web app from `apps/mobile`); shared `packages/{ui,core,tokens,config}`.
- **Frontend:** Expo + Expo Router, NativeWind, react-hook-form + zod (schemas shared with backend), TanStack Query for server state, Zustand for client state.
- **Backend:** NestJS modular monolith. PostgreSQL 16 + Prisma. Redis + BullMQ for the timer/escalation job queue. Twilio (Verify/SMS/Voice), FCM + APNs push, Stripe billing, S3-compatible storage for photos/voice memos (server-side encrypted).
- **Why Node/NestJS:** first-class TypeScript end-to-end (shared validation schemas with the RN app), mature queue tooling (BullMQ) for exactly this delayed-job/escalation pattern, strong Twilio SDK support, opinionated module/DI structure that suits an audit-heavy compliance product. (This supersedes the earlier PHP-backend plan; the OpenAPI contract preserves the MSW mock workflow.)
- **Timer flow:** device heartbeat → API → reset `next_expiry` → BullMQ delayed job → expiry → grace window → Tier-2 outreach → consult Instruction → execute Response Queue → incident lifecycle → Admin incident command → post-incident summary / Estate Handover.

## 7. Milestones

1. **M1 — Foundation:** monorepo, tokens, UI package, User screens ported, contract mocks. *Exit:* pixel-faithful User app on iOS sim/Android emulator/web against mocks.
2. **M2 — Identity & data:** auth (Google/OTP/biometric), account+role model, plans CRUD, real API wired, demo data gone. *Exit:* duplicate-email prevention and role-linking verified by tests.
3. **M3 — Timer & escalation (highest risk, start iOS background spike immediately):** heartbeat pipeline, server timer, Twilio SMS/voice, Response Queue execution, grace window, Sick Mode path. *Exit:* end-to-end drill from a real device with real SMS + call.
4. **M4 — Hardening & stores:** audit trail complete, encryption review, pen-test pass, store submissions, web deploy (Expo Web).

## 8. Success metrics
- Heartbeat→server latency p95 < 30s when online; zero false escalations from connectivity loss in test cohort.
- OTP delivery success > 98%; escalation SMS/call delivery > 99% with fallback.
- Crash-free sessions > 99.5%; timer job accuracy within ±60s of `next_expiry`.
- 0 duplicate accounts; 100% of access-detail decryptions audit-logged.

## 9. Open questions (carried + new)
1. Couples/household support (v2 design target).
2. Watch platform scope.
3. Geographic scope & data residency (default AU, parameterized).
4. Estate Handover verification standard.
5. Confirm the PHP backend is fully retired in favor of NestJS.
6. Voice/SMS-only mode for non-smartphone users.
7. iOS background motion: acceptable degradation policy when iOS suspends the app (silent-push cadence, user disclosure copy).

## 10. Risks
| Risk | Severity | Mitigation |
|---|---|---|
| iOS background execution limits break passive motion detection | High | Phase-3 spike first; silent push nudges; honest disclosure; server-side "device gone quiet" policy distinct from "motionless" |
| False escalations (dead battery, airport mode) | High | Offline/online signal distinction; grace window; Tier-2 multi-channel outreach before any dispatch |
| App-store rejection (background sensors, foreground service) | Medium | Early declarations, review notes doc, permission rationale in Inside voice |
| Twilio deliverability by region | Medium | Sender registration, fallback channels, delivery-receipt-driven queue advance |
| Sensitive-data breach | Critical | Field-level encryption + KMS, audited decryption, pen test before launch |
