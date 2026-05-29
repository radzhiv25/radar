-- Allow anonymous catalog browsing (map/feed) before sign-in.
-- Saves, reviews, and preferences still require authenticated users.

CREATE POLICY restaurants_select_anon ON restaurants
  FOR SELECT TO anon
  USING (true);

CREATE POLICY restaurant_tags_select_anon ON restaurant_tags
  FOR SELECT TO anon
  USING (true);
