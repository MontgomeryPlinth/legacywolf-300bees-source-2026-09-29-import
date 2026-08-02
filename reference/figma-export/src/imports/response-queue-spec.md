# Legacy Wolf — Response Queue Specification

Screen ID: **RQ1**. Functional and behavioral specification only — no visual styling,
color, or layout chrome. Pair with `legacy-wolf-brand.md` and
`legacy-wolf-app-architecture.md` for identity and IA context.

---

## 1. Concept

The Response Queue is the ordered escalation ladder executed when the user's Motion Timer
expires and the grace window passes without a response. It makes the escalation sequence
explicit, visible, and user-configurable — the literal expression of "you instruct, we
execute."

- Surfaces first within Plan → Active Instruction (before the tier cards).
- The Home / Status screen renders a read-only summary of the same ladder.
- The user never starts from an empty queue: a default queue is auto-generated at
  activation from their onboarding choices.

---

## 2. Allowed step types (closed set)

Only these five step types may exist in a queue:

1. **Text to user**
2. **Call to user**
3. **Attend Your Address** (responder dispatch, at the user's configured authority level:
   knock only, or enter)
4. **Text to [Nominated Contact]**
5. **Call to [Nominated Contact]**

Contact steps (4–5) are repeatable per nominated contact if the user has more than one.
No other step types may be created, imported, or configured.

---

## 3. Default queue generation rules

### Rule 1 — Universal opening steps

Every default queue begins with, in this exact order:

1. Text message to the user
2. Phone call to the user

These always come first and give the user the opportunity to stand down before anyone
else is involved.

### Rule 2 — Plan-conditional third step

- **Advanced plan (responder attendance configured):**
  - Step 3: Attend Your Address (at the configured authority level)
  - Step 4: Text to primary nominated contact (informed alongside the dispatch)
- **Basic plan (no attendance):**
  - Step 3: Text to primary nominated contact
  - Step 4: Call to primary nominated contact
  - No responder step is ever generated for Basic.

### Rule 3 — Attendance step availability

The Attend Your Address step may only exist in a queue when ALL of the following are true:

- Advanced plan active
- Address verified with responder coverage confirmed
- Required authority level completed during setup (3A knock-only or 3B enter)

If any condition becomes untrue later (downgrade, payment failure, address change to an
uncovered area), the attendance step is automatically removed and replaced with the
Basic-plan contact steps. The queue is never left empty or broken, and the user is
notified of the substitution.

### Rule 4 — Edit constraints

After generation, the user may reorder, add, or remove steps within these constraints:

- The queue must always begin with at least one "to user" step (text or call).
- The attendance step may never precede all "to user" steps.
- The queue must contain at least one step beyond the "to user" steps to be armable.
- Only the five allowed step types may be added.

### Rule 5 — Execution semantics

- Steps execute strictly in order.
- Each step waits for its response window before advancing ("if no response, then next
  step").
- A response from the user at any step cancels the remainder of the queue.
- Completion of the final step with no response closes escalation per plan policy.
- The server-side timer is the source of truth for step advancement; the client renders
  state, it does not drive it.

### Rule 6 — Sync with plan state

- The queue re-validates whenever plan tier, nominated contacts, or attendance
  configuration change.
- Invalid steps are substituted per Rule 3, never silently dropped.
- Every queue change — user-made or system-made — is audit-logged with timestamp and
  cause.

---

## 4. Frontend behavior — RQ1 view actions

### 4.1 Queue list rendering

- Render the queue as a vertical ordered list of step cards, one card per step.
- Each card displays: step type, target (user / contact name), and — for the attendance
  step — the authority level (knock only / enter).
- Between every consecutive pair of cards, render the fixed connector text:
  **"If no response, then:"**
- After the final card, render the terminal text: **"If no response, then no further
  action."**
- Contact steps display the actual contact name pulled from the People data — never a
  hardcoded name.

### 4.2 Drag-and-drop reorder

- Every card exposes a drag handle. Long-press (touch) or pointer-drag on the handle
  lifts the card.
- While dragging: remaining cards part to reveal valid drop positions; invalid drop
  positions (per Rule 4) are not offered — e.g., no drop slot is shown above the first
  "to user" step for an attendance card.
- On drop: the list reorders immediately in the UI, connector labels re-render between
  the new pairs, and the change enters the unsaved-changes state (see 4.6).
- If a drop would violate a constraint that could not be prevented visually, the card
  animates back to its origin and a constraint message is shown (see 4.7).
- Reordering is keyboard-accessible: cards can be moved up/down via focus + arrow
  actions with the same constraint enforcement.

### 4.3 Add step

- An "Add Step" action opens a selection sheet listing only the five allowed step types.
- Contact step types expand to a picker of the user's verified nominated contacts.
- The Attend Your Address option is disabled (with plan-gating message and upgrade
  affordance) whenever Rule 3 conditions are not met. It never disappears — it renders
  locked so Basic users can discover the capability.
- A newly added step is inserted at the lowest valid position by default and can then be
  dragged.
- Duplicate prevention: the same step (identical type + target) may not appear twice in
  the queue.

### 4.4 Remove step

- Each card exposes a remove action (overflow menu or swipe).
- Removal is blocked with a constraint message when it would violate Rule 4 (e.g.,
  removing the last "to user" step, or the last non-user step).
- Removal enters the unsaved-changes state; nothing is committed until save.

### 4.5 Edit step

- Tapping a contact step allows switching the target contact (picker of verified
  contacts).
- Tapping the attendance step shows its authority level read-only, with a link out to
  the attendance settings flow — authority level is not editable from the queue.
- "To user" steps have no editable properties.

### 4.6 Save / discard

- All mutations (reorder, add, remove, retarget) are staged locally and previewed live
  in the ladder.
- A save action commits the staged queue to the server; commit succeeds only after
  server-side validation of all rules (client validation is a convenience, server is
  authoritative).
- On successful save: confirmation state, Home / Status ladder summary updates, audit
  log entry created.
- Navigating away with staged changes prompts: keep editing / discard changes.
- If server validation rejects a queue the client considered valid, the queue reverts
  to the last committed state and the reason is displayed.

### 4.7 Constraint feedback

Constraint violations produce inline, plainspoken messages (Inside voice, never
alarmist). Canonical messages:

- "Your queue must start with a text or call to you."
- "The responder step can't run before we've tried to reach you."
- "Your queue needs at least one step that reaches someone else."
- "Attend Your Address requires the Advanced plan." (with upgrade affordance)

### 4.8 State variants the view must handle

- **Default / committed** — queue matches server state.
- **Editing / staged** — local changes pending save.
- **Drag in progress** — lifted card, visible valid drop positions.
- **Basic-plan variant** — attendance step absent from queue; locked in the add sheet.
- **Substitution notice** — banner shown after a system-made substitution (Rule 3),
  dismissible, linking to the change detail in History / Audit Log.
- **Alert-active lock** — while an incident is live, the queue is read-only; edits are
  disabled with an explanatory message. Changes resume after the incident closes.

### 4.9 Read-only ladder (Home / Status)

- The Home / Status screen renders the committed queue as a non-interactive ladder with
  the same connector text.
- A single "Change Responses" affordance navigates to RQ1.
- The ladder always reflects the last committed queue — never staged edits.

---

## 5. Open items

1. **Per-step response windows** — how long each step waits before advancing ("if no
   response, then") is not yet defined. Needs product decision: fixed global window vs.
   per-step-type windows (e.g., text 5 min, call 5 min, attendance N/A).
2. **Dead-battery grace rule** — raised but not yet decided. Current C2 default is "end
   monitoring if battery dies," set silently. A low-battery warning ladder and an
   explicit battery-death policy remain open. No numbers agreed.
3. **Multiple contacts ordering** — whether contact escalation order in the queue
   supersedes or mirrors the escalation order set in People (architecture P3/PE1).
   Recommend: the queue is the single source of truth post-activation.

---

*Version 0.1 — initial specification. Screen ID RQ1. Rules 1–6 plus frontend behavior
4.1–4.9. Drafted from product decisions of 9 July 2026.*
