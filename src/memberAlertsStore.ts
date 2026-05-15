import { getMemberSession } from "./login";
import { isSupabaseReady, supabaseClient } from "./supabase";

export type MemberAlertPreferences = {
  notifyPromoCodes: boolean;
  notifyPosts: boolean;
};

const MEMBER_ALERTS_KEY = "tanne-member-alert-preferences";

const DEFAULT_PREFS: MemberAlertPreferences = {
  notifyPromoCodes: false,
  notifyPosts: false,
};

type MemberAlertRow = {
  notify_promo_codes: boolean;
  notify_posts: boolean;
};

export function getMemberAlertPreferences(): MemberAlertPreferences {
  const raw = localStorage.getItem(MEMBER_ALERTS_KEY);
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<MemberAlertPreferences>;
    return {
      notifyPromoCodes: parsed.notifyPromoCodes === true,
      notifyPosts: parsed.notifyPosts === true,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function saveMemberAlertPreferencesLocal(prefs: MemberAlertPreferences): void {
  localStorage.setItem(MEMBER_ALERTS_KEY, JSON.stringify(prefs));
}

export async function syncMemberAlertPreferencesFromRemote(): Promise<void> {
  const session = getMemberSession();
  if (!session || !isSupabaseReady() || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("member_alert_preferences")
    .select("notify_promo_codes, notify_posts")
    .eq("user_id", session.userId)
    .maybeSingle();
  if (error || !data) return;
  const row = data as MemberAlertRow;
  saveMemberAlertPreferencesLocal({
    notifyPromoCodes: row.notify_promo_codes === true,
    notifyPosts: row.notify_posts === true,
  });
}

export async function saveMemberAlertPreferences(
  prefs: MemberAlertPreferences,
): Promise<{ ok: boolean; error?: string }> {
  const session = getMemberSession();
  if (!session) return { ok: false, error: "Please log in or register as a member first." };

  saveMemberAlertPreferencesLocal(prefs);
  if (!supabaseClient) return { ok: true };

  const { error } = await supabaseClient.from("member_alert_preferences").upsert(
    {
      user_id: session.userId,
      email: session.email,
      notify_promo_codes: prefs.notifyPromoCodes,
      notify_posts: prefs.notifyPosts,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
