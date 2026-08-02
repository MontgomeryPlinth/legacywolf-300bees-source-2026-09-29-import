# Feedback implementation audit

Source: `reference/figma-export/Feedback to figma site 31-05-2026.xlsx`.

## Implemented in this reconciliation

- Active Instruction cards deep-link to People, Pets, Property, Wishes, Response Queue, and Battery Behaviour.
- Motion Timer and Manual Check-ins are mutually exclusive monitoring strategies.
- Manual check-in controls are hidden/disabled while Motion Timer is selected.
- Reminder copy changes with the selected monitoring strategy.
- Customer preference for cancelling an active escalation when verified motion resumes is persisted and enforced by the API.
- A safe plan drill explains exactly what is simulated and suppresses calls, SMS, dispatch, and emergency-services contact.
- Selecting a service above the current tier opens a four-week upgrade-trial confirmation instead of silently changing tier.
- The discontinued “Pants On Service” option was removed.
- Only one registered device is the motion-monitoring source of truth; other devices remain account-management devices.
- Account Security shows the current source-of-truth device.
- Legal authorizations can be signed in-app and are audit-linked.
- Legal documents can be scanned with the camera or selected from the device and are encrypted at rest.
- Wishes require an Estate Recipient or nominated person selected from People.

## Already implemented before this reconciliation

- Response Queue / escalation instructions and ordering.
- Battery behaviour and offline escalation deadline.
- Timer editor with active/inactive state.
- Optional advance contact notification plus notified/accepted/declined status.
- Full Property Access branches and access media.
- Multi-pet profiles, photos, guardians, veterinary, medication, routine, and calming details.
- Trial conversion reminder.
- History and audit log.
- Nominated Contact role in the same app.

## Explicitly excluded by product direction

- Manual versus automatic Trip/Home-Away behaviour.
- Figma access card and privacy-PIN gate.
- Plan Health Score replacement or explanation.

## Non-requirement discussion notes

The spreadsheet labels monthly plan reviews as a churn concern, and marks drill reminders, delayed chat, linked-app promotions, and a non-subscriber companion experience as items to discuss or consider. They are not implemented as production behavior without a settled product decision.
