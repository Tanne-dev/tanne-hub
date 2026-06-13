import type { PostBodyBlock } from "./postBody";

export type PostDraftItem = {
  id: string;
  title: string;
  caption?: string;
  blocks: PostBodyBlock[];
  titleVi?: string;
  captionVi?: string;
  contentVi?: string;
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
    (item.titleVi === undefined || typeof item.titleVi === "string") &&
    (item.captionVi === undefined || typeof item.captionVi === "string") &&
    (item.contentVi === undefined || typeof item.contentVi === "string") &&
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
  titleVi?: string;
  captionVi?: string;
  contentVi?: string;
}): PostDraftItem {
  const now = Date.now();
  const drafts = getPostDrafts();
  const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined;
  const next: PostDraftItem = {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    title: input.title,
    caption: input.caption,
    blocks: input.blocks,
    titleVi: input.titleVi,
    captionVi: input.captionVi,
    contentVi: input.contentVi,
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
  titleVi?: string;
  captionVi?: string;
  contentVi?: string;
}): void {
  try {
    const seeded = JSON.parse(localStorage.getItem(SEEDED_DRAFTS_KEY) || "[]") as unknown;
    const seededIds = Array.isArray(seeded)
      ? seeded.filter((item): item is string => typeof item === "string")
      : [];
    const drafts = getPostDrafts();
    const existingDraft = drafts.find((draft) => draft.id === input.id);
    const draftExists = Boolean(existingDraft);
    const needsSeedTranslation = Boolean(
      existingDraft && input.contentVi && (!existingDraft.titleVi || !existingDraft.contentVi),
    );
    if (seededIds.includes(input.id) && draftExists && !needsSeedTranslation) return;

    if (!draftExists) {
      upsertPostDraft(input);
    } else if (needsSeedTranslation && existingDraft) {
      savePostDrafts(
        drafts.map((draft) =>
          draft.id === input.id
            ? {
                ...draft,
                titleVi: draft.titleVi || input.titleVi,
                captionVi: draft.captionVi || input.captionVi,
                contentVi: draft.contentVi || input.contentVi,
                updatedAt: Date.now(),
              }
            : draft,
        ),
      );
    }
    localStorage.setItem(SEEDED_DRAFTS_KEY, JSON.stringify([...seededIds, input.id]));
  } catch {
    if (!getPostDrafts().some((draft) => draft.id === input.id)) {
      upsertPostDraft(input);
    }
  }
}
