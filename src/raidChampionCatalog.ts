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
    id: "sabrael-the-distant",
    name: "Sabrael the Distant",
    role: "Support",
    rarity: "Mythical",
    faction: "high-elves",
  },
  {
    id: "losan-kleth",
    name: "Losan K'Leth",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "narma-the-returned",
    name: "Narma the Returned",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "giath-the-truthshield",
    name: "Giath the Truthshield",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "walking-tomb-dreng",
    name: "Walking Tomb Dreng",
    role: "HP",
    rarity: "Legendary",
  },
  {
    id: "gaius-the-gleeful",
    name: "Gaius the Gleeful",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "soulless",
    name: "Soulless",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "pontiff-augustin",
    name: "Pontiff Augustin",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "georgid-the-breaker",
    name: "Georgid the Breaker",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "tribune-herakletes",
    name: "Tribune Herakletes",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "sanguine-maria",
    name: "Sanguine Maria",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "bad-el-kazar",
    name: "Bad-el-Kazar",
    role: "Support",
    rarity: "Legendary",
  },
  {
    id: "knave-of-hearts",
    name: "Knave of Hearts",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "mashalled",
    name: "Ma'Shalled",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "gaspard-the-accused",
    name: "Gaspard the Accused",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "nekhret-the-great",
    name: "Nekhret the Great",
    role: "Defense",
    rarity: "Legendary",
  },
  {
    id: "valkanen",
    name: "Valkanen",
    role: "Attack",
    rarity: "Legendary",
  },
  {
    id: "sinesha",
    name: "Sinesha",
    role: "Support",
    rarity: "Epic",
  },
  {
    id: "miscreated-monster",
    name: "Miscreated Monster",
    role: "HP",
    rarity: "Epic",
  },
  {
    id: "thylessia",
    name: "Thylessia",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "skullcrown",
    name: "Skullcrown",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "whisper",
    name: "Whisper",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "gorgorab",
    name: "Gorgorab",
    role: "Support",
    rarity: "Epic",
  },
  {
    id: "catacomb-councilor",
    name: "Catacomb Councilor",
    role: "Attack",
    rarity: "Epic",
  },
  {
    id: "balthus-drauglord",
    name: "Balthus Drauglord",
    role: "Defense",
    rarity: "Epic",
  },
  {
    id: "khafru-the-deathkeeper",
    name: "Khafru the Deathkeeper",
    role: "HP",
    rarity: "Epic",
  },
  {
    id: "ostrox-boneglaive",
    name: "Ostrox Boneglaive",
    role: "Attack",
    rarity: "Epic",
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
