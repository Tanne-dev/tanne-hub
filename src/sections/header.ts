import { brandLogoImg } from "../partials/brandLogo";
import { pageInner } from "../layout";

/** Thanh điều hướng trên cùng: logo, ô tìm kiếm, ngôn ngữ. */
export function renderHeader(): string {
  return `
      <header id="site-header" class="sticky top-0 z-20 w-full transition-[background-image,background-color] duration-300">
        <div class="${pageInner}">
          <div class="site-header-inner px-2.5 sm:px-4 lg:px-5 xl:px-6">
          <!-- Top bar: mobile — logo+hành động / dưới là tìm kiếm; sm+ — logo | search (giới hạn ~560px, căn giữa) | hành động -->
          <div class="site-header-top gloss-hover-frame allow-overflow flex flex-col gap-2.5 py-2.5 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:py-3 lg:gap-6">
            <div class="flex w-full items-center justify-between gap-2 sm:contents">
            <a
              href="/"
              class="site-header-brand flex min-h-11 min-w-0 shrink-0 items-center gap-2 rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--header-bg-end)] sm:col-start-1 sm:row-start-1"
            >
              ${brandLogoImg()}
              <span class="site-header-brand-text text-[18px] font-extrabold tracking-tight text-[var(--header-brand-text)] sm:text-[20px]">Tanne Hub</span>
            </a>

            <div class="mr-[30px] flex shrink-0 items-center justify-end gap-2 sm:col-start-3 sm:row-start-1">
              <a
                id="header-shop-cart-link"
                href="/?page=cart"
                class="relative inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md border border-[var(--header-login-border)] text-[var(--header-login-text)] transition hover:bg-[var(--header-login-hover-bg)] active:opacity-90 sm:min-h-10 sm:min-w-10 sm:rounded-lg"
                aria-label="Shopping cart"
                title="Your cart — Raid listings"
              >
                <svg
                  class="h-[22px] w-[22px] shrink-0 sm:h-5 sm:w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span
                  id="header-shop-cart-badge"
                  class="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#7fe9ff] px-1 text-[10px] font-extrabold leading-none text-[#0b1f35] shadow-sm hidden"
                  aria-hidden="true"
                  >0</span>
              </a>
              <div id="account-menu-wrap" class="relative">
                <button
                  id="open-login-modal"
                  type="button"
                  class="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md border border-[var(--header-login-border)] bg-transparent px-4 py-2.5 text-[14px] font-bold text-[var(--header-login-text)] transition hover:bg-[var(--header-login-hover-bg)] active:opacity-90"
                >
                  <span id="login-btn-label">Log in</span>
                  <svg
                    id="account-menu-caret"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="hidden h-3 w-3 transition-transform duration-200"
                    aria-hidden="true"
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5"></path>
                  </svg>
                </button>
                <div
                  id="account-options-menu"
                  class="absolute right-0 top-full z-40 mt-2 hidden w-[min(100vw-2rem,300px)] min-w-[248px] rounded-md border border-white/15 bg-[#0d2740] p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
                  role="menu"
                >
                  <div id="account-menu-identity" class="hidden border-b border-white/10 px-2.5 pb-2.5 pt-1 mb-1.5" role="presentation">
                    <p id="account-menu-identity-role" class="text-[10px] font-bold uppercase tracking-wide text-[#7fe9ff]/75"></p>
                    <p id="account-menu-identity-detail" class="mt-1 text-[13px] font-semibold leading-snug text-[#e6f6ff] break-words"></p>
                  </div>
                  <div id="account-admin-dashboard-submenu" class="hidden border-b border-white/10 pb-1.5 mb-1.5">
                    <a role="menuitem" class="block min-h-11 rounded px-3 py-2.5 text-[14px] font-semibold leading-snug text-[#aeefff] hover:bg-white/5" href="/?page=dashboard">Admin dashboard</a>
                    <a role="menuitem" class="block min-h-11 rounded px-3 py-2.5 text-[14px] leading-snug text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="/?page=dashboard&tab=posts">1. Posts & Raid news</a>
                    <a role="menuitem" class="block min-h-11 rounded px-3 py-2.5 text-[14px] leading-snug text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="/?page=dashboard&tab=raid">2. Raid Shadow Legends accounts</a>
                    <a role="menuitem" class="block min-h-11 rounded px-3 py-2.5 text-[14px] leading-snug text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="/?page=dashboard&tab=epic">3. Epic Seven accounts</a>
                  </div>
                  <button id="account-logout-option" type="button" role="menuitem" class="min-h-11 w-full rounded px-3 py-2.5 text-left text-[14px] font-semibold text-[#d6dbf0] transition hover:bg-white/10 hover:text-white">
                    Logout
                  </button>
                </div>
              </div>
            </div>
            </div>

            <div class="w-full min-w-0 sm:col-start-2 sm:row-start-1 sm:max-w-[560px] sm:justify-self-center">
              <div class="flex w-full items-center gap-2.5 rounded-md border border-[var(--header-search-border)] bg-[var(--header-search-bg)] px-3 py-2 sm:px-4 sm:py-2.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5 shrink-0 text-[var(--header-search-icon)]"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7"></circle>
                  <path d="M21 21l-4.3-4.3"></path>
                </svg>
                <input
                  class="min-h-11 w-full bg-transparent text-[16px] text-[var(--header-search-text)] placeholder:text-[var(--header-search-placeholder)] outline-none sm:min-h-0 sm:text-[15px]"
                  type="search"
                  placeholder="Search your items"
                  enterkeyhint="search"
                  autocomplete="off"
                />
              </div>
            </div>
          </div>

          <!-- Nav bar: cuộn ngang trên mobile -->
          <div class="flex flex-col gap-2 border-t border-[var(--header-nav-border)] py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:py-3">
            <nav class="site-header-nav -mx-0.5 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overscroll-x-contain px-0.5 pb-1 text-[15px] [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-none sm:min-w-0 sm:gap-6 sm:overflow-visible sm:pb-0 sm:text-base [&::-webkit-scrollbar]:hidden">
              <div class="relative shrink-0 group">
                <button
                  type="button"
                  class="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-[var(--header-nav-text)] transition hover:text-[var(--header-nav-hover)] active:bg-white/5 sm:min-h-0 sm:px-0"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <span>Exchange</span>
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3 w-3 opacity-80 transition-transform duration-200 group-hover:-rotate-180 group-focus-within:-rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5"></path>
                  </svg>
                </button>
                <div
                  role="menu"
                  class="absolute left-0 top-full z-20 mt-0 hidden w-[200px] rounded-md border border-white/10 bg-[#0d2740] px-1.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block"
                >
                  <a role="menuitem" class="block rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">PayPal</a>
                  <a role="menuitem" class="block rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">Wise</a>
                  <a role="menuitem" class="block rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">Binance</a>
                  <a role="menuitem" class="block rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">Revolut</a>
                  <a role="menuitem" class="block rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">Your bank</a>
                </div>
              </div>
              <div class="relative shrink-0 group">
                <button
                  type="button"
                  class="inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-[var(--header-nav-text)] transition hover:text-[var(--header-nav-hover)] active:bg-white/5 sm:min-h-0 sm:px-0"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  <span>Accounts</span>
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3 w-3 opacity-80 transition-transform duration-200 group-hover:-rotate-180 group-focus-within:-rotate-180"
                    aria-hidden="true"
                  >
                    <path d="M2.5 4.5L6 8l3.5-3.5"></path>
                  </svg>
                </button>
                <div
                  role="menu"
                  class="absolute left-0 top-full z-20 mt-0 hidden w-[220px] rounded-md border border-white/10 bg-[#0d2740] px-1.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:block group-focus-within:block"
                >
                  <a role="menuitem" class="flex items-center gap-2 rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="/?page=raid-accounts">
                    <img src="/game-icons/raid-shadow-legends.png" alt="Raid Shadow Legends" class="h-6 w-6 rounded object-cover" />
                    <span>Raid Shadow Legends</span>
                  </a>
                  <a role="menuitem" class="flex items-center gap-2 rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">
                    <img src="/game-icons/epic-seven.png" alt="Epic Seven" class="h-6 w-6 rounded object-cover" />
                    <span>Epic Seven</span>
                  </a>
                  <a role="menuitem" class="flex items-center gap-2 rounded px-2 py-2 text-[14px] text-[#d6dbf0] hover:bg-white/5 hover:text-white" href="#">
                    <img src="/game-icons/summoners-war.png" alt="Summoners War" class="h-6 w-6 rounded object-cover" />
                    <span>Summoners War</span>
                  </a>
                </div>
              </div>
              <a class="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-2 text-[var(--header-nav-text)] transition hover:text-[var(--header-nav-hover)] active:bg-white/5 sm:min-h-0 sm:px-0 sm:py-0" href="/?page=news">Raid News</a>
              <a class="group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-[var(--header-nav-text)] transition hover:text-[var(--header-nav-hover)] active:bg-white/5 sm:min-h-0 sm:px-0 sm:py-0" href="#">Earn Play
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-3 w-3 opacity-80 transition-transform duration-200 group-hover:-rotate-180"
                  aria-hidden="true"
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5"></path>
                </svg>
              </a>
            </nav>

            <div class="flex shrink-0 items-center justify-between gap-2 border-t border-[var(--header-nav-border)] pt-2 text-[13px] text-[var(--header-muted)] sm:justify-end sm:border-t-0 sm:pt-0 sm:text-sm">
              <span class="inline-flex items-center gap-1.5">
                <span class="text-[var(--header-brand-text)]" aria-hidden="true">◷</span>
                <span class="sm:hidden">24/7</span>
                <span class="hidden sm:inline">24/7 Live Support</span>
              </span>
              <button
                id="theme-toggle"
                type="button"
                aria-label="Toggle theme"
                class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--header-accent)] bg-transparent text-[var(--header-accent)] transition hover:bg-[var(--header-accent-hover-bg)] active:opacity-90 sm:min-h-0 sm:min-w-0 sm:px-2.5 sm:py-1.5 sm:text-[13px] sm:font-bold"
              >
                <span id="theme-toggle-label" class="sr-only">Dark</span>
                <svg
                  id="theme-icon-sun"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4 hidden"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="4"></circle>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="M4.93 4.93l1.41 1.41"></path>
                  <path d="M17.66 17.66l1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="M4.93 19.07l1.41-1.41"></path>
                  <path d="M17.66 6.34l1.41-1.41"></path>
                </svg>
                <svg
                  id="theme-icon-moon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
            </div>
          </div>
          </div>
        </div>
        <div
          id="login-modal"
          class="hidden fixed inset-0 z-40 flex items-end justify-center bg-black/55 px-3 py-0 backdrop-blur-[2px] sm:items-center sm:px-4 sm:py-4"
        >
          <div
            id="login-modal-overlay"
            class="absolute inset-0"
            aria-hidden="true"
          ></div>
          <div class="relative z-10 mb-[max(0.75rem,env(safe-area-inset-bottom))] mt-auto max-h-[min(92dvh,calc(100vh-1rem))] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-2xl border border-white/15 bg-[#0d2740] p-4 text-[#e6f6ff] shadow-[0_18px_45px_rgba(0,0,0,0.45)] sm:mb-0 sm:mt-0 sm:max-h-[min(90dvh,calc(100vh-2rem))] sm:rounded-xl sm:p-5">
            <div class="mb-4 flex items-center justify-between gap-2">
              <h3 class="text-lg font-bold">Member Login</h3>
              <button id="close-login-modal" type="button" class="min-h-10 min-w-10 shrink-0 rounded-lg border border-white/20 text-sm font-semibold hover:bg-white/10">Close</button>
            </div>
            <form id="login-form" class="space-y-3">
              <div>
                <label for="login-email" class="mb-1 block text-xs text-[#c7ceef]">Email</label>
                <input id="login-email" name="email" type="email" required autocomplete="email" class="min-h-11 w-full rounded-md border border-white/20 bg-[#0b1f35] px-3 py-2.5 text-[16px] outline-none focus:border-[#7fe9ff] sm:text-sm" />
              </div>
              <div>
                <label for="login-password" class="mb-1 block text-xs text-[#c7ceef]">Password</label>
                <input id="login-password" name="password" type="password" required autocomplete="current-password" class="min-h-11 w-full rounded-md border border-white/20 bg-[#0b1f35] px-3 py-2.5 text-[16px] outline-none focus:border-[#7fe9ff] sm:text-sm" />
              </div>
              <label class="inline-flex items-center gap-2 text-xs text-[#c7ceef]">
                <input id="toggle-login-passwords" type="checkbox" class="accent-[#7fe9ff]" />
                Show password
              </label>
              <p id="login-feedback" class="hidden rounded-md bg-red-900/35 px-3 py-2 text-xs text-red-200"></p>
              <button id="login-submit" type="submit" class="min-h-12 w-full rounded-md bg-[#7fe9ff] px-3 py-3 text-base font-bold text-[#0d2740] transition hover:brightness-110 active:opacity-90 sm:py-2.5 sm:text-sm">Log in</button>
            </form>
            <div class="mt-4 border-t border-white/10 pt-3">
              <button
                id="toggle-register-panel"
                type="button"
                class="min-h-11 w-full rounded-md border border-[#7fe9ff]/45 bg-transparent px-3 py-2.5 text-sm font-semibold text-[#aeefff] transition hover:bg-[#7fe9ff]/10"
              >
                Register account
              </button>
              <div id="register-panel" class="mt-3 hidden">
              <p class="mb-2 text-xs text-[#c7ceef]">Create your member account:</p>
              <form id="register-email-form" class="space-y-2">
                <input
                  id="register-email-input"
                  name="registerEmail"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="you@example.com"
                  class="min-h-11 w-full rounded-md border border-white/20 bg-[#0b1f35] px-3 py-2.5 text-[16px] outline-none focus:border-[#7fe9ff] sm:text-sm"
                />
                <input
                  id="register-password-input"
                  name="registerPassword"
                  type="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  placeholder="Create password (min 6 chars)"
                  class="min-h-11 w-full rounded-md border border-white/20 bg-[#0b1f35] px-3 py-2.5 text-[16px] outline-none focus:border-[#7fe9ff] sm:text-sm"
                />
                <input
                  id="register-password-confirm-input"
                  name="registerPasswordConfirm"
                  type="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  placeholder="Confirm password"
                  class="min-h-11 w-full rounded-md border border-white/20 bg-[#0b1f35] px-3 py-2.5 text-[16px] outline-none focus:border-[#7fe9ff] sm:text-sm"
                />
                <label class="inline-flex items-center gap-2 text-xs text-[#c7ceef]">
                  <input id="toggle-register-passwords" type="checkbox" class="accent-[#7fe9ff]" />
                  Show passwords
                </label>
                <p id="register-email-feedback" class="hidden rounded-md px-3 py-2 text-xs"></p>
                <button
                  id="register-email-submit"
                  type="submit"
                  class="min-h-12 w-full rounded-md border border-[#7fe9ff]/60 bg-transparent px-3 py-3 text-base font-semibold text-[#aeefff] transition hover:bg-[#7fe9ff]/10 sm:py-2 sm:text-sm"
                >
                  Register Email
                </button>
              </form>
              </div>
            </div>
          </div>
        </div>
      </header>`;
}
