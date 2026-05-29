-- Helpers for bulk restaurant seeding (used by scripts/seed-restaurants.ts)

CREATE OR REPLACE FUNCTION upsert_restaurant_with_tags(
  p_slug text,
  p_name text,
  p_cuisine text,
  p_price_band int,
  p_area delhi_area,
  p_neighbourhood text,
  p_lat double precision,
  p_lng double precision,
  p_description text,
  p_image_urls text[],
  p_is_editors_pick boolean,
  p_tags jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_tag jsonb;
BEGIN
  INSERT INTO restaurants (
    name, slug, cuisine, price_band, area, neighbourhood,
    lat, lng, description, image_urls, is_editors_pick
  )
  VALUES (
    p_name, p_slug, p_cuisine, p_price_band, p_area, p_neighbourhood,
    p_lat, p_lng, p_description, p_image_urls, p_is_editors_pick
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    cuisine = EXCLUDED.cuisine,
    price_band = EXCLUDED.price_band,
    area = EXCLUDED.area,
    neighbourhood = EXCLUDED.neighbourhood,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    description = EXCLUDED.description,
    image_urls = EXCLUDED.image_urls,
    is_editors_pick = EXCLUDED.is_editors_pick
  RETURNING id INTO v_id;

  DELETE FROM restaurant_tags WHERE restaurant_id = v_id;

  FOR v_tag IN SELECT * FROM jsonb_array_elements(p_tags)
  LOOP
    INSERT INTO restaurant_tags (restaurant_id, tag_type, tag)
    VALUES (
      v_id,
      (v_tag ->> 'tag_type')::tag_type,
      v_tag ->> 'tag'
    );
  END LOOP;

  RETURN v_id;
END;
$$;

-- Service role only (seed script uses service role key)
REVOKE ALL ON FUNCTION upsert_restaurant_with_tags(
  text, text, text, int, delhi_area, text,
  double precision, double precision, text, text[], boolean, jsonb
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION upsert_restaurant_with_tags(
  text, text, text, int, delhi_area, text,
  double precision, double precision, text, text[], boolean, jsonb
) TO service_role;
