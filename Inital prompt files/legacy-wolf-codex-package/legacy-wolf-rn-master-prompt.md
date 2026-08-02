# LEGACY WOLF — MASTER PROMPT: Figma React → React Native (iOS + Android + Web) + Node Backend

> Attach alongside this prompt: the Figma Make export (`Mobile_App_User_Views`), `legacy-wolf-brand.md`, `legacy-wolf-app-architecture.md`, `legacy-wolf-prd.md`, `legacy-wolf-db-schema.md`.
> Brand rule (binding): **all branded output — copy, UI, notifications, marketing, images — must conform to `legacy-wolf-brand.md`.** Inside voice on every product surface. Guardian Green is rationed. Dark mode only.

---

## ROLE

You are the lead engineer migrating the existing Legacy Wolf Figma Make export (React 18 + TypeScript + Vite + shadcn/radix) to a production monorepo:

1. **Mobile:** React Native via **Expo SDK (latest stable) + Expo Router**, targeting iOS App Store and Google Play.
2. **Web app:** **Expo Web (react-native-web) only** — the same codebase serves the web app. No Next.js shell, no SEO work in this phase (decision recorded; SEO is deferred and out of scope). The **Admin surface renders as a desktop web layout**: wide fixed-width breakpoint (min ~1280px), sidebar navigation, data tables — not a stretched mobile layout. Use responsive breakpoints in NativeWind so `/admin/*` routes render desktop-first on web; on small viewports show a "Admin requires a desktop browser" gate rather than a degraded layout.
3. **Backend:** **Node — NestJS + TypeScript**, PostgreSQL 16 (Prisma), Redis (BullMQ) for the escalation queue, deployed as a single service initially (modular monolith, not microservices).

## PRIME DIRECTIVES

1. **Do not invent screens.** The screen inventory is exactly what exists in the export under `src/app/components/{user,nominated-contact,responder,admin,auth}`. Port those. Nothing new except where this prompt explicitly instructs (the replacement login screen, the biometric prompt, the linked-roles switcher view). If a flow seems to require a screen that doesn't exist, log it in `docs/deviations.md` and stop — do not create it.
2. **The server-side timer is the source of truth.** Device motion is a client signal that feeds it. Never make escalation decisions purely on-device.
3. **You instruct, we execute.** No feature may act without the user's pre-authorized Instruction. If any ported logic auto-dispatches without prior user authorization, flag it as a brand/product violation in `docs/deviations.md`.
4. **No demo data ships.** Strip everything (see §4).
5. Preserve established screen ID conventions (O1–O6, H1–H2, T1–T3, M1–M4, A1–A3, NC*, R*) in code comments and `docs/component-map.md`.

---

## 1. MONOREPO STRUCTURE

```
legacy-wolf/
├── apps/
│   ├── mobile/            # Expo (iOS, Android, Expo Web for the authed app)
│   └── api/               # NestJS backend
├── packages/
│   ├── ui/                # Shared RN components (ported design system)
│   ├── core/              # Types, zod schemas, API client (generated from OpenAPI)
│   ├── tokens/            # Brand tokens: Obsidian, Graphite, Onyx, Guardian Green, Deep Moss, Ember, Deep Ember, type scale
│   └── config/            # eslint, tsconfig, jest presets
├── docs/                  # component-map.md, deviations.md, decisions.md, copy-review.md, api-contract.md, app-review-notes.md
└── brand-references/      # legacy-wolf-brand.md, legacy-wolf-app-architecture.md
```

Tooling: pnpm workspaces + Turborepo. Strict TS everywhere. ESLint + Prettier from `packages/config`.

## 2. UI MIGRATION RULES (Figma export → RN)

- shadcn/radix components do not exist in RN. Rebuild the used subset in `packages/ui` on top of RN primitives + `react-native-reanimated` + `@gorhom/bottom-sheet` (all the `sheets/*` components map here). Map each old component → new component in `docs/component-map.md`.
- Tailwind classes → **NativeWind v4** (keeps the class syntax, works on native + web). Token values come only from `packages/tokens`, sourced from `legacy-wolf-brand.md` §8–9 (Obsidian `#0A0A0A`, Graphite `#161616`, Onyx `#1F1F1F`, Guardian Green `#B5C42C`, Deep Moss `#9AA826`, Ember `#C43A2C`, Deep Ember `#A4302C`, Mist/Slate/Coal, Inter type scale). No other colors. Dark mode only.
- Navigation: react-router → **Expo Router** file-based routes. Preserve the route tree: `/user/*`, `/nominated-contact/*`, `/responder/*`, `/admin/*`.
- **Admin = desktop web.** `/admin/*` renders only on Expo Web at a desktop layout (sidebar nav, data tables, min ~1280px design width, ported faithfully from the export's `AdminApp`). Do not ship Admin inside the iOS/Android binaries — exclude those routes from native builds (platform-gated routing). On narrow web viewports, show a desktop-required gate.
- Keep all existing copy verbatim, then audit it against Inside-voice rules in `docs/copy-review.md`.
- Forms: keep react-hook-form + zod; move zod schemas to `packages/core` so backend and frontend validate identically.

## 3. AUTH — REPLACE THE ENTRY FLOW

**Remove:** `RoleSelectionScreen.tsx` (the 4-card home), `UserLogin`, `NominatedContactLogin`, `ResponderLogin`, `AdminLogin` as separate entry points, and `/login/{user,contact,responder,admin}` routes.

**Replace with a single entry screen:** logo, "Protecting what you love most.", **Log In** and **Sign Up** buttons. Nothing else. One `/login` route.

**Login methods (all roles, one screen):**
1. **Google Sign-In** (`expo-auth-session` / native Google SDK; backend verifies the ID token — never trust the client).
2. **OTP** — phone-first (SMS via Twilio Verify), email OTP as secondary. Reuse the existing OTP input component.
3. **Biometric quick unlock** — after any successful first login, prompt once: *"Use Face ID / fingerprint to log in next time?"* (copy adapts to platform capability via `expo-local-authentication`). If accepted, store a device-bound refresh token in **Keychain/Keystore via `expo-secure-store`**, released only after successful biometric auth. Biometrics unlock a stored session — they are never the primary credential and never leave the device. A "Remember this device" preference lives in Account → Security.

**Role resolution happens after auth, not before.** The backend returns the roles attached to the account; the client routes to the right surface. If an account holds multiple roles (see §5), land on the highest-privilege consumer role (User) with the role-switcher available.

**Session model:** short-lived JWT access token (≤15 min) + rotating refresh token (httpOnly secure cookie on web; SecureStore on native). Refresh token rotation with reuse detection. Re-authentication (biometric or OTP) required to cancel an active incident, per architecture doc §8.1.

## 4. STRIP ALL DEMO DATA

- Delete `src/data/fixtures/*` and `src/data/examples/*` from the app bundle. If fixtures are useful for tests, move them to `apps/api/test/fixtures` only.
- Remove "demo mode (any credentials work)" from `AppContext` — auth must hit the real API.
- Remove hardcoded users (Alex Morgan, Emma Roberts, etc.), hardcoded timers, `QUICK_LOGIN_REFERENCE` flows, and any seeded incident/pet/contact data rendered without an API call.
- Empty states must be designed states (Inside voice), not blank screens: "No pets added yet. Add your pet to arm Pet Guardian."
- Development seeding lives only in `apps/api/prisma/seed.ts`, gated behind `NODE_ENV !== 'production'`.

## 5. ACCOUNT & IDENTITY RULES

- **One account per email. Enforce at DB level:** unique index on `lower(email)` in `accounts`; same for verified phone. Signup with an existing email routes to login ("An account with this email already exists — log in instead."). Google sign-in with a known email links to the existing account after verification, never creates a duplicate.
- **User + Nominated Contact are roles on one account, not two accounts.** When someone is invited as a Nominated Contact using an email/phone that matches an existing account, attach a `nominated_contact` role + relationship record to that account. The person manages "plans I'm nominated in" from a view **inside their existing account** (use the existing `MyRole` / nominated-contact screens rendered under a role-switcher within the account — do not build a new parallel app shell).
- Responder and Admin roles are provisioned by Admin only, never self-signup.

## 6. MOTION TIMER — THE CORE MECHANIC

**Rule: any phone movement resets the timer.** The accelerometer is the primary liveness signal; explicit check-in is the fallback, not the default interaction.

Client (Expo):
- `expo-sensors` accelerometer with the established battery pattern: **low-frequency baseline sampling with brief high-frequency confirmation bursts** — not continuous reads. A movement event above the noise threshold triggers a confirmation burst; a confirmed movement emits a signed "motion heartbeat."
- Background execution: iOS is the hard constraint (this is the Phase-3 risk already flagged). Use background fetch + silent push nudges + significant-location-change as auxiliary wake signals; document the honest iOS limitations in `docs/app-review-notes.md`. Android: ForegroundService with the persistent notification Google Play requires, with `ACTIVITY_RECOGNITION` / sensor permissions declared and justified.
- Heartbeats are batched and synced opportunistically (offline queue). Each heartbeat: `{deviceId, ts, signalType: motion|checkin|app_open, nonce, signature}` — device-key signed so replayed/forged heartbeats are rejected.

Server (NestJS):
- The **server-side timer is authoritative**. Each heartbeat resets `next_expiry = last_signal + interval`. A BullMQ delayed job per user fires at expiry → grace window (T3) → Tier-2 "are you OK?" push/SMS/call → no response → consult the user's Instruction → execute the Response Queue.
- Absence of heartbeats ≠ death: distinguish "phone off / no connectivity" (device stopped reporting entirely) from "phone alive but motionless" (device syncing, no motion). Surface the difference in escalation logic and in Admin anomaly views.
- Trip Mode, Pause, and Sick Mode (M4, severity 9–10 with 3-minute countdown) all modify the same server timer — one timer, many modifiers.

## 7. ESCALATION: SMS + AUTOMATED CALLS (Twilio)

Wire the existing `escalationApi.ts` stubs to real endpoints:

- **Twilio Verify** — signup/login OTP.
- **Twilio Programmable SMS** — timer warnings, grace-window alerts, Nominated Contact activation, drill notices. Delivery receipts (status callbacks) are logged to the audit trail; a failed delivery auto-escalates to the next channel/contact in the Response Queue.
- **Twilio Programmable Voice** — automated "are you OK?" calls with DTMF response ("Press 1 if you're OK") that feeds a check-in back to the timer; escalation calls to Nominated Contacts in the user's pre-set order with TwiML scripts generated from the user's own message templates.
- The **Response Queue** (already modeled in `ResponseQueueSheet` / `AddQueueStepSheet`) is the execution plan: ordered steps, each `{channel: sms|call|push, target, waitMinutes, onNoResponse: next|dispatch}`. The BullMQ worker walks the queue; every attempt, delivery status, and response is written to the immutable audit log.
- All webhook endpoints validate Twilio signatures. All phone numbers E.164-normalized and verified before they can be used in a queue.

## 8. BACKEND (NestJS) — MODULES & SECURITY

Modules: `auth`, `accounts`, `plans`, `timer`, `escalation`, `incidents`, `people`, `pets`, `property`, `wishes`, `responders`, `admin`, `audit`, `notifications`, `billing`.

Security baseline (non-negotiable):
- **Field-level encryption (AES-256-GCM, keys in KMS) for access details** (keysafe codes, alarm codes, entry instructions). Encrypted at rest, decrypted **only** on a triggered incident or audited admin click-to-reveal; every decryption writes an audit row (who, when, why, incident id). Write-only pattern in the UI: after first save the client only ever sees `••••`.
- Argon2id if any password path exists (prefer none — OTP/Google/biometric only), rate limiting (per-IP and per-identity) on OTP endpoints, OTP attempt lockout, device fingerprinting on refresh tokens.
- RBAC guards per role; Nominated Contacts see only what the user authorized, only post-trigger (permission matrix in architecture doc §2).
- Immutable audit log (append-only table, hash-chained rows) for: plan changes, authorization signatures, decryptions, notification deliveries, responder scene actions, admin overrides.
- Input validation with the shared zod schemas at the edge; helmet, CORS allowlist, strict rate limits; no PII in logs; TLS 1.2+; secrets via environment/secret manager, never in repo.
- Data residency: default region **Australia** (flagged open question — parameterize the region so it's a config decision, not a code change).

API contract: OpenAPI 3.1 generated from Nest decorators → typed client generated into `packages/core`. Document in `docs/api-contract.md`.

## 9. BUILD SEQUENCE (adapted four-phase plan)

1. **Phase 1 — Monorepo + design system:** tokens, `packages/ui` port, Expo app shell with Expo Router, all User screens ported pixel-faithful, MSW-style mocks against the OpenAPI contract.
2. **Phase 2 — Backend core:** auth (Google/OTP/biometric session), accounts + role linking, plans, server timer, Prisma schema, audit log. Wire the app to real API; delete mocks.
3. **Phase 3 — Motion + escalation (highest risk):** accelerometer heartbeat pipeline, background strategies per platform, BullMQ escalation worker, Twilio SMS/Voice, Response Queue execution, grace window, Sick Mode trigger path. Spike iOS background behavior **first**.
4. **Phase 4 — Store readiness:** permissions rationale copy (Inside voice), Play Store foreground-service declaration, App Store review notes (`docs/app-review-notes.md`), push certs, privacy manifests/nutrition labels, EAS build + submit, web deploy.

## 10. DELIVERABLE DOCS (Codex must maintain)

`docs/component-map.md`, `docs/deviations.md`, `docs/decisions.md`, `docs/copy-review.md`, `docs/api-contract.md`, `docs/app-review-notes.md`.

## 11. ACCEPTANCE CHECKS

- [ ] App launches to a single login/signup screen; no role cards anywhere.
- [ ] Google, phone OTP, email OTP all authenticate against the real backend; duplicate email signup is impossible.
- [ ] Biometric prompt appears exactly once after first successful login; subsequent launches unlock via Face ID/fingerprint.
- [ ] Physically moving the phone resets the timer without user interaction; server `next_expiry` updates.
- [ ] Killing connectivity does not fire a false escalation before the server-side policy says so.
- [ ] Timer expiry → grace window → SMS → automated call → Response Queue executes in order, fully audit-logged.
- [ ] A Nominated Contact invite to an existing email attaches a role to that account; the person switches into "My Role" from inside their own account.
- [ ] Zero fixture/demo data reachable in a production build.
- [ ] Every screen matches brand tokens; no non-palette colors; Inside voice everywhere in-product.
