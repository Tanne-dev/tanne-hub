import {
  accountStockList,
  type AccountHeroPreview,
  type AccountStockCard,
} from "./content";
import { isSupabaseReady, supabaseClient } from "./supabase";

const RAID_ACCOUNTS_KEY = "tanne-raid-selling-accounts";
let accountsCache: AccountStockCard[] | null = null;

type RaidAccountRow = {
  id: string;
  stats: AccountStockCard["stats"] | null;
  heroes: AccountHeroPreview[] | null;
  more_count: number | null;
  price_label: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

type StatsWithMeta = AccountStockCard["stats"] & {
  __note?: string;
  __description?: string;
  __detailImages?: string[];
};

function validHeroRarity(v: unknown): v is AccountHeroPreview["rarity"] {
  return (
    v === "mythic" ||
    v === "mythical" ||
    v === "legendary" ||
    v === "epic" ||
    v === "rare" ||
    v === "common" ||
    v === "uncommon"
  );
}

function sanitizeHero(h: unknown): AccountHeroPreview | null {
  if (!h || typeof h !== "object") return null;
  const o = h as Record<string, unknown>;
  if (typeof o.name !== "string" || !validHeroRarity(o.rarity)) return null;
  return {
    name: o.name,
    rarity: o.rarity,
    initials: typeof o.initials === "string" ? o.initials : undefined,
  };
}

function emptyStats(): AccountStockCard["stats"] {
  return {
    energy: "",
    silver: "",
    gems: "",
    mythicSkill: "",
    ancientShards: "",
    voidShards: "",
    primalShards: "",
    sacredShards: "",
    redBooks: "",
    blueBooks: "",
  };
}

function readStatString(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  return typeof v === "string" ? v.trim() : "";
}

/** Stats có thể bỏ trống — chỉ hiển thị trên site khi có giá trị. */
function sanitizeStats(v: unknown): AccountStockCard["stats"] {
  if (!v || typeof v !== "object") return emptyStats();
  const o = v as Record<string, unknown>;
  const mythicSkill = readStatString(o, "mythicSkill");
  const legacyBooks = readStatString(o, "books");
  const redBooks = readStatString(o, "redBooks") || legacyBooks;
  const blueBooks = readStatString(o, "blueBooks");
  return {
    energy: readStatString(o, "energy"),
    silver: readStatString(o, "silver"),
    gems: readStatString(o, "gems"),
    mythicSkill,
    ancientShards: readStatString(o, "ancientShards"),
    voidShards: readStatString(o, "voidShards"),
    primalShards: readStatString(o, "primalShards"),
    sacredShards: readStatString(o, "sacredShards"),
    redBooks,
    blueBooks,
  };
}

function sanitizeAccounts(items: AccountStockCard[]): AccountStockCard[] {
  return items
    .map((item) => sanitizeAccountLike(item))
    .filter((item): item is AccountStockCard => Boolean(item));
}

function sanitizeAccountLike(item: unknown): AccountStockCard | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  if (typeof o.id !== "string" || o.id.trim() === "") return null;

  const stats = sanitizeStats(o.stats);

  const heroesRaw = Array.isArray(o.heroes) ? o.heroes : [];
  const heroes = heroesRaw.map(sanitizeHero).filter((x): x is AccountHeroPreview => Boolean(x));

  const moreCountRaw = typeof o.moreCount === "number" ? o.moreCount : 0;
  const priceLabel = typeof o.priceLabel === "string" ? o.priceLabel : "";
  const note = typeof o.note === "string" ? o.note : undefined;
  const description = typeof o.description === "string" ? o.description : undefined;
  const detailImages = Array.isArray(o.detailImages)
    ? o.detailImages.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];

  return {
    id: o.id,
    stats,
    note,
    description,
    detailImages,
    heroes,
    moreCount: Math.max(0, moreCountRaw),
    priceLabel,
  };
}

function mapRowToAccount(row: RaidAccountRow): AccountStockCard | null {
  const stats = sanitizeStats(row.stats);
  if (!row.id || !row.price_label) return null;
  const rawStats = (row.stats ?? {}) as Record<string, unknown>;
  const noteRaw = typeof rawStats.__note === "string" ? rawStats.__note.trim() : "";
  const note = noteRaw.length > 0 ? noteRaw : undefined;
  const description =
    typeof rawStats.__description === "string" ? rawStats.__description : undefined;
  const detailImages = Array.isArray(rawStats.__detailImages)
    ? rawStats.__detailImages.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];
  const heroesRaw = Array.isArray(row.heroes) ? row.heroes : [];
  const heroes = heroesRaw.map(sanitizeHero).filter((x): x is AccountHeroPreview => Boolean(x));
  return {
    id: row.id,
    stats,
    note,
    description,
    detailImages,
    heroes,
    moreCount: Math.max(0, row.more_count ?? 0),
    priceLabel: row.price_label,
  };
}

function readLocal(): AccountStockCard[] {
  const raw = localStorage.getItem(RAID_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => sanitizeAccountLike(x))
      .filter((x): x is AccountStockCard => Boolean(x));
  } catch {
    return [];
  }
}

export function getSellingAccounts(): AccountStockCard[] {
  if (accountsCache) return [...accountsCache];
  const local = readLocal();
  if (local.length > 0) {
    accountsCache = local;
    return [...accountsCache];
  }
  accountsCache = sanitizeAccounts(accountStockList);
  return [...accountsCache];
}

export function saveSellingAccounts(accounts: AccountStockCard[]): void {
  const safe = sanitizeAccounts(accounts);
  accountsCache = safe;
  localStorage.setItem(RAID_ACCOUNTS_KEY, JSON.stringify(safe));
}

function rowFromAccount(account: AccountStockCard): Record<string, unknown> {
  const statsPayload: StatsWithMeta = {
    ...account.stats,
    __note: account.note?.trim() ?? "",
    __description: account.description,
    __detailImages: account.detailImages ?? [],
  };
  return {
    id: account.id,
    stats: statsPayload,
    heroes: account.heroes,
    more_count: 0,
    price_label: account.priceLabel,
    is_active: true,
  };
}

export async function syncSellingAccountsFromRemote(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabaseClient) return { ok: true };

  const { data, error } = await supabaseClient
    .from("raid_accounts")
    .select("id, stats, heroes, more_count, price_label, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  if (!Array.isArray(data)) return { ok: true };
  const mapped = (data as RaidAccountRow[])
    .map(mapRowToAccount)
    .filter((x): x is AccountStockCard => Boolean(x));
  saveSellingAccounts(mapped);
  return { ok: true };
}

export async function upsertSellingAccountRemote(
  account: AccountStockCard,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabaseClient
    .from("raid_accounts")
    .upsert(rowFromAccount(account), { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSellingAccountRemote(
  accountId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabaseClient
    .from("raid_accounts")
    .update({ is_active: false })
    .eq("id", accountId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
