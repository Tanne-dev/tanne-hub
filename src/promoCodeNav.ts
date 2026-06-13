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
  const entries = [...promo.history].reverse();
  const hasCodes = entries.length > 0;
  const latest = entries[0];
  const codeList = hasCodes
    ? entries
        .map(
          (entry) => `
            <li class="promo-scroll-code-row" data-promo-code-row data-promo-search="${escapeHtml(`${entry.code} ${entry.reward ?? ""} ${entry.updatedAt ?? ""}`.toLowerCase())}">
              <div class="min-w-0">
                <span class="promo-scroll-code block">${escapeHtml(entry.code)}</span>
                <span class="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold leading-snug text-[#7b879f]">
                  ${entry.reward ? `<span>${siteText("promoReward")}: ${escapeHtml(entry.reward)}</span>` : ""}
                  ${entry.updatedAt ? `<span>${siteText("promoUpdated")}: ${escapeHtml(entry.updatedAt)}</span>` : ""}
                </span>
              </div>
              <button type="button" class="promo-copy-btn" data-promo-copy="${escapeHtml(entry.code)}">${siteText("copyPromoCode")}</button>
            </li>`,
        )
        .join("")
    : `<li class="promo-scroll-empty">${siteText("noPromoCodes")}</li>`;
  const countLabel = siteText("promoCodeCount").replace("{count}", String(entries.length));

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
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7fe9ff]">${siteText("raidRewards")}</p>
            <h3 class="mt-1 text-[18px] font-extrabold text-white">${siteText("rslPromoCodesTitle")}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#b9c6df]">${siteText("rslPromoCodesIntro")}</p>
          </div>
          <button id="navbar-promo-close" type="button" class="promo-scroll-close" aria-label="${siteText("closePromoCodes")}">${siteText("close")}</button>
        </div>
        ${
          latest
            ? `<section class="promo-latest-card mt-4">
                <div class="min-w-0">
                  <p class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#f6c44c]">${siteText("latestPromoCode")}</p>
                  <p class="promo-latest-code">${escapeHtml(latest.code)}</p>
                  ${latest.reward ? `<p class="mt-1 text-[12px] font-semibold text-[#dbe7ff]">${siteText("promoReward")}: ${escapeHtml(latest.reward)}</p>` : ""}
                </div>
                <button type="button" class="promo-copy-btn promo-copy-btn-strong" data-promo-copy="${escapeHtml(latest.code)}">${siteText("copyPromoCode")}</button>
              </section>`
            : ""
        }
        <div class="promo-tools mt-3">
          <input id="promo-code-search" type="search" placeholder="${siteText("searchPromoCodes")}" class="promo-search-input" autocomplete="off" />
          <span class="promo-count-pill">${countLabel}</span>
        </div>
        <ul id="promo-code-list" class="promo-code-list mt-3">${codeList}</ul>
        <p id="promo-code-empty-search" class="promo-scroll-empty mt-3 hidden">${siteText("noPromoSearchResults")}</p>
      </div>
    </div>
  </div>`;
}
