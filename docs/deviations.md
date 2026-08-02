# Deviations and gaps

## Audit findings

- The export launches through four role cards and four separate role login routes. Phase 1 explicitly replaces this with one entry and one login route.
- `UserApp.tsx` currently imports the non-enhanced People and Pet screens. Phase 1 declares the Enhanced variants canonical, so routing will change while preserving the older files only as visual reference.
- The export has PIN creation/prompt dialogs. The governing session model uses OTP plus an optional device-bound biometric unlock, so PIN UI will not be ported.
- The exported unified role selector is a top-level app shell. User + Nominated Contact must instead coexist in one authenticated account; only the linked-role views will be reused inside Account.
- Admin’s Compliance, Billing, and Settings routes contain only “Coming soon” placeholders. There are no exported screens to port; Phase 1 will not invent them.
- Admin is responsive/mobile in the export. The governing spec overrides this: Admin will be Expo Web desktop-only with a narrow-viewport gate and no native routes.
- `SignUpWizard` exposes 14 post-entry states but does not annotate O1–O6 IDs. The implemented provisional mapping is recorded in `component-map.md`; no missing state was invented.
- The export allows up to three attendance emergency contacts. The current RN onboarding pass captures one optional contact because the schema-level multi-contact editor belongs to People Management; expanding this within onboarding remains a fidelity follow-up, not a new route.
- The export’s terms step requires detecting that a web scroll container reached its end. The RN port presents all terms in the screen ScrollView and requires explicit acceptance; it does not add a fragile nested-scroll lock.
- Biometric capability detection, durable “prompt once” preference, SecureStore session storage, and refresh-token quick unlock are implemented. Store builds still require the platform signing configuration listed in the integration handoff.
- The supplied export documents the wolf-shield logo rules but contains no actual logo artwork. `apps/mobile/assets/icon-provisional.png` is an AI-generated, palette-constrained provisional mark used so native and store builds have complete assets. Replace it with the approved trademark source without recoloring or changing its proportions.
- The export has no standalone biometric opt-in screen. This is one of the few screens the master prompt explicitly authorizes adding.
- The export has no explicit loading/error/empty variant for every screen. Phase 1 requires these states; they will be state variants of exported screens, not new routes.
- The export contains demo fixtures and hardcoded identities. None were imported. A test-only mock remains isolated in `packages/core/src/mock-client.ts`, is not package-exported, and is absent from production bundles.
- The DB schema and UI retain the exported `dispatch` and `notify_contact` queue-channel superset in addition to `sms`, `call`, and `push`.
- Attendance onboarding collects entry authority but the supplied flow has no address field. The encrypted instructions are retained against a clearly incomplete property record; responder dispatch is blocked until the user replaces it with a confirmed address in Property.
- Native Android Kotlin compilation could not be executed locally because this workstation has no Java runtime. Expo prebuild generated and registered the service successfully; EAS/CI must perform the signed native compilation.
