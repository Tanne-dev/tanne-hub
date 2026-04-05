-- Danh sách champion Raid (đồng bộ từ HellHades / script). Đọc công khai cho app; ghi qua service role hoặc policy admin.

CREATE TABLE IF NOT EXISTS public.raid_champions (
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

-- Ai cũng đọc được (anon + authenticated) — chỉ tên/faction phục vụ UI shop.
CREATE POLICY "raid_champions_select_public"
  ON public.raid_champions
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.raid_champions IS 'Raid SL champion names synced from HellHades tier list API; upsert via service role.';
