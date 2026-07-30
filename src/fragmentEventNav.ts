import { escapeHtml } from "./postBody";
import { bindFragmentEventCalculators } from "./fragmentEventCalculator";
import { getNewsLanguage } from "./newsLanguage";

const EVENT_END_ISO = "2026-08-10T23:59:59+02:00";

type FragmentNavItem = {
  id: string;
  label: string;
  dates: string;
  fragments: number;
  group: "low" | "summon" | "leaderboard";
};

const itemsEn: FragmentNavItem[] = [
  { id: "dragon", label: "Dragon Tournament", dates: "Jul 27-Jul 30", fragments: 5, group: "low" },
  { id: "arena-1", label: "Classic Arena I", dates: "Jul 30-Aug 2", fragments: 5, group: "low" },
  { id: "training-tournament", label: "Champion Training Tournament", dates: "Jul 30-Aug 3", fragments: 20, group: "leaderboard" },
  { id: "fire-knight", label: "Fire Knight Tournament", dates: "Jul 31-Aug 3", fragments: 5, group: "low" },
  { id: "ice-golem", label: "Ice Golem Tournament", dates: "Aug 3-Aug 6", fragments: 5, group: "low" },
  { id: "arena-2", label: "Classic Arena II", dates: "Aug 5-Aug 8", fragments: 5, group: "low" },
  { id: "champion-chase", label: "Champion Chase", dates: "Aug 7-Aug 10", fragments: 25, group: "summon" },
  { id: "spider", label: "Spider Tournament", dates: "Aug 7-Aug 10", fragments: 5, group: "low" },
  { id: "gear-hunters-1", label: "Gear Hunters I", dates: "Jul 27-Jul 30", fragments: 5, group: "low" },
  { id: "gear-enhance-1", label: "Gear Enhancement I", dates: "Jul 28-Jul 31", fragments: 5, group: "low" },
  { id: "summon-rush-1", label: "Summon Rush I", dates: "Jul 31-Aug 3", fragments: 20, group: "summon" },
  { id: "gear-enhance-2", label: "Gear Enhancement II", dates: "Aug 1-Aug 4", fragments: 5, group: "low" },
  { id: "summon-rush-2", label: "Summon Rush II", dates: "Aug 4-Aug 6", fragments: 15, group: "summon" },
  { id: "gear-enhance-3", label: "Gear Enhancement III", dates: "Aug 5-Aug 8", fragments: 5, group: "low" },
  { id: "gear-hunters-2", label: "Gear Hunters II", dates: "Aug 6-Aug 9", fragments: 5, group: "low" },
  { id: "training-event", label: "Champion Training Event", dates: "Aug 6-Aug 10", fragments: 15, group: "low" },
];

const itemsVi: FragmentNavItem[] = [
  { id: "dragon", label: "Dragon Tournament", dates: "27/7-30/7", fragments: 5, group: "low" },
  { id: "arena-1", label: "Classic Arena I", dates: "30/7-2/8", fragments: 5, group: "low" },
  { id: "training-tournament", label: "Champion Training Tournament", dates: "30/7-3/8", fragments: 20, group: "leaderboard" },
  { id: "fire-knight", label: "Fire Knight Tournament", dates: "31/7-3/8", fragments: 5, group: "low" },
  { id: "ice-golem", label: "Ice Golem Tournament", dates: "3/8-6/8", fragments: 5, group: "low" },
  { id: "arena-2", label: "Classic Arena II", dates: "5/8-8/8", fragments: 5, group: "low" },
  { id: "champion-chase", label: "Champion Chase", dates: "7/8-10/8", fragments: 25, group: "summon" },
  { id: "spider", label: "Spider Tournament", dates: "7/8-10/8", fragments: 5, group: "low" },
  { id: "gear-hunters-1", label: "Gear Hunters I", dates: "27/7-30/7", fragments: 5, group: "low" },
  { id: "gear-enhance-1", label: "Gear Enhancement I", dates: "28/7-31/7", fragments: 5, group: "low" },
  { id: "summon-rush-1", label: "Summon Rush I", dates: "31/7-3/8", fragments: 20, group: "summon" },
  { id: "gear-enhance-2", label: "Gear Enhancement II", dates: "1/8-4/8", fragments: 5, group: "low" },
  { id: "summon-rush-2", label: "Summon Rush II", dates: "4/8-6/8", fragments: 15, group: "summon" },
  { id: "gear-enhance-3", label: "Gear Enhancement III", dates: "5/8-8/8", fragments: 5, group: "low" },
  { id: "gear-hunters-2", label: "Gear Hunters II", dates: "6/8-9/8", fragments: 5, group: "low" },
  { id: "training-event", label: "Champion Training Event", dates: "6/8-10/8", fragments: 15, group: "low" },
];

function formatCountdown(endIso = EVENT_END_ISO): string {
  const diff = new Date(endIso).getTime() - Date.now();
  if (diff <= 0) return getNewsLanguage() === "vi" ? "Đã kết thúc" : "Ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function renderOptions(items: FragmentNavItem[], isVi: boolean): string {
  const labels = isVi
    ? { low: "Dễ", summon: "Shard", leaderboard: "Nặng" }
    : { low: "Safe", summon: "Shard", leaderboard: "High" };

  return items
    .map((item) => {
      const badge = labels[item.group];
      return `
        <label class="fragment-calc-option" data-group="${escapeHtml(item.group)}">
          <input
            type="checkbox"
            class="fragment-calc-checkbox"
            data-fragments="${item.fragments}"
            data-group="${escapeHtml(item.group)}"
            aria-label="${escapeHtml(item.label)}"
          />
          <span class="fragment-calc-option-main">
            <span class="fragment-calc-option-name">${escapeHtml(item.label)}</span>
            <span class="fragment-calc-option-date">${escapeHtml(item.dates)}</span>
          </span>
          <span class="fragment-calc-option-side">
            <span class="fragment-calc-option-badge">${badge}</span>
            <strong>${item.fragments}</strong>
          </span>
        </label>
      `;
    })
    .join("");
}

export function renderNavbarFragmentEventHtml(): string {
  const isVi = getNewsLanguage() === "vi";
  const copy = isVi
    ? {
        title: "Khamir Fragment",
        subtitle: "Tick event bạn sẽ làm để tính nhanh đủ 100 fragments.",
        label: "Fusion",
        countdown: "Còn",
        goal: "Mục tiêu",
        route: "Kế hoạch",
        fragments: "fragments",
        initial: "Chọn event để bắt đầu tính.",
        detail: "Ưu tiên mốc dễ trước, rồi mới quyết định summon.",
        safe: "Chọn mốc dễ",
        noSummon: "Không tính summon",
        all: "Chọn tất cả",
        clear: "Xoá chọn",
        close: "Đóng",
      }
    : {
        title: "Khamir Fragment",
        subtitle: "Tick events to plan a clean 100-fragment route.",
        label: "Fusion",
        countdown: "Left",
        goal: "Goal",
        route: "Route",
        fragments: "fragments",
        initial: "Choose events to start planning.",
        detail: "Start with safe fragments, then decide if summon events are needed.",
        safe: "Safe events",
        noSummon: "No summon",
        all: "All",
        clear: "Clear",
        close: "Close",
      };
  const items = isVi ? itemsVi : itemsEn;

  return `<div id="navbar-fragment-event" class="fragment-event-nav relative min-w-0 shrink-0">
    <button
      id="navbar-fragment-event-button"
      type="button"
      class="fragment-event-button"
      aria-expanded="false"
      aria-controls="navbar-fragment-event-panel"
      title="${escapeHtml(copy.title)}"
    >
      <span class="fragment-event-avatar">
        <img src="/news-images/khamir-scald-eye-avatar.png" alt="" loading="lazy" decoding="async" />
      </span>
      <span class="hidden min-w-0 sm:grid">
        <span class="fragment-event-button-title">${escapeHtml(copy.label)}</span>
        <span class="fragment-event-countdown" data-fragment-event-countdown data-event-end="${EVENT_END_ISO}">${formatCountdown()}</span>
      </span>
      <span class="fragment-event-mobile-countdown sm:hidden" data-fragment-event-countdown data-event-end="${EVENT_END_ISO}">${formatCountdown()}</span>
    </button>

    <div id="navbar-fragment-event-panel" class="fragment-event-panel" aria-hidden="true">
      <div class="fragment-event-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[#7fe9ff]">${escapeHtml(copy.countdown)} <span data-fragment-event-countdown data-event-end="${EVENT_END_ISO}">${formatCountdown()}</span></p>
            <h3 class="mt-1 text-[18px] font-black leading-tight text-white">${escapeHtml(copy.title)}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#b9c6df]">${escapeHtml(copy.subtitle)}</p>
          </div>
          <button id="navbar-fragment-event-close" type="button" class="promo-scroll-close" aria-label="${escapeHtml(copy.close)}">${escapeHtml(copy.close)}</button>
        </div>

        <section class="fragment-calc fragment-calc-compact mt-4" data-target="100" data-total="150" data-locale="${isVi ? "vi" : "en"}">
          <div class="rounded-xl border border-[#ffaa00]/35 bg-[#ffaa00]/12 px-3 py-2">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#ffd58a]">${escapeHtml(copy.goal)}</p>
                <p class="text-lg font-black text-white">100 / 150</p>
              </div>
              <div class="text-right">
                <p class="text-[11px] font-black uppercase tracking-[0.12em] text-[#9be8ff]">${escapeHtml(copy.route)}</p>
                <p><span class="fragment-calc-score text-2xl font-black text-white">0</span> <span class="text-xs font-bold text-[#cfe7f4]">${escapeHtml(copy.fragments)}</span></p>
              </div>
            </div>
            <div class="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div class="fragment-calc-progress h-full w-0 rounded-full bg-[linear-gradient(90deg,#1877f2,#7fe9ff,#ffaa00)] transition-[width] duration-300"></div>
            </div>
            <p class="fragment-calc-status mt-3 text-sm font-extrabold text-[#ffd58a]">${escapeHtml(copy.initial)}</p>
            <p class="fragment-calc-detail mt-1 text-xs leading-relaxed text-[#cfe7f4]/80">${escapeHtml(copy.detail)}</p>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="safe">${escapeHtml(copy.safe)}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="no-summon">${escapeHtml(copy.noSummon)}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="all">${escapeHtml(copy.all)}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="clear">${escapeHtml(copy.clear)}</button>
          </div>

          <div class="fragment-event-option-list mt-3 grid gap-2">
            ${renderOptions(items, isVi)}
          </div>
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
    bindFragmentEventCalculators(wrap);
  }
}

function updateCountdowns(): void {
  document.querySelectorAll<HTMLElement>("[data-fragment-event-countdown]").forEach((node) => {
    const endIso = node.dataset.eventEnd || EVENT_END_ISO;
    node.textContent = formatCountdown(endIso);
  });
}

export function initNavbarFragmentEvent(): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-fragment-event");
  const button = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-button");
  const close = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-close");
  if (!wrap || !button || wrap.dataset.bound === "1") return;
  wrap.dataset.bound = "1";
  bindFragmentEventCalculators(wrap);
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
