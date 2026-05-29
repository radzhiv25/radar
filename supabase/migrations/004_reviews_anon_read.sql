-- Allow reading public reviews on restaurant detail (catalog browsing)

CREATE POLICY reviews_select_anon ON reviews
  FOR SELECT TO anon
  USING (true);
