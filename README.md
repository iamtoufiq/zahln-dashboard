# Zahln Dashboard

The Studierendenwerk finance dashboard: daily totals per mensa and per till, payments that need attention, transaction search with the full history of each payment, and CSV export.

Part of the Zahln Mensa take-home, together with [zahln-student](../zahln-student) and [zahln-till](../zahln-till). The design document is in [DESIGN.md](DESIGN.md).

## Run it

```bash
npm install
cp .env.example .env   # API base URL and candidate id
npm run dev            # http://localhost:5173
npm run build          # static files in dist/
```

Sign in as `finance` / `test1234`.

## Test

```bash
npm test               # Vitest: API client, CSV, export paging, Berlin day ranges
npx playwright install chromium   # once, downloads the test browser
npm run e2e            # Playwright: sign in, totals, attention, search, history, CSV, German, offline, filters
```

## What is built

- Daily totals for any day in Europe/Berlin (today taken from the server clock), per mensa with each till below it; pending payments shown apart from the gross, net defined on screen, an "as of" time, and today refreshed every minute.
- Payments that need attention, with their reasons.
- Search by payment, order or payer id, status, mensa, till and date range; filters live in the URL, so a search can be shared.
- Payment detail with items, refunds, pending refund amount and the full event history; it keeps polling while the payment or a refund is pending.
- CSV export of the whole current search (all pages, all or nothing), with Berlin local times, a BOM for Excel and formula injection guarded. In German the file uses `;` and decimal commas so German Excel splits the columns.
- The session token is kept in a short-lived `Secure; SameSite=Strict` cookie that expires with the token, so a reload or a new tab stays signed in; after it expires, finance signs in again and returns to the same page. The password is never stored.
- English by default, German from the language button.

## Left out, and why

- **Re-signing in silently after the token expires.** The password is never stored, and the API has no refresh token, so finance types it again. DESIGN.md §6.
- **Live updates.** The API has no push; today's totals refresh every minute instead. DESIGN.md §6.

## Libraries

Vite, React 19, react-router, TanStack Query, react-day-picker for the date and range pickers, Fontsource for self-hosted Inter and Plus Jakarta Sans (no font request leaves the browser), Vitest, Playwright (Maestro's web support could not fill the login form).

## Tools

I made the architecture and design decisions. Claude Code was used as a coding assistant during implementation. All flows were tested in the browser against the mock API.

## Test logins

`finance` / `test1234`.
