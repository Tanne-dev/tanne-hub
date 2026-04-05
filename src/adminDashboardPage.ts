import {
  clearAdminCart,
  pruneAdminCart,
  removeAdminCartEntry,
  upsertAdminCartEntry,
} from "./adminCartStore";
import {
  getEpicSevenAccountNotes,
  getRaidAccountNotes,
  saveEpicSevenAccountNotes,
  saveRaidAccountNotes,
  saveRaidSelectedChampionIds,
} from "./adminGameAccountsStore";
import {
  escapeHtml,
  postToInitialBlocks,
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
  updatePostRemote,
} from "./postsStore";
import {
  deleteSellingAccountRemote,
  getSellingAccounts,
  saveSellingAccounts,
  syncSellingAccountsFromRemote,
  upsertSellingAccountRemote,
} from "./sellingAccountsStore";
import { fireAccountListingConfetti } from "./accountListingConfetti";
import { loadRaidChampionCatalogFromSupabase } from "./raidChampionsStore";
import { uploadPostImageRemote } from "./supabase";
import { RAID_CHAMPION_CATALOG, type RaidChampion } from "./raidChampionCatalog";
import {
  ACCOUNT_HERO_MORE_EPIC_LABEL,
  ACCOUNT_HERO_MORE_LEGENDARY_LABEL,
  sortHeroesByRarity,
  type AccountHeroPreview,
  type AccountStockCard,
} from "./content";

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

type AdminTab = "posts" | "raid" | "epic";

function tabFromUrl(): AdminTab {
  const t = new URLSearchParams(window.location.search).get("tab");
  if (t === "raid" || t === "epic" || t === "posts") return t;
  return "posts";
}

export function initAdminDashboardPage(): void {
  const pageRoot = document.querySelector("#admin-dashboard-page");
  if (!pageRoot) return;

  const guestEl = document.querySelector<HTMLElement>("#admin-dashboard-guest");
  const contentEl = document.querySelector<HTMLElement>("#admin-dashboard-content");
  const adminCartLines = document.querySelector<HTMLElement>("#admin-cart-lines");
  const adminCartBadge = document.querySelector<HTMLElement>("#admin-cart-badge");
  const adminCartClear = document.querySelector<HTMLButtonElement>("#admin-cart-clear");
  const adminCartReady = Boolean(adminCartLines && adminCartBadge && adminCartClear);
  const openLoginBtn = document.querySelector<HTMLButtonElement>("#admin-open-login-from-dashboard");
  const tabPosts = document.querySelector<HTMLButtonElement>("#admin-tab-posts");
  const tabRaid = document.querySelector<HTMLButtonElement>("#admin-tab-raid");
  const tabEpic = document.querySelector<HTMLButtonElement>("#admin-tab-epic");
  const panelPosts = document.querySelector<HTMLElement>("#admin-panel-posts");
  const panelRaid = document.querySelector<HTMLElement>("#admin-panel-raid");
  const panelEpic = document.querySelector<HTMLElement>("#admin-panel-epic");

  const raidNotes = document.querySelector<HTMLTextAreaElement>("#admin-raid-accounts-notes");
  const raidSave = document.querySelector<HTMLButtonElement>("#admin-raid-accounts-save");
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
  const epicNotes = document.querySelector<HTMLTextAreaElement>("#admin-epic-accounts-notes");
  const epicSave = document.querySelector<HTMLButtonElement>("#admin-epic-accounts-save");
  const epicFb = document.querySelector<HTMLElement>("#admin-epic-accounts-feedback");

  const adminPostForm = document.querySelector<HTMLFormElement>("#admin-post-create-form");
  const adminPostFeedback = document.querySelector<HTMLElement>("#admin-post-feedback");
  const adminPostsList = document.querySelector<HTMLElement>("#admin-posts-list");
  const postTitleInput = document.querySelector<HTMLInputElement>("#admin-post-title");
  const postCaptionInput = document.querySelector<HTMLInputElement>("#admin-post-caption");
  const postBodyBlocksContainer = document.querySelector<HTMLElement>("#admin-post-body-blocks");
  const postAddTextBtn = document.querySelector<HTMLButtonElement>("#admin-post-add-text");
  const postAddImageBtn = document.querySelector<HTMLButtonElement>("#admin-post-add-image");

  if (
    !guestEl ||
    !contentEl ||
    !tabPosts ||
    !tabRaid ||
    !tabEpic ||
    !panelPosts ||
    !panelRaid ||
    !panelEpic ||
    !raidNotes ||
    !raidSave ||
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
    !epicNotes ||
    !epicSave ||
    !epicFb ||
    !adminPostForm ||
    !adminPostFeedback ||
    !adminPostsList ||
    !postTitleInput ||
    !postCaptionInput ||
    !postBodyBlocksContainer ||
    !postAddTextBtn ||
    !postAddImageBtn
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
      raidNotes.value = getRaidAccountNotes();
      void syncSellingAccountsFromRemote().then(() => {
        renderRaidSellingAccounts();
        window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
      });
      raidChampionCatalog = [...RAID_CHAMPION_CATALOG];
      selectedRaidChampionIds = new Set<string>();
      saveRaidSelectedChampionIds([]);
      raidChampionSearch.value = "";
      renderRaidSellingAccounts();
      renderAdminCart();
      syncRarityFilterButtonStyles();
      renderChampionGrid();
      renderSelectedChampionTags();
      void loadRaidChampionCatalogFromSupabase().then((rows) => {
        raidChampionCatalog = rows;
        renderChampionGrid();
        renderSelectedChampionTags();
      });
      epicNotes.value = getEpicSevenAccountNotes();
      setActiveTab(tabFromUrl());
      renderAdminPostsList();
      resetPostComposer();
    }
  };

  const setActiveTab = (tab: AdminTab) => {
    const tabs: { id: AdminTab; btn: HTMLButtonElement; panel: HTMLElement }[] = [
      { id: "posts", btn: tabPosts, panel: panelPosts },
      { id: "raid", btn: tabRaid, panel: panelRaid },
      { id: "epic", btn: tabEpic, panel: panelEpic },
    ];
    for (const { id, btn, panel } of tabs) {
      const on = id === tab;
      panel.classList.toggle("hidden", !on);
      btn.className = on
        ? "rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-accent-muted)]"
        : "rounded-lg border border-[var(--admin-tab-idle-border)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--admin-tab-idle-text)] transition hover:bg-[var(--admin-tab-idle-hover)]";
    }
    const url = new URL(window.location.href);
    url.searchParams.set("page", "dashboard");
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  };

  tabPosts.addEventListener("click", () => setActiveTab("posts"));
  tabRaid.addEventListener("click", () => setActiveTab("raid"));
  tabEpic.addEventListener("click", () => setActiveTab("epic"));

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
              <button type="button" data-admin-cart-add="${escapeHtml(acc.id)}" class="rounded border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-subtle)] transition hover:bg-[var(--admin-tab-idle-hover)]" title="Add to cart">Cart</button>
              <button data-raid-selling-edit-id="${escapeHtml(acc.id)}" type="button" class="rounded border border-[var(--admin-tab-active-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">Edit</button>
              <button data-raid-selling-delete-id="${escapeHtml(acc.id)}" type="button" class="rounded border border-[var(--admin-danger-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-danger-text)] hover:bg-red-500/10">Delete</button>
            </div>
          </div>
          <p class="mt-1 text-[11px] text-[var(--admin-muted)]">Top champions: ${escapeHtml(top3)}</p>
        </article>`;
      })
      .join("");
  };

  const renderAdminCart = () => {
    try {
      if (!adminCartReady || !adminCartLines || !adminCartBadge) return;
      const accounts = getSellingAccounts();
      const ids = new Set(accounts.map((a) => a.id.trim()).filter((x) => x.length > 0));
      const lines = pruneAdminCart(ids);
      adminCartBadge.textContent = String(lines.length);
      if (lines.length === 0) {
        adminCartLines.innerHTML =
          '<p class="rounded-md border border-dashed border-[var(--admin-border)] px-2 py-5 text-center text-[11px] leading-relaxed text-[var(--admin-muted)]">Cart is empty.<br /><span class="mt-1 block text-[10px] opacity-80">Add from Raid → Active listed accounts.</span></p>';
        return;
      }
      adminCartLines.innerHTML = lines
        .map((line) => {
          const acc = accounts.find((a) => a.id === line.accountId);
          const price = escapeHtml(acc?.priceLabel ?? line.priceLabel);
          const prev = escapeHtml(line.preview || "—");
          return `
        <div class="rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] p-2">
          <div class="flex items-start justify-between gap-1.5">
            <div class="min-w-0 flex-1">
              <p class="font-mono text-[11px] font-semibold text-[var(--admin-heading)]">ID: ${escapeHtml(line.accountId)}</p>
              <p class="mt-0.5 text-[11px] font-bold text-[var(--admin-accent)]">${price}</p>
              <p class="mt-1 line-clamp-2 text-[10px] leading-snug text-[var(--admin-muted)]">${prev}</p>
            </div>
            <button type="button" data-admin-cart-remove="${escapeHtml(line.accountId)}" class="shrink-0 rounded border border-[var(--admin-input-border)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-tab-idle-hover)]" aria-label="Remove from cart">×</button>
          </div>
        </div>`;
        })
        .join("");
    } finally {
      window.dispatchEvent(new CustomEvent("tanne-admin-cart-updated"));
    }
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

  raidSave.addEventListener("click", () => {
    saveRaidAccountNotes(raidNotes.value);
    flash(raidFb, "Saved.");
  });

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
    const account = {
      id,
      priceLabel,
      stats: existing?.stats ?? EMPTY_SELLING_ACCOUNT_STATS,
      description: raidSellingDescription.value.trim() || undefined,
      detailImages: raidSellingImages.value
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x.length > 0),
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
    removeAdminCartEntry(accountId);
    renderRaidSellingAccounts();
    renderAdminCart();
    window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
    flash(raidFb, "Account removed from listed inventory.");
    resetRaidSellingForm();
  });

  epicSave.addEventListener("click", () => {
    saveEpicSevenAccountNotes(epicNotes.value);
    flash(epicFb, "Saved.");
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

  postAddTextBtn.addEventListener("click", () => {
    postBodyBlocksContainer.appendChild(createEmptyTextBlock());
  });
  postAddImageBtn.addEventListener("click", () => {
    postBodyBlocksContainer.appendChild(buildImageBlockEl({ url: "", align: "full", caption: "" }));
  });
  postBodyBlocksContainer.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const block = t.closest<HTMLElement>(".admin-post-body-block");
    if (!block || !postBodyBlocksContainer.contains(block)) return;
    if (t.classList.contains("admin-body-move-up")) moveBlockElement(block, -1);
    else if (t.classList.contains("admin-body-move-down")) moveBlockElement(block, 1);
    else if (t.classList.contains("admin-body-remove"))
      removeBlockElement(block, postBodyBlocksContainer);
  });

  const setPostFeedback = (message: string, kind: "success" | "error" | "warn") => {
    adminPostFeedback.textContent = message;
    adminPostFeedback.className =
      kind === "success"
        ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]"
        : kind === "warn"
          ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-warn-bg)] text-[var(--admin-feedback-warn-text)]"
          : "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-err-bg)] text-[var(--admin-feedback-err-text)]";
  };

  let editingPostId: string | null = null;
  const postSubmitBtn = adminPostForm.querySelector<HTMLButtonElement>('button[type="submit"]');

  const resetPostComposer = () => {
    editingPostId = null;
    adminPostForm.reset();
    mountPostBodyBlocks(postBodyBlocksContainer, [{ type: "text", text: "" }]);
    if (postSubmitBtn) {
      postSubmitBtn.textContent = "Publish post";
    }
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

    const content = serializePostBody(read.blocks);
    const { imageUrl: coverUrl, imagePosition } = legacyCoverFromBlocks(read.blocks);

    const newPost = {
      id: targetPost?.id ?? crypto.randomUUID(),
      title,
      caption: caption || undefined,
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
    await syncPostsFromRemote();
    window.dispatchEvent(new CustomEvent("tanne-posts-updated"));

    setPostFeedback(editingPostId ? "Post updated." : "Post published.", "success");
    renderAdminPostsList();
    resetPostComposer();
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
      postTitleInput.value = post.title;
      postCaptionInput.value = post.caption ?? "";
      mountPostBodyBlocks(postBodyBlocksContainer, postToInitialBlocks(post));
      if (postSubmitBtn) {
        postSubmitBtn.textContent = "Update post";
      }
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

  setVisibility();
  window.addEventListener("tanne-auth-changed", setVisibility);
  window.addEventListener("tanne-selling-accounts-updated", () => {
    renderRaidSellingAccounts();
    renderAdminCart();
  });

  contentEl.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const addBtn = target.closest<HTMLButtonElement>("[data-admin-cart-add]");
    if (addBtn) {
      const id = addBtn.getAttribute("data-admin-cart-add");
      if (!id) return;
      const acc = getSellingAccounts().find((a) => a.id === id);
      if (!acc) return;
      const preview =
        sortHeroesByRarity(acc.heroes)
          .slice(0, 3)
          .map((h) => h.name)
          .join(", ") ||
        (acc.description?.trim().slice(0, 96) ?? "");
      upsertAdminCartEntry({
        accountId: acc.id,
        priceLabel: acc.priceLabel,
        preview,
      });
      renderAdminCart();
      return;
    }
    const rmBtn = target.closest<HTMLButtonElement>("[data-admin-cart-remove]");
    if (rmBtn) {
      const id = rmBtn.getAttribute("data-admin-cart-remove");
      if (id) removeAdminCartEntry(id);
      renderAdminCart();
    }
  });

  if (adminCartClear) {
    adminCartClear.addEventListener("click", () => {
      clearAdminCart();
      renderAdminCart();
    });
  }
}
