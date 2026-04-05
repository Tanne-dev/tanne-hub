export type AccountHeroPreview = {
  name: string;
  /** Màu tên theo tier (legendary cam, epic tím, …) */
  rarity:
    | "legendary"
    | "epic"
    | "rare"
    | "mythic"
    | "mythical"
    | "common"
    | "uncommon";
  initials?: string;
};

const HERO_RARITY_RANK: Record<AccountHeroPreview["rarity"], number> = {
  mythic: 0,
  mythical: 0,
  legendary: 1,
  epic: 2,
  rare: 3,
  uncommon: 4,
  common: 5,
};

/** Tag tổng hợp tier — luôn xếp cuối cùng trong đúng bậc (legendary / epic). */
export const ACCOUNT_HERO_MORE_LEGENDARY_LABEL = "More legendary champions";
export const ACCOUNT_HERO_MORE_EPIC_LABEL = "More epic champions";

const MORE_TIER_FOOTER_NAMES_LOWER = new Set([
  ACCOUNT_HERO_MORE_LEGENDARY_LABEL.toLowerCase(),
  "more legendary champion",
  ACCOUNT_HERO_MORE_EPIC_LABEL.toLowerCase(),
  "more epic champion",
]);

function isAccountHeroMoreTierFooter(h: AccountHeroPreview): boolean {
  return MORE_TIER_FOOTER_NAMES_LOWER.has(h.name.trim().toLowerCase());
}

/** Mythic → Legendary → Epic → …; cùng tier: tên A→Z, riêng dòng “More … champions” luôn cuối tier. */
export function sortHeroesByRarity(heroes: AccountHeroPreview[]): AccountHeroPreview[] {
  return [...heroes].sort((a, b) => {
    const d = HERO_RARITY_RANK[a.rarity] - HERO_RARITY_RANK[b.rarity];
    if (d !== 0) return d;
    const aFooter = isAccountHeroMoreTierFooter(a);
    const bFooter = isAccountHeroMoreTierFooter(b);
    if (aFooter && !bFooter) return 1;
    if (!aFooter && bFooter) return -1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export type AccountStockCard = {
  id: string;
  stats: {
    energy: string;
    silver: string;
    gems: string;
    mythicSkill: string;
    ancientShards: string;
    voidShards: string;
    primalShards: string;
    sacredShards: string;
    redBooks: string;
    blueBooks: string;
  };
  note?: string;
  description?: string;
  detailImages?: string[];
  heroes: AccountHeroPreview[];
  /** Luôn 0 — cột DB giữ tương thích; không còn dùng trên UI */
  moreCount: number;
  priceLabel: string;
};

/** Giá trị stat để hiển thị chip / ô trong drawer (bỏ qua nếu rỗng). */
export function isAccountStatFilled(value: string): boolean {
  return typeof value === "string" && value.trim() !== "";
}

/** Dữ liệu mẫu — sau này có thể thay bằng API / Supabase */
export const accountStockList: AccountStockCard[] = [
  {
    id: "6B64F8M",
    stats: {
      energy: "94K",
      silver: "64M",
      gems: "8065",
      mythicSkill: "13",
      ancientShards: "7",
      voidShards: "0",
      primalShards: "2",
      sacredShards: "1",
      redBooks: "34",
      blueBooks: "75",
    },
    description: "Stable dungeon farming profile with strong shard and upgrade resources.",
    detailImages: [],
    heroes: [
      { name: "Visix the Unbowed", rarity: "epic", initials: "VX" },
      { name: "Aleksandr the Sharpshooter", rarity: "legendary", initials: "AS" },
      { name: "Geomancer", rarity: "epic", initials: "GM" },
      { name: "Deacon Armstrong", rarity: "rare", initials: "DA" },
      { name: "Coldheart", rarity: "rare", initials: "CH" },
      { name: "Royal Guard", rarity: "epic", initials: "RG" },
    ],
    moreCount: 0,
    priceLabel: "$109.99 USD",
  },
  {
    id: "9K2PL4Q",
    stats: {
      energy: "112K",
      silver: "48M",
      gems: "12040",
      mythicSkill: "22",
      ancientShards: "18",
      voidShards: "0",
      primalShards: "5",
      sacredShards: "3",
      redBooks: "25",
      blueBooks: "61",
    },
    description: "Has multiple sustain and debuff champions for long-term team scaling.",
    detailImages: [],
    heroes: [
      { name: "Krisk the Ageless", rarity: "legendary", initials: "KR" },
      { name: "Warlord", rarity: "legendary", initials: "WL" },
      { name: "Scyl of the Drakes", rarity: "legendary", initials: "SD" },
      { name: "Doompriest", rarity: "epic", initials: "DP" },
      { name: "Frozen Banshee", rarity: "rare", initials: "FB" },
      { name: "Apothecary", rarity: "rare", initials: "AP" },
    ],
    moreCount: 0,
    priceLabel: "$189.00 USD",
  },
  {
    id: "3F88RN1",
    stats: {
      energy: "78K",
      silver: "91M",
      gems: "4520",
      mythicSkill: "8",
      ancientShards: "4",
      voidShards: "0",
      primalShards: "1",
      sacredShards: "0",
      redBooks: "18",
      blueBooks: "36",
    },
    description: "Great for new players who want a strong champion foundation to progress quickly.",
    detailImages: [],
    heroes: [
      { name: "Ninja", rarity: "legendary", initials: "NJ" },
      { name: "Duchess Lilitu", rarity: "legendary", initials: "DL" },
      { name: "Stag Knight", rarity: "epic", initials: "SK" },
      { name: "Spider", rarity: "epic", initials: "SP" },
      { name: "Armiger", rarity: "rare", initials: "AR" },
    ],
    moreCount: 0,
    priceLabel: "$79.50 USD",
  },
  {
    id: "7HQQM92",
    stats: {
      energy: "156K",
      silver: "120M",
      gems: "15400",
      mythicSkill: "31",
      ancientShards: "26",
      voidShards: "0",
      primalShards: "9",
      sacredShards: "6",
      redBooks: "46",
      blueBooks: "96",
    },
    description: "Includes multiple late-game champions suitable for Arena and Doom Tower progression.",
    detailImages: [],
    heroes: [
      { name: "Arbiter", rarity: "mythic", initials: "AB" },
      { name: "Cardiel", rarity: "legendary", initials: "CD" },
      { name: "Siphi the Lost Bride", rarity: "legendary", initials: "SB" },
      { name: "Brogni", rarity: "legendary", initials: "BR" },
      { name: "Rector Drath", rarity: "legendary", initials: "RD" },
      { name: "Demytha", rarity: "epic", initials: "DM" },
    ],
    moreCount: 0,
    priceLabel: "$299.00 USD",
  },
  {
    id: "1ZX4TT8",
    stats: {
      energy: "62K",
      silver: "35M",
      gems: "2890",
      mythicSkill: "5",
      ancientShards: "2",
      voidShards: "0",
      primalShards: "0",
      sacredShards: "0",
      redBooks: "9",
      blueBooks: "24",
    },
    description: "Low price with enough resources to build up gradually based on your needs.",
    detailImages: [],
    heroes: [
      { name: "Kael", rarity: "rare", initials: "KA" },
      { name: "Athel", rarity: "rare", initials: "AT" },
      { name: "Galek", rarity: "rare", initials: "GA" },
      { name: "Elhain", rarity: "rare", initials: "EL" },
      { name: "Tallia", rarity: "epic", initials: "TA" },
    ],
    moreCount: 0,
    priceLabel: "$39.00 USD",
  },
  {
    id: "4PP09WW",
    stats: {
      energy: "101K",
      silver: "72M",
      gems: "6780",
      mythicSkill: "19",
      ancientShards: "11",
      voidShards: "0",
      primalShards: "3",
      sacredShards: "2",
      redBooks: "28",
      blueBooks: "69",
    },
    description: "Playable across multiple modes: dungeon, clan boss, and arena with flexible teams.",
    detailImages: [],
    heroes: [
      { name: "Helicath", rarity: "legendary", initials: "HC" },
      { name: "Michinaki", rarity: "legendary", initials: "MC" },
      { name: "Vogoth", rarity: "epic", initials: "VG" },
      { name: "Miscreated Monster", rarity: "epic", initials: "MM" },
      { name: "Reliquary Tender", rarity: "rare", initials: "RT" },
      { name: "Pain Keeper", rarity: "rare", initials: "PK" },
    ],
    moreCount: 0,
    priceLabel: "$139.00 USD",
  },
];

/** Cột link chân trang — mỗi mảng con là một cột (cùng chủ đề), tránh grid 1-link-1-ô bị lệch hàng. */
export const footerLinkColumns: { href: string; label: string }[][] = [
  [
    { href: "#", label: "Help Center" },
    { href: "#", label: "Cookie Policy" },
  ],
  [
    { href: "#", label: "Sell" },
    { href: "#", label: "Privacy Policy" },
  ],
  [
    { href: "#", label: "Contact Us" },
    { href: "#", label: "Careers" },
  ],
];
