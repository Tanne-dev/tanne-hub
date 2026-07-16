import { ACCOUNT_HERO_MORE_EPIC_LABEL, ACCOUNT_HERO_MORE_LEGENDARY_LABEL } from "./content";
import { pageInner } from "./layout";
import { escapeHtml, renderPostArticleBodyHtml } from "./postBody";
import { bindHelpfulReactionButtons, renderHelpfulButton } from "./postHelpfulReactions";
import { getPostByIdRemote, getPosts, savePosts } from "./postsStore";
import { getSellingAccounts } from "./sellingAccountsStore";
import { renderLazySectionPlaceholder } from "./lazySections";
import { renderHeader } from "./sections/header";
import { renderHero } from "./sections/hero";
import { renderSellingAccountsGrid } from "./sections/popularAccounts";
import { renderSiteFooter } from "./sections/siteFooter";
import { HONEYGAIN_REFERRAL_URL } from "./referralLinks";
import { getLocalizedPost, getNewsLanguage, postHasVietnamese, siteText } from "./newsLanguage";
import { setPostSocialMeta } from "./socialMeta";

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
            ${renderLazySectionPlaceholder("raid-news", siteText("loadingRaidNews"), 560)}
            ${renderLazySectionPlaceholder("member-alerts", siteText("loadingMemberAlerts"), 180)}
            ${renderLazySectionPlaceholder("popular-accounts", siteText("loadingPopularAccounts"), 520)}
            ${renderLazySectionPlaceholder("safe-trading", siteText("loadingSafeTrading"), 260)}
            ${renderLazySectionPlaceholder("legit-check", siteText("loadingLegitCheck"), 360)}
            ${renderLazySectionPlaceholder("trustpilot", siteText("loadingTrustpilot"), 220)}
            ${renderLazySectionPlaceholder("promos", siteText("loadingPromos"), 220)}
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

export function renderExchangePage(root: HTMLElement): void {
  root.innerHTML = `
    <div class="relative min-h-screen w-full bg-[var(--page-bg)]">
      <div id="site-bg-base" class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20"></div>
      <div id="site-bg-slide" class="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-20 hidden"></div>

      <div class="relative z-0">
        ${renderHeader()}
        <main class="${pageInner} space-y-5 py-6 sm:space-y-8 sm:py-8">
          <a
            href="/"
            class="inline-flex min-h-11 items-center rounded-lg border border-[#7fe9ff]/45 px-4 py-2.5 text-[15px] font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10 active:opacity-90 sm:min-h-0 sm:px-3 sm:py-2 sm:text-[14px]"
          >
            ← Home
          </a>

          <section class="overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
            <div class="grid gap-0 lg:grid-cols-[1fr_0.92fr]">
              <div class="p-5 sm:p-7 lg:p-9">
                <p class="inline-flex rounded-full border border-[#7fe9ff]/45 bg-[#7fe9ff]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--header-accent)]">
                  Exchange service
                </p>
                <h1 class="mt-4 max-w-3xl text-[30px] font-extrabold leading-[1.08] tracking-tight sm:text-[42px]">
                  Choose what you send, see what you receive
                </h1>
                <p class="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--panel-muted)]">
                  Exchange between PayPal, crypto, Wise, or bank transfer with clear rates before any transaction starts.
                </p>
                <div class="mt-5 grid gap-3">
                  <div class="grid gap-2 sm:grid-cols-3">
                    <div class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-3">
                      <p class="text-sm font-extrabold">1. Pick service</p>
                      <p class="mt-1 text-xs leading-snug text-[var(--panel-muted)]">Choose PayPal, crypto, Wise, or bank transfer.</p>
                    </div>
                    <div class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-3">
                      <p class="text-sm font-extrabold">2. Check estimate</p>
                      <p class="mt-1 text-xs leading-snug text-[var(--panel-muted)]">Fixed-rate services show the receive range instantly.</p>
                    </div>
                    <div class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-3">
                      <p class="text-sm font-extrabold">3. Confirm first</p>
                      <p class="mt-1 text-xs leading-snug text-[var(--panel-muted)]">Final rate and method are agreed before sending.</p>
                    </div>
                  </div>
                  <div class="rounded-lg border border-[#f6c44c]/35 bg-[#f6c44c]/10 px-3 py-2 text-sm text-[var(--panel-muted)]">
                    Crypto transfers are handled through Binance only. Proof of funds is available on request.
                  </div>
                </div>
              </div>

              <div id="exchange-calculator" class="border-t border-[var(--admin-border)] bg-[linear-gradient(145deg,rgba(127,233,255,0.16),rgba(246,196,76,0.12))] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                <h2 class="text-xl font-extrabold">Exchange calculator</h2>
                <p class="mt-1 text-sm text-[var(--panel-muted)]">Select the service and enter the amount you want to send.</p>
                <div class="mt-4 grid gap-3">
                  <label class="grid gap-1.5 text-sm font-bold">
                    I want to do this
                    <select id="exchange-service" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]">
                      <option value="crypto_paypal">I send crypto → receive PayPal</option>
                      <option value="paypal_crypto">I send PayPal → receive crypto</option>
                      <option value="paypal_wise">I send PayPal → receive Wise</option>
                      <option value="bank_transfer">I send Crypto / PayPal / Wise → receive bank transfer</option>
                    </select>
                  </label>
                  <div class="grid gap-3 sm:grid-cols-[1fr_120px]">
                    <label class="grid gap-1.5 text-sm font-bold">
                      You send
                      <input id="exchange-amount" type="number" min="1" step="0.01" value="100" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]" />
                    </label>
                    <label class="grid gap-1.5 text-sm font-bold">
                      Currency
                      <select id="exchange-currency" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2.5 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]">
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="SEK">SEK</option>
                      </select>
                    </label>
                  </div>
                  <div class="rounded-xl border border-[#7fe9ff]/35 bg-[#07192d]/85 p-4 text-white">
                    <p class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7fe9ff]">You should receive around</p>
                    <p id="exchange-estimate-result" class="mt-1 text-[28px] font-extrabold leading-tight">$95.00 – $96.00</p>
                    <p id="exchange-estimate-detail" class="mt-2 text-[13px] leading-relaxed text-[#dbeafe]"></p>
                  </div>
                  <p class="text-[11px] leading-snug text-[var(--panel-muted)]">Estimate only. Do not send funds before the final rate and payment details are confirmed.</p>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-5">
            <h2 class="text-xl font-extrabold">Available exchange types</h2>
            <div class="mt-3 grid gap-2">
              <div class="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm">
                <span>Crypto via Binance → PayPal</span>
                <strong class="text-[var(--header-accent)]">0.95–0.96</strong>
              </div>
              <div class="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm">
                <span>PayPal → crypto via Binance</span>
                <strong class="text-[var(--header-accent)]">0.95–0.96</strong>
              </div>
              <div class="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm">
                <span>PayPal → Wise</span>
                <strong class="text-[var(--header-accent)]">0.95–0.96</strong>
              </div>
              <div class="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-[var(--admin-border)] px-3 py-2.5 text-sm">
                <span>Crypto / PayPal / Wise → bank account</span>
                <strong class="text-[var(--header-accent)]">Quote</strong>
              </div>
            </div>
          </section>

          <section class="rounded-[14px] border border-[#7fe9ff]/30 bg-[#7fe9ff]/10 p-5 text-[var(--panel-text)] sm:p-6">
            <h2 class="text-2xl font-extrabold">Ready to exchange?</h2>
            <p class="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--panel-muted)]">
              Contact me with your amount, currency, what you send, and what you want to receive. For bank transfer, also include the destination country.
            </p>
          </section>
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;
}

export function renderHoneygainPage(root: HTMLElement): void {
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
        <main class="${pageInner} py-6 sm:py-8">
          <a
            href="/"
            class="inline-flex min-h-11 items-center rounded-lg border border-[#7fe9ff]/45 px-4 py-2.5 text-[15px] font-semibold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10 active:opacity-90 sm:min-h-0 sm:px-3 sm:py-2 sm:text-[14px]"
          >
            ← Home
          </a>

          <section class="mt-5 overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
            <div class="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div class="p-5 sm:p-7 lg:p-9">
                <p class="inline-flex rounded-full border border-[#f6c44c]/45 bg-[#f6c44c]/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#c58a10]">
                  Passive earning app
                </p>
                <h1 class="mt-4 max-w-3xl text-[30px] font-extrabold leading-[1.05] tracking-tight text-[var(--panel-text)] sm:text-[42px] lg:text-[52px]">
                  Turn your unused internet into small rewards
                </h1>
                <p class="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--panel-muted)] sm:text-[18px]">
                  Honeygain is an app that can run quietly in the background and lets you earn credits by sharing a small part of your unused internet bandwidth with its secure network.
                </p>
                <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="${HONEYGAIN_REFERRAL_URL}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#f6c44c] px-5 py-3 text-[15px] font-extrabold text-[#182033] transition hover:bg-[#ffd873]"
                  >
                    Try Honeygain
                  </a>
                  <a
                    href="#how-honeygain-works"
                    class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#7fe9ff]/45 px-5 py-3 text-[15px] font-bold text-[#7fe9ff] transition hover:bg-[#7fe9ff]/10"
                  >
                    How it works
                  </a>
                </div>
              </div>

              <div class="border-t border-[var(--admin-border)] bg-[linear-gradient(145deg,rgba(127,233,255,0.18),rgba(246,196,76,0.18))] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-9">
                <div class="grid h-full content-center gap-3">
                  <div class="rounded-lg border border-white/20 bg-black/20 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                    <p class="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7fe9ff]">The simple idea</p>
                    <p class="mt-2 text-[28px] font-extrabold leading-tight">Install. Stay online. Earn credits.</p>
                    <p class="mt-3 text-[14px] leading-relaxed text-[#dbeafe]">
                      Earnings depend on network demand in your region, connection uptime, and active devices. You stay in control and can pause usage whenever needed.
                    </p>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-center text-[12px] font-bold text-[var(--panel-text)]">
                    <div class="rounded-md border border-[var(--admin-border)] bg-[var(--panel-bg)] px-2 py-3">Desktop</div>
                    <div class="rounded-md border border-[var(--admin-border)] bg-[var(--panel-bg)] px-2 py-3">Mobile</div>
                    <div class="rounded-md border border-[var(--admin-border)] bg-[var(--panel-bg)] px-2 py-3">Passive</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="mt-5 overflow-hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
            <img
              src="/honeygain-dashboard.jpg"
              alt="Honeygain dashboard showing current balance, earnings chart, achievements, and referral rewards"
              class="h-auto w-full object-cover"
              loading="eager"
              width="2048"
              height="1100"
            />
            <div class="border-t border-[var(--admin-border)] p-4 sm:p-5">
              <p class="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#c58a10]">Dashboard preview</p>
              <p class="mt-1 text-sm leading-relaxed text-[var(--panel-muted)]">
                Honeygain shows balance, earning activity, achievements, and referral progress in one dashboard, so users can follow how their credits build up over time.
              </p>
            </div>
          </section>

          <section id="how-honeygain-works" class="mt-5 grid gap-4 md:grid-cols-3">
            <article class="rounded-[10px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-5 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
              <p class="text-[13px] font-extrabold text-[#c58a10]">1. Install the app</p>
              <h2 class="mt-2 text-xl font-extrabold">Set it up once</h2>
              <p class="mt-2 text-sm leading-relaxed text-[var(--panel-muted)]">Honeygain is available on common desktop and mobile platforms, so users can choose the device that fits their routine.</p>
            </article>
            <article class="rounded-[10px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-5 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
              <p class="text-[13px] font-extrabold text-[#c58a10]">2. Share unused bandwidth</p>
              <h2 class="mt-2 text-xl font-extrabold">Runs in the background</h2>
              <p class="mt-2 text-sm leading-relaxed text-[var(--panel-muted)]">The app uses idle internet capacity for Honeygain's network while you continue using your device normally.</p>
            </article>
            <article class="rounded-[10px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-5 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)]">
              <p class="text-[13px] font-extrabold text-[#c58a10]">3. Collect rewards</p>
              <h2 class="mt-2 text-xl font-extrabold">Cash out later</h2>
              <p class="mt-2 text-sm leading-relaxed text-[var(--panel-muted)]">Credits can be converted after the minimum payout threshold is reached, with payout options such as PayPal or JMPT.</p>
            </article>
          </section>

          <section class="mt-5 rounded-[14px] border border-[#7fe9ff]/30 bg-[#7fe9ff]/10 p-5 text-[var(--panel-text)] sm:p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-2xl font-extrabold">Curious enough to try it?</h2>
                <p class="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--panel-muted)]">
                  Use this referral link if you want to start from Tanne Hub. Always check Honeygain's current terms, payout rules, and availability in your country before using it.
                </p>
              </div>
              <a
                href="${HONEYGAIN_REFERRAL_URL}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[#f6c44c] px-5 py-3 text-[15px] font-extrabold text-[#182033] transition hover:bg-[#ffd873]"
              >
                Open Honeygain
              </a>
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
  const lang = getNewsLanguage();
  const localizedPost = post ? getLocalizedPost(post, lang) : null;
  const hasVietnamese = post ? postHasVietnamese(post) : false;

  if (localizedPost) {
    setPostSocialMeta(localizedPost);
  }

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
              : `<article class="raid-article raid-article-shell mx-auto max-w-[980px] rounded-[14px] bg-[var(--panel-bg)] p-5 shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-6 md:px-7">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <a href="/?page=news" class="inline-flex rounded-md border border-[#7fe9ff]/45 px-3 py-1.5 text-xs font-semibold text-[#7fe9ff] hover:bg-[#7fe9ff]/10">← Raid news</a>
                    <div class="inline-flex rounded-md border border-white/15 bg-black/15 p-1" aria-label="Article language">
                      <a href="/share/${encodeURIComponent(post.id)}?lang=en" aria-label="Read in English" title="English" class="inline-flex h-8 w-9 items-center justify-center rounded text-lg ${lang === "en" ? "bg-[#7fe9ff]/20 ring-1 ring-[#7fe9ff]/35" : "opacity-70 hover:bg-white/10 hover:opacity-100"}">🇬🇧</a>
                      <a href="/share/${encodeURIComponent(post.id)}?lang=vi" aria-label="Read in Vietnamese" title="Tiếng Việt" class="inline-flex h-8 w-9 items-center justify-center rounded text-lg ${lang === "vi" ? "bg-[#ffaa00]/20 ring-1 ring-[#ffaa00]/35" : "opacity-70 hover:bg-white/10 hover:opacity-100"}">🇻🇳</a>
                    </div>
                  </div>
                  ${lang === "vi" && !hasVietnamese ? `<p class="mt-3 rounded-md border border-[#ffaa00]/35 bg-[#ffaa00]/10 px-3 py-2 text-xs font-semibold text-[#ffd58a]">Vietnamese translation is not available for this article yet, so the English version is shown.</p>` : ""}
                  <h1 class="raid-article-main-title mt-3 text-2xl font-extrabold">${escapeHtml(localizedPost!.title)}</h1>
                  <p class="mt-1.5 text-[12px] font-semibold tracking-[0.01em]" style="color: color-mix(in srgb, #ffaa00 80%, var(--news-card-text) 20%);">
                    Updated: ${new Date(post.createdAt).toLocaleString()}
                  </p>
                  ${localizedPost!.caption ? `<p class="mt-2 text-sm" style="color: color-mix(in srgb, var(--news-card-text) 78%, transparent);">${escapeHtml(localizedPost!.caption)}</p>` : ""}
                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    ${renderHelpfulButton(post.id)}
                    <span class="text-xs" style="color: color-mix(in srgb, var(--news-card-text) 68%, transparent);">Tap Like if this article helped you.</span>
                  </div>
                  <div class="raid-article-body mt-5 text-[var(--news-card-text)]">${renderPostArticleBodyHtml(localizedPost!)}</div>
                  <div class="mt-6 rounded-xl border border-[#1877f2]/30 bg-[#1877f2]/10 px-4 py-3">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p class="text-sm font-extrabold text-[var(--news-card-text)]">Like this article?</p>
                        <p class="mt-0.5 text-xs" style="color: color-mix(in srgb, var(--news-card-text) 68%, transparent);">Your Like helps Tanne Hub know what content to write next.</p>
                      </div>
                      ${renderHelpfulButton(post.id)}
                    </div>
                  </div>
                  <p class="mt-4 text-xs" style="color: color-mix(in srgb, var(--news-card-text) 72%, transparent);">By Tanne Hub · ${new Date(post.createdAt).toLocaleString()}</p>
                </article>`
          }
        </main>
        ${renderSiteFooter()}
      </div>
    </div>
  `;

  bindHelpfulReactionButtons();

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
        <main id="admin-dashboard-page" class="${pageInner} py-4 sm:py-8">
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

          <div id="admin-dashboard-content" class="theme-smooth hidden rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-3 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] sm:p-4 md:p-6">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
              <div>
                <h1 class="text-2xl font-extrabold text-[var(--admin-heading)]">Admin dashboard</h1>
                <p class="mt-1 text-sm text-[var(--panel-muted)]">Pick a section from the menu (stacked on small screens).</p>
              </div>
              <a href="/" class="text-xs font-semibold text-[var(--admin-accent)] hover:underline">← Back to home</a>
            </div>

            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
              <nav class="admin-dashboard-tabs -mx-1 flex shrink-0 snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:sticky lg:top-24 lg:mx-0 lg:w-[240px] lg:flex-col lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden" aria-label="Admin sections">
                <button type="button" data-admin-tab="posts" id="admin-tab-posts" class="min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-accent-muted)] lg:min-w-0">
                  1. Posts & Raid news
                </button>
                <button type="button" data-admin-tab="raid" id="admin-tab-raid" class="min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)] lg:min-w-0">
                  2. Raid Shadow Legends accounts
                </button>
	                <button type="button" data-admin-tab="promo" id="admin-tab-promo" class="min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)] lg:min-w-0">
	                  3. Promo code
	                </button>
	                <button type="button" data-admin-tab="profit" id="admin-tab-profit" class="min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)] lg:min-w-0">
	                  4. Profit tracker
	                </button>
              </nav>

              <div class="min-w-0 flex-1 space-y-6">
                <section id="admin-panel-posts" class="admin-dash-panel theme-smooth rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3 sm:p-4 md:p-5">
                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Edit posts (Raid news)</h2>
                  <p class="mt-1 text-xs text-[var(--admin-subtle)]">Paragraphs and images, upload or URL. Click a block first, then + Image/+ Paragraph inserts below it. Use ↑ ↓ to reorder blocks.</p>
                  <form id="admin-post-create-form" class="mt-4 space-y-2.5">
                    <input id="admin-post-title" type="text" maxlength="120" required placeholder="Title" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                    <input id="admin-post-caption" type="text" maxlength="180" placeholder="Caption (optional)" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                    <details class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                      <summary class="cursor-pointer text-xs font-bold text-[var(--admin-accent-muted)]">Vietnamese translation (optional)</summary>
                      <div class="mt-3 space-y-2">
                        <input id="admin-post-title-vi" type="text" maxlength="140" placeholder="Vietnamese title" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <input id="admin-post-caption-vi" type="text" maxlength="220" placeholder="Vietnamese caption (optional)" class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <textarea id="admin-post-content-vi" rows="8" placeholder="Vietnamese article body. Optional. Supports headings, bullets, and skill/effect directives." class="admin-dash-input min-h-[180px] w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"></textarea>
                        <p class="text-[11px] leading-snug text-[var(--admin-subtle)]">If empty, readers who choose Vietnamese will see the English version for this article.</p>
                      </div>
                    </details>
	                    <div class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-[11px] text-[var(--admin-subtle)]">
	                      Editor supports <strong>bold</strong>, <em>italic</em>, line breaks, bullets, and text color via toolbar in each paragraph block.
	                    </div>
	                    <div class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--admin-tab-active-border)]/45 bg-[var(--admin-tab-active-bg)]/25 px-3 py-2">
	                      <p class="text-[11px] leading-snug text-[var(--admin-subtle)]">
	                        Fixed Raid news structure keeps each post consistent: cover image first, quick summary, update details, impact, and closing note.
	                      </p>
	                      <button id="admin-post-use-raid-template" type="button" class="rounded-md border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-accent-muted)] hover:brightness-110">
	                        Use Raid news template
	                      </button>
	                    </div>
	                    <div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
                      <div class="min-w-0">
                        <p class="mb-1 text-xs font-semibold text-[var(--admin-subtle)]">Content</p>
                        <div id="admin-post-body-blocks" class="space-y-2"></div>
                        <div class="mt-2 flex flex-wrap gap-2">
                          <button id="admin-post-add-text" type="button" class="rounded-md border border-[var(--admin-tab-active-border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">+ Paragraph</button>
                          <button id="admin-post-add-image" type="button" class="rounded-md border border-[var(--admin-input-border)] bg-transparent px-3 py-1.5 text-xs font-semibold text-[var(--admin-btn-ghost-text)] hover:bg-[var(--admin-tab-idle-hover)]">+ Image</button>
                        </div>
                      </div>
                      <div class="min-w-0 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3 lg:sticky lg:top-3">
                        <div class="mb-2 flex items-center justify-between gap-2">
                          <p class="text-xs font-semibold text-[var(--admin-accent-muted)]">Live preview</p>
                          <span class="text-[10px] text-[var(--admin-muted)]">Auto updates while editing</span>
                        </div>
                        <div id="admin-post-live-preview" class="max-h-[48vh] min-h-[260px] overflow-auto rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-inner-bg)] p-3 sm:max-h-[68vh] sm:min-h-[420px]"></div>
                      </div>
                    </div>
                    <p id="admin-post-feedback" class="hidden rounded-md px-3 py-2 text-xs"></p>
                    <div class="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      <button id="admin-post-save-draft" type="button" class="min-h-11 rounded-md border border-[var(--admin-input-border)] bg-transparent px-4 py-2 text-sm font-bold text-[var(--admin-btn-ghost-text)] transition hover:bg-[var(--admin-tab-idle-hover)]">
                        Save draft
                      </button>
                      <button type="submit" class="min-h-11 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">
                        Publish post
                      </button>
                    </div>
                  </form>
	                  <div class="mt-6 border-t border-[var(--admin-border)] pt-4">
	                    <div class="flex flex-wrap items-end justify-between gap-2">
	                      <div>
	                        <h3 class="text-sm font-semibold text-[var(--admin-accent-muted)]">Draft news</h3>
	                        <p class="mt-0.5 text-[11px] text-[var(--admin-subtle)]">Saved drafts stay private here until you publish them.</p>
	                      </div>
	                    </div>
	                    <div id="admin-post-drafts-list" class="mt-2.5 space-y-2"></div>
	                  </div>
	                  <div class="mt-6 border-t border-[var(--admin-border)] pt-4">
	                    <h3 class="text-sm font-semibold text-[var(--admin-accent-muted)]">Recent posts</h3>
	                    <div id="admin-posts-list" class="mt-2.5 space-y-2"></div>
	                  </div>
		                </section>

                <section id="admin-panel-raid" class="admin-dash-panel theme-smooth hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3 sm:p-4 md:p-5">
                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Raid Shadow Legends accounts</h2>
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
                    <div class="mt-2 grid grid-cols-1 sm:flex sm:justify-end">
                      <button id="admin-raid-selling-submit" type="submit" class="min-h-11 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">
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
                    <p class="mt-2 text-[11px] text-[var(--admin-muted)]">Quick tags (toggle on/off - always shown outside the grid):</p>
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
                    <p class="mt-2 text-[11px] text-[var(--admin-muted)]">Rarity (toggle on/off to filter):</p>
                    <div
                      id="admin-raid-champion-rarity-filters"
                      class="mt-1.5 flex flex-wrap gap-2"
                      role="group"
                      aria-label="Filter by rarity"
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
                  <p id="admin-raid-accounts-feedback" class="mt-2 hidden text-xs text-[var(--admin-success-inline)]"></p>
                </section>

	                <section id="admin-panel-promo" class="admin-dash-panel theme-smooth hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3 sm:p-4 md:p-5">
		                  <h2 class="text-lg font-bold text-[var(--admin-heading)]">Raid Shadow Legends promo code</h2>
		                  <p class="mt-1 text-xs text-[var(--admin-subtle)]">Update RSL game reward codes shown from the navbar scroll.</p>
		                  <form id="admin-promo-code-form" class="mt-4 space-y-2.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
		                    <label class="flex items-center gap-2 text-xs font-semibold text-[var(--admin-subtle)]">
		                      <input id="admin-promo-active" type="checkbox" class="accent-[var(--admin-accent)]" />
		                      Show RSL promo code in navbar
		                    </label>
		                    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
		                      <input id="admin-promo-code" type="text" maxlength="160" placeholder="New RSL code, comma separated if many" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 font-mono text-sm uppercase text-[var(--admin-input-text)] outline-none placeholder:font-sans placeholder:normal-case placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
		                      <input id="admin-promo-expires" type="text" maxlength="40" placeholder="Updated date, e.g. 2026-05-10" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
		                    </div>
		                    <textarea id="admin-promo-description" rows="3" maxlength="220" placeholder="Reward from this code, e.g. Energy, silver, XP boost..." class="admin-dash-input w-full rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]"></textarea>
	                    <p id="admin-promo-feedback" class="hidden rounded-md px-3 py-2 text-xs"></p>
	                    <div class="grid grid-cols-1 sm:flex sm:justify-end">
	                      <button type="submit" class="min-h-11 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">
	                        Save promo code
	                      </button>
	                    </div>
	                  </form>
                    <div class="mt-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Saved promo codes</h3>
                        <p class="text-[11px] text-[var(--admin-muted)]">Delete expired codes here.</p>
                      </div>
                      <div id="admin-promo-history-list" class="mt-2.5 space-y-2"></div>
                    </div>
	                </section>

	                <section id="admin-panel-profit" class="admin-dash-panel theme-smooth hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3 sm:p-4 md:p-5">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 class="text-lg font-bold text-[var(--admin-heading)]">Tanne Profit Tracker</h2>
                        <p class="mt-1 text-xs text-[var(--admin-subtle)]">Private admin tool for account buy/sell cost, revenue, and profit by week/month.</p>
                      </div>
                      <p class="rounded-md border border-[var(--admin-tab-active-border)]/45 bg-[var(--admin-tab-active-bg)]/25 px-2.5 py-1.5 text-[11px] font-semibold text-[var(--admin-accent-muted)]">Admin only</p>
                    </div>

                    <div id="profit-summary-grid" class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"></div>

                    <form id="profit-tracker-form" class="mt-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Create / edit trade</h3>
                        <button id="profit-tracker-reset" type="button" class="rounded border border-[var(--admin-input-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-btn-ghost-text)] hover:bg-[var(--admin-tab-idle-hover)]">Reset form</button>
                      </div>
                      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input id="profit-account-name" type="text" maxlength="100" placeholder="Account / deal name (required)" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <input id="profit-game" type="text" maxlength="80" value="Raid Shadow Legends" placeholder="Game" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <label class="grid gap-1 text-[11px] font-semibold text-[var(--admin-subtle)]">
                          Buy date
                          <input id="profit-buy-date" type="date" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]" />
                        </label>
                        <label class="grid gap-1 text-[11px] font-semibold text-[var(--admin-subtle)]">
                          Buy price
                          <input id="profit-buy-price" type="number" min="0" step="0.01" placeholder="0.00" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        </label>
                        <label class="grid gap-1 text-[11px] font-semibold text-[var(--admin-subtle)]">
                          Sell date
                          <input id="profit-sell-date" type="date" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]" />
                        </label>
                        <label class="grid gap-1 text-[11px] font-semibold text-[var(--admin-subtle)]">
                          Sell price
                          <input id="profit-sell-price" type="number" min="0" step="0.01" placeholder="0.00" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        </label>
                        <select id="profit-status" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]">
                          <option value="in_stock">In stock</option>
                          <option value="reserved">Reserved</option>
                          <option value="sold">Sold</option>
                        </select>
                        <input id="profit-payment-method" type="text" maxlength="80" placeholder="Payment method, e.g. PayPal / Crypto" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <input id="profit-customer-name" type="text" maxlength="80" placeholder="Customer (optional)" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                        <textarea id="profit-notes" rows="3" maxlength="500" placeholder="Notes: source, account ID, deal proof, delivery status..." class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)] sm:col-span-2"></textarea>
                      </div>
                      <p id="profit-tracker-feedback" class="mt-2 hidden rounded-md px-3 py-2 text-xs"></p>
                      <div class="mt-3 grid grid-cols-1 sm:flex sm:justify-end">
                        <button id="profit-tracker-submit" type="submit" class="min-h-11 rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-bold text-[var(--admin-submit-text)] transition hover:brightness-110">Save trade</button>
                      </div>
                    </form>

                    <div class="mt-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <h3 class="text-sm font-semibold text-[var(--admin-heading)]">Trade history</h3>
                        <p class="text-[11px] text-[var(--admin-muted)]">Sold trades count toward profit. Inventory capital shows unsold cost.</p>
                      </div>
                      <div id="profit-trades-list" class="mt-2.5 space-y-2"></div>
                    </div>
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
