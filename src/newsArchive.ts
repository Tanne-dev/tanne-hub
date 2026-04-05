import {
  escapeHtml,
  getFirstImageUrlFromPost,
  postPlainBodyForPreview,
  postPlainTextForSearch,
} from "./postBody";
import { getPosts, syncPostsFromRemote, type PostItem } from "./postsStore";

const PAGE_SIZE = 12;

function toPreviewText(content: string, limit = 180): string {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trimEnd()}...`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function renderArchiveList(posts: PostItem[], page: number): void {
  const listEl = document.querySelector<HTMLElement>("#news-archive-list");
  const countEl = document.querySelector<HTMLElement>("#news-archive-count");
  const paginationEl = document.querySelector<HTMLElement>("#news-archive-pagination");
  if (!listEl || !countEl) return;

  countEl.textContent = `${posts.length} article${posts.length === 1 ? "" : "s"}`;
  if (posts.length === 0) {
    listEl.innerHTML =
      '<p class="rounded-lg border border-white/10 bg-black/10 px-4 py-3 text-sm text-[var(--panel-muted)]">No articles match your filters.</p>';
    if (paginationEl) paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pagedPosts = posts.slice(offset, offset + PAGE_SIZE);

  listEl.innerHTML = pagedPosts
    .map(
      (post) => `
      <article class="news-surface rounded-xl border p-3.5 shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
        <a href="${`/?post=${encodeURIComponent(post.id)}`}" class="group block">
          <div class="grid gap-3 sm:grid-cols-[180px_1fr]">
            ${
              (() => {
                const img = getFirstImageUrlFromPost(post);
                return img
                  ? `<div class="overflow-hidden rounded-lg border border-white/10 bg-black/20"><img src="${img}" alt="" class="aspect-video w-full object-contain object-center p-1" loading="lazy" /></div>`
                  : `<div class="flex aspect-video items-center justify-center rounded-lg border border-white/10 bg-black/15 text-xs text-[var(--news-card-muted)]">No image</div>`;
              })()
            }
            <div class="min-w-0">
              <h2 class="news-title text-lg font-bold leading-tight group-hover:text-[#9be8ff]">${escapeHtml(post.title)}</h2>
              <p class="news-muted mt-1 text-[12px]">${formatDate(post.createdAt)} · ${escapeHtml(post.authorEmail)}</p>
              <p class="news-title mt-2 text-[13px] leading-[1.55] opacity-90">${toPreviewText(postPlainBodyForPreview(post), 220)}</p>
            </div>
          </div>
        </a>
      </article>`,
    )
    .join("");

  if (!paginationEl) return;
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }
  const buttons: string[] = [];
  for (let p = 1; p <= totalPages; p += 1) {
    const active = p === safePage;
    buttons.push(
      `<button type="button" data-archive-page="${p}" class="rounded-md border px-2.5 py-1 text-xs font-semibold ${
        active
          ? "border-[#7fe9ff]/55 bg-[#7fe9ff]/15 text-[#aeefff]"
          : "border-white/20 text-[#d6dbf0] hover:bg-white/10"
      }">${p}</button>`,
    );
  }
  paginationEl.innerHTML = `<div class="flex flex-wrap gap-2">${buttons.join("")}</div>`;
}

let archivePage = 1;

function filteredPosts(): PostItem[] {
  const q = document.querySelector<HTMLInputElement>("#news-filter-input")?.value.trim().toLowerCase() ?? "";
  const imgOnly = document.querySelector<HTMLInputElement>("#news-filter-with-image")?.checked ?? false;
  const sort = document.querySelector<HTMLSelectElement>("#news-filter-sort")?.value ?? "latest";

  let list = getPosts();
  if (q) {
    list = list.filter((p) => postPlainTextForSearch(p).includes(q));
  }
  if (imgOnly) {
    list = list.filter((p) => Boolean(getFirstImageUrlFromPost(p)));
  }
  if (sort === "oldest") {
    list = [...list].reverse();
  }
  return list;
}

function refreshArchiveUI(): void {
  renderArchiveList(filteredPosts(), archivePage);
}

export function initNewsArchive(): void {
  const listEl = document.querySelector("#news-archive-list");
  if (!listEl) return;

  void syncPostsFromRemote().then(() => {
    refreshArchiveUI();
  });

  const input = document.querySelector<HTMLInputElement>("#news-filter-input");
  const imgCb = document.querySelector<HTMLInputElement>("#news-filter-with-image");
  const sortSel = document.querySelector<HTMLSelectElement>("#news-filter-sort");
  const paginationEl = document.querySelector<HTMLElement>("#news-archive-pagination");

  input?.addEventListener("input", () => {
    archivePage = 1;
    refreshArchiveUI();
  });
  imgCb?.addEventListener("change", () => {
    archivePage = 1;
    refreshArchiveUI();
  });
  sortSel?.addEventListener("change", () => {
    archivePage = 1;
    refreshArchiveUI();
  });

  paginationEl?.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-archive-page]");
    if (!t) return;
    const p = Number(t.getAttribute("data-archive-page"));
    if (!Number.isFinite(p) || p < 1) return;
    archivePage = p;
    refreshArchiveUI();
  });

  window.addEventListener("tanne-posts-updated", () => {
    void syncPostsFromRemote().then(() => refreshArchiveUI());
  });
}
