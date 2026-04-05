-- Bước B — Sau khi Bước A chạy OK, mở tab SQL mới, copy TOÀN BỘ file này → Run.

CREATE TABLE public.raid_champions (
  hellhades_id text PRIMARY KEY,
  name text NOT NULL,
  faction text,
  hellhades_url text,
  portrait_url text,
  rarity text,
  role text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raid_champions_name_lower ON public.raid_champions (lower(name));

ALTER TABLE public.raid_champions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "raid_champions_select_public" ON public.raid_champions;

CREATE POLICY "raid_champions_select_public"
  ON public.raid_champions
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.raid_champions IS 'Raid SL champion names synced from HellHades tier list API; upsert via service role.';
