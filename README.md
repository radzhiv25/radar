# Radar

Delhi restaurant discovery — save-first, curated picks, map exploration. Built with Expo SDK 54, Expo Router, NativeWind, and Supabase.

## Features

- **Home feed** — saved places first, then rule-based personalised picks (`get_feed` RPC when signed in)
- **Map** — Delhi pins, search, area/cuisine/tag filters; tap POI or long-press to save on device
- **Restaurant detail** — photos, tags, save, read/write reviews (signed in)
- **Profile** — saved list, streak count, my reviews, edit taste
- **Onboarding** — cuisines, budget, vibes, occasions, areas (syncs to Supabase when signed in)
- **Auth** — email OTP via Supabase (iOS & Android); sign-in required to save catalog restaurants
- **Share deep link** — `radar://share?q=...` opens search-to-save flow
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

   | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Android release maps (optional in dev) |

   Never commit `.env` — it is gitignored.

3. **Database**

   Apply migrations and seed 84 Delhi restaurants:

   ```bash
   npx supabase db push
   npx tsx scripts/seed-restaurants.ts
   ```

4. **Run the app**

   ```bash
   npm start
   ```

   Press `i` for iOS simulator, `a` for Android, or scan the QR code with Expo Go.

5. **Production builds (EAS)**

   ```bash
   npx eas-cli build --profile preview --platform all
   ```

   Configure `EAS_PROJECT_ID` in `.env` after `eas init`.

## Share deep link

Open the share save flow from another app or terminal:

```text
radar://share?q=hauz%20khas
```

On iOS/Android, configure a share target in a future native build; MVP uses deep links + in-app search.

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
