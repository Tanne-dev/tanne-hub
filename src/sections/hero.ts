/** Khối banner: nội dung chính bên trái + Hot News cố định ở cột phải trên desktop. */
import { pageInner } from "../layout";
import { siteText } from "../newsLanguage";
import { renderWelcomeLetter } from "./welcomeLetter";

export function renderHero(): string {
  return `
        <section
          class="w-full bg-[var(--header-bg-end)]"
          id="hero"
        >
          <div class="${pageInner} relative min-h-[56vh] py-8 sm:py-10 lg:min-h-[62vh] lg:py-12">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
              <div class="hero-welcome-panel order-1 min-w-0 lg:col-span-7">
                <div
                  class="hero-welcome-bg relative min-h-[52vh] overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:min-h-[min(58vh,540px)]"
                >
                  <div
                    id="hero-bg-base"
                    class="absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-300"
                    style="background-image: url('/rsl-main-background.png')"
                  ></div>
                  <div
                    id="hero-bg-slide"
                    class="absolute inset-0 bg-cover bg-center hidden"
                    style="background-image: url('/rsl-main-background.png')"
                  ></div>
                  <div class="absolute inset-0 bg-black/25 md:bg-black/15"></div>
                  <div
                    class="pointer-events-none absolute inset-x-0 bottom-0 h-20"
                    style="background: linear-gradient(to top, color-mix(in srgb, var(--page-bg, #f4f6fb) 70%, transparent), rgba(0,0,0,0));"
                  ></div>
                  <h1 class="sr-only">${siteText("heroTitle")}</h1>
                </div>
                <div class="mt-3 flex flex-col gap-2.5 rounded-2xl border border-white/12 bg-[#071827]/72 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
                  <a
                    href="/?page=raid-accounts"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#101d33] px-4 py-2.5 text-[14px] font-extrabold text-white transition hover:bg-[#172842] active:opacity-90 sm:w-auto"
                  >
                    ${siteText("browseRaidAccounts")}
                  </a>
                  <a
                    href="/?page=news"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#7fe9ff]/70 bg-[#061b31] px-4 py-2.5 text-[14px] font-extrabold text-[#aeefff] shadow-[0_0_0_1px_rgba(127,233,255,0.24),0_0_18px_rgba(127,233,255,0.14)] transition hover:-translate-y-0.5 hover:bg-[#0b2743] hover:text-white active:opacity-90 sm:w-auto"
                  >
                    ${siteText("readLatestInfo")}
                  </a>
                  <button
                    type="button"
                    id="read-before-explore"
                    class="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/35 bg-white/10 px-4 py-2.5 text-[14px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/18 active:opacity-90 sm:w-auto"
                  >
                    ${siteText("startHere")}
                  </button>
                </div>
              </div>

              <aside
                id="hero-hot-news"
                class="hero-hot-news-aside order-2 flex min-h-0 min-w-0 flex-col lg:col-span-5 lg:justify-center"
                data-hero-hot-layout="compact"
                aria-label="Hot news"
              >
                <div class="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-3.5">
                  <div>
                    <h2 class="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[var(--header-brand-text)]">${siteText("hotNews")}</h2>
                    <p class="mt-0.5 text-[11px] text-[var(--panel-muted)]">${siteText("hotNewsSubtitle")}</p>
                  </div>
                  <a
                    href="/?page=news"
                    class="shrink-0 text-[11px] font-bold text-[var(--header-accent)] underline-offset-2 hover:underline"
                  >${siteText("allArticles")}</a>
                </div>

                <div
                  id="hero-hot-news-viewport"
                  class="relative min-h-[240px] w-full flex-1 overflow-hidden rounded-2xl border border-white/18 bg-black/20 shadow-[0_12px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] sm:min-h-[260px] lg:min-h-[280px]"
                >
                  <div id="hero-hot-news-track" class="hero-hot-news-track flex h-full w-full"></div>
                </div>

                <div class="mt-3 flex items-center justify-between gap-2">
                  <div id="hero-hot-news-dots" class="flex flex-wrap items-center gap-1.5"></div>
                  <div class="flex shrink-0 gap-1.5">
                    <button
                      id="hero-hot-news-prev"
                      type="button"
                      class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-[var(--header-nav-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-sm transition hover:border-[var(--header-accent)]/40 hover:bg-[var(--icon-bg)]"
                      aria-label="${siteText("previousHotNewsSlide")}"
                    >
                      <span class="text-lg leading-none" aria-hidden="true">‹</span>
                    </button>
                    <button
                      id="hero-hot-news-next"
                      type="button"
                      class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-[var(--header-nav-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-sm transition hover:border-[var(--header-accent)]/40 hover:bg-[var(--icon-bg)]"
                      aria-label="${siteText("nextHotNewsSlide")}"
                    >
                      <span class="text-lg leading-none" aria-hidden="true">›</span>
                    </button>
                  </div>
                </div>
              </aside>
            </div>
            ${renderWelcomeLetter()}
          </div>
        </section>`;
}
