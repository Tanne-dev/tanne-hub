-- URL ảnh portrait HellHades (https), đồng bộ bằng script có cờ --portraits.

ALTER TABLE public.raid_champions
  ADD COLUMN IF NOT EXISTS portrait_url text;

COMMENT ON COLUMN public.raid_champions.portrait_url IS 'HellHades *-Portrait.jpg/png full URL; hotlink — tôn trọng ToS/rate limit site nguồn.';
