import { isSupabaseReady, supabaseClient } from "./supabase";

export type LegitReview = {
  id: string;
  displayName: string;
  rating: number;
  message: string;
  orderRef?: string;
  createdAt: number;
};

const LEGIT_REVIEWS_KEY = "tanne-legit-reviews";

const DEFAULT_REVIEWS: LegitReview[] = [
  {
    id: "seed-alex",
    displayName: "Alex T.",
    rating: 5,
    message: "Fast delivery, clear account details, and friendly support from start to finish.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "seed-minh",
    displayName: "Minh P.",
    rating: 5,
    message: "Everything matched the listing. The process felt safe and easy to follow.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];

type LegitReviewRow = {
  id: string;
  display_name: string;
  rating: number;
  message: string;
  order_ref: string | null;
  created_at: string;
};

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function sanitizeReview(item: LegitReview): LegitReview {
  return {
    id: item.id,
    displayName: item.displayName.trim().slice(0, 48) || "Verified buyer",
    rating: clampRating(item.rating),
    message: item.message.trim().slice(0, 260),
    orderRef: item.orderRef?.trim().slice(0, 60) || undefined,
    createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
  };
}

function mapRowToReview(row: LegitReviewRow): LegitReview {
  return sanitizeReview({
    id: row.id,
    displayName: row.display_name,
    rating: row.rating,
    message: row.message,
    orderRef: row.order_ref ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  });
}

function sortReviews(items: LegitReview[]): LegitReview[] {
  return items
    .map(sanitizeReview)
    .filter((item) => item.message.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getLegitReviews(): LegitReview[] {
  const raw = localStorage.getItem(LEGIT_REVIEWS_KEY);
  if (!raw) return [...DEFAULT_REVIEWS];
  try {
    const parsed = JSON.parse(raw) as LegitReview[];
    if (!Array.isArray(parsed)) return [...DEFAULT_REVIEWS];
    return sortReviews(parsed);
  } catch {
    return [...DEFAULT_REVIEWS];
  }
}

export function saveLegitReviews(items: LegitReview[]): void {
  localStorage.setItem(LEGIT_REVIEWS_KEY, JSON.stringify(sortReviews(items)));
}

export async function syncLegitReviewsFromRemote(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabaseClient) return { ok: true };

  const { data, error } = await supabaseClient
    .from("legit_reviews")
    .select("id, display_name, rating, message, order_ref, created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) return { ok: false, error: error.message };
  if (!Array.isArray(data)) return { ok: false, error: "Unexpected review payload." };
  const remoteReviews = (data as LegitReviewRow[]).map(mapRowToReview);
  if (remoteReviews.length > 0) saveLegitReviews(remoteReviews);
  return { ok: true };
}

export async function createLegitReviewRemote(
  review: Omit<LegitReview, "id" | "createdAt">,
): Promise<{ ok: boolean; review?: LegitReview; error?: string }> {
  const localReview = sanitizeReview({
    ...review,
    id: `local-${Date.now()}`,
    createdAt: Date.now(),
  });

  if (!supabaseClient) {
    saveLegitReviews([localReview, ...getLegitReviews()]);
    return { ok: true, review: localReview };
  }

  const { data, error } = await supabaseClient
    .from("legit_reviews")
    .insert({
      display_name: localReview.displayName,
      rating: localReview.rating,
      message: localReview.message,
      order_ref: localReview.orderRef ?? null,
      is_visible: true,
    })
    .select("id, display_name, rating, message, order_ref, created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  const saved = mapRowToReview(data as LegitReviewRow);
  saveLegitReviews([saved, ...getLegitReviews()]);
  return { ok: true, review: saved };
}
