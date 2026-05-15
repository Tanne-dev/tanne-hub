const RAID_SELECTED_CHAMPION_IDS_KEY = "tanne-admin-raid-selected-champion-ids";

export function getRaidSelectedChampionIds(): string[] {
  const raw = localStorage.getItem(RAID_SELECTED_CHAMPION_IDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveRaidSelectedChampionIds(ids: string[]): void {
  localStorage.setItem(RAID_SELECTED_CHAMPION_IDS_KEY, JSON.stringify(ids));
}
