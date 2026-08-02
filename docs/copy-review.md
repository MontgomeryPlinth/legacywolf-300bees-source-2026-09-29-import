# Product copy review

Status: initial audit flags only. Ported copy will remain verbatim in implementation until each item is reviewed here.

## Known flags

- The export’s generic error boundary says “Something went wrong.” Replace only through a documented Inside-voice review; do not inherit generic destructive/system colors.
- “Back to Roles” and all role-selection copy conflict with post-auth role resolution and will be removed with that shell.
- Admin placeholder copy (“Coming soon”) belongs to routes with no source screen; those routes will not be ported.
- All fixture-derived names, incident narratives, alerts, and seeded contact/pet copy are demo content and must not ship.
- Empty-state copy must be direct and operational. Approved example from the governing prompt: “No pets added yet. Add your pet to arm Pet Guardian.”
- Preserve “Pants On Service”; it is protected brand language and must not be sanitized.

## Authentication/onboarding review

- Removed the exported “Demo: enter any 6 digits” hint. OTP uses the real provider-backed API.
- Replaced “We act when you can’t” on entry with the mandated “Protecting what you love most.”
- Kept the operational terms, response-choice, contact, timer, attendance, access, and summary copy, tightening only punctuation and Inside-voice phrasing where recorded in the RN implementation.
- The biometric prompt explains that biometrics unlock a stored session and are not a primary credential.
