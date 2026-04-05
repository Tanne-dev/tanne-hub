import { escapeHtml, getFirstImageUrlFromPost, postPlainBodyForPreview } from "./postBody";
import { getPosts, type PostItem } from "./postsStore";

const HERO_HOT_MAX = 6;
const HERO_HOT_INTERVAL_MS = 9000;

let heroHotIndex = 0;
let heroHotTimer: number | null = null;
let heroHotPaused = false;

function postDetailUrl(postId: string): string {
  return `/?post=${encodeURIComponent(postId)}`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function previewLine(post: PostItem): string {
  const raw = post.caption?.trim() || postPlainBodyForPreview(post);
  const one = raw.replace(/\s+/g, " ").trim();
  if (one.length <= 96) return one;
  return `${one.slice(0, 94).trimEnd()}…`;
}

function buildSlideHtml(post: PostItem, i: number, len: number): string {
  const url = postDetailUrl(post.id);
  const thumb = getFirstImageUrlFromPost(post);
  const img = thumb
    ? `<div class="hero-hot-thumb relative aspect-[16/10] w-full overflow-hidden bg-black/40">
         <img src="${thumb}" alt="${escapeHtml(post.title)}" class="h-full w-full object-cover object-center" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" fetchpriority="${i === 0 ? "high" : "low"}" />
         <span class="absolute left-2 top-2 rounded-full bg-[#7fe9ff]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#aeefff] ring-1 ring-[#7fe9ff]/40">Hot</span>
       </div>`
    : `<div class="hero-hot-thumb flex aspect-[16/10] w-full items-center justify-center bg-black/30 text-[11px] text-white/50">No image</div>`;

  const slicePct = 100 / len;
  return `
    <a
      href="${url}"
      class="hero-hot-slide group flex h-full min-w-0 flex-col border-r border-white/10 bg-[color-mix(in_srgb,#0b1530_88%,transparent)] transition-[background-color] last:border-r-0 hover:bg-[color-mix(in_srgb,#0f1f42_92%,transparent)]"
      style="flex: 0 0 ${slicePct}%; width: ${slicePct}%; max-width: ${slicePct}%;"
      data-hero-hot-slide="${i}"
    >
      ${img}
      <div class="flex min-h-0 flex-1 flex-col p-3 sm:p-3.5">
        <time class="text-[11px] text-white/55" datetime="${new Date(post.createdAt).toISOString()}">${formatDate(post.createdAt)}</time>
        <h3 class="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-white group-hover:text-[#aeefff] sm:text-[16px]">${escapeHtml(post.title)}</h3>
        <p class="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-white/75">${escapeHtml(previewLine(post))}</p>
        <span class="mt-auto pt-2 text-[11px] font-semibold text-[#7fe9ff] opacity-90 group-hover:opacity-100">Read article →</span>
      </div>
    </a>`;
}

function buildEmptyHtml(): string {
  return `
    <div class="flex min-h-[220px] flex-col items-center justify-center gap-2 p-5 text-center sm:min-h-[260px]">
      <p class="text-sm font-semibold text-white/85">No hot posts yet</p>
      <p class="text-xs text-white/55">Raid news will appear here when published.</p>
      <a href="/?page=news" class="mt-1 text-xs font-bold text-[#7fe9ff] underline-offset-2 hover:underline">Browse archive</a>
    </div>`;
}

export function renderHeroHotNews(): void {
  const root = document.querySelector<HTMLElement>("#hero-hot-news");
  const track = document.querySelector<HTMLElement>("#hero-hot-news-track");
  const dots = document.querySelector<HTMLElement>("#hero-hot-news-dots");
  if (!root || !track) return;

  const posts = getPosts().slice(0, HERO_HOT_MAX);
  heroHotIndex = Math.min(heroHotIndex, Math.max(0, posts.length - 1));

  if (posts.length === 0) {
    track.style.width = "";
    track.style.transform = "";
    track.innerHTML = buildEmptyHtml();
    track.className =
      "hero-hot-news-track flex min-h-[200px] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
    if (dots) dots.innerHTML = "";
    root.dataset.heroHotLen = "0";
    return;
  }

  const len = posts.length;
  root.dataset.heroHotLen = String(len);
  track.className =
    "hero-hot-news-track flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]";
  track.style.width = `${len * 100}%`;
  track.style.transform = `translateX(-${(100 / len) * heroHotIndex}%)`;
  track.innerHTML = posts.map((p, i) => buildSlideHtml(p, i, len)).join("");

  if (dots) {
    dots.innerHTML = posts
      .map(
        (_, i) =>
          `<button type="button" class="hero-hot-dot h-1.5 rounded-full transition-all ${i === heroHotIndex ? "w-5 bg-[#7fe9ff]" : "w-1.5 bg-white/35 hover:bg-white/55"}" data-hero-hot-dot="${i}" aria-label="Slide ${i + 1}"></button>`,
      )
      .join("");
  }
}

function shiftHeroHot(step: number): void {
  const posts = getPosts().slice(0, HERO_HOT_MAX);
  if (posts.length <= 1) return;
  heroHotIndex = (heroHotIndex + step + posts.length) % posts.length;
  renderHeroHotNews();
}

function restartHeroHotTimer(): void {
  if (heroHotTimer !== null) {
    window.clearInterval(heroHotTimer);
    heroHotTimer = null;
  }
  const posts = getPosts().slice(0, HERO_HOT_MAX);
  if (posts.length <= 1) return;
  heroHotTimer = window.setInterval(() => {
    if (heroHotPaused) return;
    shiftHeroHot(1);
  }, HERO_HOT_INTERVAL_MS);
}

let heroHotBound = false;

export function bindHeroHotNews(): void {
  if (heroHotBound) return;
  const root = document.querySelector<HTMLElement>("#hero-hot-news");
  const prev = document.querySelector<HTMLButtonElement>("#hero-hot-news-prev");
  const next = document.querySelector<HTMLButtonElement>("#hero-hot-news-next");
  const dots = document.querySelector<HTMLElement>("#hero-hot-news-dots");
  if (!root || !prev || !next) return;
  heroHotBound = true;

  prev.addEventListener("click", () => shiftHeroHot(-1));
  next.addEventListener("click", () => shiftHeroHot(1));

  const pause = () => {
    heroHotPaused = true;
  };
  const resume = () => {
    heroHotPaused = false;
  };
  prev.addEventListener("mouseenter", pause);
  next.addEventListener("mouseenter", pause);
  prev.addEventListener("mouseleave", resume);
  next.addEventListener("mouseleave", resume);

  dots?.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-hero-hot-dot]");
    if (!t) return;
    const i = Number(t.dataset.heroHotDot);
    if (Number.isFinite(i)) {
      heroHotIndex = i;
      renderHeroHotNews();
    }
  });

  root.addEventListener("mouseenter", pause);
  root.addEventListener("mouseleave", resume);
}

export function initHeroHotNews(): void {
  renderHeroHotNews();
  bindHeroHotNews();
  restartHeroHotTimer();
}

export function refreshHeroHotNewsAfterPostsChange(): void {
  heroHotIndex = 0;
  renderHeroHotNews();
  bindHeroHotNews();
  restartHeroHotTimer();
}
