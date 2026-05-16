import type { PostBodyBlock } from "./postBody";

export type PostDraftItem = {
  id: string;
  title: string;
  caption?: string;
  blocks: PostBodyBlock[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "tanne-post-drafts-v1";
const SEEDED_DRAFTS_KEY = "tanne-post-draft-seeds-v1";

function isPostBodyBlock(value: unknown): value is PostBodyBlock {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (item.type === "text") return typeof item.text === "string";
  return (
    item.type === "image" &&
    typeof item.url === "string" &&
    (item.align === "full" || item.align === "center" || item.align === "left" || item.align === "right") &&
    (item.caption === undefined || typeof item.caption === "string")
  );
}

function isPostDraftItem(value: unknown): value is PostDraftItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    (item.caption === undefined || typeof item.caption === "string") &&
    Array.isArray(item.blocks) &&
    item.blocks.every(isPostBodyBlock) &&
    typeof item.createdAt === "number" &&
    typeof item.updatedAt === "number"
  );
}

export function getPostDrafts(): PostDraftItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPostDraftItem).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function savePostDrafts(drafts: PostDraftItem[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...drafts].sort((a, b) => b.updatedAt - a.updatedAt)),
  );
}

export function upsertPostDraft(input: {
  id?: string;
  title: string;
  caption?: string;
  blocks: PostBodyBlock[];
}): PostDraftItem {
  const now = Date.now();
  const drafts = getPostDrafts();
  const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined;
  const next: PostDraftItem = {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    title: input.title,
    caption: input.caption,
    blocks: input.blocks,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  savePostDrafts([next, ...drafts.filter((draft) => draft.id !== next.id)]);
  return next;
}

export function deletePostDraft(id: string): void {
  savePostDrafts(getPostDrafts().filter((draft) => draft.id !== id));
}

export function seedPostDraftOnce(input: {
  id: string;
  title: string;
  caption?: string;
  blocks: PostBodyBlock[];
}): void {
  try {
    const seeded = JSON.parse(localStorage.getItem(SEEDED_DRAFTS_KEY) || "[]") as unknown;
    const seededIds = Array.isArray(seeded)
      ? seeded.filter((item): item is string => typeof item === "string")
      : [];
    if (seededIds.includes(input.id)) return;

    if (!getPostDrafts().some((draft) => draft.id === input.id)) {
      upsertPostDraft(input);
    }
    localStorage.setItem(SEEDED_DRAFTS_KEY, JSON.stringify([...seededIds, input.id]));
  } catch {
    if (!getPostDrafts().some((draft) => draft.id === input.id)) {
      upsertPostDraft(input);
    }
  }
}
