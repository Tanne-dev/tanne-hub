import { escapeHtml } from "./postBody";
import { siteText } from "./newsLanguage";
import { getPromoCodeSettings } from "./promoCodeStore";

const promoGiftIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-[var(--header-accent)]" aria-hidden="true">
    <rect x="3" y="8" width="18" height="13" rx="2"></rect>
    <path d="M12 8v13"></path>
    <path d="M3 12h18"></path>
    <path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8"></path>
    <path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8"></path>
  </svg>`;

export function renderNavbarPromoCodeHtml(): string {
  const promo = getPromoCodeSettings();
  const entries = promo.history;
  const hasCodes = entries.length > 0;
  const codeList = hasCodes
    ? [...entries]
        .reverse()
        .map(
          (entry) => `
            <li class="promo-scroll-code-row">
              <span class="min-w-0">
                <span class="promo-scroll-code block">${escapeHtml(entry.code)}</span>
                ${entry.reward ? `<span class="mt-1 block text-[12px] font-semibold leading-snug text-[#604817]">${siteText("promoReward")}: ${escapeHtml(entry.reward)}</span>` : ""}
                ${entry.updatedAt ? `<span class="mt-1 block text-[11px] font-bold text-[#795c20]">${siteText("promoUpdated")}: ${escapeHtml(entry.updatedAt)}</span>` : ""}
              </span>
            </li>`,
        )
        .join("")
    : `<li class="promo-scroll-empty">${siteText("noPromoCodes")}</li>`;

  return `<div id="navbar-promo-code" class="relative min-w-0 shrink-0">
    <button
      id="navbar-promo-code-button"
      type="button"
      class="inline-flex min-h-9 items-center gap-1.5 rounded-md border ${hasCodes ? "border-[#7fe9ff]/45 bg-[#7fe9ff]/10" : "border-[var(--header-nav-border)]"} px-2.5 py-1.5 text-[12px] font-bold text-[var(--header-nav-text)] transition hover:border-[#7fe9ff]/55 hover:bg-[#7fe9ff]/10 sm:text-[13px]"
      aria-expanded="false"
      aria-controls="navbar-promo-scroll"
    >
      ${promoGiftIcon}
      <span>${siteText("promoCodeLabel")}</span>
      <span class="rounded border border-[#7fe9ff]/35 px-1.5 py-0.5 font-mono text-[11px] text-[var(--header-accent)]">RSL</span>
    </button>
    <div id="navbar-promo-scroll" class="promo-scroll-shell" aria-hidden="true">
      <div class="promo-scroll-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#795c20]">${siteText("raidRewards")}</p>
            <h3 class="mt-1 text-[18px] font-extrabold text-[#34230a]">${siteText("rslPromoCodesTitle")}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#604817]">${siteText("rslPromoCodesIntro")}</p>
          </div>
          <button id="navbar-promo-close" type="button" class="promo-scroll-close" aria-label="${siteText("closePromoCodes")}">${siteText("close")}</button>
        </div>
        <ul class="mt-4 space-y-2">${codeList}</ul>
      </div>
    </div>
  </div>`;
}
