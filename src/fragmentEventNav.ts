import { escapeHtml } from "./postBody";
import { getNewsLanguage } from "./newsLanguage";

const EVENT_START_ISO = "2026-09-14T09:00:00+00:00";
const EVENT_END_ISO = "2026-09-18T09:00:00+00:00";
const FATE_DECK_IMAGE = "/news-images/tin-woodman-event-icon.jpg";
const FATE_DECK_POST_ID = "raid-news-2026-09-12-tin-woodman-deck-of-fate-fragment-guide";

function formatCountdown(): string {
  const now = Date.now();
  const start = new Date(EVENT_START_ISO).getTime();
  const end = new Date(EVENT_END_ISO).getTime();

  if (now > end) return getNewsLanguage() === "vi" ? "Đã kết thúc" : "Ended";

  const target = now < start ? start : end;
  const diff = Math.max(target - now, 0);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`;
}

function getCountdownLabel(): string {
  const now = Date.now();
  const start = new Date(EVENT_START_ISO).getTime();
  const end = new Date(EVENT_END_ISO).getTime();
  const isVi = getNewsLanguage() === "vi";

  if (now < start) return isVi ? "Bắt đầu sau" : "Starts in";
  if (now <= end) return isVi ? "Còn lại" : "Ends in";
  return isVi ? "Trạng thái" : "Status";
}

export function renderNavbarFragmentEventHtml(): string {
  const isVi = getNewsLanguage() === "vi";
  const copy = isVi
    ? {
        title: "Tin Woodman Deck of Fate",
        subtitle: "Bắt đầu lúc 09:00 UTC ngày 14/09 và kéo dài 96 giờ. Thu thập 100 mảnh để triệu hồi The Tin Woodman.",
        label: "Fate Deck",
        rewardLabel: "Mục tiêu",
        fragments: "mảnh",
        durationLabel: "Thời lượng",
        durationValue: "96 giờ",
        hint: "Hãy chuẩn bị Soulstone và tài nguyên farm đồ trước khi sự kiện mở.",
        guide: "Xem hướng dẫn sự kiện",
        close: "Đóng",
      }
    : {
        title: "Tin Woodman Deck of Fate",
        subtitle: "Starts September 14 at 09:00 UTC and runs for 96 hours. Collect 100 fragments to summon The Tin Woodman.",
        label: "Fate Deck",
        rewardLabel: "Reward",
        fragments: "fragments",
        durationLabel: "Duration",
        durationValue: "96 hours",
        hint: "Save Soulstones and gear-farming resources before the event opens.",
        guide: "Read event guide",
        close: "Close",
      };

  const countdown = formatCountdown();

  return `<div id="navbar-fragment-event" class="fragment-event-nav relative min-w-0 shrink-0">
    <button id="navbar-fragment-event-button" type="button" class="fragment-event-button" aria-expanded="false" aria-controls="navbar-fragment-event-panel" title="${escapeHtml(copy.title)}">
      <span class="fragment-event-avatar" aria-hidden="true"><img src="${FATE_DECK_IMAGE}" alt="" loading="lazy" /></span>
      <span class="hidden min-w-0 sm:grid">
        <span class="fragment-event-button-title">${escapeHtml(copy.label)}</span>
        <span class="fragment-event-countdown" data-fragment-event-countdown>${countdown}</span>
      </span>
      <span class="fragment-event-mobile-countdown sm:hidden" data-fragment-event-countdown>${countdown}</span>
    </button>
    <div id="navbar-fragment-event-panel" class="fragment-event-panel" aria-hidden="true">
      <div class="fragment-event-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[#7fe9ff]"><span data-fragment-event-countdown-label>${escapeHtml(getCountdownLabel())}</span> <span data-fragment-event-countdown>${countdown}</span></p>
            <h3 class="mt-1 text-[18px] font-black leading-tight text-white">${escapeHtml(copy.title)}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#b9c6df]">${escapeHtml(copy.subtitle)}</p>
          </div>
          <button id="navbar-fragment-event-close" type="button" class="promo-scroll-close" aria-label="${escapeHtml(copy.close)}">${escapeHtml(copy.close)}</button>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-[#ffaa00]/35 bg-[#ffaa00]/12 p-3">
            <p class="text-[11px] font-black uppercase tracking-[0.12em] text-[#ffd58a]">${escapeHtml(copy.rewardLabel)}</p>
            <div class="mt-1 flex items-end gap-2"><strong class="text-2xl leading-none text-white">100</strong><span class="pb-0.5 text-sm font-black text-[#cfe7f4]">${escapeHtml(copy.fragments)}</span></div>
          </div>
          <div class="rounded-xl border border-white/10 bg-black/20 p-3">
            <p class="text-[11px] font-black uppercase tracking-[0.12em] text-[#7fe9ff]">${escapeHtml(copy.durationLabel)}</p>
            <strong class="mt-1 block text-2xl leading-none text-white">${escapeHtml(copy.durationValue)}</strong>
          </div>
        </div>
        <p class="mt-3 text-xs font-semibold leading-relaxed text-[#b9c6df]">${escapeHtml(copy.hint)}</p>
        <a href="?post=${encodeURIComponent(FATE_DECK_POST_ID)}" class="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#7fe9ff]/35 bg-[#7fe9ff]/10 px-3 py-2 text-xs font-black text-[#dffaff] transition hover:border-[#7fe9ff] hover:bg-[#7fe9ff]/20">${escapeHtml(copy.guide)} <span aria-hidden="true">&rarr;</span></a>
      </div>
    </div>
  </div>`;
}

export function setFragmentEventOpen(open: boolean): void {
  const panel = document.getElementById("navbar-fragment-event-panel");
  const button = document.getElementById("navbar-fragment-event-button");
  if (!panel || !button) return;

  panel.classList.toggle("is-open", open);
  panel.setAttribute("aria-hidden", String(!open));
  button.setAttribute("aria-expanded", String(open));
}

export function updateCountdowns(): void {
  const countdown = formatCountdown();
  document.querySelectorAll<HTMLElement>("[data-fragment-event-countdown]").forEach((node) => {
    node.textContent = countdown;
  });
  document.querySelectorAll<HTMLElement>("[data-fragment-event-countdown-label]").forEach((node) => {
    node.textContent = getCountdownLabel();
  });
}

export function initNavbarFragmentEvent(): void {
  const wrap = document.getElementById("navbar-fragment-event");
  const button = document.getElementById("navbar-fragment-event-button");
  const close = document.getElementById("navbar-fragment-event-close");
  if (!wrap || !button || wrap.dataset.bound === "1") return;

  wrap.dataset.bound = "1";
  updateCountdowns();
  window.setInterval(updateCountdowns, 60_000);

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = button.getAttribute("aria-expanded") === "true";
    setFragmentEventOpen(!isOpen);
  });

  close?.addEventListener("click", (event) => {
    event.stopPropagation();
    setFragmentEventOpen(false);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setFragmentEventOpen(false);
  });

  window.addEventListener("click", (event) => {
    if (!wrap.contains(event.target as Node)) setFragmentEventOpen(false);
  });
}
