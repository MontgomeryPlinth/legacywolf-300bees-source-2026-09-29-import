# Store submission checklist

## Apple

- Configure the EAS project, bundle signing, APNs key, Google OAuth iOS client, and production API URL.
- In App Privacy, declare contact information, user content, identifiers, coarse location permission usage, diagnostics, and product interaction according to the deployed analytics configuration. Do not declare tracking; the app does not track or sell data.
- Explain that coarse location change is an auxiliary wake signal and coordinates are not uploaded by that task.
- Provide a drill-only review account and the limitation text from `app-review-notes.md`.

## Google Play

- Configure Play signing, FCM, Google OAuth Android client, and foreground-service health declaration.
- Complete Data Safety for identity, user-authored plan content, device ID, coarse location permission usage, and encrypted transport/storage.
- Include the persistent notification rationale: motion-timer protection continues while the user has an active plan.
- Supply a privacy-policy URL, support URL, responder-service eligibility regions, and account-deletion URL.

Submission remains intentionally blocked only on provider credentials, legal URLs/content approval, store accounts, and signed release builds.
