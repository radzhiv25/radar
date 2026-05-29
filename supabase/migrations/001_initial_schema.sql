-- Radar MVP: initial schema, RLS, feed scoring, streaks, search

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMs
-- ---------------------------------------------------------------------------

CREATE TYPE delhi_area AS ENUM ('north', 'south', 'east', 'west');
CREATE TYPE tag_type AS ENUM ('vibe', 'occasion', 'food');
CREATE TYPE streak_event_type AS ENUM ('save', 'review');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  cuisine text NOT NULL,
  price_band int NOT NULL CHECK (price_band BETWEEN 1 AND 4),
  area delhi_area NOT NULL,
  neighbourhood text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  description text,
  image_urls text[] NOT NULL DEFAULT '{}',
  avg_rating numeric NOT NULL DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  save_count int NOT NULL DEFAULT 0 CHECK (save_count >= 0),
  is_editors_pick boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX restaurants_area_idx ON restaurants (area);
CREATE INDEX restaurants_neighbourhood_idx ON restaurants (neighbourhood);
CREATE INDEX restaurants_slug_idx ON restaurants (slug);
CREATE INDEX restaurants_editors_pick_idx ON restaurants (is_editors_pick) WHERE is_editors_pick;

CREATE TABLE restaurant_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  tag_type tag_type NOT NULL,
  tag text NOT NULL,
  UNIQUE (restaurant_id, tag_type, tag)
);

CREATE INDEX restaurant_tags_restaurant_id_idx ON restaurant_tags (restaurant_id);
CREATE INDEX restaurant_tags_tag_idx ON restaurant_tags (tag);

CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  cuisines text[] NOT NULL DEFAULT '{}',
  budget_band int CHECK (budget_band IS NULL OR budget_band BETWEEN 1 AND 4),
  occasions text[] NOT NULL DEFAULT '{}',
  vibes text[] NOT NULL DEFAULT '{}',
  preferred_areas delhi_area[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);

CREATE INDEX saves_user_id_idx ON saves (user_id);
CREATE INDEX saves_restaurant_id_idx ON saves (restaurant_id);
CREATE INDEX saves_created_at_idx ON saves (created_at DESC);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, restaurant_id)
);

CREATE INDEX reviews_restaurant_id_idx ON reviews (restaurant_id);

CREATE TABLE streak_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  event_date date NOT NULL DEFAULT (timezone('Asia/Kolkata', now()))::date,
  event_type streak_event_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_date)
);

CREATE INDEX streak_events_user_id_idx ON streak_events (user_id, event_date DESC);

-- ---------------------------------------------------------------------------
-- Helpers: distance & rating
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 6371.0 * 2 * asin(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2)
      + cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
    )
  );
$$;

CREATE OR REPLACE FUNCTION refresh_restaurant_avg_rating(p_restaurant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE restaurants r
  SET avg_rating = COALESCE((
    SELECT round(avg(rv.rating)::numeric, 2)
    FROM reviews rv
    WHERE rv.restaurant_id = p_restaurant_id
  ), 0)
  WHERE r.id = p_restaurant_id;
END;
$$;

CREATE OR REPLACE FUNCTION trg_reviews_avg_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_restaurant_avg_rating(OLD.restaurant_id);
    RETURN OLD;
  END IF;

  PERFORM refresh_restaurant_avg_rating(NEW.restaurant_id);

  IF TG_OP = 'UPDATE' AND OLD.restaurant_id IS DISTINCT FROM NEW.restaurant_id THEN
    PERFORM refresh_restaurant_avg_rating(OLD.restaurant_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_avg_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trg_reviews_avg_rating();

CREATE OR REPLACE FUNCTION trg_saves_save_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE restaurants SET save_count = save_count + 1 WHERE id = NEW.restaurant_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE restaurants SET save_count = greatest(save_count - 1, 0) WHERE id = OLD.restaurant_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER saves_save_count
  AFTER INSERT OR DELETE ON saves
  FOR EACH ROW
  EXECUTE FUNCTION trg_saves_save_count();

-- ---------------------------------------------------------------------------
-- Streak: one event per user per calendar day (IST)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION record_streak_event(
  p_user_id uuid,
  p_event_type streak_event_type
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (timezone('Asia/Kolkata', now()))::date;
BEGIN
  INSERT INTO streak_events (user_id, event_date, event_type)
  VALUES (p_user_id, v_today, p_event_type)
  ON CONFLICT (user_id, event_date) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION trg_saves_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM record_streak_event(NEW.user_id, 'save');
  RETURN NEW;
END;
$$;

CREATE TRIGGER saves_streak
  AFTER INSERT ON saves
  FOR EACH ROW
  EXECUTE FUNCTION trg_saves_streak();

CREATE OR REPLACE FUNCTION trg_reviews_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM record_streak_event(NEW.user_id, 'review');
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_streak
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trg_reviews_streak();

CREATE OR REPLACE FUNCTION get_streak_count(p_user_id uuid)
RETURNS int
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int := 0;
  v_cursor date;
  v_today date := (timezone('Asia/Kolkata', now()))::date;
BEGIN
  SELECT max(event_date) INTO v_cursor
  FROM streak_events
  WHERE user_id = p_user_id;

  IF v_cursor IS NULL THEN
    RETURN 0;
  END IF;

  -- If last activity wasn't today or yesterday, streak is broken
  IF v_cursor < v_today - 1 THEN
    RETURN 0;
  END IF;

  -- Count consecutive days ending at v_cursor
  WHILE EXISTS (
    SELECT 1 FROM streak_events
    WHERE user_id = p_user_id AND event_date = v_cursor
  ) LOOP
    v_count := v_count + 1;
    v_cursor := v_cursor - 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ---------------------------------------------------------------------------
-- Feed scoring (rule-based per MVP plan)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_feed(
  p_user_id uuid,
  p_lat double precision,
  p_lng double precision
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  cuisine text,
  price_band int,
  area delhi_area,
  neighbourhood text,
  lat double precision,
  lng double precision,
  description text,
  image_urls text[],
  avg_rating numeric,
  save_count int,
  is_editors_pick boolean,
  created_at timestamptz,
  score numeric,
  match_reason text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefs user_preferences%ROWTYPE;
  v_has_prefs boolean;
BEGIN
  SELECT * INTO v_prefs FROM user_preferences WHERE user_id = p_user_id;
  v_has_prefs := v_prefs.user_id IS NOT NULL
    AND (
      coalesce(array_length(v_prefs.cuisines, 1), 0) > 0
      OR v_prefs.budget_band IS NOT NULL
      OR coalesce(array_length(v_prefs.occasions, 1), 0) > 0
      OR coalesce(array_length(v_prefs.vibes, 1), 0) > 0
      OR coalesce(array_length(v_prefs.preferred_areas, 1), 0) > 0
    );

  RETURN QUERY
  WITH scored AS (
    SELECT
      r.*,
      EXISTS (SELECT 1 FROM saves s WHERE s.user_id = p_user_id AND s.restaurant_id = r.id) AS already_saved,
      CASE
        WHEN v_has_prefs AND v_prefs.cuisines IS NOT NULL
          AND r.cuisine = ANY (v_prefs.cuisines) THEN 3
        WHEN NOT v_has_prefs AND r.is_editors_pick THEN 2
        ELSE 0
      END AS cuisine_pts,
      CASE
        WHEN v_has_prefs AND v_prefs.budget_band IS NOT NULL
          AND r.price_band = v_prefs.budget_band THEN 2
        WHEN NOT v_has_prefs AND r.is_editors_pick THEN 1
        ELSE 0
      END AS budget_pts,
      COALESCE((
        SELECT count(*)::int * 2
        FROM restaurant_tags rt
        WHERE rt.restaurant_id = r.id
          AND (
            (rt.tag_type = 'occasion' AND rt.tag = ANY (coalesce(v_prefs.occasions, '{}')))
            OR (rt.tag_type = 'vibe' AND rt.tag = ANY (coalesce(v_prefs.vibes, '{}')))
          )
      ), 0) AS tag_pts,
      CASE
        WHEN v_has_prefs
          AND coalesce(array_length(v_prefs.preferred_areas, 1), 0) > 0
          AND r.area = ANY (v_prefs.preferred_areas) THEN 2
        ELSE 0
      END AS area_pts,
      CASE
        WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
          greatest(0, 1 - (haversine_km(p_lat, p_lng, r.lat, r.lng) / 8.0))
        ELSE 0
      END AS proximity_pts,
      COALESCE((
        SELECT count(*)::numeric * 0.3
        FROM saves s
        WHERE s.restaurant_id = r.id
          AND s.created_at >= now() - interval '7 days'
      ), 0) AS trending_pts
    FROM restaurants r
  ),
  final AS (
    SELECT
      s.*,
      (
        s.cuisine_pts
        + s.budget_pts
        + s.tag_pts
        + s.area_pts
        + s.proximity_pts
        + s.trending_pts
        + round(s.avg_rating * 0.5, 2)
        - CASE WHEN s.already_saved THEN 5 ELSE 0 END
      )::numeric AS calc_score,
      trim(both ' · ' FROM concat_ws(
        ' · ',
        CASE WHEN s.cuisine_pts > 0 THEN 'Matches your cuisine picks' END,
        CASE WHEN s.budget_pts > 0 THEN 'Fits your budget' END,
        CASE WHEN s.tag_pts > 0 THEN 'Matches your vibe or occasion' END,
        CASE WHEN s.area_pts > 0 THEN 'In your preferred area' END,
        CASE WHEN s.proximity_pts >= 0.5 THEN 'Near you' END,
        CASE WHEN NOT v_has_prefs AND s.is_editors_pick THEN 'Editor''s pick' END,
        CASE WHEN NOT v_has_prefs AND s.trending_pts > 0 THEN 'Popular this week' END
      )) AS reason
    FROM scored s
  )
  SELECT
    f.id,
    f.name,
    f.slug,
    f.cuisine,
    f.price_band,
    f.area,
    f.neighbourhood,
    f.lat,
    f.lng,
    f.description,
    f.image_urls,
    f.avg_rating,
    f.save_count,
    f.is_editors_pick,
    f.created_at,
    f.calc_score,
    COALESCE(NULLIF(f.reason, ''), 'Recommended for you')
  FROM final f
  ORDER BY f.calc_score DESC, f.save_count DESC, f.avg_rating DESC
  LIMIT 50;
END;
$$;

-- ---------------------------------------------------------------------------
-- Search (share screen / catalog lookup)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION search_restaurants(p_query text)
RETURNS SETOF restaurants
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.*
  FROM restaurants r
  WHERE p_query IS NULL
    OR trim(p_query) = ''
    OR r.name ILIKE '%' || trim(p_query) || '%'
    OR r.neighbourhood ILIKE '%' || trim(p_query) || '%'
    OR r.cuisine ILIKE '%' || trim(p_query) || '%'
    OR r.slug ILIKE '%' || trim(p_query) || '%'
  ORDER BY
    CASE WHEN r.name ILIKE trim(p_query) || '%' THEN 0 ELSE 1 END,
    r.save_count DESC,
    r.avg_rating DESC
  LIMIT 25;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_events ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Restaurants & tags: read-only for authenticated users
CREATE POLICY restaurants_select_authenticated ON restaurants
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY restaurant_tags_select_authenticated ON restaurant_tags
  FOR SELECT TO authenticated
  USING (true);

-- User preferences
CREATE POLICY user_preferences_select_own ON user_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY user_preferences_insert_own ON user_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_preferences_update_own ON user_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_preferences_delete_own ON user_preferences
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Saves
CREATE POLICY saves_select_own ON saves
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY saves_insert_own ON saves
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY saves_delete_own ON saves
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Reviews
CREATE POLICY reviews_select_authenticated ON reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY reviews_delete_own ON reviews
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Streak events
CREATE POLICY streak_events_select_own ON streak_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data ->> 'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant execute on RPCs to authenticated role
GRANT EXECUTE ON FUNCTION get_feed(uuid, double precision, double precision) TO authenticated;
GRANT EXECUTE ON FUNCTION get_streak_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION search_restaurants(text) TO authenticated;
