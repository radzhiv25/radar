# Radar — Product Vision

## Overview

Radar is a restaurant discovery mobile app focused on **personalised recommendations**, **restaurant saving behaviour**, and making food discovery feel more **curated and intentional**.

The core idea behind Radar is that current restaurant discovery platforms feel overwhelming, generic, and utility-driven. Users today often rely on Instagram saves, Google Maps, or friends’ recommendations because existing discovery feels impersonal.

Radar aims to create a cleaner, more personalised restaurant discovery experience centred around **taste**, **behaviour**, and **context**.

---

## Product Vision

Create a restaurant discovery platform that:

- Understands user taste
- Makes saving restaurants frictionless
- Encourages repeat discovery behaviour
- Eventually evolves into a more social and collaborative food discovery product

**Geography:** Radar will initially launch **only in Delhi, India**.

---

## V1 Scope — Core Features

### 1. Home Feed (Personalised Recommendations)

A dedicated home screen displaying restaurant recommendations tailored to each user. Recommendations are **rule-based** (not ML in V1) and consider:

- Cuisine preferences
- Budget preferences
- Occasion / vibe preferences
- Saved restaurants (to avoid repeats)
- Area proximity
- Restaurant tags

### 2. Map-Based Discovery

Explore restaurants through an interactive map:

- Integrated search bar on the map screen
- Map pins for restaurants
- Tap pin to open restaurant card
- Search by areas / neighbourhoods

### 3. Restaurant Cards

Every restaurant has a dedicated detail view containing:

- Restaurant name, cuisine, price range
- Images, neighbourhood / location
- Tags (vibe, occasion, food type)
- Rating, save button, reviews

### 4. Save / Bookmark System

Users can save restaurants. Saved restaurants appear in the user profile. **Saving is one of the most important product actions** in Radar.

### 5. User Profiles

Profiles contain:

- Saved restaurants
- User reviews
- Streak count
- Onboarding preferences

Future social features may build on profiles.

### 6. Reviews

Users leave short reviews and ratings (one review per user per restaurant).

### 7. Instagram Share (Simple V1)

Save restaurants from Instagram via native share:

1. User taps Share on an Instagram post / reel
2. User selects Radar from the share sheet
3. Radar opens as a bottom-sheet / modal
4. User sees a search bar and optional lightweight auto-suggestion
5. User selects a restaurant from the catalog
6. Restaurant is saved to profile

V1 avoids complex scraping / parsing. Simple auto-suggestion attempts are enough; **search fallback is required**.

### 8. Gamification (Lightweight)

Subtle engagement, not heavy gamification:

- **Onboarding:** progress bar, subtle mascot / guide animation (can be deferred in MVP)
- **Weekly streak:** triggered by saving or reviewing restaurants; lightweight and non-intrusive
- No complex reward systems or leaderboards in V1

---

## Restaurant Data & Tags

Recommendations rely on structured metadata. Each restaurant includes name, cuisine, location, **area** (North / South / East / West Delhi), price range, images, ratings, description, and a **tag system**:

| Tag type   | Purpose                                      |
|-----------|-----------------------------------------------|
| Vibe      | Atmosphere (cosy, casual, moody, etc.)        |
| Occasion  | Use case (brunch, date night, work lunch)     |
| Food      | Experience style (cocktail bar, dessert spot)|
| Neighbourhood | Local discovery & area filtering          |

See [tags.md](./tags.md) for the allowed vocabulary.

---

## Design Philosophy

The product prioritises:

- Ease of use
- Smooth discovery
- Strong UX around saving and recommendations

The app should **not** feel cluttered or feature-heavy.

---

## Deferred Features (Vision V1 but not first beta)

These appear in the vision document but are **trimmed or phased** for the disciplined MVP beta:

- Instagram auto-suggestion from caption / URL (search-only first)
- Heavy onboarding mascot animations
- Weekly streak push notifications
- Google Places as catalog expansion
- Swipe discovery, group voting, community, monetization (see [ROADMAP.md](./ROADMAP.md))

---

## Brand & Product Philosophy

Radar embodies the **digital version of the friend who always knows the best places**.

- Young and culturally aware without feeling forced
- Tasteful and discovery-oriented rather than algorithmically overwhelming
- Encourages users to **go out more**, explore the city intentionally, and move beyond endless passive bookmarking
- Long-term aspiration: feel like a **trusted curator**, not a transactional reservation or discount platform

**V1 discipline:** Stay focused and build a strong foundation. Quality of recommendations and save UX matter more than catalog size.

---

## Related Docs

- [MVP.md](./MVP.md) — Scope, success criteria, tech stack, delivery phases
- [tags.md](./tags.md) — Controlled tag and neighbourhood vocabulary
- [ROADMAP.md](./ROADMAP.md) — Post-V1 features and monetization directions
