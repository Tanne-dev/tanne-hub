CREATE TABLE IF NOT EXISTS public.member_alert_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  notify_promo_codes boolean NOT NULL DEFAULT false,
  notify_posts boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_alert_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "member_alert_preferences_select_own" ON public.member_alert_preferences;
CREATE POLICY "member_alert_preferences_select_own"
  ON public.member_alert_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "member_alert_preferences_insert_own" ON public.member_alert_preferences;
CREATE POLICY "member_alert_preferences_insert_own"
  ON public.member_alert_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "member_alert_preferences_update_own" ON public.member_alert_preferences;
CREATE POLICY "member_alert_preferences_update_own"
  ON public.member_alert_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "member_alert_preferences_admin_all" ON public.member_alert_preferences;
CREATE POLICY "member_alert_preferences_admin_all"
  ON public.member_alert_preferences
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
