# Radar — Tag Vocabulary

Controlled vocabulary for seed data, `restaurant_tags`, onboarding, and filters. Use **exact** slug strings below (lowercase, hyphenated where noted).

Tags are stored in `restaurant_tags` with `tag_type` enum: `vibe` | `occasion` | `food`.

Neighbourhoods are stored on `restaurants.neighbourhood` (text). Area is stored as `delhi_area` enum on `restaurants.area`.

---

## Area enum (`delhi_area`)

| Value | Description |
|-------|-------------|
| `north` | North Delhi |
| `south` | South Delhi |
| `east` | East Delhi |
| `west` | West Delhi |

**Rule:** Every restaurant has exactly one `area`. Use neighbourhood for finer-grained discovery and search.

---

## Vibe tags (`tag_type = vibe`)

Atmosphere and ambience. Assign **1–3** per restaurant.

| Tag | When to use |
|-----|-------------|
| `cosy` | Intimate, warm, small-room feel |
| `casual` | Relaxed dress code, easy-going |
| `authentic` | Traditional recipes, local character |
| `moody` | Dim lighting, evening atmosphere |
| `scenic` | Views, rooftops, outdoor seating with setting |
| `fine-dining` | Formal service, tasting menus, upscale |
| `lively` | Busy, energetic, social buzz |
| `quiet` | Conversation-friendly, low noise |
| `trendy` | Current hotspot, design-forward |
| `rustic` | Raw materials, homely, unfussy decor |
| `romantic` | Couples-friendly setting (pair with `date-night` occasion) |
| `family-friendly` | Welcomes kids, groups |
| `live-music` | Regular live performances |
| `rooftop` | Primary draw is rooftop seating |
| `garden` | Courtyard / garden seating |
| `heritage` | Historic building or old-Delhi character |
| `minimal` | Clean, understated design |
| `loud` | High energy / volume (honest tag) |
| `instagrammable` | Strong visual identity (use sparingly) |

---

## Occasion tags (`tag_type = occasion`)

Why someone goes. Assign **1–3** per restaurant.

| Tag | When to use |
|-----|-------------|
| `brunch` | Late morning / midday weekend-style menu |
| `date-night` | Couples dinner, special evening |
| `casual-meetup` | Friends catching up, low pressure |
| `celebration` | Birthdays, milestones, group dinners |
| `work-lunch` | Quick, reliable midday; business-appropriate |
| `solo` | Comfortable dining alone (counter, cafe, bar) |
| `family-dinner` | Multi-generational, shared plates |
| `drinks` | Primarily bar / drinks-led visit |
| `late-night` | Meaningful kitchen or bar after 10pm |
| `quick-bite` | Under 45 minutes, casual |
| `special-occasion` | Splurge, chef-driven, memorable |
| `coffee-catchup` | Cafe-style meet, not full meal |
| `pre-game` | Before going out elsewhere |
| `sunday-roast` | Weekend roast / long lunch tradition |

---

## Food style tags (`tag_type = food`)

Cuisine experience and format. Assign **1–4** per restaurant. Complements `restaurants.cuisine` (free text, e.g. "North Indian").

| Tag | When to use |
|-----|-------------|
| `coffee-speciality` | Third-wave / serious coffee program |
| `cocktail-bar` | Cocktails are a primary draw |
| `wine-bar` | Wine-focused list |
| `comfort-food` | Hearty, familiar plates |
| `dessert-spot` | Pastries, ice cream, sweets-led |
| `street-food` | Chaat, rolls, casual street-style |
| `vegetarian` | Strong veg menu or fully veg |
| `vegan-friendly` | Reliable vegan options |
| `seafood` | Fish / shellfish focus |
| `bbq-grill` | Tandoor, grill, smoke |
| `small-plates` | Sharing, tapas-style |
| `biryani` | Biryani as signature |
| `mughlai` | Mughlai / Old Delhi canon |
| `south-indian` | Dosa, idli, Kerala, etc. |
| `pan-asian` | Thai, Japanese, Chinese crossover |
| `italian` | Pizza, pasta focus |
| `middle-eastern` | Levant, Turkish, etc. |
| `bakery` | Bread, viennoiserie |
| `healthy` | Salads, bowls, light options |
| `craft-beer` | Microbrew / beer list focus |
| `juice-smoothie` | Juice bars, smoothies |
| `all-day-breakfast` | Breakfast menu most of the day |

---

## Delhi neighbourhood tags

Stored in `restaurants.neighbourhood`. Use for map search, filters, and local discovery clusters.

### Central & New Delhi

| Neighbourhood | Typical `area` |
|---------------|----------------|
| `connaught-place` | `north` |
| `janpath` | `north` |
| `khan-market` | `south` |
| `lodhi-colony` | `south` |
| `lodhi-road` | `south` |
| `sunder-nagar` | `south` |
| `india-gate` | `south` |
| `chanakyapuri` | `south` |

### South Delhi

| Neighbourhood | `area` |
|---------------|--------|
| `hauz-khas` | `south` |
| `hauz-khas-village` | `south` |
| `green-park` | `south` |
| `greater-kailash` | `south` |
| `greater-kailash-1` | `south` |
| `greater-kailash-2` | `south` |
| `defence-colony` | `south` |
| `lajpat-nagar` | `south` |
| `saket` | `south` |
| `malviya-nagar` | `south` |
| `mehrauli` | `south` |
| `chhatarpur` | `south` |
| `vasant-kunj` | `south` |
| `vasant-vihar` | `south` |
| `nehru-place` | `south` |
| `kalkaji` | `south` |
| `govindpuri` | `south` |
| `panchsheel-park` | `south` |
| `shahpur-jat` | `south` |

### West Delhi

| Neighbourhood | `area` |
|---------------|--------|
| `rajouri-garden` | `west` |
| `punjabi-bagh` | `west` |
| `paschim-vihar` | `west` |
| `janakpuri` | `west` |
| `subhash-nagar` | `west` |
| `motinagar` | `west` |

### East Delhi

| Neighbourhood | `area` |
|---------------|--------|
| `preet-vihar` | `east` |
| `laxmi-nagar` | `east` |
| `mayur-vihar` | `east` |
| `vasundhara-enclave` | `east` |
| `indirapuram` | `east` |

### North Delhi

| Neighbourhood | `area` |
|---------------|--------|
| `civil-lines` | `north` |
| `kashmere-gate` | `north` |
| `old-delhi` | `north` |
| `chandni-chowk` | `north` |
| `karol-bagh` | `north` |
| `rajinder-nagar` | `north` |
| `model-town` | `north` |
| `kamla-nagar` | `north` |
| `hudson-lane` | `north` |
| `gtb-nagar` | `north` |

### NCR spillover (use only if in launch catalog)

| Neighbourhood | `area` |
|---------------|--------|
| `cyber-hub` | `west` |
| `golf-course-road` | `west` |
| `sector-29-gurgaon` | `west` |

*MVP default: **prefer Delhi municipal neighbourhoods**; add Gurgaon / NCR only when intentionally expanding catalog.*

---

## Usage rules

1. **Slugs only** — no display labels in DB; format in UI layer.
2. **No duplicate types** — do not store the same tag twice on one restaurant.
3. **Cross-type allowed** — e.g. `romantic` (vibe) + `date-night` (occasion) together.
4. **Neighbourhood required** — every seed row must have `neighbourhood` + `area`.
5. **New tags** — add to this doc and migration seed allowlist before using in production JSON.
6. **Onboarding** — user picks from subsets of vibe / occasion / cuisine; map to same slugs where possible.

---

## Example restaurant tag set

**Restaurant:** Evening cocktail bar in Hauz Khas Village

```yaml
area: south
neighbourhood: hauz-khas-village
vibe: [moody, trendy, lively]
occasion: [date-night, drinks, casual-meetup]
food: [cocktail-bar, small-plates]
```

---

## Related Docs

- [MVP.md](./MVP.md) — Data model and seed workflow
- [PRODUCT_VISION.md](./PRODUCT_VISION.md) — Why tags matter for recommendations
