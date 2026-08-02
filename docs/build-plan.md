# Build plan — completed implementation

This plan is the required checkpoint after export audit and before mass porting.

## 1. Foundation and workspace

Status: complete.

- Create the pnpm/Turborepo workspace, shared strict TypeScript/ESLint/Jest configuration, Expo mobile app, and empty NestJS placeholder.
- Add CI-ready root scripts: `lint`, `typecheck`, `test`, `dev:mobile`, and `dev:web`.
- Copy the governing brand references into `brand-references/`; keep the original prompt package until Phase 1 is verified.

## 2. Tokens and shared UI

Status: complete.

- Encode the complete dark palette, Inter scale, 4px spacing rhythm, radii, and component-state mapping as typed tokens and NativeWind configuration.
- Implement only the audited components plus the spec-required Progress, Slider, Separator, Skeleton, toast, and OTP input.
- Add interaction/accessibility tests for shared primitives before screen work.

## 3. Core contract and mocks

Status: complete. The in-memory client is retained only as an isolated unit-test fixture; production uses REST exclusively.

- Define zod schemas and inferred types for Account, AccountRole, Plan, MotionTimer, ResponseQueueStep, Person, Pet, Property, masked AccessDetail, Incident, HandoffLetter, and VoiceMemo.
- Implement a promise-based in-memory client for mock auth and User-screen CRUD with small artificial latency and explicit loading/error behavior.
- Drive timer display and check-in exclusively from `next_expiry_at`; document operations in `docs/api-contract.md`.

## 4. User app in required order

Status: complete.

- Entry, unified Login, SignUpWizard, and one-time biometric opt-in UI.
- Home Status; timer edit/check-in/grace variants.
- Plan and Response Queue; canonical Enhanced People and Pets; Property Access; Last Wishes.
- Account suite and linked Nominated Contact role views.
- Emergency, Sick, and Trip modes, with Ember restricted to critical states.
- For each family: add empty/loading/error states, update docs, and verify iOS, Android, and web before continuing.

## 5. Final surfaces

Status: complete.

- Port Admin last as desktop Expo Web routes, platform-gated out of native and gated below the desktop breakpoint.
- Port the four exported Responder screens to native/web shared primitives.
- Do not add Admin Compliance, Billing, or Settings screens without a source design.

## 6. Acceptance and cleanup

Status: complete subject to the external activation items in `integration-handoff.md` and signed-device drills.

- Run lint, strict typecheck, tests, Expo Web build, and available simulator/emulator smoke tests.
- Search `apps/` for fixture names, demo-mode auth, raw hex values, and forbidden role-login routes.
- Review all docs and source-to-target mappings.
- After verification, remove only superseded kickoff/build artifacts. Retain all brand and description Markdown files and the read-only export unless the user explicitly chooses to archive it elsewhere.
