import { escapeHtml } from "./postBody";
import { getNewsLanguage } from "./newsLanguage";

const EVENT_START_ISO = "2026-08-19T00:00:00+00:00";
const EVENT_END_ISO = "2026-09-03T23:59:00+00:00";
const FUSION_TARGET = 400;
const FUSION_TOTAL = 500;
const FUSION_IMAGE = "/news-images/cowardly-lion-fusion.jpg";

type FragmentEventItem = {
  id: string;
  name: string;
  nameVi: string;
  dates: string;
  datesVi: string;
  fragments: number;
  kind: "safe" | "shard" | "high";
};

const fragmentEvents: FragmentEventItem[] = [
  {
    id: "dragon",
    name: "Dragon Tournament",
    nameVi: "Dragon Tournament",
    dates: "Aug 19-Aug 22",
    datesVi: "19/08-22/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-enhancement-1",
    name: "Gear Enhancement Event I",
    nameVi: "Gear Enhancement Event I",
    dates: "Aug 19-Aug 22",
    datesVi: "19/08-22/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-hunters-1",
    name: "Gear Hunters Event I",
    nameVi: "Gear Hunters Event I",
    dates: "Aug 20-Aug 23",
    datesVi: "20/08-23/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "champion-chase",
    name: "Champion Chase Tournament",
    nameVi: "Champion Chase Tournament",
    dates: "Aug 21-Aug 24",
    datesVi: "21/08-24/08",
    fragments: 75,
    kind: "shard",
  },
  {
    id: "fire-knight",
    name: "Fire Knight Tournament",
    nameVi: "Fire Knight Tournament",
    dates: "Aug 22-Aug 24",
    datesVi: "22/08-24/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "champion-training-event",
    name: "Champion Training Event",
    nameVi: "Champion Training Event",
    dates: "Aug 22-Aug 24",
    datesVi: "22/08-24/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "classic-arena-1",
    name: "Classic Arena Takedown I",
    nameVi: "Classic Arena Takedown I",
    dates: "Aug 23-Aug 26",
    datesVi: "23/08-26/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-enhancement-2",
    name: "Gear Enhancement Event II",
    nameVi: "Gear Enhancement Event II",
    dates: "Aug 24-Aug 27",
    datesVi: "24/08-27/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-hunters-2",
    name: "Gear Hunters Event II",
    nameVi: "Gear Hunters Event II",
    dates: "Aug 25-Aug 28",
    datesVi: "25/08-28/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "ice-golem",
    name: "Ice Golem Tournament",
    nameVi: "Ice Golem Tournament",
    dates: "Aug 26-Aug 29",
    datesVi: "26/08-29/08",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "summon-rush",
    name: "Summon Rush",
    nameVi: "Summon Rush",
    dates: "Aug 28-Aug 30",
    datesVi: "28/08-30/08",
    fragments: 75,
    kind: "shard",
  },
  {
    id: "champion-training-tournament",
    name: "Champion Training Tournament",
    nameVi: "Champion Training Tournament",
    dates: "Aug 28-Sep 1",
    datesVi: "28/08-01/09",
    fragments: 25,
    kind: "high",
  },
  {
    id: "spider",
    name: "Spider Tournament",
    nameVi: "Spider Tournament",
    dates: "Aug 29-Sep 1",
    datesVi: "29/08-01/09",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-enhancement-3",
    name: "Gear Enhancement Event III",
    nameVi: "Gear Enhancement Event III",
    dates: "Aug 29-Sep 1",
    datesVi: "29/08-01/09",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "classic-arena-2",
    name: "Classic Arena Takedown II",
    nameVi: "Classic Arena Takedown II",
    dates: "Aug 30-Sep 2",
    datesVi: "30/08-02/09",
    fragments: 25,
    kind: "safe",
  },
  {
    id: "gear-hunters-3",
    name: "Gear Hunters Event III",
    nameVi: "Gear Hunters Event III",
    dates: "Aug 30-Sep 3",
    datesVi: "30/08-03/09",
    fragments: 25,
    kind: "safe",
  },
];

function formatCountdown(): string {
  const now = Date.now();
  const start = new Date(EVENT_START_ISO).getTime();
  const end = new Date(EVENT_END_ISO).getTime();
  const target = now < start ? start : end;
  const diff = target - now;
  if (diff <= 0) return getNewsLanguage() === "vi" ? "Đã kết thúc" : "Ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
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

function renderFragmentEventRows(isVi: boolean): string {
  return fragmentEvents
    .map((event) => {
      const badge =
        event.kind === "shard"
          ? isVi
            ? "Shard"
            : "Shard"
          : event.kind === "high"
            ? isVi
              ? "Cao"
              : "High"
            : isVi
              ? "Dễ"
              : "Safe";
      const name = isVi ? event.nameVi : event.name;
      const dates = isVi ? event.datesVi : event.dates;
      return `<label class="fragment-calc-option" data-fragment-event-item data-fragment-event-kind="${event.kind}">
        <input class="fragment-calc-checkbox" type="checkbox" value="${event.fragments}" data-fragment-event-checkbox />
        <span>
          <span class="fragment-calc-option-name">${escapeHtml(name)}</span>
          <span class="fragment-calc-option-date">${escapeHtml(dates)}</span>
        </span>
        <span class="fragment-calc-option-side">
          <span class="fragment-calc-option-badge">${escapeHtml(badge)}</span>
          <strong>${event.fragments}</strong>
        </span>
      </label>`;
    })
    .join("");
}

export function renderNavbarFragmentEventHtml(): string {
  const isVi = getNewsLanguage() === "vi";
  const copy = isVi
    ? {
        title: "Cowardly Lion Fusion",
        subtitle: "Lịch fusion đã có. Chọn các mốc bạn định làm để tính nhanh số fragments cho The Cowardly Lion.",
        label: "Fusion",
        goal: "Mục tiêu",
        route: "Lộ trình",
        needed: "fragments còn thiếu.",
        complete: "Đã đủ mốc fusion.",
        hint: "Mục tiêu thực tế: 400 fragments để lấy 4 bản Antigone. Lịch có 500 fragments tổng cộng, nghĩa là có khoảng 100 fragments dự phòng.",
        safe: "Mốc dễ",
        noSummon: "Không summon",
        all: "Tất cả",
        clear: "Xoá chọn",
        close: "Đóng",
      }
    : {
        title: "Cowardly Lion Fusion",
        subtitle: "The fusion calendar is live. Pick the events you plan to finish and calculate your Cowardly Lion route quickly.",
        label: "Fusion",
        goal: "Goal",
        route: "Route",
        needed: "fragments still needed.",
        complete: "Fusion target reached.",
        hint: "Practical target: 400 fragments for 4 Antigone copies. The calendar shows 500 total fragments, giving roughly 100 fragments of breathing room.",
        safe: "Safe route",
        noSummon: "No summon",
        all: "All",
        clear: "Clear",
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
      <span class="fragment-event-avatar" aria-hidden="true">
        <img src="${FUSION_IMAGE}" alt="" loading="lazy" />
      </span>
      <span class="hidden min-w-0 sm:grid">
        <span class="fragment-event-button-title">${escapeHtml(copy.label)}</span>
        <span class="fragment-event-countdown" data-fragment-event-countdown>${formatCountdown()}</span>
      </span>
      <span class="fragment-event-mobile-countdown sm:hidden" data-fragment-event-countdown>${formatCountdown()}</span>
    </button>

    <div id="navbar-fragment-event-panel" class="fragment-event-panel" aria-hidden="true">
      <div class="fragment-event-paper">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-black uppercase tracking-[0.14em] text-[#7fe9ff]"><span data-fragment-event-countdown-label>${escapeHtml(getCountdownLabel())}</span> <span data-fragment-event-countdown>${formatCountdown()}</span></p>
            <h3 class="mt-1 text-[18px] font-black leading-tight text-white">${escapeHtml(copy.title)}</h3>
            <p class="mt-1 text-[12px] leading-snug text-[#b9c6df]">${escapeHtml(copy.subtitle)}</p>
          </div>
          <button id="navbar-fragment-event-close" type="button" class="promo-scroll-close" aria-label="${escapeHtml(copy.close)}">${escapeHtml(copy.close)}</button>
        </div>

        <section class="fragment-calc fragment-calc-compact mt-4" data-fragment-event-planner data-target="${FUSION_TARGET}" data-total="${FUSION_TOTAL}">
          <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div class="rounded-xl border border-[#ffaa00]/35 bg-[#ffaa00]/12 p-3">
              <p class="text-[11px] font-black uppercase tracking-[0.12em] text-[#ffd58a]">${escapeHtml(copy.goal)}</p>
              <div class="mt-1 flex items-end gap-2">
                <strong class="text-2xl leading-none text-white">${FUSION_TARGET}</strong>
                <span class="pb-0.5 text-sm font-black text-[#cfe7f4]">/ ${FUSION_TOTAL}</span>
              </div>
            </div>
            <div class="rounded-xl border border-white/10 bg-black/20 p-3 text-right">
              <p class="text-[11px] font-black uppercase tracking-[0.12em] text-[#7fe9ff]">${escapeHtml(copy.route)}</p>
              <strong class="mt-1 block text-2xl leading-none text-white"><span data-fragment-event-score>0</span></strong>
              <span class="text-xs font-bold text-[#cfe7f4]">fragments</span>
            </div>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div class="h-full rounded-full bg-gradient-to-r from-[#22c55e] via-[#7fe9ff] to-[#ffaa00]" style="width:0%" data-fragment-event-progress></div>
          </div>
          <p class="mt-3 text-sm font-black text-[#ffd58a]" data-fragment-event-status>${FUSION_TARGET} ${escapeHtml(copy.needed)}</p>
          <p class="mt-1 text-xs font-semibold leading-relaxed text-[#b9c6df]">${escapeHtml(copy.hint)}</p>

          <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button class="fragment-calc-action" type="button" data-fragment-event-action="safe">${escapeHtml(copy.safe)}</button>
            <button class="fragment-calc-action" type="button" data-fragment-event-action="no-summon">${escapeHtml(copy.noSummon)}</button>
            <button class="fragment-calc-action" type="button" data-fragment-event-action="all">${escapeHtml(copy.all)}</button>
            <button class="fragment-calc-action" type="button" data-fragment-event-action="clear">${escapeHtml(copy.clear)}</button>
          </div>

          <div class="fragment-event-option-list mt-4 grid gap-2">
            ${renderFragmentEventRows(isVi)}
          </div>
          <span class="sr-only" data-fragment-event-needed-text>${escapeHtml(copy.needed)}</span>
          <span class="sr-only" data-fragment-event-complete-text>${escapeHtml(copy.complete)}</span>
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
    node.textContent = formatCountdown();
  });
  document.querySelectorAll<HTMLElement>("[data-fragment-event-countdown-label]").forEach((node) => {
    node.textContent = getCountdownLabel();
  });
}

function updateFragmentPlanner(): void {
  const planner = document.querySelector<HTMLElement>("[data-fragment-event-planner]");
  if (!planner) return;

  const target = Number(planner.dataset.target || FUSION_TARGET);
  const total = Number(planner.dataset.total || FUSION_TOTAL);
  const checkboxes = Array.from(planner.querySelectorAll<HTMLInputElement>("[data-fragment-event-checkbox]"));
  const score = checkboxes.reduce((sum, checkbox) => sum + (checkbox.checked ? Number(checkbox.value || 0) : 0), 0);
  const needed = Math.max(target - score, 0);
  const percent = Math.min((score / target) * 100, 100);

  planner.querySelectorAll<HTMLElement>("[data-fragment-event-score]").forEach((node) => {
    node.textContent = String(score);
  });
  planner.querySelectorAll<HTMLElement>("[data-fragment-event-progress]").forEach((node) => {
    node.style.width = `${percent}%`;
  });

  const neededText = planner.querySelector<HTMLElement>("[data-fragment-event-needed-text]")?.textContent || "fragments still needed.";
  const completeText = planner.querySelector<HTMLElement>("[data-fragment-event-complete-text]")?.textContent || "Fusion target reached.";
  const status = planner.querySelector<HTMLElement>("[data-fragment-event-status]");
  if (status) {
    status.textContent = needed > 0 ? `${needed} ${neededText}` : `${completeText} (${score}/${total})`;
    status.classList.toggle("text-[#22c55e]", needed === 0);
  }

  checkboxes.forEach((checkbox) => {
    checkbox.closest<HTMLElement>("[data-fragment-event-item]")?.classList.toggle("fragment-calc-option-selected", checkbox.checked);
  });
}

export function initNavbarFragmentEvent(): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-fragment-event");
  const button = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-button");
  const close = document.querySelector<HTMLButtonElement>("#navbar-fragment-event-close");
  if (!wrap || !button || wrap.dataset.bound === "1") return;
  wrap.dataset.bound = "1";
  updateCountdowns();
  updateFragmentPlanner();
  window.setInterval(updateCountdowns, 60_000);

  button.addEventListener("click", () => {
    setFragmentEventOpen(!wrap.classList.contains("fragment-event-open"));
  });
  close?.addEventListener("click", () => setFragmentEventOpen(false));
  wrap.querySelectorAll<HTMLInputElement>("[data-fragment-event-checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", updateFragmentPlanner);
  });
  wrap.querySelectorAll<HTMLButtonElement>("[data-fragment-event-action]").forEach((actionButton) => {
    actionButton.addEventListener("click", () => {
      const action = actionButton.dataset.fragmentEventAction;
      wrap.querySelectorAll<HTMLInputElement>("[data-fragment-event-checkbox]").forEach((checkbox) => {
        const item = checkbox.closest<HTMLElement>("[data-fragment-event-item]");
        const kind = item?.dataset.fragmentEventKind;
        if (action === "all") checkbox.checked = true;
        if (action === "clear") checkbox.checked = false;
        if (action === "safe") checkbox.checked = kind === "safe" || kind === "high";
        if (action === "no-summon") checkbox.checked = kind !== "shard";
      });
      updateFragmentPlanner();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setFragmentEventOpen(false);
  });
  window.addEventListener("click", (event) => {
    if (!wrap.classList.contains("fragment-event-open")) return;
    if (!wrap.contains(event.target as Node)) setFragmentEventOpen(false);
  });
}
