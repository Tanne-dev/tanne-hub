import { escapeHtml } from "./postBody";
import { getNewsLanguage } from "./newsLanguage";

const EVENT_START_ISO = "2026-08-19T00:00:00+00:00";

function formatCountdown(eventIso = EVENT_START_ISO): string {
  const diff = new Date(eventIso).getTime() - Date.now();
  if (diff <= 0) return getNewsLanguage() === "vi" ? "Đang diễn ra" : "Live";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function renderNavbarFragmentEventHtml(): string {
  const isVi = getNewsLanguage() === "vi";
  const copy = isVi
    ? {
        title: "Cowardly Lion Fusion",
        subtitle: "Fusion mới bắt đầu ngày 19/08/2026. Tanne Hub sẽ cập nhật lịch và tool tính điểm khi Raid công bố đầy đủ.",
        label: "Fusion",
        countdown: "Bắt đầu sau",
        soon: "Coming soon",
        note: "Chưa có calendar chính thức, nên mình tạm ẩn bảng fragment để tránh hiển thị sai thông tin.",
        prepare: "Chuẩn bị trước: shard, energy, silver và champion food.",
        close: "Đóng",
      }
    : {
        title: "Cowardly Lion Fusion",
        subtitle: "The new fusion starts on August 19, 2026. Tanne Hub will update the calendar and calculator once Raid reveals the full schedule.",
        label: "Fusion",
        countdown: "Starts in",
        soon: "Coming soon",
        note: "The official calendar is not available yet, so the fragment planner is hidden to avoid showing outdated information.",
        prepare: "Prepare now: shards, energy, silver, and champion food.",
        close: "Close",
      };

  return `<div id="navbar-fragment-event" class="fragment-event-nav relative min-w-0 shrink-0">
    <button
      id="navbar-fragment-event-button"
      type="button"
      class="fragment-event-button"
      aria-expanded="false"
      aria-controls="navbar-fragment-event-panel"
      title="${escapeHtml(copy.title)}"
    >
      <span class="hidden min-w-0 sm:grid">
        <span class="fragment-event-button-title">${escapeHtml(copy.label)}</span>
        <span class="fragment-event-countdown" data-fragment-event-countdown data-event-start="${EVENT_START_ISO}">${formatCountdown()}</span>
      </span>
      <span class="fragment-event-mobile-countdown sm:hidden" data-fragment-event-countdown data-event-start="${EVENT_START_ISO}">${formatCountdown()}</span>
    </button>

    <div id="navbar-fragment-event-panel" class="fragment-event-panel" aria-hidden="true">
      <div class="fragment-event-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[#7fe9ff]">${escapeHtml(copy.countdown)} <span data-fragment-event-countdown data-event-start="${EVENT_START_ISO}">${formatCountdown()}</span></p>
            <h3 class="mt-1 text-[18px] font-black leading-tight text-white">${escapeHtml(copy.title)}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#b9c6df]">${escapeHtml(copy.subtitle)}</p>
          </div>
          <button id="navbar-fragment-event-close" type="button" class="promo-scroll-close" aria-label="${escapeHtml(copy.close)}">${escapeHtml(copy.close)}</button>
        </div>

        <section class="fragment-event-coming-soon mt-4 rounded-xl border border-[#ffaa00]/35 bg-[#ffaa00]/12 px-4 py-4">
          <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[#ffd58a]">${escapeHtml(copy.soon)}</p>
          <p class="mt-2 text-sm font-semibold leading-relaxed text-white">${escapeHtml(copy.note)}</p>
          <p class="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold leading-relaxed text-[#cfe7f4]">${escapeHtml(copy.prepare)}</p>
        </section>
      </div>
    </div>
  </div>`;
}

function setFragmentEventOpen(open: boolean): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-fragment-event");
  const button = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-button");
  const panel = document.querySelector<HTMLElement>("#navbar-fragment-event-panel");
  if (!wrap || !button || !panel) return;
  wrap.classList.toggle("fragment-event-open", open);
  button.setAttribute("aria-expanded", open ? "true" : "false");
  panel.setAttribute("aria-hidden", open ? "false" : "true");
  if (open) {
    document.querySelector<HTMLElement>("#navbar-promo-code")?.classList.remove("promo-scroll-open");
    document.querySelector<HTMLButtonElement>("#navbar-promo-code-button")?.setAttribute("aria-expanded", "false");
    document.querySelector<HTMLElement>("#navbar-promo-scroll")?.setAttribute("aria-hidden", "true");
  }
}

function updateCountdowns(): void {
  document.querySelectorAll<HTMLElement>("[data-fragment-event-countdown]").forEach((node) => {
    const startIso = node.dataset.eventStart || EVENT_START_ISO;
    node.textContent = formatCountdown(startIso);
  });
}

export function initNavbarFragmentEvent(): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-fragment-event");
  const button = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-button");
  const close = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-close");
  if (!wrap || !button || wrap.dataset.bound === "1") return;
  wrap.dataset.bound = "1";
  updateCountdowns();
  window.setInterval(updateCountdowns, 60_000);

  button.addEventListener("click", () => {
    setFragmentEventOpen(!wrap.classList.contains("fragment-event-open"));
  });
  close?.addEventListener("click", () => setFragmentEventOpen(false));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setFragmentEventOpen(false);
  });
  window.addEventListener("click", (event) => {
    if (!wrap.classList.contains("fragment-event-open")) return;
    if (!wrap.contains(event.target as Node)) setFragmentEventOpen(false);
  });
}
