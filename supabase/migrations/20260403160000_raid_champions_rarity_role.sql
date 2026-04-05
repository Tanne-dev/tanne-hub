-- Bổ sung rarity + role (HellHades API v3). Chạy trong SQL Editor sau khi đã có bảng raid_champions.

ALTER TABLE public.raid_champions
  ADD COLUMN IF NOT EXISTS rarity text,
  ADD COLUMN IF NOT EXISTS role text;

COMMENT ON COLUMN public.raid_champions.rarity IS 'HellHades: Common, Uncommon, Rare, Epic, Legendary, Mythical';
COMMENT ON COLUMN public.raid_champions.role IS 'HellHades: ATK, DEF, HP, Supp → map trong app';
