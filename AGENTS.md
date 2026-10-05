# Base44 Dev Environment

## Overview

DocumentTrack — a citizen-side government service organizer. React + Vite frontend with local demo data (no backend connected). pnpm workspace monorepo.

## Running the app

```bash
docker compose -f docker-compose.base44.yml up -d
```

- Web entry point: **port 3000** (mapped to Vite's 5173 inside the container)
- Health: `GET /` returns 200
- Live reload: Vite HMR is active; frontend edits appear without restart

## Key details

- **pnpm version**: The lockfile was generated with pnpm 10+ (uses `minimumReleaseAge` in `pnpm-workspace.yaml`). Corepack resolves to pnpm 12. The install uses `--config.dangerouslyAllowAllBuilds=true` to bypass pnpm 10+'s build-script approval gate (`ERR_PNPM_IGNORED_BUILDS`).
- **No backend needed**: The frontend (`artifacts/document-track/`) uses local demo data. The API server (`artifacts/api-server/`) and DB packages (`lib/db/`) are not used by the current frontend.
- **No external secrets required**: The app boots without any credentials.
- **Replit plugins**: `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` are only loaded when `REPL_ID` is set, so they're inactive in this environment.
- **Vite config**: Already binds `0.0.0.0` with `allowedHosts: true` — no host allowlist issues.

## Structure

- `artifacts/document-track/` — the main React + Vite app (what runs in preview)
- `artifacts/api-server/` — Express API (not used by frontend currently)
- `lib/` — shared workspace packages (api-client-react, db, api-spec, api-zod)
- `pnpm-workspace.yaml` — workspace config with catalog, overrides, and supply-chain settings
