import { isSupabaseReady, supabaseClient } from "./supabase";

export type PostItem = {
  id: string;
  title: string;
  caption?: string;
  content: string;
  imageUrl?: string;
  imagePosition?: "top" | "left" | "right";
  ownerId?: string;
  authorEmail: string;
  createdAt: number;
};

const POSTS_KEY = "tanne-posts";
let postsCache: PostItem[] | null = null;

type PostRow = {
  id: string;
  title: string;
  caption: string | null;
  content: string;
  image_url: string | null;
  image_position: "top" | "left" | "right" | null;
  owner_id: string | null;
  author_email: string;
  created_at: string;
};

function mapRowToPost(row: PostRow): PostItem {
  return {
    id: row.id,
    title: row.title,
    caption: row.caption ?? undefined,
    content: row.content,
    imageUrl: row.image_url ?? undefined,
    imagePosition: row.image_position ?? "top",
    ownerId: row.owner_id ?? undefined,
    authorEmail: row.author_email,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function sanitizePosts(items: PostItem[]): PostItem[] {
  return items
    .filter((item) => item && typeof item.id === "string")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getPosts(): PostItem[] {
  if (postsCache) return [...postsCache];
  const raw = localStorage.getItem(POSTS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PostItem[];
    if (!Array.isArray(parsed)) return [];
    postsCache = sanitizePosts(parsed);
    return [...postsCache];
  } catch {
    return [];
  }
}

export function savePosts(posts: PostItem[]): void {
  const safePosts = sanitizePosts(posts);
  postsCache = safePosts;
  localStorage.setItem(POSTS_KEY, JSON.stringify(safePosts));
}

export function removeLegacySeedPosts(): void {
  const posts = getPosts();
  const next = posts.filter((item) => !item.id.startsWith("seed-"));
  if (next.length !== posts.length) {
    savePosts(next);
  }
}

function rowFromPost(post: PostItem): Record<string, unknown> {
  return {
    id: post.id,
    title: post.title,
    caption: post.caption ?? null,
    content: post.content,
    image_url: post.imageUrl ?? null,
    image_position: post.imagePosition ?? "top",
    owner_id: post.ownerId ?? null,
    author_email: post.authorEmail,
    created_at: new Date(post.createdAt).toISOString(),
  };
}

export async function syncPostsFromRemote(): Promise<void> {
  if (!isSupabaseReady() || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !Array.isArray(data)) return;

  savePosts((data as PostRow[]).map(mapRowToPost));
}

export async function getPostByIdRemote(postId: string): Promise<PostItem | null> {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();
  if (error || !data) return null;
  return mapRowToPost(data as PostRow);
}

export async function createPostRemote(
  post: PostItem,
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabaseClient.from("posts").insert(rowFromPost(post));
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updatePostRemote(
  postId: string,
  patch: {
    title: string;
    caption?: string;
    content: string;
    imageUrl?: string;
    imagePosition?: "top" | "left" | "right";
  },
): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabaseClient
    .from("posts")
    .update({
      title: patch.title,
      caption: patch.caption ?? null,
      content: patch.content,
      image_url: patch.imageUrl ?? null,
      image_position: patch.imagePosition ?? "top",
    })
    .eq("id", postId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deletePostRemote(postId: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseClient) return { ok: false, error: "Supabase is not configured." };
  const { error } = await supabaseClient.from("posts").delete().eq("id", postId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
