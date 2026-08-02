# Legacy Wolf — Figma Gap Analysis & Additive Update Instructions

**Purpose of this file:** you are working inside an EXISTING Figma file that already contains implemented Legacy Wolf screens and flows. Your job is to AUDIT what exists, REPORT gaps against the flow reference below, and ADD only what is missing. You are not redesigning this app.

---

## ⛔ OPERATING RULES — READ BEFORE TOUCHING ANYTHING

1. **DO NOT rewrite, restyle, rearrange, or regenerate any existing screen, frame, component, or flow.** Existing work is the source of truth for visual style. If an existing screen differs from this document in layout or copy details, LEAVE IT and note the difference in your report — do not "fix" it.  
2. **AUDIT FIRST, BUILD SECOND.** Before creating anything, produce a gap report (format in the next section) and stop. Only proceed to creation after the gap report is confirmed.  
3. **ADDITIVE ONLY.** New screens go in new frames/sections clearly labeled with their flow ID (e.g., "C1 — Sign Up / Step 3"). Never delete, detach, or modify existing frames, and never re-link existing prototype connections except to attach a new screen at a flow's declared entry/exit point.  
4. **MATCH THE EXISTING FILE'S STYLE.** New screens must inherit the visual language of the screens already in the file (colors, type, components, spacing). Reuse existing components wherever one exists. Do not introduce new styles, new components that duplicate existing ones, or a different visual direction.  
5. **ONE FLOW AT A TIME.** Complete and report each flow's additions before starting the next. Do not batch-generate the entire document in one pass.  
6. **WHEN UNCERTAIN, ASK — DON'T IMPROVISE.** If it is ambiguous whether a screen already exists or where a new screen should connect, list it as a question in the gap report instead of guessing.

---

## STEP 1 — Required gap report (produce this before building)

Walk the flow reference below, compare against the existing Figma file, and output a table in exactly this format:

| Flow | Step / Screen | Status | Notes |
| :---- | :---- | :---- | :---- |
| C1 | Step 1 — Sign up entry | ✅ Exists / ⚠️ Partial / ❌ Missing | frame name if exists; what's missing if partial |

Status definitions:

- ✅ **Exists** — a screen in the file covers this step's purpose (even if details differ slightly; note differences, don't change them).  
- ⚠️ **Partial** — a screen exists but lacks a required element or state from the flow. Note exactly what's missing. The fix is to ADD the missing element/state variant as a new frame variant — never to alter the original frame.  
- ❌ **Missing** — no screen covers this step. Candidate for creation.

End the report with: (a) a list of proposed new frames with their flow IDs and where they attach in the prototype flow, and (b) any open questions. Then WAIT for confirmation.

## STEP 2 — Build (after confirmation only)

Create only the frames confirmed from the gap report, labeled `[FlowID] — [Screen name] (NEW)`, grouped in a section per flow, styled to match the existing file.

---

## KNOWN GAP — PRIORITY: Initial sign-up screens (Flow C1)

The file is known to be missing the first-run sign-up sequence. Expect most or all of Flow C1 to be ❌ Missing. This is the priority addition. The C1 sequence requires these screens (create only the ones your audit confirms absent):

1. **Sign-up entry** — app open, "Sign up" action (plus a login affordance for returning clients).  
2. **Pet question** — "Do you have a pet living with you?" Yes / No.  
3. **Core details** — first name, last name, mobile number. No email field.  
4. **SMS verification** — code entry to verify the mobile number.  
5. **Terms & Privacy acceptance** — summary with required acceptance before continuing.  
6. **Response selection** — two horizontal tiles under "Choose the response you want if we are alerted": "Only notify your nominated contact" / "Legacy Wolf to attend and check on you," with a note that both options are available during the 4-week free trial, and a Continue action that branches to C2 or C4.

Use "Legacy Wolf" (two words) in all screen copy.

---

## FLOW REFERENCE (audit against this — do not treat as a redesign brief)

### Flow C1 — New client sign-up and response selection

1. Client opens the app and taps Sign up.  
2. App asks: "Do you have a pet living with you?" (Yes / No). Yes is recorded so pet setup can be prioritised later if attendance is selected.  
3. Client enters first name, last name, and mobile number (no email — progressive onboarding).  
4. App sends an SMS code; client verifies mobile number.  
5. Terms and Conditions / Privacy summary; acceptance required.  
6. Response-selection screen: two horizontal tiles under "Choose the response you want if we are alerted."  
7. Tiles: "Only notify your nominated contact" / "Legacy Wolf to attend and check on you." (Police option retired.)  
8. Note that both options are available during the 4-week free trial.  
9. Client selects one, taps Continue.  
10. Branch: notify-only → Flow C2; attendance → Flow C4.

### Flow C2 — Option 1: nominated contact only

1. Nominated-contact setup opens.  
2. Contact details: name, mobile, email, relationship.  
3. Choice: inform the contact now, or only on alert.  
4. Battery rule silently defaults to "end monitoring if the battery dies" (not asked in onboarding).  
5. Motion inactivity is the default monitoring method; client may switch to check-in prompts.  
6. If switched, check-in configuration opens; otherwise motion inactivity settings.  
7. Monitoring threshold: default 24 hours, recommend 16 hours (or prompt frequency for check-in mode).  
8. Confirmation screen summarising what happens on an alert; Edit settings / Continue.  
9. Continue to Common Activation (C11–C13).

### Flow C3 — Intentionally blank (retired police path). No screens.

### Flow C4 — Attendance path, nominated contact first

1. Explainer: "You'll need a nominated contact so our responder can keep someone you trust informed if needed."  
2. Nominated-contact setup runs before permissions.  
3. Contact details: name, mobile, email, relationship.  
4. Choice: inform contact now, or only on alert. 5–6. If the client has a pet: pet profile flow (C5) before permissions and responder setup.  
5. If no pet: straight to the permissions explainer (C6).  
6. Then attendance setup (C5–C10) → Common Activation (C11–C13).

### Flow C5 — Pet-first onboarding for attendance

1. Intro: "Before we configure attendance, let's set up your pet so we know how to protect them."  
2. Pet name, species/type, photo.  
3. Primary pet guardian details.  
4. Backup guardian optionally now, or deferred to fuller pet setup later.  
5. Pet Profile page per pet (photo \+ key details).  
6. Add another pet.  
7. Pets header page ("You have 3 pets") with profile cards.  
8. Proceed to C6–C10 → C11–C13.

### Flow C6 — Permissions explainer and requests

1. Explainer screen before OS prompts.  
2. Explains why the app needs: Location (Always), Push notifications, Critical alerts, Motion & Fitness.  
3. Value framing: reduce false attendances, detect inactivity, alert before escalation.  
4. Explains location-bound attendance: location confirms the client is at their registered home before attendance is enabled or inactivity treated as a home-attendance event.  
5. OS prompts fire in sequence.  
6. Per-permission denial consequence screens (degraded-mode alternative or Settings deep link — never a dead end).  
7. Permission summary screen: granted/limited/denied per permission with effect on monitoring.  
8. Continue → C7.

### Flow C7 — Address entry and responder verification

1. Explainer: attendance is tied to one registered home address.  
2. Address entry with type-ahead autocomplete; postal-address validation on confirm; property type and unit/floor/building details; multi-unit prompts for unit info.  
3. Responder coverage check for that address.  
4. Covered: confirmation with typical response time → continue.  
5. Not covered: offer (a) continue with nominated-contact-only monitoring \+ coverage waitlist, or (b) different address. Captured data preserved.  
6. Confirm registered home → authority fork (C8 / C9).

### Flow C8 — Option 3A: attend and knock only

1. Authority fork screen: two tiles — "Attend and knock" vs "Attend and enter," each stating plainly what the responder will and won't do.  
2. Client selects "Attend and knock."  
3. Protocol explainer: attend, knock, call the client, check visible/audible signs, contact the nominated contact, escalate to emergency services on signs of distress — never enter.  
4. Pre-authorizations from outside (each yes/no): call ambulance, call police, notify nominated contact.  
5. Explicit statement: no keys, codes, or entry information are collected or held.  
6. Knock-only confirmation → C11–C13.  
7. If pets exist: caution that knock-only cannot reach a pet inside; offer upgrade to 3B or explicit acknowledgment.

### Flow C9 — Option 3B: attend and enter — authority and scene control

1. Client selects "Attend and enter" at the authority fork.  
2. Property Access Authorization: plain-language consent, signature capture, logged and timestamped.  
3. Scene-control pre-authorizations, individually consented: call ambulance, call police, provide first aid, care for pets on scene, notify contacts in pre-set order.  
4. Pet Care Authorization if pets exist.  
5. Audit-posture explainer: entries logged, access details encrypted, decrypted only on a triggered incident, on-scene actions documented.  
6. Confirm → C10.

### Flow C10 — Option 3B: access-method flow

1. "How will our responder enter?" — Keysafe / Door code / Neighbor or concierge has key / Encrypted keysafe / Other.  
2. Per-method detail form (keysafe code \+ location photo; door/alarm codes; key-holder contact; lobby/intercom/lift instructions).  
3. Sensitive fields are write-only after save (shown masked with an Update action).  
4. "What we share, when, with whom" privacy explainer.  
5. Optional alarm code and approach notes.  
6. Confirmation → C11–C13.

### Flow C11 — Billing setup and 4-week free trial

Plans: **Basic** (nominated contact notification only) and **Advanced** (responder attendance). Both available during the trial; card charged automatically at conversion.

1. Two plan tiles; the plan matching the chosen response path pre-selected.  
2. Trial terms stated plainly with exact conversion date and price.  
3. Payment method entry.  
4. Confirmation: trial start, conversion date, plan, price, how to cancel.  
5. Reminder scheduled 3 days before conversion.  
6. Downgrade rule on failed payment / Basic-at-conversion: downgrade to contact-only monitoring, never full cutoff; attendance settings preserved dormant.  
7. Continue → C12.

### Flow C12 — Event service limits and default cost caps

1. What one activation includes per plan.  
2. Default cost caps for pre-authorized incidentals (locksmith, emergency vet, extended callout), each adjustable or settable to "ask my nominated contact first."  
3. At-cap behavior: pause and seek authorization from the nominated contact.  
4. Fair-use note; drills always free.  
5. Confirmation → C13.

### Flow C13 — Final activation summary

1. Full-plan summary: monitoring method and threshold, response path, Response Queue ladder, contact, pets and guardians, address, access method (masked), plan and trial conversion date, cost caps.  
2. "What happens if you stop responding" — the escalation ladder for this client's configuration.  
3. Edit shortcut per section.  
4. Single CTA: **Activate Protection**.  
5. Post-activation confirmation ("Your plan is armed. Timer set to \[X\]h. We'll be here.") then Plan Health Score intro prompting anything skipped.

### Response Queue (screen RQ1) — post-activation feature

An ordered, drag-to-reorder escalation ladder ("If no response, then:" connectors) editable from Home/Status and Plan → Active Instruction. Step types limited to: text to user, call to user, attend address (Advanced plan only), text to a nominated contact, call to a nominated contact. Default queue: text to user → call to user → then (Advanced) attend address \+ text primary contact, or (Basic) text primary contact → call primary contact. If a screen resembling the "Alert (Response) Order" ladder already exists in the file, treat RQ1 as ⚠️ Partial and add only the editing affordances that are missing.

---

## Copy rules for any NEW screens

- Product name: "Legacy Wolf" — two words, always.  
- Voice: measured, precise, plainspoken, never alarming. No exclamation marks, no urgency-marketing, no cutesy pet language.  
- Feature names are proper nouns: Motion Timer, Nominated Contact, Pet Guardian, Attend & Check, Response Queue, Activate Protection.

