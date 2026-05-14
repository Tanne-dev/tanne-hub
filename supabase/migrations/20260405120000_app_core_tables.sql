-- Core app tables used by the frontend.
-- Run after the auth project is created. Seed admins manually with a service role:
-- insert into public.admins (user_id) values ('<auth.users.id>');

CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_select_self" ON public.admins;
CREATE POLICY "admins_select_self"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );

CREATE TABLE IF NOT EXISTS public.posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  caption text,
  content text NOT NULL DEFAULT '',
  image_url text,
  image_position text NOT NULL DEFAULT 'top' CHECK (image_position IN ('top', 'left', 'right')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
CREATE POLICY "posts_select_public"
  ON public.posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "posts_insert_admin" ON public.posts;
CREATE POLICY "posts_insert_admin"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "posts_update_admin" ON public.posts;
CREATE POLICY "posts_update_admin"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "posts_delete_admin" ON public.posts;
CREATE POLICY "posts_delete_admin"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.raid_accounts (
  id text PRIMARY KEY,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  heroes jsonb NOT NULL DEFAULT '[]'::jsonb,
  more_count integer NOT NULL DEFAULT 0 CHECK (more_count >= 0),
  price_label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raid_accounts_active_created_at
  ON public.raid_accounts (is_active, created_at DESC);

ALTER TABLE public.raid_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "raid_accounts_select_public_active" ON public.raid_accounts;
CREATE POLICY "raid_accounts_select_public_active"
  ON public.raid_accounts
  FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "raid_accounts_insert_admin" ON public.raid_accounts;
CREATE POLICY "raid_accounts_insert_admin"
  ON public.raid_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "raid_accounts_update_admin" ON public.raid_accounts;
CREATE POLICY "raid_accounts_update_admin"
  ON public.raid_accounts
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));

DROP POLICY IF EXISTS "raid_accounts_delete_admin" ON public.raid_accounts;
CREATE POLICY "raid_accounts_delete_admin"
  ON public.raid_accounts
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admins a WHERE a.user_id = auth.uid()));
