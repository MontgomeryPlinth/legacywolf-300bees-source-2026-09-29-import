# Architecture decisions

## Recorded at kickoff audit

1. The Figma export is unpacked under `reference/figma-export/` and treated as read-only.
2. Expo Web is the sole web shell. No Next.js or separate web app will be introduced.
3. `PeopleManagementEnhanced` and `PetManagementEnhanced` are canonical despite the current export router importing their older counterparts.
4. Authentication is one-account, post-auth role resolution. The four per-role entry points and PIN flow are removed.
5. Nominated-contact screens live inside the Account role-switcher experience; they are not a parallel authenticated shell.
6. Admin is web-only and desktop-only, implemented last among the Phase 1 surfaces. Missing placeholder routes are documented, not invented.
7. `motion_timer.next_expiry_at` is the client countdown authority. The mock client owns reset/read operations so a backend swap does not rewrite UI logic.
8. Access details are write-only from the client’s perspective and return masked values only after save.
9. The foundation targets stable Expo SDK 57 (`expo`/`expo-router` 57.0.4), React Native 0.86, and React 19.2.3. NativeWind remains on v4 because that version is binding in the Phase 1 prompt.
10. PostgreSQL 16 plus Prisma is the persistence source; Redis/BullMQ stores delayed timer and escalation work. Provider adapters fail closed when credentials are absent.
11. Device heartbeats are replay-protected by `(device_id, nonce)` and signed with a device-bound Ed25519 key whose private half remains in platform secure storage.
12. Audit records are hash-chained in application code and protected from update/delete by database triggers.
