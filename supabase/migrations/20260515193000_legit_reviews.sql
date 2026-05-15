CREATE TABLE IF NOT EXISTS public.legit_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 48),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 260),
  order_ref text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_legit_reviews_visible_created_at
  ON public.legit_reviews (is_visible, created_at DESC);

ALTER TABLE public.legit_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "legit_reviews_select_visible" ON public.legit_reviews;
CREATE POLICY "legit_reviews_select_visible"
  ON public.legit_reviews
  FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

DROP POLICY IF EXISTS "legit_reviews_insert_public" ON public.legit_reviews;
CREATE POLICY "legit_reviews_insert_public"
  ON public.legit_reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    is_visible = true
    AND rating BETWEEN 1 AND 5
    AND char_length(display_name) BETWEEN 1 AND 48
    AND char_length(message) BETWEEN 1 AND 260
  );

DROP POLICY IF EXISTS "legit_reviews_update_admin" ON public.legit_reviews;
CREATE POLICY "legit_reviews_update_admin"
  ON public.legit_reviews
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "legit_reviews_delete_admin" ON public.legit_reviews;
CREATE POLICY "legit_reviews_delete_admin"
  ON public.legit_reviews
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
