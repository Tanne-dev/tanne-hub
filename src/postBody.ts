import type { PostItem } from "./postsStore";

export type PostBodyImageAlign = "full" | "center" | "left" | "right";

export type PostBodyBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string; align: PostBodyImageAlign; caption?: string };

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInlineArticleRichText(raw: string): string {
  let html = escapeHtml(raw);
  // Basic markdown-like inline formatting for newsroom quality text.
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  html = html.replace(
    /\[color=(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]([\s\S]*?)\[\/color\]/g,
    '<span style="color:$1">$2</span>',
  );
  html = html.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "<strong>$2</strong>");
  html = html.replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, "<em>$2</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}

function parseDirectiveAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(/(\w+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function effectIconUrl(label: string): string | null {
  const normalized = label.toLowerCase();
  if (normalized.includes("hp burn")) return "/raid-effect-icons/hp-burn.svg";
  if (normalized.includes("bomb")) return "/raid-effect-icons/bomb.svg";
  if (normalized.includes("leech")) return "/raid-effect-icons/leech.svg";
  if (normalized.includes("perfect veil") || normalized.includes("veil")) return "/raid-effect-icons/perfect-veil.svg";
  if (normalized.includes("weaken")) return "/raid-effect-icons/weaken.svg";
  if (normalized.includes("ignore defense") || normalized.includes("ignore defence")) {
    return "/raid-effect-icons/ignore-defense.svg";
  }
  if (normalized.includes("stun") || normalized.includes("freeze") || normalized.includes("sleep") || normalized.includes("fear") || normalized.includes("provoke") || normalized.includes("petrification") || normalized.includes("control")) {
    return "/raid-effect-icons/control.svg";
  }
  if (normalized.includes("hp aura") || normalized.includes("ally hp")) return "/raid-effect-icons/hp-aura.svg";
  if (normalized.includes("poison")) return "/raid-effect-icons/poison.svg";
  if (normalized.includes("acc")) return "/raid-effect-icons/accuracy.svg";
  if (normalized.includes("turn meter")) return "/raid-effect-icons/turn-meter.svg";
  if (normalized.includes("cooldown")) return "/raid-effect-icons/cooldown.svg";
  if (normalized.includes("buff")) return "/raid-effect-icons/buff-duration.svg";
  if (normalized.includes("crit rate")) return "/raid-effect-icons/crit-rate.svg";
  if (normalized.includes("crit damage")) return "/raid-effect-icons/crit-damage.svg";
  return null;
}

function renderEffectBadges(items: string[]): string {
  const badges = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const icon = effectIconUrl(item);
      const iconHtml = icon
        ? `<img src="${icon}" alt="" class="h-4 w-4 rounded object-cover" loading="lazy" decoding="async" />`
        : '<span class="h-1.5 w-1.5 rounded-full bg-[#ffaa00]"></span>';

      return `
        <span class="inline-flex items-center gap-1 rounded-full border border-[#7fe9ff]/35 bg-[#7fe9ff]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#bff4ff]">
          ${iconHtml}
          ${renderInlineArticleRichText(item)}
        </span>`;
    })
    .join("");

  return `<div class="raid-article-effects mb-5 flex flex-wrap gap-2">${badges}</div>`;
}

function renderSkillCard(lines: string[]): string | null {
  const first = lines[0] ?? "";
  const last = lines[lines.length - 1] ?? "";
  if (!first.startsWith("::skill{") || last !== "::endskill") return null;

  const attrMatch = first.match(/^::skill\{([\s\S]*)\}$/);
  if (!attrMatch) return null;

  const attrs = parseDirectiveAttrs(attrMatch[1]);
  const key = attrs.key || "Skill";
  const name = attrs.name || "Skill detail";
  const icon = attrs.icon || "";
  const cooldown = attrs.cooldown || "";
  const tags = (attrs.tags || "").split("|").map((tag) => tag.trim()).filter(Boolean);
  const body = lines.slice(1, -1).join(" ").trim();

  const iconHtml = icon
    ? `<img src="${escapeHtml(icon)}" alt="" class="h-full w-full object-cover" loading="lazy" decoding="async" />`
    : `<span class="text-[18px] font-black text-[#07192d]">${escapeHtml(key)}</span>`;

  return `
    <article class="raid-article-skill-card mb-4 overflow-hidden rounded-xl border border-[#7fe9ff]/25 bg-[linear-gradient(135deg,rgba(8,24,44,0.92),rgba(41,31,73,0.88))] p-4 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div class="grid gap-3 sm:grid-cols-[64px_1fr] sm:items-start">
        <div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#ffaa00]/45 bg-[#ffaa00] shadow-[0_0_22px_rgba(255,170,0,0.2)]">
          ${iconHtml}
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full border border-[#ffaa00]/45 bg-[#ffaa00]/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#ffd58a]">${escapeHtml(key)}</span>
            ${cooldown ? `<span class="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">Cooldown: ${escapeHtml(cooldown)}</span>` : ""}
          </div>
          <h4 class="mt-2 text-[18px] font-extrabold leading-tight text-white">${renderInlineArticleRichText(name)}</h4>
          ${body ? `<p class="mt-2 text-[14px] leading-[1.7] text-[#d9eef7]">${renderInlineArticleRichText(body)}</p>` : ""}
          ${tags.length ? `<div class="mt-3 flex flex-wrap gap-2">${renderEffectBadges(tags).replace(/^<div[^>]*>|<\/div>$/g, "")}</div>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderEventCard(lines: string[]): string | null {
  const first = lines[0] ?? "";
  const last = lines[lines.length - 1] ?? "";
  if (!first.startsWith("::event{") || last !== "::endevent") return null;

  const attrMatch = first.match(/^::event\{([\s\S]*)\}$/);
  if (!attrMatch) return null;

  const attrs = parseDirectiveAttrs(attrMatch[1]);
  const icon = normalizeRaidEventIcon(attrs.icon || "✦");
  const name = attrs.name || "Event";
  const dates = attrs.dates || "";
  const fragments = attrs.fragments || "";
  const tip = attrs.tip || "";
  const body = lines.slice(1, -1).join(" ").trim();
  const eventIconHtml = icon.startsWith("/")
    ? `<img src="${escapeHtml(icon)}" alt="" class="raid-event-card-icon-image" loading="lazy" decoding="async" />`
    : escapeHtml(icon);

  return `
    <article class="raid-event-card mb-4 rounded-xl border border-[#7fe9ff]/24 bg-[linear-gradient(135deg,rgba(7,22,39,0.96),rgba(24,35,68,0.9))] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
      <div class="grid gap-3 sm:grid-cols-[56px_1fr] sm:items-start">
        <div class="raid-event-card-icon flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ffaa00]/45 bg-[#0a1524] text-2xl shadow-[0_0_24px_rgba(255,170,0,0.16)]">
          ${eventIconHtml}
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            ${dates ? `<span class="rounded-full border border-[#7fe9ff]/25 bg-[#7fe9ff]/10 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#bff4ff]">${renderInlineArticleRichText(dates)}</span>` : ""}
            ${fragments ? `<span class="rounded-full border border-[#ffaa00]/35 bg-[#ffaa00]/12 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#ffd58a]">${renderInlineArticleRichText(fragments)}</span>` : ""}
          </div>
          <h4 class="mt-2 text-[17px] font-extrabold leading-tight text-white">${renderInlineArticleRichText(name)}</h4>
          ${body ? `<p class="mt-2 text-[14px] leading-[1.65] text-[#d9eef7]">${renderInlineArticleRichText(body)}</p>` : ""}
          ${tip ? `<p class="mt-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[13px] font-semibold leading-relaxed text-[#fff2cc]">${renderInlineArticleRichText(tip)}</p>` : ""}
        </div>
      </div>
    </article>
  `;
}

type FragmentCalculatorItem = {
  id: string;
  label: string;
  dates: string;
  fragments: number;
  group: "low" | "summon" | "leaderboard";
};

const khamirFragmentCalculatorItems: FragmentCalculatorItem[] = [
  { id: "dragon", label: "Dragon Tournament", dates: "Jul 27-Jul 30", fragments: 5, group: "low" },
  { id: "arena-1", label: "Classic Arena Takedown I", dates: "Jul 30-Aug 2", fragments: 5, group: "low" },
  { id: "training-tournament", label: "Champion Training Tournament", dates: "Jul 30-Aug 3", fragments: 20, group: "leaderboard" },
  { id: "fire-knight", label: "Fire Knight Tournament", dates: "Jul 31-Aug 3", fragments: 5, group: "low" },
  { id: "ice-golem", label: "Ice Golem Tournament", dates: "Aug 3-Aug 6", fragments: 5, group: "low" },
  { id: "arena-2", label: "Classic Arena Takedown II", dates: "Aug 5-Aug 8", fragments: 5, group: "low" },
  { id: "champion-chase", label: "Champion Chase Tournament", dates: "Aug 7-Aug 10", fragments: 25, group: "summon" },
  { id: "spider", label: "Spider Tournament", dates: "Aug 7-Aug 10", fragments: 5, group: "low" },
  { id: "gear-hunters-1", label: "Gear Hunters Event I", dates: "Jul 27-Jul 30", fragments: 5, group: "low" },
  { id: "gear-enhance-1", label: "Gear Enhancement Event I", dates: "Jul 28-Jul 31", fragments: 5, group: "low" },
  { id: "summon-rush-1", label: "Summon Rush I", dates: "Jul 31-Aug 3", fragments: 20, group: "summon" },
  { id: "gear-enhance-2", label: "Gear Enhancement Event II", dates: "Aug 1-Aug 4", fragments: 5, group: "low" },
  { id: "summon-rush-2", label: "Summon Rush II", dates: "Aug 4-Aug 6", fragments: 15, group: "summon" },
  { id: "gear-enhance-3", label: "Gear Enhancement Event III", dates: "Aug 5-Aug 8", fragments: 5, group: "low" },
  { id: "gear-hunters-2", label: "Gear Hunters Event II", dates: "Aug 6-Aug 9", fragments: 5, group: "low" },
  { id: "training-event", label: "Champion Training Event", dates: "Aug 6-Aug 10", fragments: 15, group: "low" },
];

const khamirFragmentCalculatorItemsVi: FragmentCalculatorItem[] = [
  { id: "dragon", label: "Dragon Tournament", dates: "27/7-30/7", fragments: 5, group: "low" },
  { id: "arena-1", label: "Classic Arena Takedown I", dates: "30/7-2/8", fragments: 5, group: "low" },
  { id: "training-tournament", label: "Champion Training Tournament", dates: "30/7-3/8", fragments: 20, group: "leaderboard" },
  { id: "fire-knight", label: "Fire Knight Tournament", dates: "31/7-3/8", fragments: 5, group: "low" },
  { id: "ice-golem", label: "Ice Golem Tournament", dates: "3/8-6/8", fragments: 5, group: "low" },
  { id: "arena-2", label: "Classic Arena Takedown II", dates: "5/8-8/8", fragments: 5, group: "low" },
  { id: "champion-chase", label: "Champion Chase Tournament", dates: "7/8-10/8", fragments: 25, group: "summon" },
  { id: "spider", label: "Spider Tournament", dates: "7/8-10/8", fragments: 5, group: "low" },
  { id: "gear-hunters-1", label: "Gear Hunters Event I", dates: "27/7-30/7", fragments: 5, group: "low" },
  { id: "gear-enhance-1", label: "Gear Enhancement Event I", dates: "28/7-31/7", fragments: 5, group: "low" },
  { id: "summon-rush-1", label: "Summon Rush I", dates: "31/7-3/8", fragments: 20, group: "summon" },
  { id: "gear-enhance-2", label: "Gear Enhancement Event II", dates: "1/8-4/8", fragments: 5, group: "low" },
  { id: "summon-rush-2", label: "Summon Rush II", dates: "4/8-6/8", fragments: 15, group: "summon" },
  { id: "gear-enhance-3", label: "Gear Enhancement Event III", dates: "5/8-8/8", fragments: 5, group: "low" },
  { id: "gear-hunters-2", label: "Gear Hunters Event II", dates: "6/8-9/8", fragments: 5, group: "low" },
  { id: "training-event", label: "Champion Training Event", dates: "6/8-10/8", fragments: 15, group: "low" },
];

function renderFragmentCalculator(lines: string[]): string | null {
  const first = lines[0] ?? "";
  if (!first.startsWith("::fragmentcalc{")) return null;

  const attrMatch = first.match(/^::fragmentcalc\{([\s\S]*)\}$/);
  if (!attrMatch) return null;

  const attrs = parseDirectiveAttrs(attrMatch[1]);
  const preset = attrs.preset || "khamir-2026-07";
  const locale = attrs.locale || "en";
  const target = Number.parseInt(attrs.target || "100", 10);
  const total = Number.parseInt(attrs.total || "150", 10);
  const title = attrs.title || "Fragment Event Calculator";
  const subtitle =
    attrs.subtitle || "Choose the events you plan to complete. The calculator will show whether you reach the summon target.";
  const items =
    preset === "khamir-2026-07" && locale === "vi"
      ? khamirFragmentCalculatorItemsVi
      : khamirFragmentCalculatorItems;
  const labels =
    locale === "vi"
      ? {
          planning: "Công cụ",
          goal: "Mục tiêu",
          safe: "Mốc dễ",
          shard: "Shard",
          leaderboard: "Nặng",
          selectSafe: "Chọn mốc dễ",
          noSummon: "Không tính summon",
          selectAll: "Chọn tất cả",
          clear: "Xoá chọn",
          route: "Kế hoạch của bạn",
          fragments: "fragments",
          initial: "Chọn event để bắt đầu tính.",
          detail: "Lộ trình an toàn thường lấy dungeon, arena, gear và training trước khi đốt shard.",
        }
      : {
          planning: "Planning tool",
          goal: "Goal",
          safe: "Safe",
          shard: "Shard",
          leaderboard: "High effort",
          selectSafe: "Select safe events",
          noSummon: "No summon plan",
          selectAll: "Select all",
          clear: "Clear",
          route: "Your route",
          fragments: "fragments",
          initial: "Choose events to start planning.",
          detail: "The safest route usually starts with dungeon, arena, gear, and training fragments before spending shards.",
        };

  const itemHtml = items
    .map((item) => {
      const badge =
        item.group === "summon"
          ? labels.shard
          : item.group === "leaderboard"
            ? labels.leaderboard
            : labels.safe;
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

  return `
    <section
      class="fragment-calc mb-6 rounded-2xl border border-[#7fe9ff]/25 bg-[linear-gradient(135deg,rgba(5,17,31,0.98),rgba(17,31,58,0.92))] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.24)]"
      data-target="${Number.isFinite(target) ? target : 100}"
      data-total="${Number.isFinite(total) ? total : 150}"
      data-locale="${escapeHtml(locale)}"
    >
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        <div>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.12em] text-[#7fe9ff]">${labels.planning}</p>
              <h3 class="mt-1 text-[21px] font-black leading-tight text-white">${renderInlineArticleRichText(title)}</h3>
              <p class="mt-1 max-w-[620px] text-sm leading-relaxed text-[#cfe7f4]">${renderInlineArticleRichText(subtitle)}</p>
            </div>
            <div class="rounded-xl border border-[#ffaa00]/35 bg-[#ffaa00]/12 px-3 py-2 text-right">
              <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#ffd58a]">${labels.goal}</p>
              <p class="text-lg font-black text-white"><span data-fragment-calc-target>${Number.isFinite(target) ? target : 100}</span> / ${Number.isFinite(total) ? total : 150}</p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="safe">${labels.selectSafe}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="no-summon">${labels.noSummon}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="all">${labels.selectAll}</button>
            <button type="button" class="fragment-calc-action" data-fragment-calc-action="clear">${labels.clear}</button>
          </div>

          <div class="fragment-calc-options mt-4 grid gap-2 md:grid-cols-2">
            ${itemHtml}
          </div>
        </div>

        <aside class="fragment-calc-summary rounded-2xl border border-white/10 bg-black/20 p-4">
          <p class="text-xs font-black uppercase tracking-[0.12em] text-[#9be8ff]">${labels.route}</p>
          <div class="mt-3 flex items-end gap-2">
            <span class="fragment-calc-score text-4xl font-black text-white">0</span>
            <span class="mb-1 text-sm font-bold text-[#cfe7f4]">${labels.fragments}</span>
          </div>
          <div class="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
            <div class="fragment-calc-progress h-full w-0 rounded-full bg-[linear-gradient(90deg,#1877f2,#7fe9ff,#ffaa00)] transition-[width] duration-300"></div>
          </div>
          <p class="fragment-calc-status mt-3 text-sm font-extrabold text-[#ffd58a]">${labels.initial}</p>
          <p class="fragment-calc-detail mt-2 text-xs leading-relaxed text-[#cfe7f4]/80">${labels.detail}</p>
        </aside>
      </div>
    </section>
  `;
}

function normalizeRaidEventIcon(icon: string): string {
  const eventIconMap: Record<string, string> = {
    "/raid-event-icons/summon-rush.svg": "/raid-event-icons/sacred-shard-event.jpg",
    "/raid-event-icons/champion-chase.svg": "/raid-event-icons/sacred-shard-event.jpg",
    "/raid-event-icons/dungeon.svg": "/raid-event-icons/dungeon-tournament.jpg",
    "/raid-event-icons/gear-enhancement.svg": "/raid-event-icons/silver-event.jpg",
    "/raid-event-icons/champion-training.svg": "/raid-stat-icons/book-red.png",
  };

  return eventIconMap[icon] || icon;
}

function renderArticleHeading(level: number, title: string): string {
  if (level === 1) {
    return `<h2 class="raid-article-h1 mb-4 mt-6 text-[24px] font-extrabold leading-tight">${title}</h2>`;
  }
  if (level === 2) {
    return `<h3 class="raid-article-h2 mb-3 mt-6 text-[20px] font-bold leading-tight">${title}</h3>`;
  }
  if (level === 3) {
    return `<h4 class="raid-article-h3 mb-2.5 mt-5 text-[17px] font-bold leading-tight">${title}</h4>`;
  }
  return `<h5 class="raid-article-h4 mb-2 mt-4 text-[15px] font-semibold uppercase tracking-wide">${title}</h5>`;
}

function normalizeLegacyLineBreakTags(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    // Some copied content has escaped tags like \ <br/> from JSON/editor pipelines.
    .replace(/\\<br\s*\/?>/gi, "\n")
    .replace(/\\<\/p>\s*\\<p>/gi, "\n\n")
    .replace(/^\\<p>/gi, "")
    .replace(/\\<\/p>$/gi, "")
    // Some content is HTML-escaped (&lt;br /&gt;) before reaching renderer.
    .replace(/&lt;br\s*\/?&gt;/gi, "\n")
    .replace(/&lt;\/p&gt;\s*&lt;p&gt;/gi, "\n\n")
    .replace(/^&lt;p&gt;/gi, "")
    .replace(/&lt;\/p&gt;$/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/^<p>/gi, "")
    .replace(/<\/p>$/gi, "");
}


function isMarkdownTable(lines: string[]): boolean {
  if (lines.length < 2) return false;
  if (!lines[0].includes("|") || !lines[1].includes("|")) return false;
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[1]);
}

function splitMarkdownTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdownTable(lines: string[]): string {
  const headers = splitMarkdownTableRow(lines[0]);
  const rows = lines.slice(2).map(splitMarkdownTableRow);
  const thead = headers
    .map((header) => `<th class="border border-[#7fe9ff]/20 bg-[#102b49] px-3 py-2 text-left text-xs font-extrabold uppercase tracking-[0.08em] text-[#9be8ff]">${renderInlineArticleRichText(header)}</th>`)
    .join("");
  const tbody = rows
    .map((row) => {
      const cells = headers
        .map((_, index) => `<td class="border border-[#7fe9ff]/15 px-3 py-2 align-top text-sm leading-relaxed">${renderInlineArticleRichText(row[index] || "")}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<div class="mb-6 overflow-x-auto rounded-xl border border-[#7fe9ff]/20"><table class="min-w-full border-collapse bg-[#071827]/70 text-[var(--news-card-text)]"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`;
}

function renderTextBlockHtml(text: string): string[] {
  const normalized = normalizeLegacyLineBreakTags(text);
  const parts = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];

  for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
    const part = parts[partIndex];
    const lines = part.split("\n").map((x) => x.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines[0]?.startsWith("::skill{")) {
      const skillLines = [...lines];
      while (skillLines[skillLines.length - 1] !== "::endskill" && partIndex + 1 < parts.length) {
        partIndex += 1;
        skillLines.push(
          ...parts[partIndex]
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
        );
      }
      const recoveredSkillCardHtml = renderSkillCard(skillLines);
      if (recoveredSkillCardHtml) {
        out.push(recoveredSkillCardHtml);
        continue;
      }
    }

    if (lines[0]?.startsWith("::event{")) {
      const eventLines = [...lines];
      while (eventLines[eventLines.length - 1] !== "::endevent" && partIndex + 1 < parts.length) {
        partIndex += 1;
        eventLines.push(
          ...parts[partIndex]
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
        );
      }
      const recoveredEventCardHtml = renderEventCard(eventLines);
      if (recoveredEventCardHtml) {
        out.push(recoveredEventCardHtml);
        continue;
      }
    }

    const skillCardHtml = renderSkillCard(lines);
    if (skillCardHtml) {
      out.push(skillCardHtml);
      continue;
    }

    const eventCardHtml = renderEventCard(lines);
    if (eventCardHtml) {
      out.push(eventCardHtml);
      continue;
    }

    const fragmentCalculatorHtml = renderFragmentCalculator(lines);
    if (fragmentCalculatorHtml) {
      out.push(fragmentCalculatorHtml);
      continue;
    }

    const effectsMatch = lines.length === 1 ? lines[0].match(/^::effects\{([\s\S]*)\}$/) : null;
    if (effectsMatch) {
      const attrs = parseDirectiveAttrs(effectsMatch[1]);
      out.push(renderEffectBadges((attrs.items || "").split("|")));
      continue;
    }

    if (isMarkdownTable(lines)) {
      out.push(renderMarkdownTable(lines));
      continue;
    }

    const headingMatch = lines[0].match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = renderInlineArticleRichText(headingMatch[2]);
      out.push(renderArticleHeading(level, title));
      if (lines.length > 1) {
        out.push(...renderTextBlockHtml(lines.slice(1).join("\n")));
      }
      continue;
    }

    if (lines.length === 1) {
      const skillHeading = lines[0].match(
        /^((?:A[1-6]|P(?:ASSIVE)?|LEADER|AURA|ULT(?:IMATE)?|SKILL)\s*[-:])\s*(.+)$/i,
      );
      if (skillHeading) {
        out.push(
          `<h4 class="raid-article-skill-title mb-2.5 mt-6 text-[18px] font-extrabold uppercase tracking-[0.02em]"><span class="raid-article-skill-key">${renderInlineArticleRichText(skillHeading[1].replace(/\s+$/, ""))}</span> ${renderInlineArticleRichText(skillHeading[2])}</h4>`,
        );
        continue;
      }
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      const items = lines
        .map((line) => line.replace(/^[-*]\s+/, ""))
        .map((line) => `<li class="mb-1">${renderInlineArticleRichText(line)}</li>`)
        .join("");
      out.push(`<ul class="raid-article-ul mb-5 ml-5 list-disc text-[15px] leading-[1.75]">${items}</ul>`);
      continue;
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      const items = lines
        .map((line) => line.replace(/^\d+\.\s+/, ""))
        .map((line) => `<li class="mb-1">${renderInlineArticleRichText(line)}</li>`)
        .join("");
      out.push(`<ol class="raid-article-ol mb-5 ml-5 list-decimal text-[15px] leading-[1.75]">${items}</ol>`);
      continue;
    }

    if (lines.every((line) => /^>\s+/.test(line))) {
      const quote = lines
        .map((line) => renderInlineArticleRichText(line.replace(/^>\s+/, "")))
        .join("<br />");
      out.push(
        `<blockquote class="raid-article-quote mb-5 border-l-2 border-[#7fe9ff]/45 pl-4 italic opacity-90">${quote}</blockquote>`,
      );
      continue;
    }

    const paragraphHtml = lines.map((line) => renderInlineArticleRichText(line)).join("<br />");
    out.push(
      `<p class="raid-article-p mb-5 text-[15px] leading-[1.8]">${paragraphHtml}</p>`,
    );
  }

  return out;
}

function tryParseBlocks(content: string): PostBodyBlock[] | null {
  const t = content.trim();
  if (!t.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(t) as unknown;
    if (!Array.isArray(parsed)) return null;
    const out: PostBodyBlock[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (o.type === "text" && typeof o.text === "string") {
        out.push({ type: "text", text: o.text });
      } else if (
        o.type === "image" &&
        typeof o.url === "string" &&
        (o.align === "full" || o.align === "center" || o.align === "left" || o.align === "right")
      ) {
        out.push({
          type: "image",
          url: o.url,
          align: o.align,
          caption: typeof o.caption === "string" ? o.caption : undefined,
        });
      }
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

export function parsePostBody(content: string): PostBodyBlock[] {
  const blocks = tryParseBlocks(content);
  if (blocks) return blocks;
  return [{ type: "text", text: content }];
}

export function serializePostBody(blocks: PostBodyBlock[]): string {
  return JSON.stringify(blocks);
}

export function postToInitialBlocks(post: PostItem): PostBodyBlock[] {
  const fromJson = tryParseBlocks(post.content);
  if (fromJson) return fromJson;

  const blocks: PostBodyBlock[] = [];
  if (post.content?.trim()) {
    blocks.push({ type: "text", text: post.content });
  }
  if (post.imageUrl) {
    const align: PostBodyImageAlign =
      post.imagePosition === "left"
        ? "left"
        : post.imagePosition === "right"
          ? "right"
          : "full";
    blocks.push({ type: "image", url: post.imageUrl, align, caption: post.caption });
  }
  return blocks.length > 0 ? blocks : [{ type: "text", text: "" }];
}

export function getFirstImageUrlFromPost(post: PostItem): string | undefined {
  for (const b of parsePostBody(post.content)) {
    if (b.type === "image" && b.url.trim()) return b.url.trim();
  }
  return post.imageUrl;
}

export function postPlainBodyForPreview(post: PostItem): string {
  return parsePostBody(post.content)
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) =>
      normalizeLegacyLineBreakTags(b.text)
        .replace(/\[color=(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\]([\s\S]*?)\[\/color\]/g, "$2")
        .replace(/`([^`\n]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1")
        .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, "$2")
        .replace(/(\*|_)(?=\S)([\s\S]*?\S)\1/g, "$2")
        .replace(/^#{1,4}\s+/gm, "")
        .replace(/^[-*]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/^>\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .join("\n\n");
}

export function postPlainTextForSearch(post: PostItem): string {
  const parts = [
    post.title,
    post.caption ?? "",
    postPlainBodyForPreview(post),
    post.authorEmail,
  ];
  return parts.join("\n").toLowerCase();
}

function imageWrapClass(align: PostBodyImageAlign): string {
  switch (align) {
    case "left":
      return "float-left mr-4 mb-3 max-w-[min(100%,320px)]";
    case "right":
      return "float-right ml-4 mb-3 max-w-[min(100%,320px)]";
    case "center":
      return "mx-auto my-3 block max-w-2xl";
    default:
      return "my-3 w-full";
  }
}

export function renderPostArticleBodyHtml(post: PostItem): string {
  const blocks = parsePostBody(post.content);
  const pieces: string[] = [];
  let clearAfterFloat = false;

  for (const b of blocks) {
    if (b.type === "text") {
      pieces.push(...renderTextBlockHtml(b.text));
    } else if (b.type === "image" && b.url.trim()) {
      const cap = b.caption?.trim()
        ? `<figcaption class="mt-1.5 text-center text-xs opacity-80">${escapeHtml(b.caption)}</figcaption>`
        : "";
      const wrap = imageWrapClass(b.align);
      if (b.align === "left" || b.align === "right") clearAfterFloat = true;
      pieces.push(
        `<figure class="${wrap} raid-article-figure overflow-hidden rounded-lg border border-white/10 bg-black/20">
          <img src="${escapeHtml(b.url)}" alt="" class="h-auto w-full object-contain" loading="lazy" decoding="async" />
          ${cap}
        </figure>`,
      );
    }
  }

  if (clearAfterFloat) {
    pieces.push('<div class="clear-both" aria-hidden="true"></div>');
  }

  const needsKhamirFragmentCalculator =
    post.id === "raid-news-2026-07-28-khamir-fragment-event-calendar" &&
    !post.content.includes("::fragmentcalc{") &&
    !pieces.some((piece) => piece.includes("fragment-calc"));
  if (needsKhamirFragmentCalculator) {
    const isVi = post.title.toLowerCase().includes("lịch") || post.content.includes("Trả lời nhanh");
    const calculator = renderFragmentCalculator([
      isVi
        ? '::fragmentcalc{preset="khamir-2026-07" locale="vi" target="100" total="150" title="Công cụ tính fragments nhanh" subtitle="Chọn các event bạn định làm. Tool sẽ tự cộng fragments và báo bạn đã đủ 100 để summon Khamir hay còn thiếu bao nhiêu."}'
        : '::fragmentcalc{preset="khamir-2026-07" target="100" total="150" title="Quick fragment calculator" subtitle="Choose the events you plan to complete. The tool adds your fragments and shows whether you already reach the 100-fragment summon target."}',
    ]);
    if (calculator) pieces.splice(Math.min(3, pieces.length), 0, calculator);
  }

  return pieces
    .join("\n")
    .replace(/<strong>/g, '<strong class="font-extrabold">')
    .replace(/<em>/g, '<em class="italic">')
    .replace(
      /<code>/g,
      '<code class="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[0.9em] text-[#bfefff]">',
    )
    .replace(/<a /g, '<a class="text-[#9be8ff] underline underline-offset-2 hover:text-[#c8f5ff]" ');
}
