# API contract

The NestJS service is versioned under `/v1`; all routes except authentication and validated provider webhooks require a 15-minute bearer token. Refresh tokens rotate per device and family reuse revokes the family. Swagger is served at `/v1/docs`.

| Surface | Routes |
| --- | --- |
| Auth | OTP request/verify, Google token verify, rotating refresh |
| User | account/profile/history/authorizations, plan, timer/check-in/modes, signed heartbeat |
| Plan data | people, pets, property, masked access details, response queue, encrypted handoff letters |
| Linked role | nominated plans, active incidents, safe confirmation |
| Responder | shift lifecycle, dispatch accept/arrival, incident report, incident-scoped access reveal |
| Admin | dashboard, incidents, users/responders, account status and role management |
| Providers | Twilio status/voice/DTMF, Stripe checkout/webhook, Expo push registration/delivery |

Shared client-facing shapes are zod schemas in `packages/core`. The Expo app uses `RestApiClient`; no development data source is reachable in production. Countdown displays derive from server `nextExpiryAt`. The server alone opens incidents and walks the authorized queue.

Access-detail writes accept plaintext over TLS and return only `••••`. Reads never return ciphertext. A reveal requires an active incident plus admin authority or an accepted responder assignment, expires after 15 minutes, and writes both a decryption record and hash-chained audit event.
