import { track } from "@vercel/analytics";

// Only fixed event names, public post IDs and numeric milestones are collected.
export function initEngagementAnalytics(): void {
  const send = (name: string, data: Record<string, string | number> = {}) => {
    try { track(name, data); } catch { /* Analytics must never interrupt navigation. */ }
  };
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>("a, button");
    if (!target) return;
    if (target.hasAttribute("data-open-promo")) {
      const promo = document.getElementById("navbar-promo-code-button");
      if (promo) { event.preventDefault(); event.stopPropagation(); promo.click(); }
    }
    const action = target.dataset.analytics;
    if (["hero_guides", "hero_promo", "article_more_guides", "related_article"].includes(action || "")) {
      send("navigation_click", { action: action! });
    }
    if (target.id === "floating-contact-discord") send("contact_click", { channel: "discord" });
    if (target instanceof HTMLAnchorElement) {
      const url = new URL(target.href, location.origin);
      if (url.protocol === "mailto:") send("contact_click", { channel: "email" });
      else if (url.hostname === "www.epicnpc.com" || url.hostname === "epicnpc.com") {
        send(url.pathname.startsWith("/conversations/") ? "contact_click" : "trust_profile_click", { channel: "epicnpc" });
      } else if (url.origin === location.origin && url.searchParams.get("page") === "raid-accounts") {
        send("accounts_click");
      }
    }
  });
  const sent = new Set<string>();
  let scheduled = false;
  const measure = () => {
    scheduled = false;
    const body = document.querySelector<HTMLElement>("[data-reading-post]");
    if (!body || document.visibilityState !== "visible") return;
    const bounds = body.getBoundingClientRect();
    if (bounds.height <= 0 || bounds.top >= innerHeight || bounds.bottom <= 0) return;
    const post = body.dataset.readingPost!;
    if (!sent.has(post)) { sent.add(post); send("article_view", { post }); }
    const depth = Math.min(100, Math.max(0, (innerHeight - bounds.top) / bounds.height * 100));
    for (const percent of [50, 90]) {
      const key = `${post}:${percent}`;
      if (depth >= percent && !sent.has(key)) {
        sent.add(key);
        send("article_scroll_depth", { post, percent });
      }
    }
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(measure); }
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("visibilitychange", schedule);
  // Article content may arrive asynchronously or be refreshed from the server.
  const root = document.getElementById("app");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  schedule();
}
