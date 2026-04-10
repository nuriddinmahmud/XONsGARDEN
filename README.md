# XON's Garden

Frontend-only orchard and garden expense management dashboard built with React, TypeScript, webpack, Tailwind CSS, and `localStorage`.

## What It Does

- Protects the admin experience with a simple local demo login
- Tracks local expense records for:
  - workers
  - food
  - fertilizer
  - transport
  - energy
  - oil
  - repairs
  - tax
  - drainage
- Stores all data in `localStorage`
- Seeds demo data on first load
- Provides dashboard analytics, reports, filtering, settings, and JSON backup/restore

## Tech Stack

- React 19
- TypeScript
- React Router
- Tailwind CSS
- Recharts
- Webpack

## Project Structure

```text
src/
  components/      Shared UI building blocks
  constants/       Navigation, auth, and storage constants
  context/         Auth and toast state
  data/
    entities/      Per-entity CRUD config modules
    seed.ts        Demo seed data
  hooks/           localStorage sync hooks
  layouts/         App shell layout
  pages/           Routed screens
  routes/          Router and auth guard
  types/           Shared TypeScript models
  utils/           Formatting, calculations, and localStorage helpers
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run typecheck
```

## localStorage Model

The app intentionally uses browser storage instead of a backend.

Known storage keys:

- `auth`
- `workers`
- `foods`
- `fertilizers`
- `transports`
- `energies`
- `oils`
- `remonts`
- `taxes`
- `drainages`
- `settings`
- `users`

## Backup and Restore

Settings page includes:

- JSON export of all app-managed `localStorage` data
- JSON import with validation and confirmation

This makes the project easy to demo, reset, and move between browsers without introducing a server.

## Notes

- This is a frontend-first local admin tool by design.
- No backend or API is required for normal use.
- Demo credentials are defined in `src/constants/auth.ts`.
