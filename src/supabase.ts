import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const postImagesBucket = import.meta.env.VITE_SUPABASE_POST_IMAGES_BUCKET || "post-images";

export const supabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseReady(): boolean {
  return supabaseClient !== null;
}

export type RemoteSession = {
  userId: string;
  email: string;
  role: "member" | "admin";
  displayName?: string;
};

export type UserProfile = {
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isAdmin: boolean;
};

async function resolveRole(userId: string): Promise<"member" | "admin"> {
  if (!supabaseClient) return "member";
  const { data, error } = await supabaseClient
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return "member";
  return "admin";
}

function guessDisplayName(email: string): string {
  return email.split("@")[0] ?? email;
}

export async function upsertUserProfileRemote(
  userId: string,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const role = await resolveRole(userId);
  const { error } = await supabaseClient.from("profiles").upsert(
    {
      user_id: userId,
      email,
      display_name: guessDisplayName(email),
      is_admin: role === "admin",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getUserProfileRemote(userId: string): Promise<UserProfile | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("user_id, email, display_name, avatar_url, is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    userId: data.user_id,
    email: data.email,
    displayName: data.display_name ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    isAdmin: Boolean(data.is_admin),
  };
}

export async function registerMemberRemote(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) {
    return {
      ok: false,
      error: "Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    };
  }
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (!error && data.user?.id && data.user.email) {
    await upsertUserProfileRemote(data.user.id, data.user.email);
  }
  if (!error) return { ok: true };
  return { ok: false, error: error.message };
}

export async function authenticateMemberRemote(
  email: string,
  password: string,
): Promise<{ ok: boolean; session?: RemoteSession; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error || !data.user?.email) return { ok: false, error: error?.message ?? "Invalid login." };
  await upsertUserProfileRemote(data.user.id, data.user.email);
  const profile = await getUserProfileRemote(data.user.id);
  const role = await resolveRole(data.user.id);
  return {
    ok: true,
    session: {
      userId: data.user.id,
      email: data.user.email,
      role,
      displayName: profile?.displayName,
    },
  };
}

export async function getCurrentMemberRemote(): Promise<RemoteSession | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient.auth.getUser();
  if (error || !data.user?.email) return null;
  await upsertUserProfileRemote(data.user.id, data.user.email);
  const profile = await getUserProfileRemote(data.user.id);
  const role = await resolveRole(data.user.id);
  return {
    userId: data.user.id,
    email: data.user.email,
    role,
    displayName: profile?.displayName,
  };
}

export async function signOutRemote(): Promise<void> {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

export async function uploadPostImageRemote(
  file: File,
  userId: string,
): Promise<{ ok: boolean; imageUrl?: string; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };

  const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "jpg";
  const safeExt = ext && /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const filePath = `${userId}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabaseClient.storage
    .from(postImagesBucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    const raw = uploadError.message;
    if (/bucket not found/i.test(raw)) {
      return {
        ok: false,
        error: `Storage bucket "${postImagesBucket}" was not found. In Supabase go to Storage -> New bucket, create it with the exact same name "${postImagesBucket}" (set Public if you need public URLs), and add policies that allow authenticated uploads. Or update VITE_SUPABASE_POST_IMAGES_BUCKET in .env to match your real bucket name.`,
      };
    }
    return { ok: false, error: raw };
  }

  const { data } = supabaseClient.storage.from(postImagesBucket).getPublicUrl(filePath);
  if (!data?.publicUrl) return { ok: false, error: "Cannot resolve uploaded image URL." };

  return { ok: true, imageUrl: data.publicUrl };
}
