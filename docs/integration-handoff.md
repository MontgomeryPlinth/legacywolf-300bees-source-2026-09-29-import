# Third-party integration handoff

All provider secrets remain blank. Supply them through the deployment secret manager, never source control.

## Required before a live environment

1. PostgreSQL 16 `DATABASE_URL`; run Prisma migrations.
2. Redis `REDIS_URL`; verify BullMQ worker health and delayed-job persistence.
3. Generate a strong `JWT_SECRET` and a 32-byte base64 `FIELD_ENCRYPTION_KEY_BASE64` backed by production KMS key wrapping.
4. Twilio Account SID/token, Verify service, registered SMS sender, voice-capable caller, and public webhook URL. Configure status callbacks and validate signatures through the existing webhook endpoint.
5. Google OAuth client IDs for iOS, Android, and web; register the application identifiers and redirect URIs.
6. Expo/EAS project ID plus Apple APNs and Firebase Cloud Messaging credentials. The client registration and Expo push adapter are implemented.
7. Stripe secret/webhook keys and four `STRIPE_PRICE_*` IDs. Checkout and signed webhook persistence are implemented.
8. S3-compatible storage credentials. The encrypted-at-rest object adapter is implemented.
9. Expo/EAS project ownership, signing certificates, provisioning profiles, Play signing, and store accounts.

See `.env.example` files for the complete blank-key inventory. No provider secret is committed.

## Release verification

- Run a real-device motion drill with the app backgrounded and force-quit.
- Run offline/online recovery without permitting a false escalation.
- Complete an end-to-end timer expiry → grace → SMS → voice → queue drill.
- Confirm every access-detail reveal and provider callback creates an audit event.
- Rotate refresh tokens and verify reuse revokes the full token family.
