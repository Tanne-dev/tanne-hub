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

function renderTextBlockHtml(text: string): string[] {
  const normalized = normalizeLegacyLineBreakTags(text);
  const parts = normalized
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];

  for (const part of parts) {
    const lines = part.split("\n").map((x) => x.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const skillCardHtml = renderSkillCard(lines);
    if (skillCardHtml) {
      out.push(skillCardHtml);
      continue;
    }

    const effectsMatch = lines.length === 1 ? lines[0].match(/^::effects\{([\s\S]*)\}$/) : null;
    if (effectsMatch) {
      const attrs = parseDirectiveAttrs(effectsMatch[1]);
      out.push(renderEffectBadges((attrs.items || "").split("|")));
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
