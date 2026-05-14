import { isSupabaseReady, supabaseClient } from "./supabase";

export type PromoCodeEntry = {
  code: string;
  reward: string;
  updatedAt?: string;
};

export type PromoCodeSettings = {
  isActive: boolean;
  code: string;
  reward: string;
  updatedAt?: string;
  history: PromoCodeEntry[];
};

const PROMO_CODE_STORAGE_KEY = "tanne-latest-promo-code";
const PROMO_SETTING_KEY = "latest_promo_code";

const DEFAULT_PROMO_CODE: PromoCodeSettings = {
  isActive: false,
  code: "",
  reward: "",
  history: [],
};

type AppSettingRow = {
  value: unknown;
};

function sanitizePromoCodeSettings(value: unknown): PromoCodeSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROMO_CODE };
  const item = value as Record<string, unknown>;
  const legacyCode = typeof item.code === "string" ? item.code.trim().toUpperCase() : "";
  const legacyReward =
    typeof item.reward === "string" && item.reward.trim()
      ? item.reward.trim()
      : typeof item.description === "string"
        ? item.description.trim()
        : DEFAULT_PROMO_CODE.reward;
  const legacyUpdatedAt =
    typeof item.updatedAt === "string" && item.updatedAt.trim()
      ? item.updatedAt.trim()
      : typeof item.expiresAt === "string" && item.expiresAt.trim()
        ? item.expiresAt.trim()
        : undefined;
  const history = Array.isArray(item.history)
    ? item.history
        .map((entry): PromoCodeEntry | null => {
          if (!entry || typeof entry !== "object") return null;
          const e = entry as Record<string, unknown>;
          const code = typeof e.code === "string" ? e.code.trim().toUpperCase() : "";
          if (!code) return null;
          return {
            code,
            reward: typeof e.reward === "string" ? e.reward.trim() : "",
            updatedAt:
              typeof e.updatedAt === "string" && e.updatedAt.trim()
                ? e.updatedAt.trim()
                : undefined,
          };
        })
        .filter((entry): entry is PromoCodeEntry => Boolean(entry))
    : [];
  const legacyHistory =
    history.length === 0 && legacyCode
      ? [{ code: legacyCode, reward: legacyReward, updatedAt: legacyUpdatedAt }]
      : history;

  return {
    isActive: item.isActive === true,
    code: legacyCode,
    reward: legacyReward,
    updatedAt: legacyUpdatedAt,
    history: legacyHistory,
  };
}

export function getPromoCodeSettings(): PromoCodeSettings {
  const raw = localStorage.getItem(PROMO_CODE_STORAGE_KEY);
  if (!raw) return { ...DEFAULT_PROMO_CODE };
  try {
    return sanitizePromoCodeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PROMO_CODE };
  }
}

export function savePromoCodeSettings(settings: PromoCodeSettings): void {
  localStorage.setItem(
    PROMO_CODE_STORAGE_KEY,
    JSON.stringify(sanitizePromoCodeSettings(settings)),
  );
}

export async function syncPromoCodeSettingsFromRemote(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabaseClient) return { ok: true };

  const { data, error } = await supabaseClient
    .from("app_settings")
    .select("value")
    .eq("key", PROMO_SETTING_KEY)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: true };
  savePromoCodeSettings(sanitizePromoCodeSettings((data as AppSettingRow).value));
  return { ok: true };
}

export async function savePromoCodeSettingsRemote(
  settings: PromoCodeSettings,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const safe = sanitizePromoCodeSettings(settings);
  savePromoCodeSettings(safe);

  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };

  const { error } = await supabaseClient.from("app_settings").upsert(
    {
      key: PROMO_SETTING_KEY,
      value: safe,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
