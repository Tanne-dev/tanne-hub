import { initLegitReviewsManager } from "./legitReviewsManager";
import { initMemberAlertsManager } from "./memberAlertsManager";
import { initPostsManager } from "./postsManager";
import { initSellingAccountsManager } from "./sellingAccountsManager";
import { renderLegitCheck } from "./sections/legitCheck";
import { renderMemberAlerts } from "./sections/memberAlerts";
import { renderPopularAccounts } from "./sections/popularAccounts";
import { renderPromos } from "./sections/promos";
import { renderRaidNewsSection } from "./sections/raidNews";
import { renderSafeTrading } from "./sections/safeTrading";
import { renderTrustpilotReviews } from "./sections/trustpilotReviews";

type LazySectionKey =
  | "raid-news"
  | "member-alerts"
  | "popular-accounts"
  | "safe-trading"
  | "legit-check"
  | "trustpilot"
  | "promos";

const sectionRenderers: Record<LazySectionKey, () => string> = {
  "raid-news": renderRaidNewsSection,
  "member-alerts": renderMemberAlerts,
  "popular-accounts": renderPopularAccounts,
  "safe-trading": renderSafeTrading,
  "legit-check": renderLegitCheck,
  trustpilot: renderTrustpilotReviews,
  promos: renderPromos,
};

function initLoadedSection(key: LazySectionKey): void {
  if (key === "raid-news") initPostsManager();
  else if (key === "popular-accounts") initSellingAccountsManager();
  else if (key === "member-alerts") initMemberAlertsManager();
  else if (key === "legit-check") initLegitReviewsManager();
}

function loadLazySection(host: HTMLElement): void {
  const key = host.dataset.lazySection as LazySectionKey | undefined;
  if (!key || host.dataset.loaded === "1") return;
  const render = sectionRenderers[key];
  if (!render) return;

  host.dataset.loaded = "1";
  host.classList.add("lazy-section-loading");

  window.requestAnimationFrame(() => {
    host.outerHTML = render();
    window.requestAnimationFrame(() => initLoadedSection(key));
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
          This section loads when you scroll close to it, so the first screen stays faster.
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
