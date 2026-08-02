# Response Queue — RQ1

## Context

The Response Queue is the escalation ladder that executes when the motion timer expires and the grace window passes without a check-in. It makes the sequence explicit and user-configurable — the literal expression of "you instruct, we execute." Per the spec (RQ1), it surfaces as the **first row in the Active Instructions card** on the Nest / Home screen, and has a full edit sheet (RQ1 view). Twilio powers each step (SMS + voice call) with webhook callbacks for user responses.

---

## Data Model — AppContext.tsx

### New types (add above `AppState` interface)

```typescript
export type QueueStepType =
  | "text-user"
  | "call-user"
  | "attend-address"
  | "text-contact"
  | "call-contact";

export interface ResponseQueueStep {
  id: string;
  type: QueueStepType;
  contactId?: string;           // for text-contact / call-contact
  authorityLevel?: "knock-only" | "enter"; // for attend-address
}

export interface ResponseQueue {
  committed: ResponseQueueStep[];   // last server-saved state
  staged: ResponseQueueStep[];      // live local edits (mirrors committed when clean)
  isDirty: boolean;
  substitutionNotice?: string | null;
}
```

### Default queue generator (pure function, no state)

```typescript
function buildDefaultQueue(
  tier: UserPlan["tier"],
  primaryContactId: string | null
): ResponseQueueStep[] {
  const base: ResponseQueueStep[] = [
    { id: "dq-1", type: "text-user" },
    { id: "dq-2", type: "call-user" },
  ];
  if (tier === "full" || tier === "attend-check" || tier === "pet-guardian") {
    base.push({ id: "dq-3", type: "attend-address", authorityLevel: "knock-only" });
    if (primaryContactId)
      base.push({ id: "dq-4", type: "text-contact", contactId: primaryContactId });
  } else {
    if (primaryContactId) {
      base.push({ id: "dq-3", type: "text-contact", contactId: primaryContactId });
      base.push({ id: "dq-4", type: "call-contact", contactId: primaryContactId });
    }
  }
  return base;
}
```

### `initialResponseQueue` constant

```typescript
const initialResponseQueue: ResponseQueue = {
  committed: buildDefaultQueue("full", "1"),  // "1" = Sarah Chen
  staged: buildDefaultQueue("full", "1"),
  isDirty: false,
  substitutionNotice: null,
};
```

### Add to `AppState` interface

```typescript
responseQueue: ResponseQueue;
reorderQueueSteps: (steps: ResponseQueueStep[]) => void;
addQueueStep: (step: Omit<ResponseQueueStep, "id">) => void;
removeQueueStep: (id: string) => void;
updateQueueStep: (id: string, updates: Partial<ResponseQueueStep>) => void;
saveQueue: () => void;
discardQueue: () => void;
dismissSubstitutionNotice: () => void;
```

### Constraint validator (pure helper)

```typescript
function validateQueue(steps: ResponseQueueStep[]): string | null {
  if (!steps.some(s => s.type === "text-user" || s.type === "call-user"))
    return "Your queue must start with a text or call to you.";
  const firstNonUser = steps.findIndex(s => s.type !== "text-user" && s.type !== "call-user");
  const firstAttend = steps.findIndex(s => s.type === "attend-address");
  if (firstAttend !== -1 && firstAttend < firstNonUser)
    return "The responder step can't run before we've tried to reach you.";
  if (steps.filter(s => s.type !== "text-user" && s.type !== "call-user").length === 0)
    return "Your queue needs at least one step that reaches someone else.";
  return null;
}
```

---

## New Files

### 1. `src/app/services/escalationApi.ts`

Twilio integration stubs — each function is a clearly-marked placeholder for the real HTTP call:

```typescript
// POST /api/escalation/sms
// Body: { to: string, userId: string, stepId: string, message: string }
// Twilio sends SMS; returns { sid: string, status: "queued" | "sent" }
export async function sendEscalationSms(to: string, message: string): Promise<void> {
  console.info("[LegacyWolf] SMS stub →", to, message);
  // TODO: replace with fetch('/api/escalation/sms', { method: 'POST', body: JSON.stringify({to, message}) })
}

// POST /api/escalation/call
// Body: { to: string, userId: string, stepId: string, twiml: string }
// Twilio initiates voice call; returns { sid: string }
export async function initiateEscalationCall(to: string): Promise<void> {
  console.info("[LegacyWolf] Call stub →", to);
  // TODO: replace with fetch('/api/escalation/call', ...)
}

// POST /api/escalation/attend
// Body: { userId: string, address: string, authorityLevel: "knock-only" | "enter" }
export async function dispatchAttendance(address: string, authorityLevel: string): Promise<void> {
  console.info("[LegacyWolf] Attend stub →", address, authorityLevel);
  // TODO: replace with fetch('/api/escalation/attend', ...)
}

// WEBHOOK — Twilio → POST /api/twilio/sms-response
// Twilio sends: { From, Body, MessageSid }
// Handler checks if Body contains "OKAY", "STOP", or known keyword → cancels queue
// Register at: Twilio Console → Phone Number → Messaging → Webhook URL

// WEBHOOK — Twilio → POST /api/twilio/call-response
// Twilio sends: { CallSid, Digits (keypress), CallStatus }
// Handler interprets digit press (e.g. "1" = I'm okay) → cancels queue
// Register at: Twilio Console → Phone Number → Voice → Webhook URL
```

### 2. `src/app/components/user/sheets/ResponseQueueSheet.tsx`

Full-screen floating sheet (matching existing `inset-x-2 bottom-2 rounded-2xl h-[88vh]` pattern).

Sections:
- **Header**: "Response Queue" title + description
- **Substitution notice banner** (amber, dismissible) — shown when `substitutionNotice` is set
- **Alert-active lock banner** — if an incident is live, show read-only notice
- **Step list**: Each step card shows:
  - Numbered badge (1, 2, 3…)
  - Step icon + label (e.g. "📱 Text to Alex Morgan")
  - Up / Down arrow buttons (keyboard-accessible reorder; up hidden for first, down hidden for last)
  - Remove button (trash icon; blocked with toast if constraint violated)
  - Between cards: `"If no response, then:"` connector line
  - After last card: `"If no response, then no further action."` terminal
- **Add Step button** → opens `AddQueueStepSheet`
- **Fixed footer**: Cancel (discard) + Save buttons; Save disabled when `!isDirty`

Constraint violations: `toast.error(message)` inline, card does not move/remove.

### 3. `src/app/components/user/sheets/AddQueueStepSheet.tsx`

Bottom sheet listing the 5 step types:
- Text to me
- Call to me
- Attend Your Address (disabled + "Requires Advanced plan" if tier is basic; never hidden)
- Text to [Contact] → expands inline contact picker from `people`
- Call to [Contact] → same

Tapping a fully configured option calls `addQueueStep(...)` and closes the sheet. Duplicate detection: if identical step already exists, show `toast.error("This step already exists in your queue.")`.

---

## Files to Modify

### `src/app/contexts/AppContext.tsx`

1. Add `QueueStepType`, `ResponseQueueStep`, `ResponseQueue` type exports
2. Add `buildDefaultQueue` and `validateQueue` helper functions (above AppProvider)
3. Add `initialResponseQueue` constant
4. Add `responseQueue` state + all 7 actions inside AppProvider
5. Add to `AppState` interface
6. Add all to Provider value object

### `src/app/components/user/screens/HomeStatus.tsx`

Insert **before** the `attend-check` row (first row in the `<div className="space-y-1">` inside the Active Instructions card):

```tsx
{/* Response Queue — read-only ladder summary */}
<button
  className="flex items-center gap-2 w-full text-left hover:bg-accent/50 -mx-1 px-1 py-1 rounded-lg transition-colors"
  onClick={() => setShowQueueSheet(true)}
>
  <ListOrdered className="w-4 h-4 text-primary flex-shrink-0" />
  <div className="flex-1">
    <p className="font-medium text-sm">Response Queue</p>
    <p className="text-xs text-muted-foreground">
      {responseQueue.committed.length} steps — tap to view or edit
    </p>
  </div>
  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
</button>
```

Add `showQueueSheet` state + `<ResponseQueueSheet>` render near other sheets.
Import `ListOrdered` from lucide-react, `ResponseQueueSheet` from sheets folder, `responseQueue` from `useApp()`.

---

## Twilio Integration Points (for later connection)

| Step type | Twilio API | Function in escalationApi.ts |
|-----------|-----------|------------------------------|
| text-user | SMS API → user phone | `sendEscalationSms(user.phone, message)` |
| call-user | Voice API → user phone | `initiateEscalationCall(user.phone)` |
| attend-address | Internal dispatch API | `dispatchAttendance(address, authorityLevel)` |
| text-contact | SMS API → contact phone | `sendEscalationSms(contact.phone, message)` |
| call-contact | Voice API → contact phone | `initiateEscalationCall(contact.phone)` |

**Webhook endpoints to register in Twilio Console:**
- SMS reply handler: `POST /api/twilio/sms-response`
- Call keypress handler: `POST /api/twilio/call-response`

Both webhooks cancel the active queue when a positive response is received (keyword "OKAY" for SMS; digit "1" for call).

---

## Verification

1. Nest tab → Active Instructions card → "Response Queue" is the first row showing step count
2. Tap row → ResponseQueueSheet opens with 4 default steps and connectors
3. Up/down arrows reorder steps; constraint violations show toast
4. Tap trash on step → removed; constraint block toasts if it would violate rules
5. Add Step → AddQueueStepSheet shows all 5 types; "Attend Your Address" visible but disabled for basic plan
6. Add a contact step → contact picker shows people from context by real name
7. Save → `isDirty` clears; sheet footer buttons disable
8. Discard → staged reverts to committed state
9. `console.info` logs appear for each escalation stub call (visible in browser DevTools)

---

# Grace Period Setting (complete)

## Context

When the motion timer expires, the platform should not immediately dispatch a responder — it should first wait a configurable grace window so the user can still check in and avoid a false alarm. The same grace period applies to the "Still Respond" battery behaviour option (timer expires while device is offline → wait grace window → dispatch). Default is **4 hours** for all accounts; users can change it in the timer settings.

## What to Build

### 1. AppContext.tsx — add `gracePeriodHours`

Add `gracePeriodHours: number` to `MotionTimer` interface and set `gracePeriodHours: 4` in `initialMotionTimer`.

Add action to `AppState` interface and implement inside `AppProvider`:
```typescript
updateGracePeriod: (hours: number) => void;
```

Implementation:
```typescript
const updateGracePeriod = (hours: number) => {
  setMotionTimer({ ...motionTimer, gracePeriodHours: hours });
};
```

### 2. EditTimerSheet.tsx — grace period section

Below the existing motion timer presets/custom selector, add a second section titled **"Grace Period"** with the same stepper + preset pattern:

Presets: `1h · 2h · 4h (default) · 8h · 12h`

The grace period is the window after timer expiry before a responder is dispatched. Show helper text:
> "After your timer expires, we'll wait [X]h before sending a responder. You can still check in during this window."

Local state `selectedGrace` initialised from `motionTimer.gracePeriodHours`. Saved alongside the timer interval via `updateGracePeriod(selectedGrace)`.

### 3. BatteryBehaviourSheet.tsx — grace period note on "Still Respond" option

When the "Still Respond" option card is selected or hovered, show an inline note beneath its description:
> "Your [X]h grace period applies — you'll have [X]h after the timer would have expired to reconnect before a responder is dispatched."

Read `motionTimer.gracePeriodHours` from `useApp()`.

### 4. HomeStatus.tsx — battery rule subtext update

For `batteryBehaviour === "respond"`, update the subtext to include grace period:
> "If battery dies, we respond after timer + [X]h grace period"

### 5. (Backend note, no code change)
The timer expiry worker uses `gracePeriodHours` as the delay between setting `status = 'grace-window'` and creating the incident. The battery 48h escalation runs independently of the grace period.

## Files to Change

| File | Change |
|------|--------|
| `src/app/contexts/AppContext.tsx` | Add `gracePeriodHours` to `MotionTimer` interface + `initialMotionTimer` + `updateGracePeriod` action |
| `src/app/components/user/sheets/EditTimerSheet.tsx` | Add grace period section below timer presets |
| `src/app/components/user/sheets/BatteryBehaviourSheet.tsx` | Show grace period note on "Still Respond" option |
| `src/app/components/user/screens/HomeStatus.tsx` | Update battery-rule "respond" subtext to include grace period |

## Verification

1. Open Edit Timer Sheet → second section shows "Grace Period" with presets (4h pre-selected by default) and stepper
2. Change grace period → save → battery rule row on HomeStatus updates subtext for "Still Respond"
3. Battery Behaviour Sheet → select "Still Respond" → note reads the correct grace period from context
4. Change grace period in timer sheet → note in battery sheet also updates (reads from same context)

---

# Battery Behaviour Rule — Previous Work (Complete)

**AppContext.tsx is complete.** All battery fields (`batteryBehaviour`, `batteryOfflineSince`, `deviceLastSeen`, `batteryRuleEnabled`, `lostPhoneMode`), all actions (`updateBatteryBehaviour`, `reportBatteryOffline`, `reportBatteryReconnected`, `reportLostPhone`, `reEnableBatteryRule`), and `userTimerStatuses` mock array are in place. The `useApp must be used within an AppProvider` error was caused by a mid-edit incomplete state in the previous session and is now resolved.

**Remaining work — 5 files:**

| File | Status |
|------|--------|
| `src/app/components/user/screens/HomeStatus.tsx` | Needs battery rule row + lost-phone amber banner |
| `src/app/components/user/EditInstructionsSheet.tsx` | Needs battery-rule as 5th service item |
| `src/app/components/user/sheets/BatteryBehaviourSheet.tsx` | New file — doesn't exist yet |
| `src/app/components/email/BatteryOfflineEmail.tsx` | New file — doesn't exist yet |
| `src/app/components/responder/screens/ShiftHome.tsx` | Needs user timer status section |

---

## Implementation Details

### 1. HomeStatus.tsx

**Battery rule row** — add inside the Active Instructions card after the existing service rows, shown when `plan.activeServices.includes("battery-rule")`:

```tsx
// Import BatteryLow from lucide-react
// Import BatteryBehaviourSheet

<button onClick={() => setShowBatterySheet(true)} className="w-full text-left ...">
  <BatteryLow className="w-4 h-4" />
  <div>
    <p className="font-bold text-sm">Battery Rule</p>
    <p className="text-xs text-muted-foreground">
      {motionTimer.batteryBehaviour === "respond" && "If battery dies, we still respond after timer expires"}
      {motionTimer.batteryBehaviour === "suppress" && "If battery dies, timer is paused — no response triggered"}
      {motionTimer.batteryBehaviour === "alert-contact" && "If battery dies, your primary contact is notified"}
    </p>
  </div>
  <ChevronRight className="w-4 h-4 ml-auto" />
</button>
```

**Lost-phone amber banner** — shown when `plan.lostPhoneMode === true`, above the Active Instructions card:

```tsx
<div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
  <div className="flex items-center gap-2">
    <AlertTriangle className="w-4 h-4 text-amber-500" />
    <p className="text-sm font-medium">Battery monitoring paused — lost phone reported.</p>
  </div>
  <button onClick={reEnableBatteryRule} className="text-xs text-primary font-bold">Re-enable</button>
</div>
```

Also add `[showBatterySheet, setShowBatterySheet]` state and render `<BatteryBehaviourSheet>`.

Also update the `quickSheet` type to include `"battery-rule"`.

### 2. EditInstructionsSheet.tsx

Add a 5th service item to `availableServices`:

```tsx
{
  id: "battery-rule",
  name: "Battery Rule",
  description: "Define what happens if your phone goes offline",
  icon: BatteryLow,  // import from lucide-react
  available: true,
  needsSetup: false,
  setupMessage: "",
}
```

### 3. BatteryBehaviourSheet.tsx (new)

Path: `src/app/components/user/sheets/BatteryBehaviourSheet.tsx`

- Floating sheet: `inset-x-2 bottom-2 rounded-2xl h-[85vh] overflow-y-auto`
- Toggle at top: "Battery Rule active" mapped to `plan.batteryRuleEnabled`; when off, shows "Disabled — lost phone reported" if `plan.lostPhoneMode`
- Three radio-style option cards (same visual pattern as EditInstructionsSheet services):
  - **Suppress (recommended)** — "Pause timer when device goes offline; resume when it reconnects"
  - **Respond** — "Treat offline same as unresponsive; dispatch proceeds after grace window"
  - **Alert Contact** — "Notify primary contact but do not dispatch responder"
- Save button calls `updateBatteryBehaviour(selected)` and `updateActiveServices` to add/remove `"battery-rule"`
- Dev section at bottom: "Simulate Battery Offline" button (calls `reportBatteryOffline`) for demo purposes

### 4. BatteryOfflineEmail.tsx (new)

Path: `src/app/components/email/BatteryOfflineEmail.tsx`

Static preview component rendered in a dark container to simulate an email client.

Layout:
- Obsidian `#0A0A0A` background
- Legacy Wolf wordmark at top (text-based, Guardian Green)
- Body text: "We noticed your phone went offline. We wanted to check in..."
- Two CTA buttons:
  - "I'm Okay" — solid Guardian Green (`bg-primary`) — calls `reportBatteryReconnected()`
  - "Lost My Phone" — outline muted — calls `reportLostPhone()`
- Footer: 48-hour escalation warning, "The Legacy Wolf Team"

This is a preview component accepting `onImOkay` and `onLostPhone` callback props.

### 5. ShiftHome.tsx

Add a "User Timer Status" section using `useApp().userTimerStatuses`:

```tsx
import { useApp } from "../../../contexts/AppContext";
const { userTimerStatuses } = useApp();
```

Per-user card showing:
- User name + `timerStatus` chip (ACTIVE = green, GRACE = amber, PAUSED = blue, TRIGGERED = red)
- Last check-in: relative time (e.g. "2h 14m ago")
- Time remaining: relative from `nextCheckIn`
- If `batteryOfflineSince`: amber badge "Device offline Xh ago"
- If `lostPhoneMode`: grey chip "Lost phone reported"

---

## Verification

1. User → Nest → Active Instructions: Battery Rule row visible with correct subtext per `batteryBehaviour`
2. Tap Battery Rule row → BatteryBehaviourSheet opens; select option + save updates subtext
3. Toggle battery rule off → row disappears from Active Instructions
4. "Simulate Battery Offline" → `motionTimer.batteryOfflineSince` is set; if `lostPhoneMode` becomes true, amber banner appears on HomeStatus
5. "Re-enable" on amber banner → banner disappears, battery rule restored
6. Edit Instructions sheet → Battery Rule listed as 5th item; toggling on/off adds/removes from plan.activeServices
7. Responder → Shift Home → user timer cards visible; Tom Harris shows amber battery-offline badge

---

## Original Context

Users living solo rely on the motion timer as their safety net. If their phone battery dies, the timer stops updating — which would normally trigger a false incident response when the grace window expires. The user needs a declared preference: "if my battery dies, do you still respond?" This setting belongs in Active Instructions (alongside Attend & Check, Pet Guardian, etc.) because it is an instruction to the platform about what to do in a specific failure scenario.

Additionally, for the responder view to be useful in production, timer state (last check-in, time remaining, battery-offline events) must be persisted server-side so responders see real user data — not stale hardcoded values.

---

## Part 1 — Frontend Changes

### 1.1 Data Model additions (AppContext.tsx)

Add to `MotionTimer` interface:
```typescript
batteryBehaviour: "respond" | "suppress" | "alert-contact";
batteryOfflineSince?: Date | null;
deviceLastSeen?: Date | null;
```

Add to `UserPlan`:
```typescript
batteryRuleEnabled: boolean;
```

Update `initialMotionTimer` and `initialPlan` with sensible defaults:
- `batteryBehaviour: "suppress"` (safest default — don't send a responder because of a dead battery)
- `batteryRuleEnabled: true`

Add context action:
```typescript
updateBatteryBehaviour: (behaviour: MotionTimer["batteryBehaviour"]) => void;
```

### 1.2 Active Instructions row — HomeStatus.tsx

Add a new row inside the Active Instructions card, after the existing service rows, conditionally shown when `plan.batteryRuleEnabled`:

```
🔋 Battery Rule           ChevronRight
   [subtext based on batteryBehaviour]
```

Subtext values:
- `"respond"` → "If battery dies, we still respond after timer expires"
- `"suppress"` → "If battery dies, timer is paused — no response triggered"
- `"alert-contact"` → "If battery dies, your primary contact is notified"

Clicking the row opens a new `BatteryBehaviourSheet`.

### 1.3 BatteryBehaviourSheet (new file)

`src/app/components/user/sheets/BatteryBehaviourSheet.tsx`

- Floating sheet (`inset-x-2 bottom-2 rounded-2xl`) matching existing sheet pattern
- Three radio-style options (same UI pattern as SickModeModal battery options already built):
  - **Suppress (recommended)** — pause timer when device goes offline; resume when it reconnects
  - **Respond** — treat offline same as unresponsive; dispatch proceeds normally after grace window
  - **Alert contact** — notify primary contact but do not dispatch responder
- Toggle at top: "Battery Rule active" (maps to `plan.batteryRuleEnabled`)
- Save calls `updateBatteryBehaviour()`

### 1.4 EditInstructionsSheet.tsx

Add a fifth item to the services list:
```typescript
{
  id: "battery-rule",
  name: "Battery Rule",
  description: "Define what happens if your phone goes offline",
  icon: BatteryLow,
  available: true,
  needsSetup: false,
}
```

This makes it togglable alongside other services. When enabled, the battery row appears in HomeStatus.

### 1.5 Responder — ShiftHome.tsx

Add a "User Timer Status" section showing per-user cards with:
- User name
- Last check-in (relative time, e.g. "3h 14m ago")
- Time remaining on timer (e.g. "12h 46m left")
- Battery offline indicator if `batteryOfflineSince` is set (amber badge: "Device offline 2h ago")

Data pulled from `useApp().incidents` and a new mock `userTimerStatuses` array in AppContext (see §2.3).

---

## Part 2 — Backend Architecture

### 2.1 Database Schema (PostgreSQL / Supabase)

**Table: `user_timer_state`**
```sql
user_id          uuid PRIMARY KEY references users(id)
interval_hours   numeric NOT NULL
last_check_in    timestamptz NOT NULL
next_check_in    timestamptz NOT NULL
status           text CHECK (status IN ('active','grace-window','triggered','paused-battery'))
battery_behaviour text CHECK (battery_behaviour IN ('respond','suppress','alert-contact'))
battery_rule_enabled boolean DEFAULT true
device_last_seen timestamptz
battery_offline_since timestamptz
updated_at       timestamptz DEFAULT now()
```

**Table: `battery_events`**
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id          uuid references users(id)
event_type       text CHECK (event_type IN ('offline','reconnected','low-battery'))
battery_pct      int   -- null for 'offline'/'reconnected'
occurred_at      timestamptz DEFAULT now()
timer_status_at_event text  -- snapshot of status when event fired
```

**Table: `timer_heartbeats`** (append-only, lightweight)
```sql
user_id          uuid references users(id)
checked_in_at    timestamptz DEFAULT now()
source           text CHECK (source IN ('app','api','sms'))
```

### 2.2 API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/timer/check-in` | User checks in — updates `last_check_in`, `next_check_in`, inserts heartbeat row |
| `POST` | `/api/timer/battery-offline` | App sends when device detects imminent shutdown (low battery / power off) — sets `battery_offline_since`, conditionally pauses timer |
| `POST` | `/api/timer/battery-reconnect` | App sends on next launch after offline — clears `battery_offline_since`, resumes timer if suppressed |
| `PATCH` | `/api/timer/battery-behaviour` | User updates their battery preference |
| `GET`  | `/api/responder/user-statuses` | Responder fetches all active users' timer states (last check-in, time remaining, battery flags) |
| `GET`  | `/api/admin/timer-health` | Admin dashboard — aggregate view of overdue timers, battery-paused users |

### 2.3 Battery-Offline Logic (server-side, runs on POST /api/timer/battery-offline)

```
1. Record battery event (type = 'offline') in battery_events
2. Read user's battery_behaviour preference:
   - "suppress"      → set timer status = 'paused-battery'; no alert fired
   - "respond"       → do nothing; timer continues; grace window will fire normally
   - "alert-contact" → set timer status = 'paused-battery'; send SMS to primary_contact
3. Store battery_offline_since = now()
4. Return 200
```

### 2.4 Timer Expiry Worker (cron, runs every 60s)

```
FOR each user WHERE status = 'active' AND next_check_in < now():
  IF status = 'paused-battery': SKIP (battery suppression is active)
  ELSE:
    SET status = 'grace-window'
    NOTIFY user (push/SMS)
    SCHEDULE: after grace_window_minutes → trigger incident
```

This is the key suppression gate: `paused-battery` status makes the worker skip the user entirely, preventing a false dispatch.

### 2.4b 48-Hour Auto-Escalation Worker (cron, runs every 60s)

If the device never comes back online after the battery-offline event, the suppression cannot last forever. After **48 hours** of `paused-battery` with no reconnect, the system auto-escalates:

```
FOR each user WHERE status = 'paused-battery'
  AND battery_offline_since < now() - interval '48 hours':
    SET status = 'triggered'
    CREATE incident (type = 'battery-escalation')
    NOTIFY responder (same dispatch flow as normal expiry)
    LOG escalation_reason = 'device-offline-48h'
```

This covers the scenario where the user genuinely cannot respond because something happened — not just a dead phone.

### 2.5 Email Notification on Battery Offline

Triggered immediately when `POST /api/timer/battery-offline` is called (regardless of `batteryBehaviour` setting — this email always fires).

**Email payload:**

```
Subject: Your Legacy Wolf device went offline
From:    no-reply@legacywolf.com.au

[Legacy Wolf wordmark]

We noticed your phone went offline.

We wanted to check in. If your battery died or you switched
devices, tap the button below so we know you're safe.

[  I'M OKAY  ]          ← deep-links to /api/user/battery-okay
[  I LOST MY PHONE  ]   ← deep-links to /api/user/lost-phone

If we don't hear from you within 48 hours, we'll activate
your protection plan.

— The Legacy Wolf Team
```

**CTA endpoints:**

| Endpoint | Action |
|----------|--------|
| `POST /api/user/battery-okay` | Clears `battery_offline_since`; resets `status = 'active'`; resumes timer from now |
| `POST /api/user/lost-phone` | Sets `battery_rule_enabled = false`; sets `status = 'paused-battery'` indefinitely; sends confirmation email; service stays disabled until user re-enables from account settings |

Both endpoints accept a **signed token** embedded in the URL (HMAC-SHA256, 72-hour TTL) so no login is required — the user just clicks from their inbox.

**Email implementation (prototype):**

Build the email template now as a React component at:
`src/app/components/email/BatteryOfflineEmail.tsx`

This is a static preview component (no real sending yet). It renders the on-brand HTML email with:
- Obsidian `#0A0A0A` background, Guardian Green `#B5C42C` primary CTA button
- Legacy Wolf wordmark text header
- Two-button layout: "I'm Okay" (primary/green) and "Lost My Phone" (outline/muted)
- Footer: 48-hour escalation warning, support line

When the mail provider is connected (Resend / SendGrid / Postmark), the API route calls `.send()` using this template rendered to HTML via `react-dom/server`.

**"Lost Phone" — disable flow:**

In AppContext (prototype): add `lostPhoneMode: boolean` to `UserPlan`. When `true`:
- Battery rule toggle shows as "Disabled — lost phone reported"
- User must tap "Re-enable" in Account → Security to restore
- In UI: amber banner on HomeStatus: "Battery monitoring paused — lost phone reported. [Re-enable]"

### 2.5 Responder real-time feed

- `GET /api/responder/user-statuses` returns JSON array used by `ShiftHome.tsx`
- Poll every 30s or use Supabase Realtime subscription on `user_timer_state` table
- Each record includes: `user_id`, `user_name`, `last_check_in`, `next_check_in`, `status`, `battery_offline_since`
- Responder UI shows a status chip per user: ACTIVE / GRACE / OFFLINE (battery) / TRIGGERED

### 2.6 Recommended Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Database | Supabase (PostgreSQL) | Already in project deps; provides Realtime out of the box |
| API | Supabase Edge Functions (Deno) or Next.js API routes | Minimal ops overhead |
| Cron worker | Supabase pg_cron extension or a separate scheduled Edge Function | Keeps logic server-side |
| Push notifications | Supabase + Expo Push / APNS / FCM | Cross-platform mobile |
| SMS fallback | Twilio | Battery-offline alert-contact SMS |

---

## Part 3 — What We Build Now (Prototype)

Since the app currently has no backend, we implement the full UI and simulate the backend logic in `AppContext`:

1. **AppContext** — add `batteryBehaviour`, `batteryRuleEnabled`, `batteryOfflineSince`, `lostPhoneMode` to interfaces; add `updateBatteryBehaviour()`, `reportLostPhone()`, `reEnableBatteryRule()` actions
2. **HomeStatus** — battery rule row in Active Instructions; amber "lost phone" banner when `lostPhoneMode = true`
3. **BatteryBehaviourSheet** — three options + enable/disable toggle; "simulate battery offline" dev button for demo purposes
4. **EditInstructionsSheet** — battery-rule as fifth service
5. **BatteryOfflineEmail.tsx** — fully rendered on-brand email preview component with "I'm Okay" / "Lost My Phone" CTAs (no sending yet — wired to trigger when mail provider connected)
6. **AppContext mock escalation** — `useEffect` that watches `batteryOfflineSince`; after mock 48h threshold (represented in demo as a visible countdown), flips `status = 'triggered'`
7. **ShiftHome.tsx** — user timer status section with last check-in, time remaining, battery-offline badge, and `lostPhoneMode` indicator

---

## Files to Modify / Create

| File | Change |
|------|--------|
| `src/app/contexts/AppContext.tsx` | Add battery fields to `MotionTimer` + `UserPlan`; add `lostPhoneMode`; add 3 new actions |
| `src/app/components/user/screens/HomeStatus.tsx` | Battery rule row; lost-phone amber banner |
| `src/app/components/user/EditInstructionsSheet.tsx` | Add battery-rule as fifth service |
| `src/app/components/user/sheets/BatteryBehaviourSheet.tsx` | **New** — floating sheet with 3 behaviour options + toggle |
| `src/app/components/email/BatteryOfflineEmail.tsx` | **New** — on-brand email preview; "I'm Okay" + "Lost My Phone" CTAs |
| `src/app/components/responder/screens/ShiftHome.tsx` | User timer status section with battery flags |

---

## Verification

1. **Battery row** — User → Nest → Active Instructions shows Battery Rule row with correct subtext per behaviour
2. **Sheet** — Tap Battery Rule → floating sheet opens; three options selectable; toggle disables/enables rule
3. **Lost phone flow** — Tap "Lost My Phone" CTA in email preview → HomeStatus shows amber banner; battery rule shows "Disabled"; re-enable link works
4. **48h escalation** — AppContext mock: if `batteryOfflineSince` is set and 48h passes (mocked), `status` flips to `triggered`
5. **Edit Instructions** — Battery Rule listed as fifth service; toggling on/off adds/removes row from Nest
6. **Email preview** — `BatteryOfflineEmail` renders correctly at `/email-preview` route (add temp dev route); both CTA buttons visible; on-brand styling
7. **Responder view** — Shift Home shows per-user timer cards; battery-offline users show amber "Device offline Xh ago" badge; lost-phone users show grey "Lost phone reported" chip
