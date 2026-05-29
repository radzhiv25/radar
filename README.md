# Radar

Delhi restaurant discovery — save-first, curated picks, map exploration. Built with Expo SDK 54, Expo Router, NativeWind, and Supabase.

## Features

- **Home feed** — saved places first, then personalised picks
- **Map** — Delhi default view; tap or long-press map places to save on device (iOS & Android)
- **Profile** — saved restaurants list
- **Onboarding** — taste preferences (cuisines, budget, areas)
- **Guided empty states** — no harsh errors on first launch

## Project structure

```
app/              Expo Router screens (tabs, auth, onboarding, detail)
components/       UI by domain (map, feed, restaurant, ui)
hooks/            Screen data hooks
lib/              API, env, storage, guides, scoring
contexts/         React context (saves)
types/            Shared TypeScript types
supabase/         Postgres migrations and config
data/             Seed restaurant JSON
scripts/          Database seed script
docs/             Product spec and roadmap
```

## Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) on a device, or iOS Simulator / Android emulator
- Supabase project (optional for catalog; map saves work offline on device)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env` and fill in your Supabase keys:

   ```bash
   cp .env.example .env
   ```

   | Variable | Used by |
   |----------|---------|
   | `EXPO_PUBLIC_SUPABASE_URL` | Mobile app |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile app |
   | `SUPABASE_URL` | Seed script only |
   | `SUPABASE_SERVICE_ROLE_KEY` | Seed script only |

   Never commit `.env` — it is gitignored.

3. **Database (optional)**

   Apply migrations and seed restaurants:

   ```bash
   npx supabase db push
   npx tsx scripts/seed-restaurants.ts
   ```

4. **Run the app**

   ```bash
   npm start
   ```

   Press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

   Clear Metro cache if env vars changed:

   ```bash
   npm start -- --clear
   ```

## Map saves (local)

Without Supabase, you can still use the map:

- **Tap** a business on the map (POI), or **press and hold** anywhere
- Tap **Save to device** on the preview card
- Saved places appear on Home and Profile (stored in AsyncStorage)

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open iOS simulator |
| `npm run android` | Open Android emulator |
| `npm run web` | Web (map falls back to list view) |

## Docs

- [MVP spec](docs/MVP.md)
- [Roadmap](docs/ROADMAP.md)
- [Product vision](docs/PRODUCT_VISION.md)

## License

See [LICENSE](LICENSE).
