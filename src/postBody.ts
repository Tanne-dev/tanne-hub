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
    .map((b) => b.text.replace(/\s+/g, " ").trim())
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
      const paras = b.text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
      for (const p of paras) {
        pieces.push(
          `<p class="raid-article-p mb-3 text-[15px] leading-[1.65] last:mb-0">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`,
        );
      }
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

  return pieces.join("\n");
}
