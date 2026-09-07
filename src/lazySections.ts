import { siteText } from "./newsLanguage";

type LazySectionKey =
  | "raid-news"
  | "member-alerts"
  | "popular-accounts"
  | "safe-trading"
  | "legit-check"
  | "trustpilot"
  | "promos";

async function renderLazySection(key: LazySectionKey): Promise<string> {
  if (key === "raid-news") {
    const { renderRaidNewsSection } = await import("./sections/raidNews");
    return renderRaidNewsSection();
  }
  if (key === "member-alerts") {
    const { renderMemberAlerts } = await import("./sections/memberAlerts");
    return renderMemberAlerts();
  }
  if (key === "popular-accounts") {
    const { renderPopularAccounts } = await import("./sections/popularAccounts");
    return renderPopularAccounts();
  }
  if (key === "safe-trading") {
    const { renderSafeTrading } = await import("./sections/safeTrading");
    return renderSafeTrading();
  }
  if (key === "legit-check") {
    const { renderLegitCheck } = await import("./sections/legitCheck");
    return renderLegitCheck();
  }
  if (key === "trustpilot") {
    const { renderTrustpilotReviews } = await import("./sections/trustpilotReviews");
    return renderTrustpilotReviews();
  }
  const { renderPromos } = await import("./sections/promos");
  return renderPromos();
}

async function initLoadedSection(key: LazySectionKey): Promise<void> {
  if (key === "raid-news") {
    const { initPostsManager } = await import("./postsManager");
    initPostsManager();
  } else if (key === "popular-accounts") {
    const { initSellingAccountsManager } = await import("./sellingAccountsManager");
    initSellingAccountsManager();
  } else if (key === "member-alerts") {
    const { initMemberAlertsManager } = await import("./memberAlertsManager");
    initMemberAlertsManager();
  } else if (key === "legit-check") {
    const { initLegitReviewsManager } = await import("./legitReviewsManager");
    initLegitReviewsManager();
  }
}

function loadLazySection(host: HTMLElement): void {
  const key = host.dataset.lazySection as LazySectionKey | undefined;
  if (!key || host.dataset.loaded === "1") return;

  host.dataset.loaded = "1";
  host.classList.add("lazy-section-loading");

  window.requestAnimationFrame(() => {
    void renderLazySection(key).then((html) => {
      host.outerHTML = html;
      window.requestAnimationFrame(() => {
        void initLoadedSection(key);
      });
    });
  });
}

export function renderLazySectionPlaceholder(
  key: LazySectionKey,
  label: string,
  minHeight = 260,
): string {
  return `
    <section
      class="lazy-section-placeholder theme-smooth rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-5"
      data-lazy-section="${key}"
      style="min-height:${minHeight}px"
      aria-busy="true"
    >
      <div class="flex min-h-[inherit] flex-col items-center justify-center gap-3 text-center">
        <span class="lazy-section-spinner" aria-hidden="true"></span>
        <span class="text-sm font-extrabold text-[var(--panel-text)]">${label}</span>
        <span class="max-w-md text-xs leading-relaxed text-[var(--panel-muted)]">
          ${siteText("lazySuffix")}
        </span>
      </div>
    </section>`;
}

export function initLazySections(): void {
  const items = [...document.querySelectorAll<HTMLElement>("[data-lazy-section]")].filter(
    (item) => item.dataset.loaded !== "1",
  );
  if (items.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach(loadLazySection);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = entry.target as HTMLElement;
        observer.unobserve(target);
        loadLazySection(target);
      }
    },
    { rootMargin: "420px 0px", threshold: 0.01 },
  );

  items.forEach((item) => observer.observe(item));
}
