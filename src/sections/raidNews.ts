/** Raid Shadow Legends news preview on the homepage (filled by `postsManager`). */
export function renderRaidNewsSection(): string {
  return `
        <section id="raid-news-section" class="theme-smooth rounded-[14px] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--header-accent)]">Game info first</p>
              <h2 class="mt-1 text-[18px] font-semibold text-[var(--panel-text)] md:text-[21px]">Latest Raid updates</h2>
              <p class="mt-1 text-sm text-[var(--panel-muted)]">News, promo-code notes, guides, and quick context for Raid players.</p>
            </div>
            <div class="flex items-center gap-1.5">
              <button id="raid-news-prev" type="button" class="inline-flex rounded-md border border-[#7fe9ff]/45 px-2.5 py-1.5 text-xs font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10">Prev</button>
              <button id="raid-news-next" type="button" class="inline-flex rounded-md border border-[#7fe9ff]/45 px-2.5 py-1.5 text-xs font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10">Next</button>
              <a href="/?page=news" class="inline-flex rounded-md border border-[#7fe9ff]/45 px-3 py-1.5 text-xs font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10">All articles</a>
            </div>
          </div>
          <div id="raid-news-posts" class="mt-4 grid gap-3"></div>
        </section>`;
}
