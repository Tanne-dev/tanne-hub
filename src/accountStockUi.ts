import { sortHeroesByRarity, type AccountHeroPreview } from "./content";
import { escapeHtml } from "./postBody";
import { upsertShopCartEntry } from "./shopCartStore";
import { getSellingAccounts } from "./sellingAccountsStore";

const rarityDrawerClass: Record<AccountHeroPreview["rarity"], string> = {
  mythic: "text-red-500",
  mythical: "text-red-500",
  legendary: "text-amber-500",
  epic: "text-purple-500",
  rare: "text-sky-500",
  common: "text-slate-400",
  uncommon: "text-emerald-600",
};

function ensureDrawerEls(): { overlay: HTMLElement; panel: HTMLElement; body: HTMLElement } {
  let overlay = document.querySelector<HTMLElement>("#account-detail-overlay");
  let panel = document.querySelector<HTMLElement>("#account-detail-panel");
  if (!overlay || !panel) {
    const mount = document.createElement("div");
    mount.innerHTML = `
      <div id="account-detail-overlay" class="fixed inset-0 z-[85] hidden bg-black/60 backdrop-blur-[2px] transition-opacity sm:bg-black/55 sm:backdrop-blur-sm"></div>
      <aside
        id="account-detail-panel"
        class="fixed right-0 top-0 z-[90] flex h-full w-full max-w-full translate-x-full flex-col border-l border-[#7fe9ff]/20 bg-[var(--panel-bg)] text-[var(--panel-text)] shadow-[-16px_0_48px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out min-[480px]:max-w-[min(92vw,720px)]"
      >
        <header
          id="account-detail-header"
          class="shrink-0 border-b border-[var(--news-card-border)] bg-gradient-to-br from-[var(--icon-bg)] via-[var(--panel-bg)] to-[color-mix(in_srgb,var(--panel-bg)_85%,#7fe9ff_15%)] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7 sm:pb-5 sm:pt-6"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--panel-muted)]">Raid account</p>
              <h3 id="account-detail-title" class="mt-1 font-mono text-[1.65rem] font-extrabold leading-tight tracking-tight text-[var(--panel-text)] sm:text-[1.85rem]"></h3>
              <p id="account-detail-price" class="mt-2 text-lg font-bold text-[#7fe9ff] sm:text-xl"></p>
            </div>
            <button
              id="account-detail-close"
              type="button"
              class="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[var(--news-card-border)] bg-[var(--panel-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--panel-text)] shadow-sm transition hover:border-[#7fe9ff]/50 hover:bg-[var(--icon-bg)] active:scale-[0.98]"
            >
              <svg class="h-4 w-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
              <span class="hidden sm:inline">Close</span>
            </button>
          </div>
        </header>
        <div
          id="account-detail-body"
          class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
        ></div>
      </aside>`;
    document.body.appendChild(mount);
    overlay = document.querySelector<HTMLElement>("#account-detail-overlay")!;
    panel = document.querySelector<HTMLElement>("#account-detail-panel")!;
  }
  const body = document.querySelector<HTMLElement>("#account-detail-body")!;
  return { overlay, panel, body };
}

function sectionShell(title: string, inner: string): string {
  return `
    <section class="theme-smooth mb-5 last:mb-0 overflow-hidden rounded-2xl border border-[var(--news-card-border)] bg-[color-mix(in_srgb,var(--panel-bg)_92%,var(--icon-bg)_8%)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:mb-6">
      <div class="border-b border-[var(--news-card-border)] bg-[color-mix(in_srgb,var(--icon-bg)_70%,transparent)] px-4 py-2.5 sm:px-5 sm:py-3">
        <h4 class="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--panel-muted)]">${escapeHtml(title)}</h4>
      </div>
      <div class="p-4 sm:p-5">
        ${inner}
      </div>
    </section>`;
}

function openDetailDrawer(accountId: string): void {
  const account = getSellingAccounts().find((x) => x.id === accountId);
  if (!account) return;

  const { overlay, panel, body } = ensureDrawerEls();
  const title = document.querySelector<HTMLElement>("#account-detail-title");
  const priceEl = document.querySelector<HTMLElement>("#account-detail-price");
  if (title) title.textContent = `Account ${account.id}`;
  if (priceEl) {
    if (account.priceLabel?.trim()) {
      priceEl.textContent = account.priceLabel.trim();
      priceEl.classList.remove("hidden");
    } else {
      priceEl.textContent = "";
      priceEl.classList.add("hidden");
    }
  }

  const descHtml = account.description
    ? `<p class="text-[15px] leading-relaxed text-[var(--panel-text)] sm:text-base">${escapeHtml(account.description)}</p>`
    : `<p class="text-[15px] italic text-[var(--panel-muted)]">No description provided for this listing.</p>`;

  const heroesSorted = sortHeroesByRarity(account.heroes);
  const championsHtml =
    heroesSorted.length === 0
      ? `<p class="text-[15px] text-[var(--panel-muted)]">No champions listed — seller may rely on screenshots and description only.</p>`
      : `<ul class="space-y-2.5">
          ${heroesSorted
            .map((h) => {
              const cls = rarityDrawerClass[h.rarity] ?? "text-[var(--panel-text)]";
              return `<li class="flex items-baseline gap-2 border-l-2 border-[#7fe9ff]/35 pl-3 text-[15px] font-semibold leading-snug sm:text-base ${cls}">${escapeHtml(h.name)}</li>`;
            })
            .join("")}
        </ul>`;

  const imagesHtml =
    account.detailImages && account.detailImages.length > 0
      ? `<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
          ${account.detailImages
            .map(
              (url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" class="group block overflow-hidden rounded-xl border border-[var(--news-card-border)] bg-black/10 shadow-md ring-0 transition hover:ring-2 hover:ring-[#7fe9ff]/50">
                  <img src="${escapeHtml(url)}" alt="Account screenshot" class="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]" width="640" height="480" loading="lazy" decoding="async" fetchpriority="low" />
                </a>`,
            )
            .join("")}
        </div>`
      : `<p class="text-[15px] text-[var(--panel-muted)]">No screenshots attached.</p>`;

  const sections: string[] = [
    sectionShell("About this account", descHtml),
    sectionShell("Screenshots", imagesHtml),
    sectionShell("Champions", championsHtml),
  ];
  body.innerHTML = sections.join("");

  overlay.classList.remove("hidden");
  panel.classList.remove("hidden");
  requestAnimationFrame(() => panel.classList.remove("translate-x-full"));
}

function closeDetailDrawer(): void {
  const overlay = document.querySelector<HTMLElement>("#account-detail-overlay");
  const panel = document.querySelector<HTMLElement>("#account-detail-panel");
  if (!overlay || !panel) return;
  panel.classList.add("translate-x-full");
  window.setTimeout(() => {
    overlay.classList.add("hidden");
    panel.classList.add("hidden");
  }, 220);
}

/** Nút copy ID trên thẻ kho tài khoản + drawer chi tiết account. */
export function initAccountStockUi(): void {
  document.addEventListener("click", (event) => {
    const btn = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-id]");
    if (btn && btn.dataset.copyId) {
      event.stopPropagation();
      const id = btn.dataset.copyId;
      void navigator.clipboard.writeText(id).then(() => {
        const prev = btn.title;
        btn.title = "Copied!";
        btn.classList.add("ring-2", "ring-[var(--admin-accent)]");
        window.setTimeout(() => {
          btn.title = prev || "Copy ID";
          btn.classList.remove("ring-2", "ring-[var(--admin-accent)]");
        }, 1200);
      });
      return;
    }

    const closeBtn = (event.target as HTMLElement).closest<HTMLButtonElement>("#account-detail-close");
    if (closeBtn) {
      closeDetailDrawer();
      return;
    }
    if ((event.target as HTMLElement).closest("#account-detail-overlay")) {
      closeDetailDrawer();
      return;
    }

    const sliderDot = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-account-slider-dot]",
    );
    const sliderPrev = (event.target as HTMLElement).closest<HTMLButtonElement>(
      ".account-card-slider-prev",
    );
    const sliderNext = (event.target as HTMLElement).closest<HTMLButtonElement>(
      ".account-card-slider-next",
    );
    const sliderCtl = sliderDot ?? sliderPrev ?? sliderNext;
    if (sliderCtl) {
      event.stopPropagation();
      const media = sliderCtl.closest<HTMLElement>(".account-card-media");
      const viewport = media?.querySelector<HTMLElement>(".account-card-slider-viewport");
      if (viewport) {
        const w = viewport.clientWidth || 1;
        if (sliderPrev) viewport.scrollBy({ left: -w, behavior: "smooth" });
        else if (sliderNext) viewport.scrollBy({ left: w, behavior: "smooth" });
        else if (sliderDot) {
          const i = Number(sliderDot.dataset.accountSliderDot);
          if (Number.isFinite(i)) viewport.scrollTo({ left: i * w, behavior: "smooth" });
        }
      }
      return;
    }

    const buyBtn = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-account-buy]");
    if (buyBtn) {
      const id = buyBtn.getAttribute("data-account-buy");
      if (id) {
        const account = getSellingAccounts().find((a) => a.id === id);
        if (account) {
          const preview =
            sortHeroesByRarity(account.heroes)
              .slice(0, 3)
              .map((h) => h.name)
              .join(", ") ||
            (account.description?.trim().slice(0, 96) ?? "");
          upsertShopCartEntry({
            accountId: account.id,
            priceLabel: account.priceLabel,
            preview,
          });
          window.dispatchEvent(new CustomEvent("tanne-shop-cart-updated"));
          window.location.assign("/?page=cart");
        }
      }
      return;
    }

    const detailsBtn = (event.target as HTMLElement).closest<HTMLButtonElement>(
      "[data-account-details]",
    );
    if (detailsBtn) {
      const id = detailsBtn.getAttribute("data-account-details");
      if (id) openDetailDrawer(id);
      return;
    }

    const card = (event.target as HTMLElement).closest<HTMLElement>("[data-account-id]");
    if (card && card.dataset.accountId) {
      openDetailDrawer(card.dataset.accountId);
    }
  });
}
