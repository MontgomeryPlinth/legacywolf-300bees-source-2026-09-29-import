# Legacy Wolf — Figma Make Prompt

A structured prompt for generating Legacy Wolf's app sitemap, flows, and screens in Figma Make (or any AI design tool). Use with `legacy-wolf-brand.md` and `legacy-wolf-app-architecture.md` attached as inputs.

---

## How to use this prompt

This prompt is modular. Three ways to run it:

1. **Full generation** — paste the whole prompt to generate the complete sitemap across all four roles in one pass. Best for the initial structural pass.  
2. **Per-role scoping** — paste the Master Context block \+ a single Role Module. Best for focused work on one role at a time.  
3. **Per-screen scoping** — paste the Master Context block \+ a specific Screen Brief from the architecture doc. Best for high-fidelity work on individual screens.

The prompt assumes you've attached both `.md` files. If your tool can't read attachments, the Master Context block is self-sufficient for structural work — only the visual specifics require the brand doc.

---

## ────────────────────────────────────────

## MASTER CONTEXT BLOCK

## ────────────────────────────────────────

**Include this block in every prompt run.**

You are designing screens for **Legacy Wolf**, a monitoring-and-response service for people living solo. The product activates if the user becomes unresponsive — alerting a nominated contact, dispatching a Security Accredited Agent (Registered Nurse), caring for the user's pet, and executing pre-authorized dignity instructions before family arrives.

Refer to the attached files as canonical:

- **`legacy-wolf-brand.md`** — visual identity, color, typography, components, voice and tone (Inside register for product surfaces). Do not improvise visual decisions; defer to this doc.  
- **`legacy-wolf-app-architecture.md`** — the full sitemap, screen catalog, and IA per role. Do not invent screens not listed in the catalog without flagging the addition.

### Non-negotiable design constraints

- **Dark mode is the default and only theme.** Backgrounds: Obsidian `#0A0A0A` (base), Graphite `#161616` (cards/modals), Onyx `#1F1F1F` (overlays).  
- **Single accent: Guardian Green `#B5C42C`.** Used only for CTAs, progress, active states, and brand mark. Never decorative. No secondary accent colors.  
- **Typography:** Inter Black (or comparable heavy grotesque) for display, in UPPERCASE for hero and section headers. Inter Regular/Medium for body, sentence case. Small all-caps with tracking for labels.  
- **Component grammar:** pill-shaped CTAs (24px+ radius), Graphite cards with 16–20px radius, dark inputs with uppercase labels above the field.  
- **Spacing:** base unit 4px. Use the scale 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96\.  
- **Iconography:** line-based, single-weight, rounded terminals. Mist `#B5B5B5` default, Guardian Green when active.

### Voice constraints

All in-product copy uses the **Inside voice**:

- Plainspoken, precise, measured  
- Direct about the subject (this product is about death and incapacity — copy does not flinch)  
- Treats the user as an adult  
- Uses brand-noun naming: **Motion Timer, Silent Guardian, Friend Alert, Attend & Check, Pet Guardian, Reputation Guard / Pants On Service, Last Wishes, Nominated Contact, Security Accredited Agent**  
- Never uses: fur baby, doggo, pawesome, rainbow bridge, passed away (use "died"), beloved, sacred, journey (as death euphemism)

The **Outside voice** (witty, sharper, gallows humor) is reserved for marketing surfaces and explicitly not for product screens.

### Behavioral principles for the design

1. **Glanceability over depth on Home screens.** The User must see "is my plan armed, what's next, who would be called" within 2 seconds of opening the app.  
2. **Information surfaces only when authorized.** Access details, instructions, and pet info are encrypted at rest — UI shows them as `••••` until the user explicitly reveals or until an active incident decrypts them.  
3. **Calm over alarm in active-incident states.** Even when the timer expires, the UI should feel composed — like a flight attendant, not a fire alarm.  
4. **Confidence-building before activation.** Onboarding shows the user what their plan will look like in motion, before they trust it with their life.  
5. **The user is the author, we are the executor.** Copy and UI consistently reflect that the user is *instructing*, not requesting. Buttons say "Activate Protection," not "Submit."

---

## ────────────────────────────────────────

## TASK

## ────────────────────────────────────────

### If running full generation:

Generate the complete Legacy Wolf product as a Figma file with the following structure:

1. **Cover page** — title, version, doc references, last updated  
2. **Design System page** — color tokens, type tokens, components (buttons, inputs, cards, progress, modals, status badges, navigation), spacing scale, and iconography sample, all aligned to `legacy-wolf-brand.md`  
3. **Sitemap page** — visual node-and-edge diagram showing all four roles' IA from `legacy-wolf-app-architecture.md`, color-coded per role  
4. **User App pages** (mobile, 390 × 844 viewport) — every screen listed in Section 4 of the architecture doc, in flow order, with clear screen labels (H1, T1, P1, etc.)  
5. **Nominated Contact pages** (mobile web, 390 × 844 viewport) — Section 5 of the architecture doc  
6. **Responder App pages** (mobile, 390 × 844 viewport) — Section 6 of the architecture doc  
7. **Admin pages** (desktop web, 1440 × 900 viewport) — Section 7 of the architecture doc  
8. **Shared System flow pages** — Section 8 of the architecture doc, focused on auth and notifications  
9. **Edge cases page** — Section 9 of the architecture doc

Each screen must:

- Use the exact name from the architecture doc (e.g., "H1 — Home / Status")  
- Apply the design system tokens — no improvised colors, type sizes, or spacing  
- Use Inside voice in all copy  
- Show realistic content (not Lorem Ipsum) drawn from the architecture doc's screen descriptions  
- Indicate primary CTA, secondary actions, and back/exit paths clearly

Annotate any decision the architecture doc leaves ambiguous as a Figma comment, do not silently resolve it.

### If running per-role scoping:

Generate the complete set of screens for **\[ROLE\]** as listed in **Section \[N\] of `legacy-wolf-app-architecture.md`**, following the Master Context constraints. Produce one Figma page per screen, named exactly as the architecture doc specifies. Include flow arrows between screens within a sequence.

Replace `[ROLE]` and `[N]` with one of:

- User → Section 4  
- Nominated Contact → Section 5  
- Responder → Section 6  
- Admin → Section 7

### If running per-screen scoping:

Produce a high-fidelity Figma frame for **\[SCREEN ID — Screen Name\]** as specified in `legacy-wolf-app-architecture.md`. Apply Master Context design system tokens. Show every element the architecture doc lists, with realistic copy in Inside voice. Provide three variants if the screen has meaningful states (e.g., empty / populated / loading; or default / hover / pressed).

---

## ────────────────────────────────────────

## ROLE MODULES

## ────────────────────────────────────────

Each module below scopes the prompt to a single role. Use one at a time when you want focused output.

### Module A — USER APP

**Platform:** Mobile (iOS-first), 390 × 844 viewport. Add Watch companion screens at 198 × 242\.

**Priority screens (build these first):**

1. Onboarding sequence (Welcome → Phone → Verify → Welcome Modal → Add Pet → Home & Emergency → Silent Guardian → Choose Your Instruction → Last Wishes → Legal Authorization → Activation Complete)  
2. Home / Status (H1)  
3. Plan at a Glance (H2)  
4. Motion Timer Settings (T1)  
5. Check In Now (T2)  
6. Grace Window Active (T3)  
7. Choose Your Instruction (P2)

**Then expand to:** all remaining screens in Section 4 of the architecture doc.

**Special considerations:**

- Home screen must communicate plan-armed status, time-to-next-check-in, primary contact name, pet name (if applicable), and Plan Health Score within the first viewport  
- The escalation ladder ("text → call → knock → enter") must be visualized somewhere — recommended location: H2 Plan at a Glance, expanded  
- Alert-active state (A1, A2) is a wholesale UI mode change, not a screen — the entire app should feel different (more prominent timer, restricted nav, single dominant CTA)

### Module B — NOMINATED CONTACT PORTAL

**Platform:** Mobile web PWA, 390 × 844 viewport. Also covers SMS message templates and push notification copy.

**Priority screens:**

1. NC1 — Invite Landing (this is often the first impression of the entire brand to non-users)  
2. NC2 — What This Means  
3. NC4 — My Role (standing instructions)  
4. NC5 — Active Alert  
5. NC8 — Drill Notice

**Special considerations:**

- The Invite Landing must work without authentication — it's a link sent by SMS or email  
- Active Alert screen must be usable in low-attention high-stress conditions — large touch targets, single primary action, calm color treatment despite the urgency  
- This portal must feel like a respectful invitation, not a transaction

### Module C — RESPONDER APP

**Platform:** Mobile, 390 × 844 viewport. Designed for on-shift, on-scene use.

**Priority screens:**

1. R1 — Shift Home  
2. R3 — New Dispatch Notification  
3. R4 — Active Dispatch (with property access details revealed)  
4. R6 — User Check (with status sub-flows)  
5. R8 — Pants On Checklist  
6. R10 — Incident Report

**Special considerations:**

- This is operational software for people under stress — bias for clarity over cleverness  
- Photo documentation is integral, not optional — design with camera-first interactions  
- All sensitive screens (access details, Pants On items) must be designed with a privacy treatment: visible briefly, auto-locked, not screenshot-able where possible  
- Status updates are the user-facing trust mechanism — design these to be obvious and fast to log

### Module D — ADMIN

**Platform:** Web, desktop-first, 1440 × 900 viewport.

**Priority screens:**

1. AD1 — Admin Dashboard (live incident map \+ status)  
2. AD3 — User Detail  
3. AD5 — Responder Roster  
4. AD8 — Live Incident Command  
5. AD13 — Authorization Audit  
6. AD15 — Pending Handovers (Estate)

**Special considerations:**

- This is mission-critical software — clarity and information density matter more than visual flourish, but the brand voice is still present  
- The Admin can override the system in active incidents — every override must be obvious, logged, and intentional  
- Sensitive data (decrypted access details) requires explicit click-to-reveal with audit-logged reason, never default-visible  
- Dashboards should use Guardian Green sparingly — too much green here flattens its meaning elsewhere in the system

---

## ────────────────────────────────────────

## OUTPUT EXPECTATIONS

## ────────────────────────────────────────

For any run, the output should include:

1. **Named pages and frames** — every screen labeled with its architecture-doc ID and name  
2. **Realistic content** — not placeholder text; use the screen descriptions to write actual copy  
3. **Connected flows** — arrows between screens in a sequence  
4. **Component reuse** — primary CTA, input, card, etc. should be Figma components used consistently  
5. **State coverage** — for any screen with meaningful variants (empty, populated, error, loading, active-incident mode), produce each variant  
6. **Annotations on decisions** — anywhere the architecture doc leaves a choice open, leave a Figma comment naming the choice rather than silently resolving it

---

## ────────────────────────────────────────

## CHECKLIST BEFORE SHIPPING

## ────────────────────────────────────────

Run through before considering any output complete:

- [ ] Every screen in the relevant architecture section has a frame  
- [ ] Design system tokens used everywhere — no off-palette colors, no off-scale type  
- [ ] Inside voice consistent in all copy — re-read for any Outside-voice slip  
- [ ] No mascot-voice, no "fur baby," no rainbow-bridge euphemism  
- [ ] Brand-noun feature names used (Motion Timer, Silent Guardian, etc.)  
- [ ] Access details and Pants On items shown as masked by default  
- [ ] Plan Health Score, Trip Mode, Test Run / Drill, Hand-off Letters present in the User app (proposed additions; flag if intentionally deferred)  
- [ ] Pre-event verification flow present for Nominated Contact (proposed; flag if deferred)  
- [ ] Wellness Check screen present for Responder (proposed; flag if deferred)  
- [ ] Estate Handover present in Admin (proposed; flag if deferred)  
- [ ] Australian National Character Check and Registered Nurse credentials visible at appropriate trust moments  
- [ ] Open questions from Section 10 of the architecture doc surfaced as Figma comments where they affect a screen

---

## ────────────────────────────────────────

## ONE-LINER PROMPT (compressed)

## ────────────────────────────────────────

For when you just need a quick paste:

```
Design Legacy Wolf — a monitoring-and-response service for people living solo. Use the attached legacy-wolf-brand.md (dark theme + Guardian Green #B5C42C accent + Inter Black UPPERCASE display + Inside voice) and legacy-wolf-app-architecture.md (every screen ID and description). Generate the full sitemap and screens for [User App / Nominated Contact Portal / Responder App / Admin / all four]. Apply design system tokens without improvising. Use Inside voice for all product copy. Name every frame with its architecture doc ID. Include realistic content drawn from the screen descriptions. Flag any ambiguity as a comment rather than silently resolving it.
```

---

*Version 0.1 — initial Figma Make prompt. Update as design decisions resolve open questions.*  
