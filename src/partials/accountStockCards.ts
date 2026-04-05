import {
  sortHeroesByRarity,
  type AccountHeroPreview,
  type AccountStockCard,
} from "../content";
import { escapeHtml } from "../postBody";

const rarityTextClass: Record<AccountHeroPreview["rarity"], string> = {
  mythic: "text-red-500",
  mythical: "text-red-500",
  legendary: "text-yellow-500",
  epic: "text-purple-500",
  rare: "text-sky-600",
  common: "text-slate-400",
  uncommon: "text-emerald-600",
};

/** Đoạn mô tả ngắn cho thẻ (plain text → escape). */
function descriptionCardPreview(text: string | undefined, maxChars: number): string {
  if (!text?.trim()) return "";
  const oneLine = text.trim().replace(/\s+/g, " ");
  const cut =
    oneLine.length > maxChars ? `${oneLine.slice(0, maxChars).trimEnd()}…` : oneLine;
  return escapeHtml(cut);
}

function buildAccountCardCover(urls: string[]): string {
  const images = urls.map((u) => u.trim()).filter((u) => u.length > 0);
  if (images.length === 0) return "";

  const outer =
    "-mx-4 -mt-4 mb-3 overflow-hidden rounded-t-xl border-b border-[var(--news-card-border)] sm:-mx-[18px] sm:-mt-[18px] sm:mb-3.5";

  if (images.length === 1) {
    const url = escapeHtml(images[0]);
    return `<div class="${outer}">
         <img src="${url}" alt="" class="account-card-cover max-h-44 w-full object-cover object-center sm:max-h-48" width="640" height="360" loading="lazy" decoding="async" fetchpriority="low" />
       </div>`;
  }

  const slides = images
    .map((raw, i) => {
      const url = escapeHtml(raw);
      const load = i === 0 ? "eager" : "lazy";
      const priority = i === 0 ? "high" : "low";
      return `<div class="account-card-slide w-full min-w-full shrink-0 snap-center snap-always">
        <img src="${url}" alt="" class="max-h-44 w-full object-cover object-center sm:max-h-48" width="640" height="360" loading="${load}" decoding="async" fetchpriority="${priority}" />
      </div>`;
    })
    .join("");

  const dots = images
    .map(
      (_, i) =>
        `<button type="button" data-account-slider-dot="${i}" class="account-card-slider-dot pointer-events-auto h-1.5 rounded-full transition-all ${i === 0 ? "account-card-slider-dot-active" : "w-1.5 bg-white/40 hover:bg-white/60"}" aria-label="Photo ${i + 1} of ${images.length}" aria-current="${i === 0 ? "true" : "false"}"></button>`,
    )
    .join("");

  return `<div class="account-card-media relative ${outer}">
    <div class="account-card-slider-viewport flex w-full touch-pan-x snap-x snap-mandatory overflow-x-auto scroll-smooth overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      ${slides}
    </div>
    <button type="button" class="account-card-slider-prev absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-lg leading-none text-white shadow-md backdrop-blur-[2px] transition hover:bg-black/65" aria-label="Previous photo">‹</button>
    <button type="button" class="account-card-slider-next absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-lg leading-none text-white shadow-md backdrop-blur-[2px] transition hover:bg-black/65" aria-label="Next photo">›</button>
    <div class="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5 px-2">${dots}</div>
  </div>`;
}

function heroRow(h: AccountHeroPreview): string {
  const textCls = rarityTextClass[h.rarity];
  const safeName = escapeHtml(h.name);
  return `
    <li class="min-w-0 truncate text-[15px] font-medium leading-snug sm:text-[16px] ${textCls}">
      ${safeName}
    </li>`;
}

function accountCard(item: AccountStockCard): string {
  const id = escapeHtml(item.id);

  const copyBtn = `
    <button
      type="button"
      class="account-copy-id inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--news-card-border)] text-[var(--panel-muted)] transition hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] active:opacity-80 sm:size-9"
      data-copy-id="${id}"
      title="Copy ID"
      aria-label="Copy ID"
    >
      <svg class="h-4 w-4 sm:h-[18px] sm:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
      </svg>
    </button>`;

  const coverBlock = buildAccountCardCover(item.detailImages ?? []);
  const hasCover = coverBlock.length > 0;

  const descPreview = descriptionCardPreview(item.description, 150);
  const descBlock = descPreview
    ? `<p class="mt-2 line-clamp-3 text-left text-[13px] leading-snug text-[var(--panel-muted)] sm:text-[14px]">${descPreview}</p>`
    : "";
  const shortHint =
    !descPreview && !hasCover
      ? `<p class="mt-2 text-left text-[12px] italic text-[var(--panel-muted)]">Open for photos &amp; full details — message if you need more info.</p>`
      : "";

  const heroesSorted = sortHeroesByRarity(item.heroes);
  const championsBlock =
    heroesSorted.length > 0
      ? `<div class="mt-3 border-t border-[var(--news-card-border)] pt-3 sm:mt-3.5 sm:pt-3.5">
        <p class="mb-2 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--panel-muted)]">Champions</p>
        <ul class="list-none space-y-2 text-left sm:space-y-2.5">
          ${heroesSorted.map(heroRow).join("")}
        </ul>
      </div>`
      : "";

  return `
    <article data-account-id="${id}" class="account-stock-card theme-smooth flex cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--news-card-border)] bg-[var(--panel-bg)] p-4 shadow-[0_2px_14px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(0,0,0,0.24)] active:scale-[0.99] sm:p-[18px] md:p-5">
      ${coverBlock}
      <div class="flex items-center justify-center gap-2">
        <span class="font-mono text-[15px] font-semibold tracking-wide text-[var(--panel-text)] sm:text-base">ID: ${id}</span>
        ${copyBtn}
      </div>
      ${descBlock}
      ${shortHint}
      ${championsBlock}
      <div class="mt-3.5 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-stretch sm:gap-2.5">
        <div
          class="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-[var(--news-card-border)] bg-[color-mix(in_srgb,var(--icon-bg)_85%,transparent)] px-3 py-3 sm:min-h-11"
          aria-label="Price"
        >
          <span class="text-[17px] font-extrabold text-[#7fe9ff] sm:text-base">${escapeHtml(item.priceLabel)}</span>
        </div>
        <button
          type="button"
          data-account-details="${id}"
          class="account-stock-details min-h-12 w-full flex-1 rounded-lg border border-[var(--news-card-border)] bg-[var(--icon-bg)] px-3 py-3 text-center text-[14px] font-bold text-[var(--panel-text)] transition hover:brightness-110 active:opacity-90 sm:min-h-11 sm:py-3.5 sm:text-[15px]"
        >
          View details
        </button>
      </div>
    </article>`;
}

export function renderAccountStockGrid(items: AccountStockCard[]): string {
  return items.map(accountCard).join("");
}
