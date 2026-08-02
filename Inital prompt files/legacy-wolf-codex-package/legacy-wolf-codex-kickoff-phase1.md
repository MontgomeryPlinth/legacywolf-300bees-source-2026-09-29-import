# LEGACY WOLF — CODEX KICKOFF PROMPT (Phase 1: Foundation)

## Attached files — read all before writing any code
1. `legacy-wolf-rn-master-prompt.md` — the governing spec for the whole migration. **Every rule in it is binding.** This kickoff prompt scopes you to Phase 1 of that document; where the two conflict, the master prompt wins.
2. `legacy-wolf-prd.md` — product requirements and architecture.
3. `legacy-wolf-db-schema.md` — the entity model. In Phase 1 you do NOT build the database; you use this to shape TypeScript types, zod schemas, and mock data so they match the real backend later.
4. `legacy-wolf-brand-description.md` + `legacy-wolf-style-guide.md` — brand and visual rules. Binding for all copy, tokens, and UI. Inside voice on every product surface.
5. `Mobile_App_User_Views.zip` — the Figma Make export (React 18 + Vite + shadcn). This is the visual and structural source of truth for screens. Unzip it to `/reference/figma-export/` in the repo and treat it as read-only reference — never import from it.

## Your mission (Phase 1 only)
Stand up the production monorepo and port the **User app** screens from the Figma export to React Native (Expo), pixel-faithful, running on iOS simulator, Android emulator, and Expo Web — against typed mocks. No backend. No native motion/biometric work yet (that is Phase 2–3).

## Hard rules (repeated from the master prompt — do not violate)
1. **Do not invent screens.** Port only what exists in the export. Anything a flow seems to need but that doesn't exist goes in `docs/deviations.md` as a note — you stop, you don't build it.
2. **Remove, don't port:** `RoleSelectionScreen` (4-role card home), the four per-role login screens and `/login/{user,contact,responder,admin}` routes, demo-mode auth, and ALL fixture/demo data (`src/data/fixtures`, `src/data/examples`, hardcoded users/timers/incidents). Fixtures may be reshaped into typed mocks (see Mock layer) but must never resemble a shipped demo mode.
3. **Replace the entry flow** with one screen: shield logo, "Protecting what you love most.", **LOG IN** and **SIGN UP** buttons (primary/secondary CTA styles per style guide). Build the login screen UI (Google button, phone-first OTP with the existing OTP input pattern, email OTP secondary) and the one-time biometric opt-in prompt UI — **as UI only, wired to mock auth**. Real Google/OTP/biometric comes in Phase 2.
4. **Brand tokens only.** All colors, type, spacing, radii come from `packages/tokens`, values exactly as specified in the style guide. Dark mode only. No non-palette colors anywhere. Guardian Green rationed; Ember only for severity/critical surfaces.
5. **Admin is desktop web only.** `/admin/*` routes render only on Expo Web at a desktop layout (sidebar, tables, ~1280px design width) and are excluded from native builds via platform-gated route files. Narrow web viewports get a "Admin requires a desktop browser" gate. (Admin porting is the LAST work item of Phase 1 — User app first.)

## Deliverable 1 — Monorepo scaffold
```
legacy-wolf/
├── apps/
│   ├── mobile/        # Expo SDK (latest stable), Expo Router, NativeWind v4, TS strict
│   └── api/           # empty NestJS scaffold only (placeholder; no endpoints yet)
├── packages/
│   ├── tokens/        # colors, type scale, spacing, radii from the style guide
│   ├── ui/            # ported component library
│   ├── core/          # shared types + zod schemas derived from the DB schema doc
│   └── config/        # eslint, tsconfig, jest presets
├── reference/figma-export/   # unzipped export, read-only
└── docs/              # component-map.md, deviations.md, decisions.md, copy-review.md
```
pnpm workspaces + Turborepo. CI-ready scripts: `lint`, `typecheck`, `test`, `dev:mobile`, `dev:web`.

## Deliverable 2 — `packages/tokens` + `packages/ui`
- Encode every value from `legacy-wolf-style-guide.md` (obsidian → deepEmber, Inter type scale, 4px rhythm, radii, component-state color mapping) as typed exports + NativeWind theme config.
- Port the shadcn components **actually used by the export's screens** (audit usage first; don't port all 40+). Expected core set: Button, Card, Input, Label, Badge, Dialog→Modal, Sheet→`@gorhom/bottom-sheet`, Tabs, Switch, Slider, Progress, Select, OTP input, Avatar, Separator, Skeleton, toast (sonner-equivalent).
- Every ported component gets a row in `docs/component-map.md`: old path → new component → notes/deviations.

## Deliverable 3 — `packages/core` (types, schemas, mock layer)
- TypeScript types + zod schemas for: Account, AccountRole, Plan, MotionTimer, ResponseQueueStep, Person, Pet, Property, AccessDetail (client only ever sees masked `••••` values — model that), Incident, HandoffLetter, VoiceMemo — shapes derived from `legacy-wolf-db-schema.md`.
- A typed mock API client (in-memory, promise-based, small artificial latency) implementing the operations the User screens need: auth (mock), plan CRUD, timer read/reset, people/pets/property/wishes CRUD, response queue CRUD. Design method signatures as if they were the real REST client; document each in `docs/api-contract.md` (draft).
- The Motion Timer countdown must be driven by mock `next_expiry_at` state, not a hardcoded local countdown — so swapping in the server later is a data-source change, not a rewrite.

## Deliverable 4 — User app screens (the bulk of Phase 1)
Port from `src/app/components/user/**` and `src/app/components/auth/**`, preserving screen IDs in comments and `docs/component-map.md`:

1. Entry screen (new, per rule 3) + Login + SignUpWizard + biometric opt-in prompt UI
2. H1 Home Status (live timer from mock state, status badge, quick actions)
3. T-series: Edit Timer sheet, Check In, grace-window UI states
4. Plan Management (P-series) incl. Response Queue sheets (`ResponseQueueSheet`, `AddQueueStepSheet`), Battery Behaviour sheet
5. People Management (Enhanced variant is canonical; note the non-enhanced one as superseded in `docs/decisions.md`)
6. Pet Management (Enhanced variant canonical)
7. Property Access (write-only masked access details)
8. Last Wishes
9. Account suite (Profile, Subscription, Legal Authorizations, Notifications, Security, History)
10. Modals: Emergency ("Are You OK?"), Sick Mode (M4 — severity 1–10 scale; Ember surfaces at 9–10), Trip Mode
11. Nominated-role view: the role switcher + `MyRole`/nominated-contact screens rendered **inside the account**, per the one-account model (UI only, mock data)
12. LAST: Admin app on Expo Web desktop layout; then Responder screens (mobile)

Every screen: designed empty states (Inside voice), loading skeletons, error states. No blank screens.

## Deliverable 5 — Docs
Maintain as you go: `docs/component-map.md`, `docs/deviations.md` (incl. every export screen you judged superseded/unclear, and any architecture screens missing from the export — e.g., verify `SignUpWizard` coverage of onboarding steps O1–O6/4.5 and log gaps), `docs/decisions.md`, `docs/copy-review.md` (flag any ported copy that violates Inside-voice rules; do not rewrite copy silently).

## Working method
1. First: unzip and audit the export. Produce `docs/component-map.md` skeleton (full screen + component inventory, used-component audit) and a build plan. **Stop and present the plan before mass-porting.**
2. Then scaffold (Deliverables 1–3), then port screens in the order above, committing per screen-family with conventional commits.
3. After each screen family, verify on all three targets (iOS sim, Android emulator, web) before moving on.

## Phase 1 acceptance checklist
- [ ] `pnpm dev:mobile` runs the User app on iOS sim + Android emulator; `pnpm dev:web` serves Expo Web.
- [ ] App opens to the single entry screen; no role cards; no per-role logins; mock login reaches Home Status.
- [ ] Zero fixture data or demo-mode auth in the app bundle; grep for fixture names (e.g. "Alex Morgan") returns nothing under `apps/`.
- [ ] Every visible color/typeface/radius traces to `packages/tokens`; no hex literals in screen code.
- [ ] Timer countdown driven by mock `next_expiry_at`; check-in resets it through the mock client.
- [ ] `/admin/*` absent from native builds; renders desktop layout on web ≥1280px; gate below that.
- [ ] All five docs files populated; deviations list reviewed with zero invented screens.
