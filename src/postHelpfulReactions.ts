import { escapeHtml } from "./postBody";
import { getMemberSession, openMemberRegisterPrompt } from "./login";

type HelpfulState = {
  counts: Record<string, number>;
  likedIds: string[];
};

const STORAGE_KEY = "tanne-post-helpful-reactions-v1";
const MIN_BASE_LIKES = 45;
const MAX_BASE_LIKES = 70;

function readState(): HelpfulState {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Partial<HelpfulState>;
    return {
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      likedIds: Array.isArray(parsed.likedIds)
        ? parsed.likedIds.filter((item): item is string => typeof item === "string")
        : [],
    };
  } catch {
    return { counts: {}, likedIds: [] };
  }
}

function saveState(state: HelpfulState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function helpfulLabel(count: number): string {
  if (count <= 0) return "0 likes";
  if (count === 1) return "1 like";
  return `${count} likes`;
}

function baseLikeCount(postId: string): number {
  let hash = 0;
  for (let i = 0; i < postId.length; i += 1) {
    hash = (hash * 31 + postId.charCodeAt(i)) >>> 0;
  }
  return MIN_BASE_LIKES + (hash % (MAX_BASE_LIKES - MIN_BASE_LIKES + 1));
}

function displayCount(postId: string, state: HelpfulState): number {
  return baseLikeCount(postId) + (state.counts[postId] ?? 0);
}

function renderThumbIcon(active: boolean): string {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 10v10" />
      <path d="M15 5.5 14 10h5.2a2 2 0 0 1 2 2.35l-1.2 6.5A2.5 2.5 0 0 1 17.6 21H9.5A2.5 2.5 0 0 1 7 18.5v-7.2c0-.7.3-1.35.8-1.8l4.6-4.6a1.55 1.55 0 0 1 2.6.6Z" ${active ? 'fill="currentColor" opacity="0.28"' : ""}/>
    </svg>`;
}

export function renderHelpfulButton(postId: string, options: { compact?: boolean } = {}): string {
  const state = readState();
  const liked = state.likedIds.includes(postId);
  const count = displayCount(postId, state);
  const compact = options.compact === true;
  const label = "Like";
  const countText = helpfulLabel(count);
  const classes = liked
    ? "border-[#1877f2]/70 bg-[#1877f2] text-white shadow-[0_8px_20px_rgba(24,119,242,0.28)]"
    : "border-[#1877f2]/45 bg-[#1877f2]/12 text-[#8ec5ff] hover:border-[#1877f2]/70 hover:bg-[#1877f2]/20 hover:text-[#cfe6ff]";

  return `
    <button
      type="button"
      data-post-helpful-id="${escapeHtml(postId)}"
      aria-pressed="${liked ? "true" : "false"}"
      title="${liked ? "You liked this article" : "Like this article"}"
      class="post-helpful-button inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${classes}"
    >
      ${renderThumbIcon(liked)}
      <span data-post-helpful-label>${compact ? label : `${label} · ${countText}`}</span>
      ${compact ? `<span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]" data-post-helpful-count>${count}</span>` : ""}
    </button>`;
}

function refreshHelpfulButtons(postId: string): void {
  const state = readState();
  const liked = state.likedIds.includes(postId);
  const count = displayCount(postId, state);
  for (const button of document.querySelectorAll<HTMLButtonElement>(`[data-post-helpful-id="${CSS.escape(postId)}"]`)) {
    const compact = Boolean(button.querySelector("[data-post-helpful-count]"));
    button.setAttribute("aria-pressed", liked ? "true" : "false");
    button.title = liked ? "You liked this article" : "Like this article";
    button.className = `post-helpful-button inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
      liked
        ? "border-[#1877f2]/70 bg-[#1877f2] text-white shadow-[0_8px_20px_rgba(24,119,242,0.28)]"
        : "border-[#1877f2]/45 bg-[#1877f2]/12 text-[#8ec5ff] hover:border-[#1877f2]/70 hover:bg-[#1877f2]/20 hover:text-[#cfe6ff]"
    }`;
    button.innerHTML = `
      ${renderThumbIcon(liked)}
      <span data-post-helpful-label>${compact ? "Like" : `Like · ${helpfulLabel(count)}`}</span>
      ${compact ? `<span class="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]" data-post-helpful-count>${count}</span>` : ""}
    `;
  }
}

export function bindHelpfulReactionButtons(): void {
  if (document.documentElement.dataset.helpfulReactionsBound === "1") return;
  document.documentElement.dataset.helpfulReactionsBound = "1";

  document.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-post-helpful-id]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const postId = button.getAttribute("data-post-helpful-id");
    if (!postId) return;

    if (!getMemberSession()) {
      openMemberRegisterPrompt("Create a free member account to like articles.");
      return;
    }

    const state = readState();
    const liked = state.likedIds.includes(postId);
    const current = state.counts[postId] ?? 0;
    if (liked) {
      state.likedIds = state.likedIds.filter((id) => id !== postId);
      state.counts[postId] = Math.max(0, current - 1);
    } else {
      state.likedIds = [...state.likedIds, postId];
      state.counts[postId] = current + 1;
    }
    saveState(state);
    refreshHelpfulButtons(postId);
  });
}
