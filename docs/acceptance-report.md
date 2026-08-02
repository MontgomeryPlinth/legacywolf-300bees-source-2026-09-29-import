# Acceptance report

Verified on 10 July 2026.

| Requirement | Evidence |
| --- | --- |
| Single entry/login, no role cards | Expo Router entry and unified OTP/Google login; forbidden-route search clean |
| Real auth, duplicate prevention, biometric unlock | Nest Twilio Verify/Google validation, signup identity check, secure rotating sessions, one-time biometric preference |
| Server-authoritative motion timer | signed Ed25519 heartbeats, replay nonce uniqueness, server reset and replaceable BullMQ expiry job |
| Background strategy | iOS background task/silent push/coarse location wake; Android generated foreground service and persistent notification |
| Escalation | expiry, grace, SMS, voice/DTMF, ordered queue, delivery callbacks, Sick Mode countdown, authorization gate |
| Linked roles | existing verified identity receives nominated role; in-account linked plans/incidents and safe response |
| Responder/Admin | role guards, shift, dispatch, scene/report flow, incident-scoped decrypt; desktop admin live APIs |
| Security | AES-256-GCM, write-only masked access, audited 15-minute reveal, append-only hash-chain audit, helmet/CORS/throttling |
| Production cleanliness | no mock client/fixture identity/demo hint in rebuilt bundle; screen colors resolve through brand tokens |
| Builds | strict TypeScript passes for mobile/API/core/UI; Prisma validates; 5 tests pass; iOS/Android/Web Expo exports pass |

Native Kotlin compilation and end-to-end provider drills require the external accounts, credentials, reachable webhooks, database/Redis services, and Java/EAS build environment listed in `integration-handoff.md`. Those are the intentionally last activation tasks, not source-code placeholders.
