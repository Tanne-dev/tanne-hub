import { siteText } from "./newsLanguage";
import { escapeHtml } from "./postBody";
import { getPromoCodeSettings } from "./promoCodeStore";

type PromoTier = "Legendary" | "Epic" | "Rare";

type PromoDisplayEntry = {
  code: string;
  reward?: string;
  updatedAt?: string;
  tier?: PromoTier;
};

const promoGiftIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 shrink-0 text-[var(--header-accent)]" aria-hidden="true">
    <rect x="3" y="8" width="18" height="13" rx="2"></rect>
    <path d="M12 8v13"></path>
    <path d="M3 12h18"></path>
    <path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8"></path>
    <path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8"></path>
  </svg>`;

const newPlayerPromoCodes: PromoDisplayEntry[] = [
  {
    code: "TREEHUGGER",
    tier: "Legendary",
    reward: "1 Legendary Hero Greenwarden Ruarc, 15 Force Brew, 300,000 Silver, 15 Greater Force Potion",
  },
  {
    code: "DESERTQUEEN",
    tier: "Legendary",
    reward: "1 Legendary Hero Tuhanarak, 25 Void Brew, 300,000 Silver, 5 Greater Void Potion",
  },
  {
    code: "GOFAST",
    tier: "Legendary",
    reward: "1 Legendary Hero Razelvarg, 15 Magic Brew, 300,000 Silver, 15 Greater Magic Potion",
  },
  {
    code: "KITTYCUT",
    tier: "Legendary",
    reward: "1 Legendary Hero Cheshire Cat, 15 Spirit Brew, 300,000 Silver, 15 Greater Spirit Potion",
  },
  {
    code: "FIRESTORM",
    tier: "Legendary",
    reward: "1 Legendary Hero Sicia Flametongue, 25 Force Brew, 300,000 Silver, 5 Greater Force Potion",
  },
  {
    code: "MADBOMBER",
    tier: "Legendary",
    reward: "1 Legendary Hero Gaius the Gleeful, 15 Magic Brew, 300,000 Silver, 15 Greater Magic Potion",
  },
  {
    code: "UNBROKEN",
    tier: "Legendary",
    reward: "1 Legendary Hero Giath the Truthshield, 15 Magic Brew, 300,000 Silver, 15 Greater Magic Potion",
  },
  {
    code: "GETGRANDOAK",
    tier: "Legendary",
    reward: "1 Legendary Hero Grand Oak Padraig, 15 Spirit Brew, 300,000 Silver, 15 Greater Spirit Potion",
  },
  {
    code: "SUPERVICTORY",
    tier: "Legendary",
    reward: "1 Legendary Hero Pelops the Victor, 15 Spirit Brew, 300,000 Silver, 15 Greater Spirit Potion",
  },
  {
    code: "UDKING",
    tier: "Legendary",
    reward: "1 Legendary Hero Ultimate Deathknight, 15 Force Brew, 300,000 Silver, 15 Greater Force Potion",
  },
  {
    code: "FORTRESS",
    tier: "Legendary",
    reward: "1 Legendary Hero Walking Tomb Dreng, 15 Spirit Brew, 300,000 Silver, 15 Greater Spirit Potion",
  },
  {
    code: "HEARTBREAKER",
    tier: "Legendary",
    reward: "1 Legendary Hero Cupidus, 15 Spirit Brew, 300,000 Silver, 15 Greater Spirit Potion",
  },
  {
    code: "GETALICE",
    tier: "Legendary",
    reward: "1 Legendary Hero Alice The Wanderer, 15 Magic Brew, 300,000 Silver, 15 Greater Magic Potion",
  },
  {
    code: "BIGDAWG",
    tier: "Legendary",
    reward: "1 Legendary Hero Turvold, 15 Void Brew, 300,000 Silver, 15 Greater Void Potion",
  },
  {
    code: "STONECOLD",
    tier: "Epic",
    reward: "1 Epic Hero Thylessia, 3 Rare Skill Tomes, 3 Rank 3 Chickens, 25 Force XP Brews, 200,000 Silver",
  },
  {
    code: "STAGSLAYER",
    tier: "Epic",
    reward: "1 Epic Hero Stag Knight, 1 Epic Skill Tome, 15 Spirit Brew, 150,000 Silver, 15 Greater Arcane Potion",
  },
  {
    code: "FINALSPITE",
    tier: "Epic",
    reward: "1 Epic Hero Uugo, 15 Magic Brew, 300 Energy, 300,000 Silver",
  },
  {
    code: "NEMESIS",
    tier: "Epic",
    reward: "1 Epic Hero Akemtum, 15 Void Brew, 300,000 Silver, 15 Greater Void Potion",
  },
  {
    code: "HEARTOFCOLD",
    tier: "Rare",
    reward: "1 Rare Hero Coldheart, 15 Void Brew, 300,000 Silver, 15 Greater Void Potion",
  },
];

function renderPromoCodeRows(entries: PromoDisplayEntry[]): string {
  if (entries.length === 0) return `<li class="promo-scroll-empty">${siteText("noPromoCodes")}</li>`;

  return entries
    .map(
      (entry) => `
        <li class="promo-scroll-code-row" data-promo-code-row data-promo-search="${escapeHtml(`${entry.code} ${entry.reward ?? ""} ${entry.updatedAt ?? ""} ${entry.tier ?? ""}`.toLowerCase())}">
          <div class="min-w-0">
            <span class="promo-scroll-code block">${escapeHtml(entry.code)}</span>
            <span class="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold leading-snug text-[#aebad2]">
              ${entry.tier ? `<span class="promo-tier-tag promo-tier-${entry.tier.toLowerCase()}">${escapeHtml(entry.tier)}</span>` : ""}
              ${entry.reward ? `<span>${siteText("promoReward")}: ${escapeHtml(entry.reward)}</span>` : ""}
              ${entry.updatedAt ? `<span>${siteText("promoUpdated")}: ${escapeHtml(entry.updatedAt)}</span>` : ""}
            </span>
          </div>
          <button type="button" class="promo-copy-btn" data-promo-copy="${escapeHtml(entry.code)}">${siteText("copyPromoCode")}</button>
        </li>`,
    )
    .join("");
}

export function renderNavbarPromoCodeHtml(): string {
  const promo = getPromoCodeSettings();
  const entries = [...promo.history].reverse();
  const hasCodes = entries.length > 0 || newPlayerPromoCodes.length > 0;
  const allPlayerCodeList = renderPromoCodeRows(entries);
  const newPlayerCodeList = renderPromoCodeRows(newPlayerPromoCodes);
  const countLabel = siteText("promoCodeCount").replace(
    "{count}",
    String(entries.length + newPlayerPromoCodes.length),
  );

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
        <div class="promo-tools mt-3">
          <input id="promo-code-search" type="search" placeholder="${siteText("searchPromoCodes")}" class="promo-search-input" autocomplete="off" />
          <span class="promo-count-pill">${countLabel}</span>
        </div>
        <div class="promo-category-tabs mt-3" role="tablist" aria-label="${escapeHtml(siteText("rslPromoCodesTitle"))}">
          <button type="button" class="promo-category-tab promo-category-tab-active" data-promo-category="all" role="tab" aria-selected="true">
            <span>${siteText("promoAllPlayersTitle")}</span>
            <strong>${entries.length}</strong>
          </button>
          <button type="button" class="promo-category-tab" data-promo-category="newbie" role="tab" aria-selected="false">
            <span>${siteText("promoNewPlayersTitle")}</span>
            <strong>${newPlayerPromoCodes.length}</strong>
          </button>
        </div>
        <div id="promo-code-list" class="promo-code-sections mt-3" data-active-promo-category="all">
          <section class="promo-code-section" data-promo-code-section="all">
            <div class="promo-code-section-heading">
              <h4>${siteText("promoAllPlayersTitle")}</h4>
              <span>${entries.length}</span>
            </div>
            <ul class="promo-code-list">${allPlayerCodeList}</ul>
          </section>
          <section class="promo-code-section hidden" data-promo-code-section="newbie">
            <div class="promo-code-section-heading">
              <h4>${siteText("promoNewPlayersTitle")}</h4>
              <span>${newPlayerPromoCodes.length}</span>
            </div>
            <div class="promo-new-player-warning">
              <strong>${siteText("promoNewPlayersActiveOnly")}</strong>
              <span>${siteText("promoNewPlayersOnePerAccount")}</span>
            </div>
            <ul class="promo-code-list">${newPlayerCodeList}</ul>
          </section>
        </div>
        <p id="promo-code-empty-search" class="promo-scroll-empty mt-3 hidden">${siteText("noPromoSearchResults")}</p>
      </div>
    </div>
  </div>`;
}
