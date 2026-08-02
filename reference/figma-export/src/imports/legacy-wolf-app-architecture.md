# Legacy Wolf — App Architecture, Sitemap & Screen Catalog

The full structural blueprint of Legacy Wolf across all four user roles. This document is the source-of-truth for IA, navigation, and the inventory of screens that must exist. Pair it with `legacy-wolf-brand.md` (visual identity \+ voice) and `legacy-wolf-content-reference.md` (raw service copy) when producing any design work.

---

## 0\. How to use this document

- **Sections 1–3** are orientation: roles, permissions, the cross-role event flow. Read these first.  
- **Sections 4–7** are the per-role screen catalogs. Each role is self-contained.  
- **Section 8** is shared infrastructure (auth, notifications, audit).  
- **Section 9** is edge cases and proposed additions.  
- **Section 10** is open questions requiring product decisions.

Screen names use **Title Case**. Brand-noun features (Motion Timer, Silent Guardian, Nominated Contact, etc.) are capitalized per the brand doc's naming conventions. Voice register defaults to **Inside voice** (measured, plainspoken, precise) for all product surfaces. Outside voice is reserved for marketing.

---

## 1\. The four roles

| Role | Platform | Primary purpose |
| :---- | :---- | :---- |
| **User** | Mobile (primary), Watch (companion), Web (account mgmt) | Sets up and maintains their plan. Lives inside the app. |
| **Nominated Contact** | Mobile web (lightweight PWA), SMS, push | Receives alerts and instructions. Does not "use" the app daily — only at moments of activation. |
| **Responder** | Mobile (operational), tablet (field) | Security Accredited Agent (Registered Nurse). Receives dispatches, attends scenes, documents incidents. |
| **Admin** | Web (desktop-first) | Legacy Wolf staff. Manages users, responders, incidents, coverage, billing, compliance. |

---

## 2\. Roles & permissions matrix

| Capability | User | Nominated Contact | Responder | Admin |
| :---- | :---: | :---: | :---: | :---: |
| View own plan | ✅ | — | — | — |
| Edit own plan | ✅ | — | — | — |
| View user's plan in active incident | — | partial (only what user authorized) | full | full |
| View access details | — | only post-trigger if authorized | only post-dispatch | masked, audit-logged |
| Trigger / cancel incident | ✅ (manual cancel) | acknowledge only | scene status updates | override |
| Pet handover authorization | ✅ (pre-set) | ✅ if designated guardian | execute | oversight |
| View other users | — | — | — | ✅ |
| View incident history | own only | own appearances only | own dispatches only | all, with audit trail |
| Issue refunds, suspend accounts | — | — | — | ✅ |

**Permission principle:** *information surfaces only when the user has authorized it, and only as much as the situation requires.* Access details are encrypted at rest and decrypted only upon a triggered incident — never browseable.

---

## 3\. The cross-role event flow

This is the protocol every role's screens are built around. Knowing this end-to-end clarifies why each screen exists.

```
USER stops moving (phone is still)
        ↓
MOTION TIMER expires → "are you ok?" SMS/push sent to User
        ↓
        User responds → timer resets → end
        User does not respond after grace window
        ↓
SYSTEM consults User's pre-set Instruction
        ↓
        ┌──────────────────┬─────────────────────┬──────────────────────┐
        │                  │                     │                      │
   FRIEND ALERT      ATTEND & CHECK         PET GUARDIAN          REPUTATION GUARD
   (notify only)     (Responder dispatched) (in addition to A&C)  (in addition to A&C)
        │                  │                     │                      │
        ↓                  ↓                     ↓                      ↓
NOMINATED CONTACT    RESPONDER receives    PET GUARDIAN notified   RESPONDER executes
receives alert,      dispatch + access     (called when scene       Pants On checklist
optionally access    details + briefing    is secured)              before family arrive
details, instructions       │                     │                      │
        │                  ↓                     ↓                      ↓
        └──────────────► On-scene actions, status updates, contact notifications, incident report
                              ↓
                       ADMIN sees the whole picture in the Incident Dashboard
                              ↓
                       Post-incident: Family/Estate Handover begins
```

---

## 4\. User app (mobile primary)

The User app is the bulk of the product. Everything else exists to serve what the User has set up here.

### 4.1 Information architecture

```
User App
├── Onboarding (first-run only)
├── Home / Status (default tab)
│   ├── Plan at a glance
│   ├── Motion Timer status
│   ├── Manual check-in
│   └── Plan Health Score
├── Plan
│   ├── Active Instruction
│   ├── Friend Alert
│   ├── Attend & Check
│   ├── Pet Guardian
│   └── Reputation Guard / Pants On Service
├── People
│   ├── Nominated Contacts
│   ├── Pet Guardian (Primary + Backup)
│   └── Family / Estate Recipients
├── Property
│   ├── Home Address
│   ├── Access Details
│   └── Alarm & Codes
├── Pets
│   ├── Pet Profiles
│   ├── Routines & Preferences
│   └── Vet & Emergency Funds
├── Last Wishes
│   ├── Hand-off Letters
│   ├── Voice Memos
│   └── Digital Vault (future)
├── Modes
│   ├── Trip Mode
│   └── Test Run / Drill
└── Account
    ├── Profile
    ├── Subscription & Billing
    ├── Legal Authorizations
    ├── Notifications
    ├── Security & Privacy
    ├── History / Audit Log
    └── Help & Support
```

### 4.2 Onboarding (5 steps from existing screens, expanded)

Existing screens preserved. Step numbering retained.

| \# | Screen | Purpose |
| :---- | :---- | :---- |
| O1 | **Welcome / Splash** | Logo, "Protecting what you love most." Register / Login. |
| O2 | **Login / Phone Number** | Phone-first auth. |
| O3 | **Verification Code** | 6-digit SMS verify. |
| O4 | **Welcome Modal** | "You instruct us to do what you would have done if you had another 60 minutes." Continue. |
| 1 | **Add Your Pet** | Pet name, species, breed, age. Skip if no pet. |
| 2 | **Home & Emergency** | Address, access method (Hidden Key, Door Code, Neighbor Has Key, Encrypted Keysafe). |
| 3 | **Silent Guardian** | Set Motion Timer (6h–72h). Permissions: location, notifications, motion. |
| 4 | **Last Wishes (optional)** | Backup Guardian, pet routine, preferences. |
| 5 | **Legal Authorization** | Property Access, Pet Care, Information Sharing, Liability Waiver. "Activate Protection" CTA. |
| O5 | **Activation Complete** | "Your plan is armed. Timer set to 16h. We'll be here." |

**New onboarding screens to add:**

| \# | Screen | Purpose |
| :---- | :---- | :---- |
| 1.5 | **No Pet Path** | If no pet, route directly to a streamlined plan focused on Attend & Check \+ Reputation Guard. Pet-related screens skipped. |
| 4.5 | **Choose Your Instruction** | After data is collected, the user explicitly picks their Active Instruction (Friend Alert vs Attend & Check vs full Tier). Without this, "Activate" is ambiguous. |
| O6 | **Plan Health Score (intro)** | After activation, surface the Health Score and prompt to add anything missing (a Backup Guardian, a Hand-off Letter, etc.). |

### 4.3 Home / Status (at rest)

The most-visited screen. Per the app wireframe spec: *"the user knows at a glance what instructions they have set for us."*

**Screen: H1 — Home / Status**

- Top: status badge — "Protected" / "Paused" / "Trip Mode" / "Alert Active"  
- Center hero: Motion Timer countdown (e.g., "15h 59m") with Next silent check-in time  
- Active Instruction summary card (e.g., "Attend & Check \+ Pet Guardian active")  
- Pet status row (e.g., "Daisy — protected")  
- Primary contact row (e.g., "Jess will be called first")  
- Quick actions: **Check In Now** / **Pause** / **Trip Mode** / **Test Run**  
- Plan Health Score chip (e.g., "92% complete — 1 thing to add")  
- Last Checked timestamp

**Screen: H2 — Plan at a Glance (expanded)**

- Full breakdown of every armed service, every nominated person, every property access detail (masked), every pet  
- Edit shortcut to each section  
- "What happens if the timer expires?" expandable walkthrough — the escalation ladder visualized: text → call → knock → enter

### 4.4 Motion Timer & check-in

**Screen: T1 — Motion Timer Settings**

- Slider 6h–72h  
- Recommended preset chips (8h, 12h, 16h, 24h, 48h, 72h)  
- "Why this matters" expandable explainer  
- Save & Arm

**Screen: T2 — Check In Now**

- Single large tap target: "I'm OK"  
- Confirmation: "Timer reset. Next check-in by \[time\]."  
- Option: "Check in and add a note" (private to user)

**Screen: T3 — Grace Window Active**

- Shown when timer has expired but grace window hasn't  
- Big red countdown: "Respond within 5 minutes"  
- "I'm OK" button \+ "I need help" button (escalates immediately)

### 4.5 Plan management

**Screen: P1 — Active Instruction**

- Shows the currently armed instruction, with rationale  
- "Change Instruction" → routes to P2

**Screen: P2 — Choose Your Instruction**

- Four tier cards, mutually exclusive selection:  
  - Friend Alert  
  - Attend & Check  
  - Attend & Check \+ Pet Guardian  
  - Full Tier (Attend & Check \+ Pet Guardian \+ Reputation Guard)  
- Each card shows what's included, what it costs (subscription tier), what's required to enable

**Screen: P3 — Friend Alert Setup**

- Choose: Friend, Police, or Both  
- Select Nominated Contact(s) from People list  
- Set escalation order  
- Sample message preview (what your contact will receive)

**Screen: P4 — Attend & Check Setup**

- Confirm property \+ access details are complete  
- Confirm Responder coverage available in your area (system check)  
- Pre-authorize: when we attend, we may also call ambulance / police / nominated contact  
- "What our Responder will do on scene" preview

**Screen: P5 — Pet Guardian Setup**

- Add pet(s) if not done  
- Designate primary \+ backup Pet Guardian  
- Verify guardians have confirmed (system check)  
- Pet care funds / pre-arranged costs

**Screen: P6 — Reputation Guard / Pants On Service Setup**

- Inventory: things to dispose of, things to clean, things to safeguard  
- Per-item: location in home, instruction (dispose / hide / courier to \[person\])  
- Sensitive content warning \+ encryption confirmation  
- Preview the Pants On Checklist your Responder will receive

### 4.6 People

**Screen: PE1 — People Overview**

- List of all nominated humans with role badges (Nominated Contact, Primary Pet Guardian, Backup Pet Guardian, Estate Recipient)  
- Verification status per person (Pending / Verified / Unreachable)

**Screen: PE2 — Add / Edit Person**

- Name, relationship, phone, email  
- Role(s) — multi-select  
- Specific instructions for this person (e.g., "Sarah handles Daisy. She doesn't know about the things in the second drawer.")  
- Verification status — send invite

**Screen: PE3 — Person Verification (sent to that person)**

- See section 5 (Nominated Contact portal)

### 4.7 Property & Access Details

**Screen: PR1 — Home Address**

- Address with map preview  
- Property type (house, apartment, etc.)  
- Unit / floor / building details

**Screen: PR2 — Access Details**

- Multi-field form modeled on the wireframe's "Tell us how to Enter":  
  - Keysafe Code (with photo of keysafe location)  
  - Lobby Access (concierge instructions, building intercom)  
  - Elevator / Lift Access  
  - Unit Access (door type, key vs code vs both)  
  - Alarm Code  
- Each field encrypted at rest, never visible in plain in the UI after first save (shown as •••• with "Update" to change)  
- "What we share, when, with whom" privacy explainer

**Screen: PR3 — Property Map**

- Optional uploaded floor plan or photos with annotated callouts (where the pet sleeps, where medications are, where private items are)

### 4.8 Pets

**Screen: PT1 — Pets Overview**

- All pets as cards  
- Add Pet

**Screen: PT2 — Pet Profile**

- Name, species, breed, age, sex, weight, microchip ID  
- Photo  
- Vet contact  
- Medications, allergies, conditions  
- Daily routine (feeding times, walks, sleep)  
- Preferences (favorite toy, calming words, anxieties)  
- Pet Guardian assigned (link to PE1)  
- Pet emergency fund amount

**Screen: PT3 — Pet Care Plan**

- Step-by-step what should happen to this pet if the user is incapacitated  
- Order of operations: immediate care → guardian notified → handover

### 4.9 Last Wishes

**Screen: LW1 — Last Wishes Overview**

- Optional section, surfaced gently  
- Three sub-sections: Hand-off Letters, Voice Memos, Digital Vault (future)

**Screen: LW2 — Hand-off Letters**

- List of letters: one per Nominated Contact, plus general "to whoever opens this"  
- Per-letter editor with delivery trigger (on activation, on confirmed death, on family arrival)

**Screen: LW3 — Voice Memos**

- Record / upload short audio  
- Per-memo delivery trigger and recipient  
- Encryption confirmation

**Screen: LW4 — Digital Vault** *(future / placeholder)*

- Designated executor for digital accounts  
- Out of scope for v1 — but reserve the IA slot

### 4.10 Modes

**Screen: M1 — Trip Mode**

- "I'll be away. Extend my timer."  
- Set duration (1–30 days)  
- Optional travel destination  
- Alternate Nominated Contact for this period  
- One-tap return to normal

**Screen: M2 — Test Run / Drill**

- "Run a drill. Make sure your plan works."  
- Sends test alerts to all nominated people with clear "THIS IS A TEST" framing  
- Collects acknowledgments  
- Surfaces failures (e.g., contact didn't receive, number invalid)  
- "How your plan performed" report

**Screen: M3 — Pause Protection**

- "Pause for a reason" — hospital stay, etc.  
- Required reason (logged)  
- Auto-resume date  
- Warning if pet still needs coverage during pause

### 4.11 Alert-active state (when timer triggers)

This is a distinct state, not just a screen — the entire app changes mode when an alert is live.

**Screen: A1 — Grace Window Active** (see T3)

**Screen: A2 — Alert Triggered**

- Read-only summary of what's now in motion  
- Live status: "Nominated Contact notified" / "Responder dispatched" / "Estimated arrival 22 min"  
- One-tap "I'm fine — cancel" with re-authentication (so a thief or unconscious-but-conscious person can't easily cancel)  
- "Speak to Legacy Wolf" — direct line to operations

**Screen: A3 — Post-Incident Summary**

- After event closes: what happened, what was done, who was contacted, what's next  
- Audit-log style timeline  
- Downloadable PDF for personal records or legal use

### 4.12 Account

**Screen: AC1 — Profile**

- Legal name (as on ID), preferred name, DOB, photo  
- Government ID upload status

**Screen: AC2 — Subscription & Billing**

- Current tier, next bill date, payment method  
- Upgrade / downgrade tier  
- Cancel (with required reason and 30-day cooling-off info)

**Screen: AC3 — Legal Authorizations**

- View signed authorizations (Property Access, Pet Care, Info Sharing, Liability Waiver)  
- Re-sign required after material changes  
- Download PDFs

**Screen: AC4 — Notifications**

- Granular control: timer reminders, monthly plan reviews, drill reminders, marketing  
- Quiet hours

**Screen: AC5 — Security & Privacy**

- Biometric lock, PIN  
- Two-factor  
- Active sessions  
- Data export request  
- Account deletion

**Screen: AC6 — History / Audit Log**

- Every event: plan changes, drills, real incidents, person verifications  
- Filterable, exportable

**Screen: AC7 — Help & Support**

- FAQ  
- Chat with support  
- Schedule a setup call (premium tier)  
- Emergency line (24/7)

### 4.13 Watch app (companion)

Single most-used screen needs to live on the wrist. Minimal viable feature set:

| Watch screen | Purpose |
| :---- | :---- |
| **Status complication** | Timer countdown visible on watch face |
| **Check In** | One tap to reset Motion Timer |
| **Quick Pause** | 30-min pause (e.g., for nap) |
| **Plan Health glance** | Status badge only |

---

## 5\. Nominated Contact portal (lightweight)

Nominated Contacts don't need a "real app." They need a confidence-building pre-event experience and an instantly-usable in-event experience.

### 5.1 Information architecture

```
Nominated Contact (mobile web PWA, SMS, push)
├── Pre-event verification (invite flow)
├── My Role (standing instructions)
├── Practice / Drill participation
└── Active incident
    ├── Initial alert
    ├── Standing instructions
    ├── Access details (if authorized)
    ├── Coordination with Responder
    ├── Status updates
    └── Post-event resources
```

### 5.2 Pre-event verification (new — high priority)

A person should never receive an emergency call from Legacy Wolf about someone they didn't know had named them.

**Screen: NC1 — Invite Landing**

- "Sean has named you as a Nominated Contact in their Legacy Wolf plan."  
- Plain-language explanation of what this means  
- "Accept Role" / "Decline" / "Ask Me Later"

**Screen: NC2 — What This Means**

- Walkthrough: what you'd be called for, what you'd be asked to do, what authority you'd have, what you'd have access to  
- Optional: a 90-second video

**Screen: NC3 — Acceptance**

- Confirm contact details  
- Choose notification preferences  
- Accept role → user is notified you've confirmed

### 5.3 Standing instructions

**Screen: NC4 — My Role**

- "Here's what Sean has asked you to do if the time comes."  
- The instructions the User wrote specifically for this contact  
- "What I have access to": list, with everything that's currently masked  
- "What gets unlocked when activated": list

### 5.4 Active incident

**Screen: NC5 — Active Alert**

- Big banner: "Sean is unresponsive. You've been activated."  
- Their pre-written instructions for you (now decrypted)  
- Access details (now decrypted) — keysafe code, alarm, etc.  
- Responder's current ETA (if Attend & Check is active)  
- Pet info if you're the Pet Guardian  
- Action buttons: "I'm on my way" / "I can't make it" / "Speak to Legacy Wolf"

**Screen: NC6 — Coordinating with Responder**

- Live status of the Responder if dispatched  
- Two-way messaging with Legacy Wolf operations  
- Notify-others toggle (other nominated people in this user's plan)

### 5.5 Post-event resources

**Screen: NC7 — Post-Event**

- Summary of what happened  
- Hand-off Letter(s) the User left for you  
- Grief / support resources  
- Funeral / next-step practical info  
- Legacy Wolf support contact

### 5.6 Drill participation

**Screen: NC8 — Drill Notice**

- "Sean is running a drill. This is a test."  
- Quick acknowledge tap  
- Helps the User know whether their alert system actually reaches you

---

## 6\. Responder app (Security Accredited Agent — Registered Nurse)

The Responder app is operational software. Built for people on shift, in motion, under stress.

### 6.1 Information architecture

```
Responder App
├── Shift
│   ├── Clock In / Clock Out
│   ├── Coverage zone today
│   └── Briefing
├── Dispatches (queue)
│   ├── Active dispatch
│   └── Past dispatches
├── On-scene
│   ├── Pre-arrival brief
│   ├── Property access
│   ├── User check
│   ├── Pet care
│   ├── Pants On checklist
│   └── Incident report
├── Communications
│   ├── Legacy Wolf ops
│   ├── Nominated Contacts
│   └── Emergency services
└── Account
    ├── Credentials (nursing license, character check)
    ├── Wellness check (new)
    ├── Training
    └── Pay & schedule
```

### 6.2 Shift management

**Screen: R1 — Shift Home**

- Status: On / Off shift  
- Today's coverage area (map)  
- Expected incident load  
- Wellness self-rating prompt (post-shift)

**Screen: R2 — Briefing**

- Anything Ops needs the Responder to know before shift starts  
- Recent training updates, new protocols

### 6.3 Dispatch

**Screen: R3 — New Dispatch Notification**

- Push \+ in-app  
- "New dispatch — accept within 60s"  
- Brief: distance, user pseudonym, tier of service, pet involved (yes/no), Reputation Guard items (yes/no)  
- Accept / Decline (with reason)

**Screen: R4 — Active Dispatch**

- Navigation to property  
- Full briefing now unlocked:  
  - User's profile and photo  
  - Property access details (all credentials decrypted)  
  - Pet info  
  - Pants On checklist if applicable  
  - User's specific instructions for the Responder  
- ETA broadcast to Ops \+ Nominated Contacts  
- "I've arrived" status update

### 6.4 On-scene

**Screen: R5 — Property Access**

- Step-by-step entry guide (specific to this property)  
- "Knock first" required interaction  
- Document approach (photo of door, building, etc.)

**Screen: R6 — User Check**

- Status options: Alive & responsive / Alive & unresponsive / Deceased / Not at home / Other  
- Each status triggers a sub-flow:  
  - Alive & responsive → de-escalate, log, leave  
  - Alive & unresponsive → call ambulance, notify contact, stay  
  - Deceased → call police, ambulance, notify contact in user's pre-set order, begin Pet & Pants On work  
  - Not at home → log, escalate to Ops

**Screen: R7 — Pet Care On-Scene**

- Pet checklist: locate, calm, feed, water, secure  
- Contact Pet Guardian  
- ETA from Pet Guardian  
- Handover documentation (photos, signatures)

**Screen: R8 — Pants On Checklist**

- The user's encrypted instruction list, now decrypted item by item  
- Each item: location, action (dispose / hide / courier to \[person\] / leave in place)  
- Each action confirmed with photo proof \+ Responder signature  
- All photos secured and deleted after incident closure per user instruction

**Screen: R9 — Notify Contacts**

- Pre-set order shown  
- Suggested message templates per contact (these were written by the User in their plan)  
- Call / Text / Both  
- Log per attempt

### 6.5 Incident report

**Screen: R10 — Incident Report**

- Timeline auto-populated from in-app actions  
- Narrative field  
- Photo upload (secured)  
- Cause-of-discovery section  
- Sign-off  
- Submit → routes to Admin for review

### 6.6 Wellness check (new)

These jobs are intense. Responders need their own care path.

**Screen: R11 — Post-Shift Wellness**

- Quick self-rating (5-point scale)  
- Optional text reflection  
- "Talk to someone" button → counseling resources  
- Flag for follow-up (Admin sees this)

---

## 7\. Admin (web)

Desktop-first. Used by Legacy Wolf operations staff. Mission-critical.

### 7.1 Information architecture

```
Admin
├── Dashboard
│   ├── Active incidents (live map)
│   ├── Responder availability
│   ├── Recent activity feed
│   └── Alerts requiring intervention
├── Users
│   ├── Search & filter
│   ├── User detail
│   ├── User plan review
│   └── User incident history
├── Responders
│   ├── Roster
│   ├── Credentials & vetting
│   ├── Coverage scheduling
│   ├── Performance & wellness
│   └── Onboarding pipeline
├── Incidents
│   ├── Live incident command
│   ├── Incident history
│   ├── Reports review & approval
│   └── Audit trail per incident
├── Operations
│   ├── Coverage zones
│   ├── Service area expansion
│   ├── Partner integrations (police, ambulance, vet networks)
│   └── SLA monitoring
├── Compliance
│   ├── Legal documents library
│   ├── Authorization audit
│   ├── Data access logs
│   └── Character check renewals
├── Billing
│   ├── Subscriptions
│   ├── Refunds
│   ├── Failed payments
│   └── Revenue reports
├── Estate Handover (new)
│   ├── Pending handovers
│   ├── Family/executor verification
│   └── Released documents
├── Content
│   ├── FAQ
│   ├── Email & SMS templates
│   ├── Marketing site CMS
│   └── In-app copy
└── Settings
    ├── Team
    ├── Roles & permissions
    └── System
```

### 7.2 Dashboard

**Screen: AD1 — Admin Dashboard**

- Live map of active incidents  
- Active Responder count by zone  
- Today's incident volume vs forecast  
- Items requiring admin intervention (a Responder hasn't accepted, a contact unreachable, a payment failed)  
- Critical alerts (system outages, etc.)

### 7.3 Users

**Screen: AD2 — User Search**

- Filter by status, plan tier, signup date, last incident, region

**Screen: AD3 — User Detail**

- Profile, plan summary, contacts, pets, property (access details masked unless audit-justified click-to-reveal)  
- Plan health  
- Subscription state  
- Incident history

**Screen: AD4 — Plan Review**

- Admin can review a user's plan for completeness or compliance issues  
- Cannot modify — only flag for user follow-up

### 7.4 Responders

**Screen: AD5 — Responder Roster**

- All Responders, status (on/off shift), coverage zone, current dispatch

**Screen: AD6 — Responder Detail**

- Credentials (nursing license expiry, ANCC status, training certifications)  
- Performance metrics  
- Wellness check trend (flagged self-ratings surface here)  
- Past dispatches

**Screen: AD7 — Responder Onboarding Pipeline**

- Applicants in progress  
- Vetting checklist (character check, license verify, animal-care training, reference checks, ride-alongs)

### 7.5 Incidents

**Screen: AD8 — Live Incident Command**

- Real-time view of an active incident  
- Responder location, ETA  
- Communications log (with User if responsive, Nominated Contacts, Responder, emergency services)  
- Override buttons (cancel dispatch, escalate to police directly, etc.)

**Screen: AD9 — Incident History**

- All closed incidents, searchable  
- Reports & post-mortems

**Screen: AD10 — Report Approval**

- Responder-submitted incident reports awaiting Admin sign-off  
- Edit notes (audited), approve, return for revision

### 7.6 Operations

**Screen: AD11 — Coverage Zones**

- Map of active service areas  
- Responder density per zone  
- Response-time SLA per zone

**Screen: AD12 — Partner Integrations**

- Active partnerships (local police liaisons, vet networks, funeral coordinators)  
- Status of each integration

### 7.7 Compliance

**Screen: AD13 — Authorization Audit**

- Per-user view of signed authorizations and expirations  
- Renewal triggers

**Screen: AD14 — Data Access Log**

- Every decryption of a user's access details, with timestamp, reason, and admin signature  
- Required for trust posture

### 7.8 Estate Handover (new)

When a user actually dies, the plan transitions from "active" to "executing the legacy." This needs its own surface.

**Screen: AD15 — Pending Handovers**

- Users whose incidents have closed with deceased status  
- Pending tasks: courier safekeeps, release of Hand-off Letters, release of Voice Memos, Pet Guardian confirmed, funeral coordination

**Screen: AD16 — Family / Executor Verification**

- Surviving family or executor verifies identity to receive released materials  
- Document the chain of custody

**Screen: AD17 — Released Documents**

- What's been released, to whom, when

---

## 8\. Shared system flows

### 8.1 Authentication

| Flow | Roles | Notes |
| :---- | :---- | :---- |
| Phone OTP | User, Nominated Contact, Responder | Primary auth |
| Email OTP | User | Secondary |
| SSO (Google/Apple) | User | Optional |
| Magic link | Nominated Contact | For pre-event verification |
| ID verification (KYC) | User, Responder | Required for paid tiers and all Responders |
| Re-authentication | User during active incident | Required to cancel an alert |

### 8.2 Notifications

Tiered by criticality. The system must work even when the user's phone is the problem.

| Tier | Channel | Use case |
| :---- | :---- | :---- |
| Tier 0 — informational | In-app, email | Plan reminders, drills |
| Tier 1 — important | Push, SMS | Timer warnings, drill alerts |
| Tier 2 — urgent | Push, SMS, voice call | Grace window, "are you ok?" |
| Tier 3 — critical | All channels \+ Nominated Contact \+ Responder dispatch | Active incident |

### 8.3 Audit trail

Every meaningful event is logged immutably:

- Plan changes  
- Authorization signatures  
- Decryptions of access details  
- Notification deliveries  
- Responder actions on scene  
- Admin overrides

### 8.4 Legal & compliance

- Property Access Authorization  
- Pet Care Authorization  
- Information Sharing Authorization  
- Liability Waiver  
- Privacy Policy \+ Data Processing Agreement  
- Estate Release Authorization (new — governs the post-death handover)

Each must be re-signed when materially changed.

---

## 9\. Edge cases & error states

A non-exhaustive list of states that need designed handling:

| Case | Handling |
| :---- | :---- |
| User loses/breaks phone | Web check-in via SMS or browser, with re-authentication |
| Nominated Contact unreachable | Auto-escalate to next contact in order; flag in Plan Health |
| Pet Guardian declines at moment of need | Cascade to Backup; Admin intervention if both fail |
| Responder can't access property (access info wrong) | On-scene escalation: contact User's nominated person for help, fallback to police |
| User is alive but lost their phone for days | False-positive incident; debrief flow \+ drill prompt |
| User actually dies — but their phone keeps moving (someone took it) | Surfaces in Admin dashboard as anomaly |
| User wants to permanently delete data | 30-day cooling-off \+ irreversible deletion flow |
| Subscription lapses | Plan downgrades to Friend Alert only; protection never fully cuts off without explicit user action |
| Multi-occupancy (couples, roommates) | v1 keeps single-user plans; flag for v2 |

---

## 10\. Open questions

1. **Couples and households** — does v1 support secondary users on a single plan? My recommendation: no for v1, design as if it's coming for v2.  
2. **Watch app scope** — Apple Watch first only, or Wear OS too?  
3. **Voice/SMS-only mode** — for users without smartphones, is there a non-app path? (Probably yes, given audience age range.)  
4. **Pet emergency funds** — held by Legacy Wolf or by user, released to Pet Guardian on event? Compliance implications.  
5. **Real-time Responder location to Nominated Contacts** — yes/no? Trade-off: transparency vs Responder privacy.  
6. **Geographic scope of v1** — Australia only or wider? Affects Admin coverage modeling and partner integrations.  
7. **Data residency** — encrypted access details, especially. Where do they live?  
8. **Family/Estate Handover identity verification** — what standard (notary, drivers license, executor letter)?

---

*Version 0.1 — initial comprehensive architecture covering all four roles. Includes proposed additions: Trip Mode, Test Run / Drill, Plan Health Score, Hand-off Letters, Voice Memos, Watch companion app, Nominated Contact pre-event verification, Responder Wellness Check, and Estate Handover workflow. To be refined as wireframing in Figma progresses.*  
