# Legacy Wolf

Production-oriented Expo + NestJS monorepo for the Legacy Wolf monitoring and response service.

## Workspace

- `apps/mobile` — Expo SDK 57 app for iOS, Android, and authenticated web.
- `apps/api` — NestJS modular service with Prisma/PostgreSQL and BullMQ/Redis.
- `packages/core` — shared zod domain models and contract types.
- `packages/tokens` — binding brand palette, type, spacing, and radii.
- `packages/ui` — cross-platform UI primitives.
- `reference/figma-export` — read-only source design export.

## Local setup

1. Install Node.js 22 and pnpm 10, then run `pnpm install`.
2. Copy `apps/api/.env.example` to `apps/api/.env` and `apps/mobile/.env.example` to `apps/mobile/.env`.
3. Generate local secrets. Do not commit them.
4. Start PostgreSQL and Redis with `docker compose up -d`.
5. Run `pnpm --filter @legacy-wolf/api exec prisma migrate deploy`.
6. Run `pnpm dev:mobile`, `pnpm dev:web`, and `pnpm --filter @legacy-wolf/api dev` as needed.
7. Use `pnpm dev:android` or `pnpm dev:ios` for a native development build.

Local PostgreSQL is exposed on port `5433` to avoid conflicts with the default
system PostgreSQL port. Native Android development uses JDK 17 and Android API
36. The iOS script selects the standard Xcode installation explicitly, so it
does not depend on the system-wide `xcode-select` setting. EAS Build regenerates
native projects from `app.json` and config plugins.

Third-party fields intentionally remain blank. See `docs/integration-handoff.md` for the final activation sequence.

Production mobile builds contain only the REST client. The isolated core mock remains test-only and is not exported by the package or reachable from an app bundle.
