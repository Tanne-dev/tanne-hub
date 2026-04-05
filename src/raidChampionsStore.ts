import { RAID_CHAMPION_CATALOG, type RaidChampion, type RaidChampionRarity } from "./raidChampionCatalog";
import { isSupabaseReady, supabaseClient } from "./supabase";

export type RaidChampionRow = {
  hellhades_id: string;
  name: string;
  faction: string | null;
  hellhades_url: string | null;
  rarity: string | null;
  role: string | null;
};

const VALID_RARITIES = new Set<string>([
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
  "Mythic",
  "Mythical",
]);

function mapDbRarity(s: string | null | undefined): RaidChampionRarity {
  const v = (s ?? "").trim();
  if (VALID_RARITIES.has(v)) return v as RaidChampionRarity;
  return "Rare";
}

/** ATK / DEF / HP / Supp từ HellHades API v3 */
function mapDbRole(s: string | null | undefined): RaidChampion["role"] {
  const v = (s ?? "").trim();
  if (v === "ATK") return "Attack";
  if (v === "DEF") return "Defense";
  if (v === "HP") return "HP";
  if (v === "Supp") return "Support";
  return "Support";
}

function rowToRaidChampion(row: RaidChampionRow): RaidChampion {
  return {
    id: row.hellhades_id,
    name: row.name,
    role: mapDbRole(row.role),
    rarity: mapDbRarity(row.rarity),
    faction: row.faction ?? undefined,
    hellhadesUrl: row.hellhades_url?.trim() ? row.hellhades_url.trim() : undefined,
  };
}

const SELECT_LIST = "hellhades_id, name, faction, hellhades_url, rarity, role";

/** Supabase/PostgREST thường giới hạn ~1000 dòng mỗi request — phải phân trang. */
const PAGE_SIZE = 1000;

async function fetchAllRaidChampionRows(): Promise<{ rows: RaidChampionRow[]; error: string | null }> {
  const rows: RaidChampionRow[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabaseClient!
      .from("raid_champions")
      .select(SELECT_LIST)
      .order("name", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) return { rows: [], error: error.message };
    const batch = (data ?? []) as RaidChampionRow[];
    if (batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return { rows, error: null };
}

/**
 * Tải catalog champion từ Supabase (`raid_champions`).
 * Nếu chưa có bảng/dữ liệu hoặc lỗi → fallback `RAID_CHAMPION_CATALOG` trong repo.
 */
export async function loadRaidChampionCatalogFromSupabase(): Promise<RaidChampion[]> {
  if (!isSupabaseReady() || !supabaseClient) {
    return [...RAID_CHAMPION_CATALOG];
  }

  const { rows, error } = await fetchAllRaidChampionRows();

  if (error) {
    console.warn("[raid_champions]", error);
    return [...RAID_CHAMPION_CATALOG];
  }
  if (rows.length === 0) {
    return [...RAID_CHAMPION_CATALOG];
  }

  return rows.map(rowToRaidChampion);
}
