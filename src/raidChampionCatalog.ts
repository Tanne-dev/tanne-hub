/** HellHades tier list + API v3; Mythic = mẫu cũ, Mythical = chính tả API */
export type RaidChampionRarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic"
  | "Mythical";

export type RaidChampion = {
  id: string;
  name: string;
  role: "Attack" | "Defense" | "Support" | "HP";
  rarity: RaidChampionRarity;
  hellhadesUrl?: string;
  /** HellHades faction slug khi load từ Supabase (vd: dark-elves) */
  faction?: string;
};

/**
 * Catalog mẫu cho Champion Picker.
 * Có thể bổ sung toàn bộ champion sau, hoặc nối từ DB/API.
 */
export const RAID_CHAMPION_CATALOG: RaidChampion[] = [
  {
    id: "arbiter-sample",
    name: "Arbiter (Sample Mythic)",
    role: "Support",
    rarity: "Mythic",
  },
  {
    id: "joan",
    name: "Joan",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "androc",
    name: "Androc",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "lord-champfort",
    name: "Lord Champfort",
    role: "HP",
    rarity: "Legendary",
  },
  {
    id: "sethallia",
    name: "Sethallia",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "cillian",
    name: "Cillian",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "sigmund",
    name: "Sigmund",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "ronda",
    name: "Ronda",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "black-knight",
    name: "Black Knight",
    role: "HP",
    rarity: "Legendary",
  },
  {
    id: "staltus",
    name: "Staltus",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "minaya",
    name: "Minaya",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "slot-11",
    name: "Unknown Champion 11",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "slot-12",
    name: "Unknown Champion 12",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "slot-13",
    name: "Unknown Champion 13",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "slot-14",
    name: "Unknown Champion 14",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "slot-15",
    name: "Unknown Champion 15",
    role: "Support",
    rarity: "Epic",
  },
  {
    id: "slot-16",
    name: "Unknown Champion 16",
    role: "Support",
    rarity: "Epic",
  },
  {
    id: "slot-17",
    name: "Unknown Champion 17",
    role: "Defense",
    rarity: "Epic",
  },
  {
    id: "slot-18",
    name: "Unknown Champion 18",
    role: "Defense",
    rarity: "Epic",
  },
];
