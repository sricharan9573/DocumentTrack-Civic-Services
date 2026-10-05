# DocumentTrack

DocumentTrack helps citizens discover government-service requirements and organize their own application references and manually updated statuses.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/document-track/` — responsive React + Vite application
- `artifacts/api-server/` — shared API service; not used by DocumentTrack's current frontend
- `lib/` — shared API/database packages; not used for DocumentTrack's local demo data

## Architecture decisions

- DocumentTrack is a citizen-side organizer only. Citizens submit and verify applications through government portals; the app does not submit, scrape, or automatically track them.
- Demo records and mock-mode session state are local to the browser and structured for a future Supabase integration. No backend or government API is currently connected.
- Do not present unverified government URLs as official links; leave these unavailable until verified.

## Product

- Service discovery, eligibility and document guidance, fee/processing estimates, and official-portal access.
- Personal application dashboard with reference numbers, manual status history, timelines, reminders, search, filters, and profile settings.
- Statuses and notifications are user-managed/demo data, not messages or updates from government systems.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
