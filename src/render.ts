import { ACCOUNT_HERO_MORE_EPIC_LABEL, ACCOUNT_HERO_MORE_LEGENDARY_LABEL } from "./content";
import { pageInner } from "./layout";
import { escapeHtml, renderPostArticleBodyHtml } from "./postBody";
import { getPostByIdRemote, getPosts, savePosts } from "./postsStore";
import { getSellingAccounts } from "./sellingAccountsStore";
import { renderHeader } from "./sections/header";
import { renderHero } from "./sections/hero";
import { renderPopularAccounts, renderSellingAccountsGrid } from "./sections/popularAccounts";
import { renderPromos } from "./sections/promos";
import { renderRaidNewsSection } from "./sections/raidNews";
import { renderSafeTrading } from "./sections/safeTrading";
import { renderSiteFooter } from "./sections/siteFooter";

/**
 * Ghép trang từ từng phần trong `src/sections/`.
 * Sửa từng phần: mở đúng file trong `src/sections/` (và `content.ts` cho dữ liệu).
 */
export function renderLanding(root: HTMLElement): void {
  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <!-- Nền của toàn website -->
      <div
        id="site-bg-base"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
      ></div>
      <div
        id="site-bg-slide"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"
      ></div>

      <div class="relative z-0">
        ${renderHeader()}

        <main class="w-full">
          ${renderHero()}

          <div class="${pageInner} space-y-4 py-6 sm:py-8">
          ${renderPopularAccounts()}
          ${renderRaidNewsSection()}
          ${renderSafeTrading()}
          ${renderPromos()}
          </div>
        </main>

        ${renderSiteFooter()}
      </div>
    </div>
  `;
}

/** Trang đầy đủ tài khoản Raid SL đang bán. */
export function renderRaidAccountsPage(root: HTMLElement): void {
  const accounts = getSellingAccounts();
  const stockHtml = renderSellingAccountsGrid(accounts);

  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <div
        id="site-bg-base"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
      ></div>
      <div
        id="site-bg-slide"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"
      ></div>

      <div class="relative z-0">
        ${renderHeader()}
        <main class="${pageInner} space-y-5 py-6 sm:space-y-8 sm:py-8">
          <div class="flex flex-wrap items-center gap-3">
            <a
              href="/"
              class="inline-flex min-h-11 items-center rounded-lg border border-[#7fe9ff]/45 px-4 py-2.5 text-[15px] font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10 active:opacity-90 sm:min-h-0 sm:px-3 sm:py-2 sm:text-[14px]"
            >
              ← Home
            </a>
          </div>

          <section class="gloss-hover-frame theme-smooth rounded-[14px] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] sm:p-6 md:p-7">
            <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <img
                src="/game-icons/raid-shadow-legends.png"
                alt=""
                class="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
                width="56"
                height="56"
              />
              <div>
                <h1 class="text-[22px] font-bold tracking-tight text-[var(--panel-text)] sm:text-2xl md:text-3xl">
                  Raid Shadow Legends — Accounts
                </h1>
                <p class="mt-1 max-w-2xl text-[15px] leading-snug text-[var(--panel-muted)]">
                  Every active Raid listing in one place. Listings can be photos + description only; champions are optional. IDs are copyable — open a card for screenshots and details.
                </p>
              </div>
            </div>

            <div id="account-stock-grid" class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              ${stockHtml}
            </div>
          </section>
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;
}

export function renderPostDetail(root: HTMLElement, postId: string): void {
  const post = getPosts().find((item) => item.id === postId);

  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <div
        id="site-bg-base"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
      ></div>
      <div
        id="site-bg-slide"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"
      ></div>

      <div class="relative z-0">
        ${renderHeader()}
        <main class="${pageInner} py-8">
          ${
            !post
              ? `<section class="rounded-[14px] bg-[var(--panel-bg)] p-5 shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
                  <h1 class="text-xl font-bold">Article not found</h1>
                  <p class="mt-2 text-sm" style="color: color-mix(in srgb, var(--news-card-text) 72%, transparent);">This article may have been removed.</p>
                  <a href="/?page=news" class="mt-4 inline-flex rounded-md border border-[#7fe9ff]/45 px-3 py-2 text-sm font-semibold text-[#7fe9ff] hover:bg-[#7fe9ff]/10">Back to Raid news</a>
                </section>`
              : `<article class="raid-article rounded-[14px] bg-[var(--panel-bg)] p-5 shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-6">
                  <a href="/?page=news" class="inline-flex rounded-md border border-[#7fe9ff]/45 px-3 py-1.5 text-xs font-semibold text-[#7fe9ff] hover:bg-[#7fe9ff]/10">← Raid news</a>
                  <h1 class="mt-3 text-2xl font-bold text-[var(--news-card-text)]">${escapeHtml(post.title)}</h1>
                  ${post.caption ? `<p class="mt-2 text-sm" style="color: color-mix(in srgb, var(--news-card-text) 78%, transparent);">${escapeHtml(post.caption)}</p>` : ""}
                  <div class="raid-article-body mt-4 text-[var(--news-card-text)]">${renderPostArticleBodyHtml(post)}</div>
                  <p class="mt-4 text-xs" style="color: color-mix(in srgb, var(--news-card-text) 72%, transparent);">By ${escapeHtml(post.authorEmail)} · ${new Date(post.createdAt).toLocaleString()}</p>
                </article>`
          }
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;

  if (post) return;

  void getPostByIdRemote(postId).then((remotePost) => {
    if (!remotePost) return;
    const refreshed = getPosts().filter((item) => item.id !== remotePost.id);
    refreshed.unshift(remotePost);
    savePosts(refreshed);
    renderPostDetail(root, postId);
  });
}

export function renderNewsArchive(root: HTMLElement): void {
  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <div
        id="site-bg-base"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
      ></div>
      <div
        id="site-bg-slide"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"
      ></div>

      <div class="relative z-0">
        ${renderHeader()}
        <main class="${pageInner} py-8">
          <section class="rounded-[14px] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-6">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 class="text-2xl font-extrabold">Raid Shadow Legends — All news</h1>
                <p class="mt-1 text-sm text-[var(--panel-muted)]">Newest articles first. Filter or sort below.</p>
              </div>
              <span id="news-archive-count" class="rounded-full border border-[#7fe9ff]/45 px-3 py-1 text-xs font-semibold text-[#7fe9ff]">0 articles</span>
            </div>

            <div class="mb-4 grid gap-2 rounded-lg border border-white/10 bg-black/10 p-3 md:grid-cols-[1fr_auto_auto]">
              <input
                id="news-filter-input"
                type="search"
                placeholder="Search title, body, or author..."
                class="w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#7fe9ff]"
              />
              <label class="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-xs font-semibold text-[var(--panel-text)]">
                <input id="news-filter-with-image" type="checkbox" class="accent-[#7fe9ff]" />
                With image only
              </label>
              <select id="news-filter-sort" class="rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm outline-none focus:border-[#7fe9ff]">
                <option value="latest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            <div id="news-archive-list" class="space-y-3"></div>
            <div id="news-archive-pagination" class="mt-4"></div>
          </section>
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;
}

export function renderAdminDashboardPage(root: HTMLElement): void {
  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <div
        id="site-bg-base"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"
      ></div>
      <div
        id="site-bg-slide"
        class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"
      ></div>

      <div class="relative z-0">
        ${renderHeader()}
        <main id="admin-dashboard-page" class="${pageInner} py-8">
          <div id="admin-dashboard-guest" class="theme-smooth rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-6 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
            <h1 class="text-xl font-bold text-[var(--admin-heading)]">Admin dashboard</h1>
            <p class="mt-2 text-sm text-[var(--panel-muted)]">Please sign in with an admin account to access this dashboard.</p>
            <button
              type="button"
              id="admin-open-login-from-dashboard"
              class="mt-4 inline-flex rounded-md border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-4 py-2 text-sm font-semibold text-[var(--admin-accent)] transition hover:brightness-110"
            >
              Open login
            </button>
            <p class="mt-4 text-xs text-[var(--panel-muted)]">After admin login, reload this page or open Admin menu (top right) -> Admin dashboard.</p>
          </div>

          <div id="admin-dashboard-content" class="theme-smooth hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-6">
            <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 class="text-2xl font-extrabold text-[var(--admin-heading)]">Admin dashboard</h1>
                <p class="mt-1 text-sm text-[var(--panel-muted)]">Pick a section from the menu (stacked on small screens).</p>
              </div>
              <a href="/" class="text-xs font-semibold text-[var(--admin-accent)] hover:underline">← Back to home</a>
            </div>

            <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              <nav class="flex shrink-0 flex-col gap-1.5 lg:w-[240px]" aria-label="Admin sections">
                <button type="button" data-admin-tab="posts" id="admin-tab-posts" class="rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-accent-muted)]">
                  1. Posts & Raid news
                </button>
                <button type="button" data-admin-tab="raid" id="admin-tab-raid" class="rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)]">
                  2. Raid Shadow Legends accounts
                </button>
                <button type="button" data-admin-tab="epic" id="admin-tab-epic" class="rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)]">
                  3. Epic Seven accounts
                </button>
              </nav>

              <div class="min-w-0 flex-1 space-y-6">
                <section id="admin-panel-posts" class="admin-dash-panel theme-smooth rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-4 md:p-5">
                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Edit posts (Raid news)</h2>
                  <p class="mt-1 text-xs text-[var(--admin-subtle)]">Paragraphs and images, upload or URL. Use ↑ ↓ to reorder blocks.</p>
                  <form id="admin-post-create-form" class="mt-4 space-y-2.5">
                    <input id="admin-post-title" type="text" maxlength="120" required placeholder="Title" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                    <input id="admin-post-caption" type="text" maxlength="180" placeholder="Caption (optional)" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                    <div>
                      <p class="mb-1 text-xs font-semibold text-[var(--admin-subtle)]">Content</p>
                      <div id="admin-post-body-blocks" class="space-y-2"></div>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <button id="admin-post-add-text" type="button" class="rounded-md border border-[var(--admin-tab-active-border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">+ Paragraph</button>
                        <button id="admin-post-add-image" type="button" class="rounded-md border border-[var(--admin-input-border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--admin-btn-ghost-text)] hover:bg-[var(--admin-tab-idle-hover)]">+ Image</button>
                      </div>
                    </div>
                    <p id="admin-post-feedback" class="hidden rounded-md px-3 py-2 text-xs"></p>
                    <div class="flex justify-end">
                      <button type="submit" class="rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">
                        Publish post
                      </button>
                    </div>
                  </form>
                  <div class="mt-6 border-t border-[var(--admin-border)] pt-4">
                    <h3 class="text-sm font-semibold text-[var(--admin-accent-muted)]">Recent posts</h3>
                    <div id="admin-posts-list" class="mt-2.5 space-y-2"></div>
                  </div>
                </section>

                <section id="admin-panel-raid" class="admin-dash-panel theme-smooth hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-4 md:p-5">
                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Raid Shadow Legends accounts</h2>
                  <p class="mt-1 text-xs text-[var(--admin-subtle)]">Internal notes (stored in browser). Can be connected to database.</p>
                  <form id="admin-raid-selling-form" class="mt-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                    <div class="mb-2 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Create / edit listed account</h3>
                      <button id="admin-raid-selling-reset" type="button" class="rounded border border-[var(--admin-input-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-btn-ghost-text)] hover:bg-[var(--admin-tab-idle-hover)]">
                        Reset form
                      </button>
                    </div>
                    <p class="mb-2 rounded-md border border-[var(--admin-tab-active-border)]/40 bg-[var(--admin-tab-active-bg)]/30 px-2.5 py-2 text-[11px] leading-snug text-[var(--admin-subtle)]">
                      <span class="font-semibold text-[var(--admin-accent-muted)]">Quick listing:</span> only <strong class="text-[var(--admin-heading)]">ID</strong> and <strong class="text-[var(--admin-heading)]">price</strong> (number after <strong class="text-[var(--admin-heading)]">$</strong>) are required. Add photos + description; champions below are optional.
                    </p>
                    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div class="flex min-w-0 flex-col gap-1">
                        <div class="flex flex-wrap items-stretch gap-2">
                          <input id="admin-raid-selling-id" type="text" placeholder="Account ID (required)" class="admin-dash-input min-w-0 flex-1 rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                          <button
                            type="button"
                            id="admin-raid-selling-random-id"
                            class="shrink-0 rounded-md border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2 text-xs font-bold text-[var(--admin-accent-muted)] transition hover:brightness-110"
                          >
                            Random 3-digit
                          </button>
                        </div>
                        <p class="text-[10px] leading-snug text-[var(--admin-muted)]">Uses 000–999 and skips IDs already on another listing (ignores the ID in this field when editing).</p>
                      </div>
                      <div class="flex w-full min-w-0 items-stretch overflow-hidden rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-sm text-[var(--admin-input-text)] focus-within:border-[var(--admin-accent)] focus-within:ring-1 focus-within:ring-[var(--admin-accent)]/30">
                        <span class="flex shrink-0 items-center border-r border-[var(--admin-input-border)] bg-[color-mix(in_srgb,var(--admin-input-bg)_85%,var(--admin-border)_15%)] px-3 py-2 font-bold tabular-nums text-[var(--admin-accent-muted)]" aria-hidden="true">$</span>
                        <input id="admin-raid-selling-price" type="text" inputmode="decimal" autocomplete="off" placeholder="249.99" class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)]" aria-label="Price amount (dollar)" />
                      </div>
                    </div>
                    <textarea id="admin-raid-selling-description" rows="4" placeholder="Description (recommended): what the buyer sees first — dungeon progress, highlights, how to contact you for more detail…" class="admin-dash-input mt-2 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"></textarea>
                    <input id="admin-raid-selling-images" type="text" placeholder="Screenshot URLs (comma separated) — or upload below" class="admin-dash-input mt-2 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                    <input id="admin-raid-selling-images-files" type="file" accept="image/*" multiple class="admin-dash-input mt-2 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] file:mr-2 file:rounded file:border-0 file:bg-[var(--admin-accent)] file:px-2 file:py-1 file:text-xs file:font-bold file:text-[var(--admin-submit-text)]" />
                    <p id="admin-raid-selling-feedback" class="mt-2 hidden rounded-md px-3 py-2 text-xs"></p>
                    <p class="mt-2 text-[11px] text-[var(--admin-muted)]"><span class="font-semibold text-[var(--admin-accent-muted)]">Optional champions:</span> use &quot;Select champions for account&quot; below — skip if you only use screenshots + description.</p>
                    <div class="mt-2 flex justify-end">
                      <button id="admin-raid-selling-submit" type="submit" class="rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">
                        Save listed account
                      </button>
                    </div>
                  </form>
                  <div class="mt-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                    <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Active listed accounts</h3>
                    <p class="mt-0.5 text-[11px] text-[var(--admin-muted)]">Data synced with marketplace accounts on home page.</p>
                    <div id="admin-raid-selling-accounts-list" class="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2"></div>
                  </div>
                  <div class="mt-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Select champions (optional)</h3>
                      <button id="admin-raid-clear-champions" type="button" class="rounded border border-[var(--admin-input-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-btn-ghost-text)] hover:bg-[var(--admin-tab-idle-hover)]">
                        Clear selection
                      </button>
                    </div>
                    <p class="mt-2 text-[11px] text-[var(--admin-muted)]">Quick tags (bật/tắt — luôn hiện ngoài lưới):</p>
                    <div id="admin-raid-champion-quick-extras" class="mt-1.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        id="admin-raid-champion-extra-legendary"
                        aria-pressed="false"
                        class="rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2.5 py-1.5 text-left text-[11px] font-semibold text-yellow-400 transition hover:bg-[var(--admin-tab-idle-hover)]"
                      >
                        ${ACCOUNT_HERO_MORE_LEGENDARY_LABEL}
                      </button>
                      <button
                        type="button"
                        id="admin-raid-champion-extra-epic"
                        aria-pressed="false"
                        class="rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2.5 py-1.5 text-left text-[11px] font-semibold text-purple-400 transition hover:bg-[var(--admin-tab-idle-hover)]"
                      >
                        ${ACCOUNT_HERO_MORE_EPIC_LABEL}
                      </button>
                    </div>
                    <input
                      id="admin-raid-champion-search"
                      type="search"
                      placeholder="Search champion by name..."
                      class="admin-dash-input mt-2.5 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"
                    />
                    <p class="mt-2 text-[11px] text-[var(--admin-muted)]">Rarity (bật/tắt để lọc):</p>
                    <div
                      id="admin-raid-champion-rarity-filters"
                      class="mt-1.5 flex flex-wrap gap-2"
                      role="group"
                      aria-label="Lọc theo rarity"
                    >
                      <button
                        type="button"
                        data-rarity-filter="mythic"
                        aria-pressed="true"
                        class="admin-raid-rarity-filter rounded-md border px-2.5 py-1 text-[11px] font-semibold transition"
                      >
                        Mythic
                      </button>
                      <button
                        type="button"
                        data-rarity-filter="legendary"
                        aria-pressed="true"
                        class="admin-raid-rarity-filter rounded-md border px-2.5 py-1 text-[11px] font-semibold transition"
                      >
                        Legendary
                      </button>
                      <button
                        type="button"
                        data-rarity-filter="epic"
                        aria-pressed="true"
                        class="admin-raid-rarity-filter rounded-md border px-2.5 py-1 text-[11px] font-semibold transition"
                      >
                        Epic
                      </button>
                      <button
                        type="button"
                        data-rarity-filter="rare"
                        aria-pressed="true"
                        class="admin-raid-rarity-filter rounded-md border px-2.5 py-1 text-[11px] font-semibold transition"
                      >
                        Rare
                      </button>
                    </div>
                    <div id="admin-raid-champion-grid" class="mt-3 grid max-h-[300px] grid-cols-2 gap-2 overflow-auto pr-1 sm:grid-cols-3"></div>
                    <div class="mt-3 border-t border-[var(--admin-border)] pt-2.5">
                      <p class="text-xs font-semibold text-[var(--admin-subtle)]">Selected:</p>
                      <div id="admin-raid-selected-champions" class="mt-2 flex flex-wrap gap-1.5"></div>
                      <button id="admin-raid-copy-champions" type="button" class="mt-2 rounded border border-[var(--admin-tab-active-border)] px-2.5 py-1 text-[11px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">
                        Copy champion list
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="admin-raid-accounts-notes"
                    rows="14"
                    class="admin-dash-input mt-3 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"
                    placeholder="Internal notes: account IDs, prices, statuses..."
                  ></textarea>
                  <button type="button" id="admin-raid-accounts-save" class="mt-3 rounded-md border border-[var(--admin-tab-active-border)] px-4 py-2 text-sm font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">
                    Save notes
                  </button>
                  <p id="admin-raid-accounts-feedback" class="mt-2 hidden text-xs text-[var(--admin-success-inline)]"></p>
                </section>

                <section id="admin-panel-epic" class="admin-dash-panel theme-smooth hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-4 md:p-5">
                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Epic Seven accounts</h2>
                  <p class="mt-1 text-xs text-[var(--admin-subtle)]">Internal notes (stored in browser).</p>
                  <textarea
                    id="admin-epic-accounts-notes"
                    rows="14"
                    class="admin-dash-input mt-3 w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"
                    placeholder="Internal notes: account IDs, prices, statuses..."
                  ></textarea>
                  <button type="button" id="admin-epic-accounts-save" class="mt-3 rounded-md border border-[var(--admin-tab-active-border)] px-4 py-2 text-sm font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">
                    Save notes
                  </button>
                  <p id="admin-epic-accounts-feedback" class="mt-2 hidden text-xs text-[var(--admin-success-inline)]"></p>
                </section>
              </div>
            </div>
          </div>
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;
}
