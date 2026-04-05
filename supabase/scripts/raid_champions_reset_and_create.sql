-- ⚠️ KHÔNG dán file này vào CUỐI một query dài trong SQL Editor (vd. "Post Images...").
-- Luôn: SQL Editor → New query → dán TOÀN BỘ file → Run.
--
-- Nếu vẫn lỗi "must be owner", làm 2 bước tách (cùng thư mục scripts/):
--   1) raid_champions_1_drop_only.sql  (chỉ DROP)
--   2) raid_champions_2_create_only.sql (CREATE + policy)
--
-- CẢNH BÁO: DROP xóa hết dữ liệu trong raid_champions.

DROP TABLE IF EXISTS public.raid_champions CASCADE;

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

COMMENT ON TABLE public.raid_champions IS 'Raid SL champions: HellHades v3 API (rarity, role); sync via npm run sync:champions.';
