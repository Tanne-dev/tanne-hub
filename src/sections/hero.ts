/** Khối banner: chào mừng (trái, chủ đạo) + tin nóng trượt (phải, lg+). */
import { pageInner } from "../layout";
import { renderWelcomeLetter } from "./welcomeLetter";

export function renderHero(): string {
  return `
        <section
          class="w-full bg-[var(--header-bg-end)]"
          id="hero"
        >
          <div class="${pageInner} relative min-h-[56vh] py-8 sm:py-10 lg:min-h-[62vh] lg:py-12">
            <div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
              <!-- Ảnh nền hero chỉ trong vùng chào mừng (trái) -->
              <div class="hero-welcome-panel min-w-0 lg:col-span-8">
                <div
                  class="hero-welcome-bg relative flex min-h-[52vh] flex-col justify-center overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:min-h-[min(58vh,540px)] lg:h-full"
                >
                  <div
                    id="hero-bg-base"
                    class="absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-300"
                    style="background-image: url('/hero-bg.png')"
                  ></div>
                  <div
                    id="hero-bg-slide"
                    class="absolute inset-0 bg-cover bg-center hidden"
                    style="background-image: url('/hero-bg.png')"
                  ></div>
                  <div class="absolute inset-0 bg-black/25 md:bg-black/15"></div>
                  <div
                    class="pointer-events-none absolute inset-x-0 bottom-0 h-20"
                    style="background: linear-gradient(to top, color-mix(in srgb, var(--page-bg, #f4f6fb) 70%, transparent), rgba(0,0,0,0));"
                  ></div>
                  <div class="relative z-[1] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-11">
                    <h1 class="max-w-[20rem] text-[30px] font-extrabold leading-[1.12] text-white min-[400px]:max-w-[22rem] min-[400px]:text-[34px] sm:max-w-2xl sm:text-[36px] md:text-4xl lg:max-w-3xl lg:text-[2.65rem] xl:text-5xl">
                      Welcome to Tanne Hub
                    </h1>
                    <p class="mb-4 mt-2 max-w-xl text-[15px] leading-snug text-white/95 sm:max-w-2xl md:text-base lg:max-w-2xl">
                      A fast, secure, and transparent game account marketplace for gamers.
                    </p>
                    <div class="flex max-w-lg flex-col gap-2.5 min-[400px]:flex-row min-[400px]:flex-wrap min-[400px]:items-center sm:gap-3">
                      <button
                        type="button"
                        class="min-h-12 w-full rounded-full bg-gray-900 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-gray-800 active:opacity-90 min-[400px]:w-auto"
                      >
                        Shop Now
                      </button>
                      <button
                        type="button"
                        id="read-before-explore"
                        class="min-h-12 w-full rounded-full border border-[#7fe9ff]/80 bg-[#041326]/80 px-5 py-3 text-[15px] font-semibold text-[#aeefff] shadow-[0_0_0_1px_rgba(127,233,255,0.35),0_0_24px_rgba(127,233,255,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0a2038]/90 hover:text-white active:opacity-90 min-[400px]:w-auto"
                      >
                        Read Before Exploring
                      </button>
                    </div>
                    <div
                      id="hero-side-visual"
                      aria-hidden="true"
                      class="pointer-events-none relative -mx-1 mt-6 max-h-[200px] overflow-hidden rounded-xl opacity-95 max-sm:hidden sm:mx-0 sm:block sm:max-h-[220px] lg:hidden"
                    >
                      <img
                        src="/hero-side.png"
                        alt=""
                        decoding="async"
                        class="h-full w-full max-h-[220px] object-cover object-right-bottom"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tin nóng: dưới welcome trên mobile; cột phải desktop — trượt từ phải (CSS) -->
              <aside
                id="hero-hot-news"
                class="hero-hot-news-aside flex min-h-0 min-w-0 flex-col lg:col-span-4 lg:justify-center"
                aria-label="Hot news"
              >
                <div class="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-3.5">
                  <div>
                    <h2 class="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[var(--header-brand-text)]">Hot news</h2>
                    <p class="mt-0.5 text-[11px] text-[var(--panel-muted)]">Latest from Raid &amp; the shop</p>
                  </div>
                  <a
                    href="/?page=news"
                    class="shrink-0 text-[11px] font-bold text-[var(--header-accent)] underline-offset-2 hover:underline"
                  >All articles</a>
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
                      aria-label="Previous hot news slide"
                    >
                      <span class="text-lg leading-none" aria-hidden="true">‹</span>
                    </button>
                    <button
                      id="hero-hot-news-next"
                      type="button"
                      class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-[var(--header-nav-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-sm transition hover:border-[var(--header-accent)]/40 hover:bg-[var(--icon-bg)]"
                      aria-label="Next hot news slide"
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
