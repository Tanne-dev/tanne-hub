import { refreshHeroHotNewsAfterPostsChange } from "./heroHotNews";
import { escapeHtml, getFirstImageUrlFromPost, postPlainBodyForPreview } from "./postBody";
import { getPosts, removeLegacySeedPosts, savePosts, syncPostsFromRemote } from "./postsStore";
import type { PostItem } from "./postsStore";

const NEWS_SLIDER_MS = 10_000;
let newsSliderTimer: number | null = null;
let newsSliderIndex = 0;
let newsSliderPaused = false;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString();
}

function getPostDetailUrl(postId: string): string {
  return `/?post=${encodeURIComponent(postId)}`;
}

function toPreviewText(content: string, limit = 120): string {
  const clean = content.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit).trimEnd()}...`;
}

export function renderRaidNewsFeed(animate = false): void {
  const feed = document.querySelector<HTMLElement>("#raid-news-posts");
  if (!feed) return;

  const posts = getPosts();
  feed.className = "mt-4";
  if (posts.length === 0) {
    feed.innerHTML =
      '<p class="rounded-lg border border-white/10 bg-black/10 px-3 py-3 text-sm text-[var(--panel-muted)]">No Raid Shadow Legends news yet. Check back soon.</p>';
    return;
  }

  const start = posts.length > 0 ? newsSliderIndex % posts.length : 0;
  const rotated = [...posts.slice(start), ...posts.slice(0, start)];
  const featured = rotated[0];
  const gridPosts = rotated.slice(1, 9);
  const sidebarPosts = (rotated.length > 9 ? rotated.slice(9, 19) : rotated.slice(1, 11)).slice(0, 10);

  const renderThumb = (post: PostItem, ratioClass: string): string => {
    const thumbUrl = getFirstImageUrlFromPost(post);
    return thumbUrl
      ? `<figure class="overflow-hidden rounded-md border border-white/12 bg-black/20">
           <img src="${thumbUrl}" alt="${escapeHtml(post.title)}" class="w-full ${ratioClass} object-contain object-center bg-black/35 p-1" loading="lazy" decoding="async" />
         </figure>`
      : `<div class="flex ${ratioClass} items-center justify-center rounded-md border border-white/10 bg-black/15 text-xs text-[var(--news-card-muted)]">No image</div>`;
  };

  if (animate) {
    feed.style.transition = "opacity 240ms ease, transform 240ms ease";
    feed.style.opacity = "0";
    feed.style.transform = "translateX(-18px)";
  }

  feed.innerHTML = `
    <section class="grid gap-3 lg:grid-cols-[2fr_1fr]">
      <div class="space-y-3">
        <article class="news-surface rounded-xl border p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <a href="${getPostDetailUrl(featured.id)}" class="group block">
            ${renderThumb(featured, "aspect-[16/9] max-h-[360px]")}
            <div class="mt-2.5">
              <div class="mb-1.5 flex items-center gap-2">
                <span class="rounded-full border border-[#7fe9ff]/35 bg-[#7fe9ff]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#aeefff]">Featured</span>
                <span class="news-muted text-[11px]">${formatDate(featured.createdAt)}</span>
              </div>
              <h3 class="news-title text-[20px] font-bold leading-tight group-hover:text-[#9be8ff]">${escapeHtml(featured.title)}</h3>
              ${featured.caption ? `<p class="news-muted mt-1.5 text-[12px]">${escapeHtml(featured.caption)}</p>` : ""}
              <p class="news-title mt-2 text-[13px] leading-[1.6] opacity-90">${toPreviewText(postPlainBodyForPreview(featured), 230)}</p>
            </div>
          </a>
        </article>

        <div class="grid gap-3 sm:grid-cols-2">
          ${gridPosts
            .map(
              (post) => `
            <article class="news-surface rounded-lg border p-2.5 transition hover:border-[#7fe9ff]/45">
              <a href="${getPostDetailUrl(post.id)}" class="group block">
                ${renderThumb(post, "aspect-[16/10]")}
                <h4 class="news-title mt-2 text-[15px] font-bold leading-tight group-hover:text-[#9be8ff]">${escapeHtml(post.title)}</h4>
                <p class="news-muted mt-1 text-[12px]">${formatDate(post.createdAt)}</p>
              </a>
            </article>`,
            )
            .join("")}
        </div>
      </div>

      <aside class="news-surface rounded-xl border p-3.5">
        <h3 class="news-title mb-2 text-[14px] font-extrabold uppercase tracking-[0.05em]">Latest</h3>
        <div class="space-y-2.5">
          ${sidebarPosts
            .map(
              (post) => `
            <a href="${getPostDetailUrl(post.id)}" class="group grid grid-cols-[76px_1fr] gap-2.5 rounded-md border border-white/10 p-2 transition hover:border-[#7fe9ff]/45">
              ${(() => {
                const su = getFirstImageUrlFromPost(post);
                return su
                  ? `<img src="${su}" alt="${escapeHtml(post.title)}" class="h-[56px] w-full rounded object-contain bg-black/25 p-0.5" loading="lazy" decoding="async" />`
                  : `<span class="news-muted flex h-[56px] items-center justify-center rounded bg-black/15 text-[10px]">No image</span>`;
              })()}
              <span class="min-w-0">
                <span class="news-title line-clamp-2 block text-[12px] font-semibold leading-[1.35] group-hover:text-[#9be8ff]">${escapeHtml(post.title)}</span>
                <span class="news-muted mt-1 block text-[10px]">${formatDate(post.createdAt)}</span>
              </span>
            </a>`,
            )
            .join("")}
        </div>
      </aside>
    </section>
  `;

  if (animate) {
    requestAnimationFrame(() => {
      feed.style.opacity = "1";
      feed.style.transform = "translateX(0)";
    });
  }
}

function shiftRaidNews(step: number): void {
  const len = getPosts().length;
  if (len <= 1) return;
  newsSliderIndex = (newsSliderIndex + step + len) % len;
  renderRaidNewsFeed(true);
}

function restartRaidNewsSlider(): void {
  if (newsSliderTimer !== null) {
    window.clearInterval(newsSliderTimer);
    newsSliderTimer = null;
  }
  const posts = getPosts();
  if (posts.length <= 1) return;
  newsSliderTimer = window.setInterval(() => {
    if (newsSliderPaused) return;
    const len = getPosts().length;
    if (len <= 1) return;
    newsSliderIndex = (newsSliderIndex + 1) % len;
    renderRaidNewsFeed(true);
  }, NEWS_SLIDER_MS);
}

function bindRaidNewsControls(): void {
  const section = document.querySelector<HTMLElement>("#raid-news-section");
  const prevBtn = document.querySelector<HTMLButtonElement>("#raid-news-prev");
  const nextBtn = document.querySelector<HTMLButtonElement>("#raid-news-next");
  if (!section || !prevBtn || !nextBtn) return;
  if (section.dataset.sliderBound === "1") return;
  section.dataset.sliderBound = "1";

  prevBtn.addEventListener("click", () => shiftRaidNews(-1));
  nextBtn.addEventListener("click", () => shiftRaidNews(1));
  const onPause = () => {
    newsSliderPaused = true;
  };
  const onResume = () => {
    newsSliderPaused = false;
  };

  // Keep auto-slider running while hovering the news area;
  // pause only when user is aiming at controls.
  prevBtn.addEventListener("mouseenter", onPause);
  nextBtn.addEventListener("mouseenter", onPause);
  prevBtn.addEventListener("mouseleave", onResume);
  nextBtn.addEventListener("mouseleave", onResume);
}

export function initPostsManager(): void {
  removeLegacySeedPosts();
  renderRaidNewsFeed();
  bindRaidNewsControls();
  restartRaidNewsSlider();
  void syncPostsFromRemote().then(() => {
    newsSliderIndex = 0;
    renderRaidNewsFeed(true);
    bindRaidNewsControls();
    restartRaidNewsSlider();
    refreshHeroHotNewsAfterPostsChange();
  });

  window.addEventListener("tanne-posts-updated", () => {
    void syncPostsFromRemote().then(() => {
      newsSliderIndex = 0;
      renderRaidNewsFeed(true);
      bindRaidNewsControls();
      restartRaidNewsSlider();
      refreshHeroHotNewsAfterPostsChange();
    });
  });
}
