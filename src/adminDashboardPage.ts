import { saveRaidSelectedChampionIds } from "./adminGameAccountsStore";
import {
  escapeHtml,
  postToInitialBlocks,
  renderPostArticleBodyHtml,
  serializePostBody,
  type PostBodyBlock,
} from "./postBody";
import {
  buildImageBlockEl,
  createEmptyTextBlock,
  mountPostBodyBlocks,
  moveBlockElement,
  readPostBodyBlocksFromEditor,
  removeBlockElement,
} from "./postBodyAdminUi";
import {
  createPostRemote,
  deletePostRemote,
  getPosts,
  savePosts,
  syncPostsFromRemote,
  type PostItem,
  updatePostRemote,
} from "./postsStore";
import {
  deletePostDraft,
  getPostDrafts,
  seedPostDraftOnce,
  upsertPostDraft,
} from "./postDraftsStore";
import { raidNewsDraftSeeds } from "./raidNewsDraftSeeds";
import {
  getPromoCodeSettings,
  savePromoCodeSettingsRemote,
  syncPromoCodeSettingsFromRemote,
  type PromoCodeEntry,
} from "./promoCodeStore";
import {
  deleteSellingAccountRemote,
  getSellingAccounts,
  isAccountImageUrl,
  normalizeAccountImageUrl,
  saveSellingAccounts,
  syncSellingAccountsFromRemote,
  upsertSellingAccountRemote,
} from "./sellingAccountsStore";
import { fireAccountListingConfetti } from "./accountListingConfetti";
import { loadRaidChampionCatalogFromSupabase } from "./raidChampionsStore";
import { uploadPostImageRemote } from "./supabase";
import { initProfitTrackerManager } from "./profitTrackerManager";
import { RAID_CHAMPION_CATALOG, type RaidChampion } from "./raidChampionCatalog";
import {
  ACCOUNT_HERO_MORE_EPIC_LABEL,
  ACCOUNT_HERO_MORE_LEGENDARY_LABEL,
  sortHeroesByRarity,
  type AccountHeroPreview,
  type AccountStockCard,
} from "./content";

function createRaidNewsTemplateBlocks(): PostBodyBlock[] {
  return [
    { type: "image", url: "", align: "full", caption: "[Replace with image caption]" },
    {
      type: "text",
      text: [
        "## [color=#ffaa00]**Quick summary**[/color]",
        "[Replace with a short intro below the cover image.]",
        "",
        "- [Replace with the main update in one sentence]",
        "- [Replace with the most important gameplay/shop impact]",
        "- [Replace with date, event window, or requirement if relevant]",
      ].join("\n"),
    },
    {
      type: "text",
      text: [
        "## [color=#ffaa00]**What's new**[/color]",
        "[Replace with the core announcement. Keep this paragraph short and direct.]",
      ].join("\n\n"),
    },
    {
      type: "text",
      text: [
        "## [color=#ffaa00]**Details**[/color]",
        "[Replace with specific details: champion skills, event steps, rewards, account changes, or patch notes.]",
      ].join("\n\n"),
    },
    {
      type: "text",
      text: [
        "## [color=#ffaa00]**Why it matters**[/color]",
        "[Replace with what buyers or players should do next.]",
      ].join("\n\n"),
    },
    {
      type: "text",
      text: [
        "## [color=#ffaa00]**Tanne note**[/color]",
        "[Replace with your final recommendation or shop note.]",
      ].join("\n\n"),
    },
  ];
}

function hasUnfilledPostTemplatePlaceholder(blocks: PostBodyBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === "text") return /\[Replace\b/i.test(block.text);
    return /\[Replace\b/i.test(block.caption ?? "");
  });
}

/** ID 3 chữ số 000–999, không trùng listing khác (bỏ qua giá trị đang gõ trong ô — để đổi ID khi sửa). */
/** Hiển thị trong ô giá (bỏ $ và hậu tố USD nếu có). */
function priceLabelToAmountInput(priceLabel: string): string {
  let t = priceLabel.trim();
  if (t.startsWith("$")) t = t.slice(1).trim();
  t = t.replace(/\s*USD\s*$/i, "").trim();
  return t;
}

/** Lưu: luôn có tiền tố $ (bỏ $ thừa nếu user dán cả ký hiệu). */
function amountInputToPriceLabel(amountRaw: string): string {
  let t = amountRaw.trim();
  if (t.startsWith("$")) t = t.slice(1).trim();
  return t ? `$${t}` : "";
}

function pickUniqueThreeDigitSellingId(currentFieldId: string): string | null {
  const fieldTrim = currentFieldId.trim();
  const taken = new Set(
    getSellingAccounts()
      .map((a) => a.id.trim())
      .filter((id) => id.length > 0 && id !== fieldTrim),
  );
  const ids = Array.from({ length: 1000 }, (_, n) => String(n).padStart(3, "0"));
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  for (const id of ids) {
    if (!taken.has(id)) return id;
  }
  return null;
}

const EMPTY_SELLING_ACCOUNT_STATS: AccountStockCard["stats"] = {
  energy: "",
  silver: "",
  gems: "",
  mythicSkill: "",
  ancientShards: "",
  voidShards: "",
  primalShards: "",
  sacredShards: "",
  redBooks: "",
  blueBooks: "",
};

/** Tag đặc biệt trên listing (không phải champion trong catalog). */
const RAID_EXTRA_MORE_LEGENDARY_ID = "__tanne_more_legendary_champions__";
const RAID_EXTRA_MORE_EPIC_ID = "__tanne_more_epic_champions__";

function heroMatchesExtraLabel(h: AccountHeroPreview, label: string): boolean {
  const n = h.name.trim().toLowerCase();
  const l = label.trim().toLowerCase();
  if (n === l) return true;
  if (l === ACCOUNT_HERO_MORE_LEGENDARY_LABEL.toLowerCase() && n === "more legendary champion") {
    return true;
  }
  if (l === ACCOUNT_HERO_MORE_EPIC_LABEL.toLowerCase() && n === "more epic champion") {
    return true;
  }
  return false;
}

const MEMBER_SESSION_KEY = "tanne-member-session";

type MemberSession = {
  userId: string;
  email: string;
  displayName?: string;
  role: "member" | "admin";
  loggedInAt: number;
};

function readSession(): MemberSession | null {
  const raw = localStorage.getItem(MEMBER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

function isAdminSession(): boolean {
  return readSession()?.role === "admin";
}

type AdminTab = "posts" | "raid" | "promo" | "profit";
const ADMIN_POST_TAG_STYLE_STORAGE_KEY = "tanne-admin-post-tag-style-v1";

function readSavedTagColor(): string {
  const fallback = "#ffaa00";
  try {
    const raw = window.localStorage.getItem(ADMIN_POST_TAG_STYLE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { color?: string };
    if (parsed?.color && /^#[0-9a-fA-F]{6}$/.test(parsed.color)) return parsed.color;
  } catch {
    // ignore malformed local storage payload
  }
  return fallback;
}

function saveTagColor(color: string): void {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return;
  window.localStorage.setItem(
    ADMIN_POST_TAG_STYLE_STORAGE_KEY,
    JSON.stringify({
      color: color.toLowerCase(),
    }),
  );
}

function tabFromUrl(): AdminTab {
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "raid" || t === "posts" || t === "promo" || t === "profit") return t;
  return "posts";
}

export function initAdminDashboardPage(): void {
  const pageRoot = document.querySelector("#admin-dashboard-page");
  if (!pageRoot) return;

  const guestEl = document.querySelector<HTMLElement>("#admin-dashboard-guest");
  const contentEl = document.querySelector<HTMLElement>("#admin-dashboard-content");
  const openLoginBtn = document.querySelector<HTMLButtonElement>("#admin-open-login-from-dashboard");
  const tabPosts = document.querySelector<HTMLButtonElement>("#admin-tab-posts");
  const tabRaid = document.querySelector<HTMLButtonElement>("#admin-tab-raid");
  const tabPromo = document.querySelector<HTMLButtonElement>("#admin-tab-promo");
  const tabProfit = document.querySelector<HTMLButtonElement>("#admin-tab-profit");
  const panelPosts = document.querySelector<HTMLElement>("#admin-panel-posts");
  const panelRaid = document.querySelector<HTMLElement>("#admin-panel-raid");
  const panelPromo = document.querySelector<HTMLElement>("#admin-panel-promo");
  const panelProfit = document.querySelector<HTMLElement>("#admin-panel-profit");

  const raidFb = document.querySelector<HTMLElement>("#admin-raid-accounts-feedback");
  const raidChampionSearch = document.querySelector<HTMLInputElement>("#admin-raid-champion-search");
  const raidChampionRarityFilters = document.querySelector<HTMLElement>(
    "#admin-raid-champion-rarity-filters",
  );
  const raidChampionGrid = document.querySelector<HTMLElement>("#admin-raid-champion-grid");
  const raidSelectedWrap = document.querySelector<HTMLElement>("#admin-raid-selected-champions");
  const raidChampionExtraLegendary = document.querySelector<HTMLButtonElement>(
    "#admin-raid-champion-extra-legendary",
  );
  const raidChampionExtraEpic = document.querySelector<HTMLButtonElement>(
    "#admin-raid-champion-extra-epic",
  );
  const raidSellingAccountsList = document.querySelector<HTMLElement>("#admin-raid-selling-accounts-list");
  const raidSellingForm = document.querySelector<HTMLFormElement>("#admin-raid-selling-form");
  const raidSellingReset = document.querySelector<HTMLButtonElement>("#admin-raid-selling-reset");
  const raidSellingId = document.querySelector<HTMLInputElement>("#admin-raid-selling-id");
  const raidSellingRandomId = document.querySelector<HTMLButtonElement>(
    "#admin-raid-selling-random-id",
  );
  const raidSellingPrice = document.querySelector<HTMLInputElement>("#admin-raid-selling-price");
  const raidSellingDescription = document.querySelector<HTMLTextAreaElement>("#admin-raid-selling-description");
  const raidSellingImages = document.querySelector<HTMLInputElement>("#admin-raid-selling-images");
  const raidSellingImagesFiles = document.querySelector<HTMLInputElement>(
    "#admin-raid-selling-images-files",
  );
  const raidSellingFeedback = document.querySelector<HTMLElement>("#admin-raid-selling-feedback");
  const raidSellingSubmit = document.querySelector<HTMLButtonElement>("#admin-raid-selling-submit");
  const raidClearChampions = document.querySelector<HTMLButtonElement>("#admin-raid-clear-champions");
  const raidCopyChampions = document.querySelector<HTMLButtonElement>("#admin-raid-copy-champions");
  const adminPostForm = document.querySelector<HTMLFormElement>("#admin-post-create-form");
  const adminPostFeedback = document.querySelector<HTMLElement>("#admin-post-feedback");
  const adminPostsList = document.querySelector<HTMLElement>("#admin-posts-list");
  const adminPostDraftsList = document.querySelector<HTMLElement>("#admin-post-drafts-list");
  const postTitleInput = document.querySelector<HTMLInputElement>("#admin-post-title");
  const postCaptionInput = document.querySelector<HTMLInputElement>("#admin-post-caption");
  const postTitleViInput = document.querySelector<HTMLInputElement>("#admin-post-title-vi");
  const postCaptionViInput = document.querySelector<HTMLInputElement>("#admin-post-caption-vi");
  const postContentViInput = document.querySelector<HTMLTextAreaElement>("#admin-post-content-vi");
  const postBodyBlocksContainer = document.querySelector<HTMLElement>("#admin-post-body-blocks");
  const postLivePreview = document.querySelector<HTMLElement>("#admin-post-live-preview");
  const postAddTextBtn = document.querySelector<HTMLButtonElement>("#admin-post-add-text");
  const postAddImageBtn = document.querySelector<HTMLButtonElement>("#admin-post-add-image");
  const postSaveDraftBtn = document.querySelector<HTMLButtonElement>("#admin-post-save-draft");
  const postUseRaidTemplateBtn = document.querySelector<HTMLButtonElement>(
    "#admin-post-use-raid-template",
  );
  const promoCodeForm = document.querySelector<HTMLFormElement>("#admin-promo-code-form");
  const promoActiveInput = document.querySelector<HTMLInputElement>("#admin-promo-active");
  const promoCodeInput = document.querySelector<HTMLInputElement>("#admin-promo-code");
  const promoDescriptionInput = document.querySelector<HTMLTextAreaElement>("#admin-promo-description");
  const promoExpiresInput = document.querySelector<HTMLInputElement>("#admin-promo-expires");
  const promoFeedback = document.querySelector<HTMLElement>("#admin-promo-feedback");
  const promoHistoryList = document.querySelector<HTMLElement>("#admin-promo-history-list");

  if (
    !guestEl ||
    !contentEl ||
    !tabPosts ||
    !tabRaid ||
    !tabPromo ||
    !tabProfit ||
    !panelPosts ||
    !panelRaid ||
    !panelPromo ||
    !panelProfit ||
    !raidFb ||
    !raidChampionSearch ||
    !raidChampionRarityFilters ||
    !raidChampionGrid ||
    !raidSelectedWrap ||
    !raidSellingAccountsList ||
    !raidSellingForm ||
    !raidSellingReset ||
    !raidSellingId ||
    !raidSellingRandomId ||
    !raidSellingPrice ||
    !raidSellingDescription ||
    !raidSellingImages ||
    !raidSellingImagesFiles ||
    !raidSellingFeedback ||
    !raidSellingSubmit ||
    !raidClearChampions ||
    !raidCopyChampions ||
    !raidChampionExtraLegendary ||
    !raidChampionExtraEpic ||
    !adminPostForm ||
    !adminPostFeedback ||
    !adminPostsList ||
    !adminPostDraftsList ||
    !postTitleInput ||
    !postCaptionInput ||
    !postTitleViInput ||
    !postCaptionViInput ||
    !postContentViInput ||
    !postBodyBlocksContainer ||
    !postLivePreview ||
    !postAddTextBtn ||
    !postAddImageBtn ||
    !postSaveDraftBtn ||
    !postUseRaidTemplateBtn ||
    !promoCodeForm ||
    !promoActiveInput ||
    !promoCodeInput ||
    !promoDescriptionInput ||
    !promoExpiresInput ||
    !promoFeedback ||
    !promoHistoryList
  )
    return;

  const loginBtn = document.querySelector<HTMLButtonElement>("#open-login-modal");

  /** Catalog champion: ưu tiên Supabase `raid_champions`, fallback file mẫu. */
  let raidChampionCatalog: RaidChampion[] = [...RAID_CHAMPION_CATALOG];

  const setVisibility = () => {
    const admin = isAdminSession();
    guestEl.classList.toggle("hidden", admin);
    contentEl.classList.toggle("hidden", !admin);
    if (admin) {
      void syncSellingAccountsFromRemote().then(() => {
        renderRaidSellingAccounts();
        window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
      });
      raidChampionCatalog = [...RAID_CHAMPION_CATALOG];
      selectedRaidChampionIds = new Set<string>();
      saveRaidSelectedChampionIds([]);
      raidChampionSearch.value = "";
      renderRaidSellingAccounts();
      syncRarityFilterButtonStyles();
      renderChampionGrid();
      renderSelectedChampionTags();
      void loadRaidChampionCatalogFromSupabase().then((rows) => {
        raidChampionCatalog = rows;
        renderChampionGrid();
        renderSelectedChampionTags();
      });
      setActiveTab(tabFromUrl());
      renderAdminPostsList();
      for (const draftSeed of raidNewsDraftSeeds) {
        seedPostDraftOnce(draftSeed);
      }
      renderAdminDraftsList();
      resetPostComposer();
      void syncPromoCodeSettingsFromRemote().then(() => {
        refreshPromoAdminUi();
      });
      initProfitTrackerManager();
    }
  };

  const setActiveTab = (tab: AdminTab) => {
    const tabs: { id: AdminTab; btn: HTMLButtonElement; panel: HTMLElement }[] = [
      { id: "posts", btn: tabPosts, panel: panelPosts },
      { id: "raid", btn: tabRaid, panel: panelRaid },
      { id: "promo", btn: tabPromo, panel: panelPromo },
      { id: "profit", btn: tabProfit, panel: panelProfit },
    ];
    for (const { id, btn, panel } of tabs) {
      const on = id === tab;
      panel.classList.toggle("hidden", !on);
      btn.className = on
        ? "min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-accent-muted)] lg:min-w-0"
        : "min-h-12 min-w-[11rem] shrink-0 snap-start rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)] lg:min-w-0";
      if (on) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
    const url = new URL(window.location.href);
    url.searchParams.set("page", "dashboard");
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  tabPosts.addEventListener("click", () => setActiveTab("posts"));
  tabRaid.addEventListener("click", () => setActiveTab("raid"));
  tabPromo.addEventListener("click", () => setActiveTab("promo"));
  tabProfit.addEventListener("click", () => setActiveTab("profit"));

  openLoginBtn?.addEventListener("click", () => {
    loginBtn?.click();
  });

  const flash = (el: HTMLElement, text: string) => {
    el.textContent = text;
    el.classList.remove("hidden");
    window.setTimeout(() => {
      el.classList.add("hidden");
      el.textContent = "";
    }, 2000);
  };

  const rarityTextClass: Record<RaidChampion["rarity"], string> = {
    Common: "text-slate-400",
    Uncommon: "text-emerald-400",
    Rare: "text-sky-300",
    Epic: "text-purple-400",
    Legendary: "text-yellow-400",
    Mythic: "text-red-400",
    Mythical: "text-red-400",
  };

  const raidRarityToHeroRarity = (
    r: RaidChampion["rarity"],
  ):
    | "mythic"
    | "mythical"
    | "legendary"
    | "epic"
    | "rare"
    | "common"
    | "uncommon" => {
    if (r === "Mythic") return "mythic";
    if (r === "Mythical") return "mythical";
    if (r === "Legendary") return "legendary";
    if (r === "Epic") return "epic";
    if (r === "Rare") return "rare";
    if (r === "Common") return "common";
    if (r === "Uncommon") return "uncommon";
    return "rare";
  };

  const RARITY_FILTER_KEYS = ["mythic", "legendary", "epic", "rare"] as const;
  type AdminRarityFilterKey = (typeof RARITY_FILTER_KEYS)[number];

  const raidRarityFiltersEnabled = new Set<AdminRarityFilterKey>([...RARITY_FILTER_KEYS]);

  const championPassesRarityFilter = (c: RaidChampion): boolean => {
    const r = c.rarity;
    if (r === "Mythic" || r === "Mythical") return raidRarityFiltersEnabled.has("mythic");
    if (r === "Legendary") return raidRarityFiltersEnabled.has("legendary");
    if (r === "Epic") return raidRarityFiltersEnabled.has("epic");
    if (r === "Rare") return raidRarityFiltersEnabled.has("rare");
    if (r === "Common" || r === "Uncommon") return raidRarityFiltersEnabled.has("rare");
    return false;
  };

  const syncRarityFilterButtonStyles = () => {
    const active =
      "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)]";
    const inactive =
      "border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] opacity-55 hover:opacity-100";
    const colors: Record<AdminRarityFilterKey, string> = {
      mythic: "text-red-400",
      legendary: "text-yellow-400",
      epic: "text-purple-400",
      rare: "text-sky-300",
    };
    raidChampionRarityFilters.querySelectorAll<HTMLButtonElement>("[data-rarity-filter]").forEach(
      (btn) => {
        const key = btn.getAttribute("data-rarity-filter") as AdminRarityFilterKey;
        const on = raidRarityFiltersEnabled.has(key);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.className = [
          "admin-raid-rarity-filter rounded-md border px-2.5 py-1 text-[11px] font-semibold transition",
          on ? `${active} ${colors[key]}` : `${inactive} text-[var(--admin-muted)]`,
        ].join(" ");
      },
    );
  };

  let selectedRaidChampionIds = new Set<string>();

  const selectedChampionsAsHeroes = (): AccountHeroPreview[] => {
    const fromCatalog = raidChampionCatalog
      .filter((c) => selectedRaidChampionIds.has(c.id))
      .map((c) => ({
        name: c.name,
        rarity: raidRarityToHeroRarity(c.rarity),
        initials: c.name.slice(0, 2).toUpperCase(),
      }));
    const extra: AccountHeroPreview[] = [];
    if (selectedRaidChampionIds.has(RAID_EXTRA_MORE_LEGENDARY_ID)) {
      extra.push({
        name: ACCOUNT_HERO_MORE_LEGENDARY_LABEL,
        rarity: "legendary",
        initials: "M+",
      });
    }
    if (selectedRaidChampionIds.has(RAID_EXTRA_MORE_EPIC_ID)) {
      extra.push({
        name: ACCOUNT_HERO_MORE_EPIC_LABEL,
        rarity: "epic",
        initials: "E+",
      });
    }
    return sortHeroesByRarity([...fromCatalog, ...extra]);
  };

  const syncRaidChampionQuickExtraButtons = () => {
    const leg = document.querySelector<HTMLButtonElement>("#admin-raid-champion-extra-legendary");
    const ep = document.querySelector<HTMLButtonElement>("#admin-raid-champion-extra-epic");
    if (!leg || !ep) return;
    const active =
      "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] ring-1 ring-[var(--admin-tab-active-border)]/35";
    const idle =
      "border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-tab-idle-hover)]";
    const onLeg = selectedRaidChampionIds.has(RAID_EXTRA_MORE_LEGENDARY_ID);
    const onEp = selectedRaidChampionIds.has(RAID_EXTRA_MORE_EPIC_ID);
    leg.setAttribute("aria-pressed", onLeg ? "true" : "false");
    ep.setAttribute("aria-pressed", onEp ? "true" : "false");
    leg.className = `rounded-md border px-2.5 py-1.5 text-left text-[11px] font-semibold text-yellow-400 transition ${onLeg ? active : idle}`;
    ep.className = `rounded-md border px-2.5 py-1.5 text-left text-[11px] font-semibold text-purple-400 transition ${onEp ? active : idle}`;
  };

  const renderSelectedChampionTags = () => {
    const ordered = selectedChampionsAsHeroes();
    if (ordered.length === 0) {
      raidSelectedWrap.innerHTML =
        '<span class="text-[11px] text-[var(--admin-muted)]">No champions selected.</span>';
      syncRaidChampionQuickExtraButtons();
      return;
    }
    raidSelectedWrap.innerHTML = ordered
      .map((h) => {
        let id: string | undefined;
        if (heroMatchesExtraLabel(h, ACCOUNT_HERO_MORE_LEGENDARY_LABEL)) id = RAID_EXTRA_MORE_LEGENDARY_ID;
        else if (heroMatchesExtraLabel(h, ACCOUNT_HERO_MORE_EPIC_LABEL)) id = RAID_EXTRA_MORE_EPIC_ID;
        else {
          const c = raidChampionCatalog.find(
            (x) =>
              selectedRaidChampionIds.has(x.id) && x.name.toLowerCase() === h.name.toLowerCase(),
          );
          id = c?.id;
        }
        if (!id) return "";
        return `
        <button type="button" data-picked-champion-id="${escapeHtml(id)}" class="inline-flex max-w-full items-center gap-1.5 rounded border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--admin-accent-muted)]">
          <span class="min-w-0 truncate">${escapeHtml(h.name)}</span>
          <span class="shrink-0 text-[10px] opacity-80">×</span>
        </button>`;
      })
      .filter((x) => x.length > 0)
      .join("");
    syncRaidChampionQuickExtraButtons();
  };

  const renderChampionGrid = () => {
    const q = raidChampionSearch.value.trim().toLowerCase();
    const filtered = raidChampionCatalog.filter(
      (c) => championPassesRarityFilter(c) && c.name.toLowerCase().includes(q),
    );
    if (filtered.length === 0) {
      raidChampionGrid.innerHTML =
        '<p class="col-span-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-xs text-[var(--admin-muted)]">No matching champions found.</p>';
      return;
    }
    raidChampionGrid.innerHTML = filtered
      .map((c) => {
        const active = selectedRaidChampionIds.has(c.id);
        return `
        <button type="button" data-champion-id="${escapeHtml(c.id)}" class="w-full text-left rounded-md border p-2 transition ${
          active
            ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)]"
            : "border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] hover:bg-[var(--admin-tab-idle-hover)]"
        }">
          <p class="truncate text-[12px] font-semibold ${rarityTextClass[c.rarity]}">${escapeHtml(c.name)}</p>
          <p class="mt-0.5 text-[10px] text-[var(--admin-muted)]">${c.faction ? `${escapeHtml(c.faction.replace(/-/g, " "))} • ` : ""}${c.rarity} • ${c.role}</p>
        </button>`;
      })
      .join("");
  };

  const renderRaidSellingAccounts = () => {
    const accounts = getSellingAccounts();
    if (accounts.length === 0) {
      raidSellingAccountsList.innerHTML =
        '<p class="col-span-full rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-xs text-[var(--admin-muted)]">No active listed accounts.</p>';
      return;
    }
    raidSellingAccountsList.innerHTML = accounts
      .map((acc) => {
        const top3 = sortHeroesByRarity(acc.heroes)
          .slice(0, 3)
          .map((h) => h.name)
          .join(", ");
        return `
        <article class="rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] p-2.5">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-xs font-semibold text-[var(--admin-heading)]">ID: ${escapeHtml(acc.id)}</p>
            <div class="flex flex-wrap items-center justify-end gap-1.5">
              <p class="text-xs font-bold text-[var(--admin-accent)]">${escapeHtml(acc.priceLabel)}</p>
              <button data-raid-selling-edit-id="${escapeHtml(acc.id)}" type="button" class="rounded border border-[var(--admin-tab-active-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">Edit</button>
              <button data-raid-selling-delete-id="${escapeHtml(acc.id)}" type="button" class="rounded border border-[var(--admin-danger-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-danger-text)] hover:bg-red-500/10">Delete</button>
            </div>
          </div>
          <p class="mt-1 text-[11px] text-[var(--admin-muted)]">Top champions: ${escapeHtml(top3)}</p>
        </article>`;
      })
      .join("");
  };

  const setRaidSellingFeedback = (msg: string, kind: "success" | "error" | "warn") => {
    raidSellingFeedback.textContent = msg;
    raidSellingFeedback.className =
      kind === "success"
        ? "mt-2 rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]"
        : kind === "warn"
          ? "mt-2 rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-warn-bg)] text-[var(--admin-feedback-warn-text)]"
          : "mt-2 rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-err-bg)] text-[var(--admin-feedback-err-text)]";
  };

  /** English success copy + confetti when a listing is saved to the shop. */
  const celebrateRaidListingSaved = (wasUpdate: boolean) => {
    raidSellingFeedback.textContent = wasUpdate
      ? "Your account listing was updated successfully."
      : "Your account listing was published successfully.";
    raidSellingFeedback.className = [
      "admin-raid-listing-success-flash",
      "mt-2 rounded-lg border border-[var(--admin-tab-active-border)]/45 px-3 py-2.5 text-sm font-semibold leading-snug",
      "bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]",
      "shadow-[0_0_24px_rgba(127,233,255,0.12)]",
    ].join(" ");
    raidSellingFeedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    fireAccountListingConfetti();
  };

  const appendDetailImageUrls = (urls: string[]) => {
    if (urls.length === 0) return;
    const existing = raidSellingImages.value
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    const merged = [...new Set([...existing, ...urls])];
    raidSellingImages.value = merged.join(", ");
  };

  const resetRaidSellingForm = () => {
    raidSellingForm.reset();
    raidSellingId.value = "";
    raidSellingDescription.value = "";
    raidSellingImages.value = "";
    raidSellingImagesFiles.value = "";
    raidSellingSubmit.textContent = "Save listed account";
    raidSellingFeedback.className = "mt-2 hidden rounded-md px-3 py-2 text-xs";
    raidSellingFeedback.textContent = "";
    selectedRaidChampionIds = new Set<string>();
    saveRaidSelectedChampionIds([]);
    raidChampionSearch.value = "";
    renderChampionGrid();
    renderSelectedChampionTags();
  };

  raidChampionSearch.addEventListener("input", renderChampionGrid);
  raidChampionRarityFilters.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-rarity-filter]");
    if (!btn) return;
    const key = btn.getAttribute("data-rarity-filter") as AdminRarityFilterKey;
    if (raidRarityFiltersEnabled.has(key)) raidRarityFiltersEnabled.delete(key);
    else raidRarityFiltersEnabled.add(key);
    syncRarityFilterButtonStyles();
    renderChampionGrid();
  });
  raidChampionGrid.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>("[data-champion-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-champion-id");
    if (!id) return;
    if (selectedRaidChampionIds.has(id)) selectedRaidChampionIds.delete(id);
    else selectedRaidChampionIds.add(id);
    saveRaidSelectedChampionIds([...selectedRaidChampionIds]);
    renderChampionGrid();
    renderSelectedChampionTags();
  });
  raidSelectedWrap.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const btn = target.closest<HTMLElement>("[data-picked-champion-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-picked-champion-id");
    if (!id) return;
    selectedRaidChampionIds.delete(id);
    saveRaidSelectedChampionIds([...selectedRaidChampionIds]);
    renderChampionGrid();
    renderSelectedChampionTags();
  });
  raidClearChampions.addEventListener("click", () => {
    selectedRaidChampionIds = new Set<string>();
    saveRaidSelectedChampionIds([]);
    renderChampionGrid();
    renderSelectedChampionTags();
  });
  raidChampionExtraLegendary.addEventListener("click", () => {
    if (selectedRaidChampionIds.has(RAID_EXTRA_MORE_LEGENDARY_ID)) {
      selectedRaidChampionIds.delete(RAID_EXTRA_MORE_LEGENDARY_ID);
    } else {
      selectedRaidChampionIds.add(RAID_EXTRA_MORE_LEGENDARY_ID);
    }
    saveRaidSelectedChampionIds([...selectedRaidChampionIds]);
    renderChampionGrid();
    renderSelectedChampionTags();
  });
  raidChampionExtraEpic.addEventListener("click", () => {
    if (selectedRaidChampionIds.has(RAID_EXTRA_MORE_EPIC_ID)) {
      selectedRaidChampionIds.delete(RAID_EXTRA_MORE_EPIC_ID);
    } else {
      selectedRaidChampionIds.add(RAID_EXTRA_MORE_EPIC_ID);
    }
    saveRaidSelectedChampionIds([...selectedRaidChampionIds]);
    renderChampionGrid();
    renderSelectedChampionTags();
  });
  raidCopyChampions.addEventListener("click", async () => {
    const text = selectedChampionsAsHeroes()
      .map((h) => h.name)
      .join(", ");
    if (!text) {
      flash(raidFb, "No champions selected to copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      flash(raidFb, "Champion list copied.");
    } catch {
      flash(raidFb, "Could not copy. Please copy manually.");
    }
  });
  raidSellingReset.addEventListener("click", resetRaidSellingForm);
  raidSellingRandomId.addEventListener("click", () => {
    const next = pickUniqueThreeDigitSellingId(raidSellingId.value);
    if (!next) {
      setRaidSellingFeedback(
        "All IDs 000–999 are already used. Remove a listing or type a custom ID.",
        "error",
      );
      return;
    }
    raidSellingId.value = next;
    setRaidSellingFeedback(`Generated unused ID: ${next}.`, "success");
  });
  raidSellingImagesFiles.addEventListener("change", async () => {
    const files = [...(raidSellingImagesFiles.files ?? [])];
    if (files.length === 0) return;

    const session = readSession();
    if (!session || session.role !== "admin") {
      setRaidSellingFeedback("Admin login is required to upload images.", "error");
      raidSellingImagesFiles.value = "";
      return;
    }

    setRaidSellingFeedback(`Uploading ${files.length} image(s)...`, "warn");
    const urls: string[] = [];
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        setRaidSellingFeedback(`Image ${file.name} exceeds 8MB.`, "error");
        continue;
      }
      const upload = await uploadPostImageRemote(file, session.userId);
      if (!upload.ok || !upload.imageUrl) {
        setRaidSellingFeedback(`Upload failed: ${upload.error ?? file.name}`, "error");
        continue;
      }
      urls.push(upload.imageUrl);
    }
    appendDetailImageUrls(urls);
    raidSellingImagesFiles.value = "";
    if (urls.length > 0) {
      setRaidSellingFeedback(`Uploaded ${urls.length} image(s) and appended to list.`, "success");
    }
  });
  raidSellingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = raidSellingId.value.trim();
    const priceLabel = amountInputToPriceLabel(raidSellingPrice.value);
    if (!id || !priceLabel) {
      setRaidSellingFeedback("Account ID and price amount are required.", "error");
      return;
    }
    const heroes = selectedChampionsAsHeroes();
    const localAccounts = getSellingAccounts();
    const existing = localAccounts.find((a) => a.id === id);
    const detailImages = raidSellingImages.value
      .split(",")
      .map(normalizeAccountImageUrl)
      .filter((x) => x.length > 0);
    const invalidImageUrl = detailImages.find((url) => !isAccountImageUrl(url));
    if (invalidImageUrl) {
      setRaidSellingFeedback(
        `Image URL is not valid: ${invalidImageUrl}. Use an https:// link or upload the image again.`,
        "error",
      );
      return;
    }

    const account = {
      id,
      priceLabel,
      stats: existing?.stats ?? EMPTY_SELLING_ACCOUNT_STATS,
      description: raidSellingDescription.value.trim() || undefined,
      detailImages,
      heroes: heroes.length > 0 ? heroes : existing?.heroes ?? [],
      moreCount: 0,
    };
    raidSellingSubmit.disabled = true;
    raidSellingSubmit.textContent = "Saving...";
    const remote = await upsertSellingAccountRemote(account);
    if (!remote.ok) {
      setRaidSellingFeedback(`Save failed: ${remote.error ?? ""}`, "error");
      raidSellingSubmit.disabled = false;
      raidSellingSubmit.textContent = "Save listed account";
      return;
    }
    const next = localAccounts.filter((a) => a.id !== account.id);
    next.unshift(account);
    saveSellingAccounts(next);
    await syncSellingAccountsFromRemote();
    renderRaidSellingAccounts();
    window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
    celebrateRaidListingSaved(Boolean(existing));
    raidSellingSubmit.disabled = false;
    raidSellingSubmit.textContent = "Save listed account";
    if (!existing) {
      selectedRaidChampionIds = new Set<string>();
      saveRaidSelectedChampionIds([]);
      raidChampionSearch.value = "";
      renderChampionGrid();
      renderSelectedChampionTags();
    }
  });
  raidSellingAccountsList.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const editBtn = target.closest<HTMLElement>("[data-raid-selling-edit-id]");
    if (editBtn) {
      const accountId = editBtn.getAttribute("data-raid-selling-edit-id");
      if (!accountId) return;
      const account = getSellingAccounts().find((a) => a.id === accountId);
      if (!account) {
        setRaidSellingFeedback("Account not found for editing.", "error");
        return;
      }
      raidSellingId.value = account.id;
      raidSellingPrice.value = priceLabelToAmountInput(account.priceLabel);
      raidSellingDescription.value = account.description ?? "";
      raidSellingImages.value = (account.detailImages ?? []).join(", ");
      selectedRaidChampionIds = new Set(
        raidChampionCatalog
          .filter((c) => account.heroes.some((h) => h.name.toLowerCase() === c.name.toLowerCase()))
          .map((c) => c.id),
      );
      for (const h of account.heroes) {
        if (heroMatchesExtraLabel(h, ACCOUNT_HERO_MORE_LEGENDARY_LABEL)) {
          selectedRaidChampionIds.add(RAID_EXTRA_MORE_LEGENDARY_ID);
        }
        if (heroMatchesExtraLabel(h, ACCOUNT_HERO_MORE_EPIC_LABEL)) {
          selectedRaidChampionIds.add(RAID_EXTRA_MORE_EPIC_ID);
        }
      }
      saveRaidSelectedChampionIds([...selectedRaidChampionIds]);
      renderChampionGrid();
      renderSelectedChampionTags();
      raidSellingSubmit.textContent = "Update listed account";
      setRaidSellingFeedback(`Editing account ${account.id}.`, "warn");
      return;
    }
    const deleteBtn = target.closest<HTMLElement>("[data-raid-selling-delete-id]");
    if (!deleteBtn) return;
    const accountId = deleteBtn.getAttribute("data-raid-selling-delete-id");
    if (!accountId) return;
    const remote = await deleteSellingAccountRemote(accountId);
    if (!remote.ok) {
      flash(raidFb, `Delete failed: ${remote.error ?? ""}`);
      return;
    }
    await syncSellingAccountsFromRemote();
    renderRaidSellingAccounts();
    window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
    flash(raidFb, "Account removed from listed inventory.");
    resetRaidSellingForm();
  });

  const legacyCoverFromBlocks = (
    blocks: PostBodyBlock[],
  ): { imageUrl?: string; imagePosition: "top" | "left" | "right" } => {
    for (const b of blocks) {
      if (b.type === "image") {
        return {
          imageUrl: b.url,
          imagePosition: b.align === "left" ? "left" : b.align === "right" ? "right" : "top",
        };
      }
    }
    return { imagePosition: "top" };
  };

  const gatherDraftBlocksForPreview = (): PostBodyBlock[] => {
    const blocks: PostBodyBlock[] = [];
    for (const child of [...postBodyBlocksContainer.children]) {
      const block = child as HTMLElement;
      if (!block.classList.contains("admin-post-body-block")) continue;
      const ta = block.querySelector<HTMLTextAreaElement>(".admin-body-text");
      if (ta) {
        blocks.push({ type: "text", text: ta.value });
        continue;
      }
      const url = block.querySelector<HTMLInputElement>(".admin-body-image-url")?.value.trim() ?? "";
      if (!url) continue;
      const alignRaw = block.querySelector<HTMLSelectElement>(".admin-body-align")?.value ?? "full";
      const align = ["full", "center", "left", "right"].includes(alignRaw) ? alignRaw : "full";
      const caption = block.querySelector<HTMLInputElement>(".admin-body-caption")?.value.trim() || undefined;
      blocks.push({ type: "image", url, align: align as "full" | "center" | "left" | "right", caption });
    }
    return blocks.length > 0 ? blocks : [{ type: "text", text: "" }];
  };

  const renderLivePreview = () => {
    const blocks = gatherDraftBlocksForPreview();
    const content = serializePostBody(blocks);
    const draftPost = {
      id: "__draft__",
      title: postTitleInput.value.trim() || "Untitled draft",
      caption: postCaptionInput.value.trim() || undefined,
      imageUrl: undefined,
      imagePosition: "top",
      content,
      ownerId: "",
      authorEmail: "you@preview.local",
      createdAt: Date.now(),
    } as PostItem;
    postLivePreview.innerHTML = `
      <article class="raid-article raid-article-shell rounded-[12px] p-3.5 md:p-4">
        <h3 class="text-lg font-bold text-[var(--news-card-text)]">${escapeHtml(draftPost.title)}</h3>
        ${draftPost.caption ? `<p class="mt-1.5 text-sm" style="color: color-mix(in srgb, var(--news-card-text) 78%, transparent);">${escapeHtml(draftPost.caption)}</p>` : ""}
        <div class="raid-article-body mt-3 text-[var(--news-card-text)]">${renderPostArticleBodyHtml(draftPost)}</div>
      </article>
    `;
  };

  const hydrateTextToolbarColorDefaults = () => {
    const color = readSavedTagColor();
    for (const picker of postBodyBlocksContainer.querySelectorAll<HTMLInputElement>(".admin-body-color")) {
      if (!picker.value || picker.value.toLowerCase() === "#9be8ff") {
        picker.value = color;
      }
    }
  };

  postAddTextBtn.addEventListener("click", () => {
    const activeBlock = postBodyBlocksContainer.querySelector<HTMLElement>(
      ".admin-post-body-block:focus-within",
    );
    const block = createEmptyTextBlock();
    if (activeBlock?.nextSibling) postBodyBlocksContainer.insertBefore(block, activeBlock.nextSibling);
    else postBodyBlocksContainer.appendChild(block);
    hydrateTextToolbarColorDefaults();
    renderLivePreview();
  });
  postAddImageBtn.addEventListener("click", () => {
    const activeBlock = postBodyBlocksContainer.querySelector<HTMLElement>(
      ".admin-post-body-block:focus-within",
    );
    const block = buildImageBlockEl({ url: "", align: "full", caption: "" });
    if (activeBlock?.nextSibling) postBodyBlocksContainer.insertBefore(block, activeBlock.nextSibling);
    else postBodyBlocksContainer.appendChild(block);
    renderLivePreview();
  });
  postUseRaidTemplateBtn.addEventListener("click", () => {
    mountPostBodyBlocks(postBodyBlocksContainer, createRaidNewsTemplateBlocks());
    hydrateTextToolbarColorDefaults();
    renderLivePreview();
    setPostFeedback("Raid news template loaded. Replace every [Replace ...] placeholder before publishing.", "warn");
  });

  const replaceSelection = (
    ta: HTMLTextAreaElement,
    replacer: (selected: string, start: number, end: number, source: string) => string,
  ) => {
    const source = ta.value;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? start;
    const selected = source.slice(start, end);
    const replacement = replacer(selected, start, end, source);
    ta.value = source.slice(0, start) + replacement + source.slice(end);
    const cursor = start + replacement.length;
    ta.focus();
    ta.setSelectionRange(cursor, cursor);
  };

  const toggleLinePrefix = (selected: string, prefix: string): string => {
    const rows = (selected || "").split("\n");
    if (rows.length === 0) return `${prefix}`;
    const allPrefixed = rows.every((row) => row.trim().length === 0 || row.startsWith(prefix));
    return rows
      .map((row) => {
        if (!row.trim()) return row;
        return allPrefixed ? row.replace(prefix, "") : `${prefix}${row}`;
      })
      .join("\n");
  };

  const applyTextAction = (block: HTMLElement, action: string) => {
    const ta = block.querySelector<HTMLTextAreaElement>(".admin-body-text");
    if (!ta) return;
    switch (action) {
      case "h1":
        replaceSelection(ta, (selected) => `# ${selected || "Main section title"}`);
        break;
      case "bold":
        replaceSelection(ta, (selected) => `**${selected || "bold text"}**`);
        break;
      case "italic":
        replaceSelection(ta, (selected) => `*${selected || "italic text"}*`);
        break;
      case "italic-tag":
        replaceSelection(ta, (selected) => `*${selected || "tag italic"}*`);
        break;
      case "h2":
        replaceSelection(ta, (selected) => `## ${selected || "Section title"}`);
        break;
      case "bullet":
        replaceSelection(ta, (selected) => toggleLinePrefix(selected || "List item", "- "));
        break;
      case "newline":
        replaceSelection(ta, () => "\n");
        break;
      case "color": {
        const colorPicker = block.querySelector<HTMLInputElement>(".admin-body-color");
        const color = colorPicker?.value?.trim() || "#ffaa00";
        replaceSelection(ta, (selected) => `[color=${color}]${selected || "highlight text"}[/color]`);
        break;
      }
      case "save-tag-style": {
        const colorPicker = block.querySelector<HTMLInputElement>(".admin-body-color");
        const color = colorPicker?.value?.trim() || "#ffaa00";
        saveTagColor(color);
        setPostFeedback(`Saved Tag style color: ${color}`, "success");
        break;
      }
      case "tag-preset": {
        const color = readSavedTagColor();
        const colorPicker = block.querySelector<HTMLInputElement>(".admin-body-color");
        if (colorPicker) colorPicker.value = color;
        replaceSelection(
          ta,
          (selected) => `## [color=${color}]**${selected || "Section heading"}**[/color]`,
        );
        break;
      }
      default:
        break;
    }
  };

  postBodyBlocksContainer.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const block = t.closest<HTMLElement>(".admin-post-body-block");
    if (!block || !postBodyBlocksContainer.contains(block)) return;
    if (t.classList.contains("admin-body-move-up")) moveBlockElement(block, -1);
    else if (t.classList.contains("admin-body-move-down")) moveBlockElement(block, 1);
    else if (t.classList.contains("admin-body-remove"))
      removeBlockElement(block, postBodyBlocksContainer);
    else if (t.classList.contains("admin-body-format")) {
      const action = t.getAttribute("data-admin-text-action");
      if (action) applyTextAction(block, action);
    }
    renderLivePreview();
  });
  postBodyBlocksContainer.addEventListener("input", () => {
    renderLivePreview();
  });
  postBodyBlocksContainer.addEventListener("change", () => {
    renderLivePreview();
  });
  postBodyBlocksContainer.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement;
    if (!(target instanceof HTMLTextAreaElement) || !target.classList.contains("admin-body-text")) return;
    const block = target.closest<HTMLElement>(".admin-post-body-block");
    if (!block) return;
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyTextAction(block, "bold");
    } else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyTextAction(block, "italic");
    }
  });
  postTitleInput.addEventListener("input", renderLivePreview);
  postCaptionInput.addEventListener("input", renderLivePreview);

  const setPostFeedback = (message: string, kind: "success" | "error" | "warn") => {
    adminPostFeedback.textContent = message;
    adminPostFeedback.className =
      kind === "success"
        ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]"
        : kind === "warn"
          ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-warn-bg)] text-[var(--admin-feedback-warn-text)]"
          : "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-err-bg)] text-[var(--admin-feedback-err-text)]";
  };

  const setPromoFeedback = (message: string, kind: "success" | "error" | "warn") => {
    promoFeedback.textContent = message;
    promoFeedback.className =
      kind === "success"
        ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]"
        : kind === "warn"
          ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-warn-bg)] text-[var(--admin-feedback-warn-text)]"
          : "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-err-bg)] text-[var(--admin-feedback-err-text)]";
  };

  const fillPromoCodeForm = () => {
    const promo = getPromoCodeSettings();
    promoActiveInput.checked = promo.isActive;
    promoCodeInput.value = "";
    promoDescriptionInput.value = "";
    promoExpiresInput.value = new Date().toISOString().slice(0, 10);
  };

  const renderPromoHistoryList = () => {
    const promo = getPromoCodeSettings();
    if (promo.history.length === 0) {
      promoHistoryList.innerHTML = `
        <div class="rounded-md border border-dashed border-[var(--admin-border)] px-3 py-3 text-xs text-[var(--admin-muted)]">
          No saved RSL promo codes yet.
        </div>
      `;
      return;
    }

    promoHistoryList.innerHTML = [...promo.history]
      .map((entry: PromoCodeEntry, index) => ({ entry, index }))
      .reverse()
      .map(
        ({ entry, index }) => `
          <div class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <p class="break-all font-mono text-sm font-extrabold text-[var(--admin-heading)]">${escapeHtml(entry.code)}</p>
                ${entry.reward ? `<p class="mt-1 text-xs leading-snug text-[var(--admin-subtle)]">Reward: ${escapeHtml(entry.reward)}</p>` : ""}
                ${entry.updatedAt ? `<p class="mt-1 text-[11px] font-semibold text-[var(--admin-muted)]">Updated: ${escapeHtml(entry.updatedAt)}</p>` : ""}
              </div>
              <button
                type="button"
                data-promo-delete-index="${index}"
                class="shrink-0 rounded-md border border-red-400/40 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          </div>
        `,
      )
      .join("");
  };

  const refreshPromoAdminUi = () => {
    fillPromoCodeForm();
    renderPromoHistoryList();
  };

  promoCodeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    promoFeedback.className = "hidden rounded-md px-3 py-2 text-xs";
    promoFeedback.textContent = "";

    const session = readSession();
    if (!session || session.role !== "admin") {
      setPromoFeedback("Admin permission required.", "error");
      return;
    }

    const code = promoCodeInput.value.trim().toUpperCase();
    if (promoActiveInput.checked && !code) {
      setPromoFeedback("Enter a promo code or turn off home page display.", "error");
      return;
    }
    const existingPromo = getPromoCodeSettings();
    const reward = promoDescriptionInput.value.trim();
    const updatedAt = promoExpiresInput.value.trim() || undefined;
    const newEntries = code
      .split(/[,\n;]/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
      .map((item) => ({ code: item, reward, updatedAt }));

    const result = await savePromoCodeSettingsRemote(
      {
        isActive: promoActiveInput.checked,
        code,
        reward,
        updatedAt,
        history: [...existingPromo.history, ...newEntries],
      },
      session.userId,
    );

    if (!result.ok) {
      setPromoFeedback(`Save failed: ${result.error ?? "Unknown error"}`, "error");
      return;
    }

    refreshPromoAdminUi();
    window.dispatchEvent(new CustomEvent("tanne-promo-code-updated"));
    setPromoFeedback("Promo code updated.", "success");
  });

  promoHistoryList.addEventListener("click", async (event) => {
    const deleteBtn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-promo-delete-index]",
    );
    if (!deleteBtn) return;

    const session = readSession();
    if (!session || session.role !== "admin") {
      setPromoFeedback("Admin permission required.", "error");
      return;
    }

    const index = Number(deleteBtn.dataset.promoDeleteIndex);
    const existingPromo = getPromoCodeSettings();
    const target = existingPromo.history[index];
    if (!Number.isInteger(index) || !target) return;

    const ok = window.confirm(`Delete expired promo code "${target.code}"?`);
    if (!ok) return;

    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";
    const nextHistory = existingPromo.history.filter((_, itemIndex) => itemIndex !== index);
    const latest = nextHistory.at(-1);
    const result = await savePromoCodeSettingsRemote(
      {
        isActive: existingPromo.isActive,
        code: latest?.code ?? "",
        reward: latest?.reward ?? "",
        updatedAt: latest?.updatedAt,
        history: nextHistory,
      },
      session.userId,
    );

    if (!result.ok) {
      setPromoFeedback(`Delete failed: ${result.error ?? "Unknown error"}`, "error");
      renderPromoHistoryList();
      return;
    }

    refreshPromoAdminUi();
    window.dispatchEvent(new CustomEvent("tanne-promo-code-updated"));
    setPromoFeedback(`Deleted promo code ${target.code}.`, "success");
  });

  let editingPostId: string | null = null;
  let editingDraftId: string | null = null;
  const postSubmitBtn = adminPostForm.querySelector<HTMLButtonElement>('button[type="submit"]');

  const setPostComposerMode = (mode: "new" | "post" | "draft") => {
    if (postSubmitBtn) {
      postSubmitBtn.textContent =
        mode === "post" ? "Update post" : mode === "draft" ? "Publish draft" : "Publish post";
    }
    postSaveDraftBtn.textContent = mode === "draft" ? "Update draft" : "Save draft";
  };

  const resetPostComposer = () => {
    editingPostId = null;
    editingDraftId = null;
    adminPostForm.reset();
    postTitleViInput.value = "";
    postCaptionViInput.value = "";
    postContentViInput.value = "";
    mountPostBodyBlocks(postBodyBlocksContainer, createRaidNewsTemplateBlocks());
    hydrateTextToolbarColorDefaults();
    renderLivePreview();
    setPostComposerMode("new");
  };

  const renderAdminPostsList = () => {
    const posts = getPosts();
    if (posts.length === 0) {
      adminPostsList.innerHTML =
        '<p class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs text-[var(--admin-subtle)]">No posts yet.</p>';
      return;
    }

    adminPostsList.innerHTML = posts
      .slice(0, 12)
      .map(
        (post) => `
        <article class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--admin-heading)]">${escapeHtml(post.title)}</p>
              <p class="text-[11px] text-[var(--admin-muted)]">${new Date(post.createdAt).toLocaleString()}</p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <button data-admin-post-edit-id="${post.id}" type="button" class="rounded border border-[var(--admin-tab-active-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">Edit</button>
              <button data-admin-post-delete-id="${post.id}" type="button" class="rounded border border-[var(--admin-danger-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-danger-text)] hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        </article>`,
      )
      .join("");
  };

  const renderAdminDraftsList = () => {
    const drafts = getPostDrafts();
    if (drafts.length === 0) {
      adminPostDraftsList.innerHTML =
        '<p class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs text-[var(--admin-subtle)]">No saved drafts yet. Write a post and click Save draft.</p>';
      return;
    }

    adminPostDraftsList.innerHTML = drafts
      .slice(0, 12)
      .map(
        (draft) => `
        <article class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-2.5">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-[var(--admin-heading)]">${escapeHtml(draft.title || "Untitled draft")}</p>
              <p class="text-[11px] text-[var(--admin-muted)]">Updated ${new Date(draft.updatedAt).toLocaleString()}</p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <button data-admin-post-draft-edit-id="${draft.id}" type="button" class="rounded border border-[var(--admin-tab-active-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">Edit</button>
              <button data-admin-post-draft-delete-id="${draft.id}" type="button" class="rounded border border-[var(--admin-danger-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-danger-text)] hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        </article>`,
      )
      .join("");
  };

  postSaveDraftBtn.addEventListener("click", () => {
    const session = readSession();
    if (!session || session.role !== "admin") {
      setPostFeedback("Admin permission required.", "error");
      return;
    }

    const title = postTitleInput.value.trim() || "Untitled Raid news draft";
    const caption = postCaptionInput.value.trim();
    const titleVi = postTitleViInput.value.trim();
    const captionVi = postCaptionViInput.value.trim();
    const contentViText = postContentViInput.value.trim();
    const draft = upsertPostDraft({
      id: editingDraftId ?? undefined,
      title,
      caption: caption || undefined,
      blocks: gatherDraftBlocksForPreview(),
      titleVi: titleVi || undefined,
      captionVi: captionVi || undefined,
      contentVi: contentViText
        ? serializePostBody([{ type: "text", text: contentViText }])
        : undefined,
    });
    editingPostId = null;
    editingDraftId = draft.id;
    renderAdminDraftsList();
    setPostComposerMode("draft");
    setPostFeedback("Draft saved. You can edit it here and publish when ready.", "success");
  });

  adminPostForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    adminPostFeedback.className = "hidden rounded-md px-3 py-2 text-xs";
    adminPostFeedback.textContent = "";
    const session = readSession();
    if (!session || session.role !== "admin") {
      setPostFeedback("Admin permission required.", "error");
      return;
    }

    const title = postTitleInput.value.trim();
    const caption = postCaptionInput.value.trim();
    const titleVi = postTitleViInput.value.trim();
    const captionVi = postCaptionViInput.value.trim();
    const contentViText = postContentViInput.value.trim();

    if (!title) {
      setPostFeedback("Please enter a title.", "error");
      return;
    }

    const targetPost = editingPostId ? getPosts().find((item) => item.id === editingPostId) : null;
    if (editingPostId && !targetPost) {
      setPostFeedback("Post not found for editing.", "error");
      resetPostComposer();
      renderAdminPostsList();
      return;
    }

    const uploadOne = async (file: File) => {
      const maxFileSizeMb = 5;
      if (file.size > maxFileSizeMb * 1024 * 1024) {
        return { ok: false as const, error: `Image must be <= ${maxFileSizeMb}MB.` };
      }
      const uploadResult = await uploadPostImageRemote(file, session.userId);
      if (!uploadResult.ok || !uploadResult.imageUrl) {
        return {
          ok: false as const,
          error: uploadResult.error ?? "Upload error.",
        };
      }
      return { ok: true as const, url: uploadResult.imageUrl };
    };

    const read = await readPostBodyBlocksFromEditor(postBodyBlocksContainer, uploadOne);
    if (!read.ok) {
      setPostFeedback(read.error, "error");
      return;
    }
    if (hasUnfilledPostTemplatePlaceholder(read.blocks)) {
      setPostFeedback("Replace all [Replace ...] template placeholders before publishing.", "error");
      return;
    }

    const content = serializePostBody(read.blocks);
    const { imageUrl: coverUrl, imagePosition } = legacyCoverFromBlocks(read.blocks);

    const newPost = {
      id: targetPost?.id ?? crypto.randomUUID(),
      title,
      caption: caption || undefined,
      titleVi: titleVi || undefined,
      captionVi: captionVi || undefined,
      contentVi: contentViText
        ? serializePostBody([{ type: "text", text: contentViText }])
        : undefined,
      imageUrl: coverUrl,
      imagePosition,
      content,
      ownerId: targetPost?.ownerId ?? session.userId,
      authorEmail: targetPost?.authorEmail ?? session.email,
      createdAt: targetPost?.createdAt ?? Date.now(),
    };

    const remote = editingPostId
      ? await updatePostRemote(editingPostId, {
          title: newPost.title,
          caption: newPost.caption,
          content: newPost.content,
          titleVi: newPost.titleVi,
          captionVi: newPost.captionVi,
          contentVi: newPost.contentVi,
          imageUrl: newPost.imageUrl,
          imagePosition: newPost.imagePosition,
        })
      : await createPostRemote(newPost);
    if (!remote.ok) {
      setPostFeedback(`Database save failed: ${remote.error ?? "Unknown"}`, "error");
      return;
    }

    const posts = getPosts();
    if (editingPostId) {
      const next = posts.map((item) => (item.id === editingPostId ? newPost : item));
      savePosts(next);
    } else {
      posts.unshift(newPost);
      savePosts(posts);
    }
    if (editingDraftId && !remote.translationsSkipped) {
      deletePostDraft(editingDraftId);
      editingDraftId = null;
      renderAdminDraftsList();
    }
    await syncPostsFromRemote();
    window.dispatchEvent(new CustomEvent("tanne-posts-updated"));

    setPostFeedback(
      remote.translationsSkipped
        ? "Post saved in English. Vietnamese translation stayed in the draft because Supabase is missing title_vi/caption_vi/content_vi columns."
        : editingPostId
          ? "Post updated."
          : "Post published.",
      remote.translationsSkipped ? "warn" : "success",
    );
    renderAdminPostsList();
    if (!remote.translationsSkipped) {
      resetPostComposer();
    }
  });

  adminPostsList.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const editBtn = target.closest<HTMLElement>("[data-admin-post-edit-id]");
    const deleteBtn = target.closest<HTMLElement>("[data-admin-post-delete-id]");

    if (editBtn) {
      const postId = editBtn.getAttribute("data-admin-post-edit-id");
      if (!postId) return;
      const post = getPosts().find((item) => item.id === postId);
      if (!post) {
        setPostFeedback("Post not found.", "error");
        return;
      }
      editingPostId = post.id;
      editingDraftId = null;
      postTitleInput.value = post.title;
      postCaptionInput.value = post.caption ?? "";
      postTitleViInput.value = post.titleVi ?? "";
      postCaptionViInput.value = post.captionVi ?? "";
      postContentViInput.value = post.contentVi
        ? postToInitialBlocks({ ...post, content: post.contentVi })
            .filter((block): block is { type: "text"; text: string } => block.type === "text")
            .map((block) => block.text)
            .join("\n\n")
        : "";
      mountPostBodyBlocks(postBodyBlocksContainer, postToInitialBlocks(post));
      hydrateTextToolbarColorDefaults();
      renderLivePreview();
      setPostComposerMode("post");
      setPostFeedback("Editing this post.", "warn");
      setActiveTab("posts");
      return;
    }

    if (!deleteBtn) return;
    const postId = deleteBtn.getAttribute("data-admin-post-delete-id");
    if (!postId) return;
    const remote = await deletePostRemote(postId);
    if (!remote.ok) {
      setPostFeedback(`Delete failed: ${remote.error ?? ""}`, "error");
      return;
    }
    savePosts(getPosts().filter((item) => item.id !== postId));
    await syncPostsFromRemote();
    window.dispatchEvent(new CustomEvent("tanne-posts-updated"));
    if (editingPostId === postId) {
      resetPostComposer();
    }
    renderAdminPostsList();
    setPostFeedback("Post deleted.", "success");
  });

  adminPostDraftsList.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const editBtn = target.closest<HTMLElement>("[data-admin-post-draft-edit-id]");
    const deleteBtn = target.closest<HTMLElement>("[data-admin-post-draft-delete-id]");

    if (editBtn) {
      const draftId = editBtn.getAttribute("data-admin-post-draft-edit-id");
      if (!draftId) return;
      const draft = getPostDrafts().find((item) => item.id === draftId);
      if (!draft) {
        setPostFeedback("Draft not found.", "error");
        renderAdminDraftsList();
        return;
      }
      editingPostId = null;
      editingDraftId = draft.id;
      postTitleInput.value = draft.title;
      postCaptionInput.value = draft.caption ?? "";
      postTitleViInput.value = draft.titleVi ?? "";
      postCaptionViInput.value = draft.captionVi ?? "";
      postContentViInput.value = draft.contentVi
        ? postToInitialBlocks({
            id: draft.id,
            title: draft.title,
            caption: draft.caption,
            content: draft.contentVi,
            authorEmail: "draft@tannehub.local",
            createdAt: draft.createdAt,
          })
            .filter((block): block is { type: "text"; text: string } => block.type === "text")
            .map((block) => block.text)
            .join("\n\n")
        : "";
      mountPostBodyBlocks(postBodyBlocksContainer, draft.blocks);
      hydrateTextToolbarColorDefaults();
      renderLivePreview();
      setPostComposerMode("draft");
      setPostFeedback("Draft loaded. Edit it, save again, or publish it.", "warn");
      setActiveTab("posts");
      return;
    }

    if (!deleteBtn) return;
    const draftId = deleteBtn.getAttribute("data-admin-post-draft-delete-id");
    if (!draftId) return;
    const draft = getPostDrafts().find((item) => item.id === draftId);
    const ok = window.confirm(`Delete draft "${draft?.title || "Untitled draft"}"?`);
    if (!ok) return;
    deletePostDraft(draftId);
    if (editingDraftId === draftId) {
      resetPostComposer();
    }
    renderAdminDraftsList();
    setPostFeedback("Draft deleted.", "success");
  });

  setVisibility();
  window.addEventListener("tanne-auth-changed", setVisibility);
  window.addEventListener("tanne-selling-accounts-updated", () => {
    renderRaidSellingAccounts();
  });
}
