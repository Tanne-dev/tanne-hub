/** Ghi chú nội bộ cho tài khoản game (localStorage, chưa gắn Supabase). */

const RAID_KEY = "tanne-admin-raid-account-notes";
const EPIC_KEY = "tanne-admin-epic-account-notes";
const RAID_SELECTED_CHAMPION_IDS_KEY = "tanne-admin-raid-selected-champion-ids";

export function getRaidAccountNotes(): string {
  return localStorage.getItem(RAID_KEY) ?? "";
}

export function saveRaidAccountNotes(text: string): void {
  localStorage.setItem(RAID_KEY, text);
}

export function getEpicSevenAccountNotes(): string {
  return localStorage.getItem(EPIC_KEY) ?? "";
}

export function saveEpicSevenAccountNotes(text: string): void {
  localStorage.setItem(EPIC_KEY, text);
}

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
