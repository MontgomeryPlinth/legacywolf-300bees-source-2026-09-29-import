# Figma Make Prompt — Legacy Wolf: Sick Mode

Paste the content below into Figma Make. Adjust hex values or type names if your design system file uses different tokens.

---

## Project context

Design a new feature called **Sick Mode** for the Legacy Wolf mobile app (iOS-first, portrait orientation, 390×844 baseline). Legacy Wolf is a monitoring and response service for people living solo — a quiet operator that activates if the user stops responding. Sick Mode is a new option inside the existing **Modes** section, alongside Trip Mode and Pause Protection.

Sick Mode is the inverse of Trip Mode. Trip Mode gives the user more rope ("I'm fine, I'll be away"). Sick Mode tightens the leash ("I'm vulnerable and at home"). When active, the Motion Timer becomes shorter, the grace window becomes shorter, check-ins become lighter (biometric / voice / one tap), and the user's Nominated Contact and Pet Guardian receive a soft, no-action-required heads-up.

**Severity is part of every check-in.** When the user taps "I'm Here," they're asked one question first — *How bad does it feel right now?* — on a 1–10 scale. The number they choose shapes the response options surfaced afterward. Low numbers reset the timer silently. Mid numbers offer optional escalations (notify Jess, find a doctor). High numbers (9–10) surface direct options — call an ambulance, dispatch a Responder — but every action still requires a user tap. The system never auto-dispatches based on a number alone, consistent with the brand's "you instruct, we execute" posture. However, **a severity score of 9 or 10 followed by no further tap within 3 minutes is treated as user-unresponsive** and triggers the user's pre-set active Instruction — same mechanism as a Motion Timer expiry, just on a faster fuse.

Design seven screens plus component states, all following the existing Legacy Wolf design system described below.

---

## Brand and design system (use these exact values)

**Color tokens — dark mode only, no light theme.**

- Obsidian `#0A0A0A` — page background, dominant surface
- Graphite `#161616` — cards, modals, input containers
- Onyx `#1F1F1F` — hover and secondary cards
- Guardian Green `#B5C42C` — primary CTAs, progress, active states, accent. Use sparingly — if everything is green, nothing is.
- Deep Moss `#9AA826` — pressed CTA state
- White `#FFFFFF` — primary text and headlines
- Mist `#B5B5B5` — secondary text and supporting copy
- Slate `#7A7A7A` — placeholders and disabled text
- Coal `#2A2A2A` — borders and dividers
- Ember `#C43A2C` — severity 9–10 surfaces only. A brand-tuned red that pairs with Guardian Green — never substitute iOS system red or fire-engine red.
- Deep Ember `#A4302C` — pressed Ember state

**Typography — Inter throughout.**

- Display L: 48 / 52, Black, UPPERCASE — section openers, hero step titles
- Display M: 32 / 36, Black, UPPERCASE — sub-sections
- Heading: 20 / 28, Semibold, sentence case — card titles, modal headers
- Body: 16 / 24, Regular, sentence case — default body
- Body Small: 14 / 20, Regular — supporting copy
- Label: 12 / 16, Medium, UPPERCASE, +0.08em tracking — eyebrows and form labels
- Mono / Numeric: 16 / 24, Medium — timers and codes (e.g. "6h")

**Components.**

- Primary CTA: pill-shaped (fully rounded), Guardian Green fill, near-black text (#0A0A0A), bold weight, UPPERCASE, generous horizontal padding (24–32px), 56px tall on mobile.
- Secondary CTA: same pill shape, transparent fill, 1px white border, white text.
- Tertiary: text link, Guardian Green or underlined, used sparingly.
- Cards: Graphite `#161616` background, 16–20px corner radius, optional 1px Coal `#2A2A2A` border, internal padding 16–24px.
- Inputs: dark Graphite fill, 16px+ radius, Label token above, Slate `#7A7A7A` placeholder.
- Toggles and radios: Guardian Green when selected.
- Progress: horizontal segmented bar, Guardian Green for completed, Coal for upcoming.

**Layout rules.**

- Generous negative space. The dark background is part of the design.
- Single focal point per screen — one headline, one primary action.
- 4px base unit, scaled 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
- Safe-area top inset for iOS status bar. Bottom safe area inset for home indicator.

**Voice — use Inside register for every word on these screens.** Measured, plainspoken, precise, adult-to-adult. Never cute. Never alarmist. Never patronizing. Use the exact copy provided below — do not paraphrase or "improve" it.

---

## Screens to design

### Screen 1 — Modes overview (modified)

The existing Modes screen needs a new row for Sick Mode added between Trip Mode and Pause Protection. Each mode is a tappable Graphite card with:

- Mode name (Heading style)
- One-line description (Body Small, Mist)
- Status chip on the right: "OFF" in Slate, or "ON" in Guardian Green
- Right chevron

Copy for the Sick Mode row:

- Title: **Sick Mode**
- Description: *"Tighter monitoring while you're unwell at home."*
- Default state: OFF

### Screen 2 — M4: Sick Mode setup

The screen the user lands on when they tap the Sick Mode row from Modes overview. This is the configuration screen.

**Layout, top to bottom:**

1. Top app bar: back chevron left, screen title "SICK MODE" (Label style, centered), no right action.
2. Hero block (with generous top padding):
   - Eyebrow label: **MODE**
   - Headline (Display M): **SICK MODE**
   - Subhead (Body, Mist): *"For when you're unwell and at home. We check in more often. People you trust get a quiet heads-up."*
3. Card 1 — Duration:
   - Label: **HOW LONG**
   - Stepper or chip selector: 1, 3, 5 (selected by default), 7, 14 days
   - Helper text (Body Small, Mist): *"Maximum 14 days. You can extend or end early."*
4. Card 2 — Check-in interval:
   - Label: **CHECK IN EVERY**
   - Chip selector: 4h, 6h (selected by default), 8h, 12h
   - Helper text: *"Your usual timer is 16h. Sick Mode shortens it."*
5. Card 3 — Quiet heads-up:
   - Label: **WHO WE'LL TELL**
   - Two rows with toggles (Guardian Green when on, both ON by default):
     - Row A: "Jess Hartley · Nominated Contact" with sub-label *"No action requested. We'll let her know if anything changes."*
     - Row B: "Marcus Chen · Pet Guardian" with sub-label *"In case Daisy needs a hand."*
6. Card 4 — Daily check-in (optional):
   - Label: **DAILY CHECK-IN**
   - Single toggle (Guardian Green when on, ON by default)
   - Helper text: *"One question a day: worse, same, or better. Skippable."*
7. Sticky footer:
   - Primary CTA, full-width with horizontal margin: **START SICK MODE**
   - Tertiary text link below: *"Cancel"*

### Screen 3 — M4a: Sick Mode active (replaces Home/Status while on)

This is what the user sees on the Home tab while Sick Mode is on. It replaces the normal Home/Status screen.

**Layout, top to bottom:**

1. Top app bar: Legacy Wolf wordmark left, settings icon right.
2. Status badge at top (centered, full-width pill): Onyx background, Guardian Green text — **SICK MODE · ACTIVE**
   - Directly below the badge, centered, small text (Label, Mist, +0.08em tracking): **LAST LOGGED · 7/10 · 2H AGO**
   - If no severity has been logged yet today, this line reads: **NOT LOGGED YET TODAY** in Slate
3. Hero block:
   - Eyebrow (Label): **NEXT CHECK-IN**
   - Massive numeric countdown (Display L, Guardian Green): **5h 42m**
   - Sub-line (Body, Mist): *"Or open the app any time to check in."*
4. Primary action card (Graphite, prominent):
   - Large pill button, Guardian Green: **I'M HERE**
   - Below button (Body Small, Mist): *"Resets your timer. One quick question first."*
5. Daily trend card (only if today's question hasn't been answered):
   - Label: **TODAY · ONCE A DAY**
   - Question (Heading): *"How are you feeling compared to yesterday?"*
   - Three pill buttons in a row, equal width, secondary style: **Worse** · **Same** · **Better**
   - Tertiary link below: *"Skip"*
6. Status summary card (Graphite):
   - Three rows, each with a Mist icon left, two-line text right:
     - "Jess has been told. No action requested."
     - "Marcus knows Daisy may need a hand."
     - "Your active instruction: Attend & Check + Pet Guardian"
7. Help row (full-width tappable, no card chrome, with red accent — but tuned to coexist with the palette, more burnt-amber than emergency red):
   - **I NEED HELP** (Label, +0.08em tracking)
   - Sub-line (Body Small, Mist): *"Skips the grace window. Dispatches now."*
8. Footer link, centered (Tertiary, Mist):
   - *"End Sick Mode"*

### Screen 4 — M4e: Severity check-in (the new core flow)

Full-screen sheet that appears immediately after the user taps "I'M HERE" on Screen 3. This is the new core check-in interaction. Single question, then branches into one of four response states based on the answer.

**State A — Asking (default entry state):**

1. Close X top-right.
2. Eyebrow: **CHECK-IN**
3. Headline (Display M, two lines): **HOW BAD DOES IT FEEL RIGHT NOW?**
4. Sub-line (Body, Mist): *"1 means barely noticing it. 10 means as bad as you've ever felt."*
5. Number grid — 10 large square tap targets arranged 5 across, 2 rows, with 12px gutter:
   - Numbers 1–5 top row, 6–10 bottom row
   - Each square: Graphite fill, 16px radius, numeric value centered in Display M White
   - Color cue under each square as a 4px bar: Guardian Green for 1–3, Mist for 4–6, a tuned burnt-amber for 7–8, Ember `#C43A2C` for 9–10
   - No labels beyond the numbers — the colored bar carries the gradient
6. Footer (Body Small, Slate, centered): *"Tap a number."* (no submit button — the tap is the submit)

**State B — Logged at 1–3 (low):**

Replaces the screen content after tap.

1. Headline (Display M): **TIMER RESET.**
2. Body (Body, Mist): *"Next check-in in 6h. We'll leave you alone."*
3. Auto-dismisses after 2 seconds, returns to Screen 3. The logged severity now appears under the SICK MODE · ACTIVE status badge.

**State C — Logged at 4–6 (mid):**

1. Headline (Display M): **THANKS.**
2. Body (Body, White): *"Timer reset. Want us to do anything?"*
3. Three stacked secondary CTAs (full-width pill, transparent fill, white border):
   - **Extend Sick Mode by 2 days**
   - **Send Jess a heads-up**
   - **Nothing — I'm OK**

**State D — Logged at 7–8 (high):**

1. Headline (Display M): **THAT'S A LOT.**
2. Body (Body, White): *"Timer reset. Here's what we can do."*
3. Three stacked CTAs:
   - Primary (Guardian Green): **Ask Jess to call me now**
   - Secondary: **Help me find a doctor**
   - Secondary: **I'm OK — just logging**

**State E — Logged at 9–10 (severe):**

This state is the most carefully designed. The card frame uses **Ember `#C43A2C`** as a 2px border on Graphite. The content is calm, direct, and tap-required. The red is not iOS system red — it is the brand-tuned Ember that lives only on this surface.

1. Banner at top (full-width, Ember `#C43A2C` fill, near-black text, Label style): **THIS SOUNDS SERIOUS.**
2. Headline (Display M, White): **WHAT DO YOU NEED?**
3. Body (Body, White): *"We'll do exactly what you tap. Nothing happens automatically."*
4. Four stacked CTAs:
   - Primary (Ember `#C43A2C` fill, near-black text, full-width pill): **Call an ambulance**
   - Secondary (transparent fill, Ember border, Ember text): **Dispatch a Responder now**
   - Secondary (transparent fill, white border, white text): **Ask Jess to call me**
   - Tertiary text link, centered, Mist: *"I'm OK — just logging"*
5. Below the CTAs, a thin countdown bar (Coal background, Ember fill that depletes left-to-right over 3 minutes).
6. Body Small (Mist, centered, below the bar): *"If you don't tap anything in 3 minutes, we'll start the response you set up in your plan."*

This is the only screen in Sick Mode where a user inaction has consequences, and the only surface in the entire product where Ember appears. Make sure the countdown is unmissable but not panicked. The brand is unshockable; this screen is its hardest test.

### Screen 5 — M4b: Daily trend check-in

A simple modal that appears once per day, either when the user taps into the daily trend card on Screen 3 or when prompted by a daily notification. This is **separate** from the per-check-in severity question — severity is the in-the-moment intensity, this is the day-over-day trend.

**Layout, top to bottom:**

1. Close X top-right.
2. Eyebrow: **DAY 3 OF 5 · ONCE A DAY**
3. Headline (Display M): **HOW ARE YOU FEELING COMPARED TO YESTERDAY?**
4. Three large vertical cards stacked (Graphite, each tappable, 24px internal padding):
   - **Worse** — Body Small below: *"Symptoms have gotten worse since yesterday."*
   - **Same** — Body Small below: *"About the same as yesterday."*
   - **Better** — Body Small below: *"Symptoms have eased."*
5. Optional notes input (collapsed by default, expandable):
   - Label: **NOTES (OPTIONAL)**
   - Helper: *"Private to you unless an incident is triggered."*
6. Sticky footer:
   - Primary CTA: **LOG**
   - Tertiary: *"Skip today"*

### Screen 6 — M4c: Sick Mode ending soon

Prompt that appears on the Home/Status screen one day before Sick Mode is set to expire. Designed as a banner or a card at the top of the existing Sick Mode active screen.

**Layout — card variant, full width on Home:**

1. Card with Coal `#2A2A2A` border on Graphite background.
2. Eyebrow: **HEADS UP**
3. Heading: *"Sick Mode ends tomorrow."*
4. Body (Mist): *"Your timer will return to 16h. Jess and Marcus will be told you're back to baseline."*
5. Three pill buttons in a row, equal width:
   - Primary: **EXTEND**
   - Secondary: **END NOW**
   - Tertiary text link: *"Let it expire"*

### Screen 7 — M4d: Extended duration prompt (day 7+)

A separate screen or sheet that appears if Sick Mode has been running for 7 consecutive days. Inside voice, direct without being alarmist.

**Layout:**

1. Close X top-right.
2. Eyebrow: **A WEEK IN**
3. Headline (Display M): **THIS HAS BEEN GOING ON A WHILE.**
4. Body (White, Body): *"If you haven't already, this is a good moment to call a doctor or someone close to you."*
5. Body (Mist, Body Small): *"We're not diagnosing anything. Just noticing."*
6. Two CTAs stacked:
   - Primary: **ASK JESS TO CALL ME**
   - Secondary: **I'M HANDLING IT**
7. Tertiary, centered: *"End Sick Mode"*

---

## Component states to design

### Sick Mode card on Modes overview — two states

- **Off:** "OFF" chip in Slate `#7A7A7A`, card unchanged from baseline.
- **On:** "ON" chip in Guardian Green `#B5C42C`, subtle Guardian Green 1px left border on the card to signal active.

### "I'm Here" check-in button — three states

- **Default:** Guardian Green fill, near-black text.
- **Pressed:** Deep Moss `#9AA826` fill.
- **Just confirmed (after severity logged at 1–3):** Brief 1.5s state — Onyx fill, Guardian Green text reading **TIMER RESET · NEXT IN 6H**, then returns to default.

### Severity number squares — four states

- **Default:** Graphite fill, White numeral, color bar visible underneath (Guardian Green for 1–3, Mist for 4–6, burnt-amber for 7–8, Ember for 9–10).
- **Hover / focused:** Onyx fill, color bar brightens.
- **Pressed:** Number flashes in its band color (Guardian Green / Mist / burnt-amber / Ember), 200ms.
- **Disabled (during 3-minute countdown on severe state):** Slate numeral, no color bar.

---

## Notification mockups (design as separate iOS-style notification cards)

Four notifications, each rendered as an iOS lock-screen notification with the Legacy Wolf icon, app name, timestamp, and body. Use Inside voice exactly as written.

1. **Sick Mode reminder (Tier 1):**
   - Title: *"Check in soon"*
   - Body: *"Your Sick Mode check-in is due in 30 minutes. Open the app or tap I'm Here."*

2. **Quiet heads-up to Nominated Contact (Tier 0, sent to Jess):**
   - Title: *"From Legacy Wolf"*
   - Body: *"Sean has marked themselves as unwell and at home. No action requested. We'll let you know if anything changes."*

3. **Severe check-in awaiting response (Tier 2, sent to user):**
   - Title: *"Still with us?"*
   - Body: *"You logged a 9. Tap to choose what we do next. If you don't, your plan starts in 3 minutes."*

4. **Sick Mode ended:**
   - Title: *"Sick Mode ended"*
   - Body: *"Your timer is back to 16h. Glad you're feeling better."*

---

## Things to avoid

- No light mode. No white backgrounds.
- No emoji, no illustrative icons in the hero — Sick Mode is not a wellness product.
- No medical iconography (thermometers, pills, stethoscopes). The brand acknowledges the subject without depicting it.
- No "great job!" or congratulatory copy after a check-in. A silent tick is enough.
- No urgency-marketing red. The only red in the product is Ember `#C43A2C`, used exclusively on severity 9–10 surfaces. Never substitute iOS system red, fire-engine red, or any other red. Error toasts, validation states, and notifications still use burnt-amber, not Ember.
- No paw prints or pet-shop visual language anywhere on these screens, even though pets are mentioned.
- No drop shadows on cards. Elevation is communicated through Graphite vs Onyx, not through shadow.
- **No auto-dispatch language anywhere.** Even on State E of the severity screen, copy never says "calling ambulance now" or "dispatching" without a user tap having happened. The 2-minute countdown copy reads *"we'll start the response you set up,"* not *"we'll call emergency services."* The user is always the author.
- **No emoji on the severity scale.** No sad/neutral/happy faces. Numbers only. The scale is for the user to interpret, not for us to caricature.

---

## Deliverable

Seven screens plus the modified Modes overview row, the two card states, the three button states, the four severity-square states, and four notification mockups — all in a single Figma file, organized in a frame titled **Sick Mode — v0.2**, in iPhone 14 Pro frames (390×844). Include a small cover frame with the feature name and a one-line summary in Inside voice: *"Tighter monitoring while you're unwell at home."*