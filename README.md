# Sophämtning Ale

A waste collection schedule app for Ale kommun. Search your address and see when your bins will be emptied, with color-coded waste types, countdown timers, and notification reminders.

Built with Next.js, TypeScript, and Tailwind CSS. Installable as a PWA on mobile devices.

## Features

- **Address search** — Autocomplete search against Ale kommun's waste pickup API
- **Schedule overview** — All upcoming collections sorted by date with days remaining
- **Waste type icons** — Color-coded cards for Restavfall, Matavfall, Plast/Papp, and more
- **Offline support** — Cached schedule data available without internet
- **Push notifications** — Reminders at 18:00 the day before and 06:00 on collection day
- **PWA** — Install as a standalone app on iOS and Android
- **Dark mode** — Follows system preference
- **Swedish UI** — All text in Swedish

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4

## Data Sources

The app proxies requests to Ale kommun's public waste pickup APIs:

- **Address search**: `POST /api/search` → `edp.ale.se/FutureWeb/SimpleWastePickup/SearchAdress`
- **Pickup schedule**: `GET /api/schedule?address=...` → `edp.ale.se/FutureWeb/SimpleWastePickup/GetWastePickupSchedule`

## Project Structure

```
src/
├── app/
│   ├── api/schedule/   # Schedule API proxy
│   ├── api/search/     # Address search API proxy
│   ├── layout.tsx      # Root layout, PWA meta, service worker registration
│   └── page.tsx        # Main page with address flow
├── components/
│   ├── AddressSearch   # Debounced address autocomplete
│   ├── ScheduleView    # Schedule display with hero card
│   └── WasteCard       # Individual waste type card
├── hooks/
│   ├── useAddress      # localStorage address management
│   ├── useAddressSearch# Debounced search with API calls
│   └── useSchedule     # Fetch, cache, and parse schedule data
├── lib/
│   └── waste-utils     # Date formatting, waste type colors, grouping
└── types/
    └── waste           # TypeScript interfaces
public/
├── sw.js               # Service worker (offline + notifications)
├── manifest.json       # PWA manifest
└── icons/              # App icons (192px, 512px)
```
