import { getFirstImageUrlFromPost, postPlainBodyForPreview } from "./postBody";
import type { PostItem } from "./postsStore";

const SITE_NAME = "Tanne Hub";
const DEFAULT_TITLE = "Tanne Hub";
const DEFAULT_DESCRIPTION =
  "Selected Raid accounts, Raid Shadow Legends updates, promo codes, and helpful account service notes.";
const DEFAULT_IMAGE = "/hero-bg.png";

function absoluteUrl(value: string): string {
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return new URL(DEFAULT_IMAGE, window.location.origin).toString();
  }
}

function upsertMeta(selector: string, attribute: "content" | "href", value: string): void {
  let element = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (!element) {
    element = selector.startsWith("link")
      ? document.createElement("link")
      : document.createElement("meta");

    const propertyMatch = selector.match(/property="([^"]+)"/);
    const nameMatch = selector.match(/name="([^"]+)"/);
    const relMatch = selector.match(/rel="([^"]+)"/);

    if (propertyMatch) element.setAttribute("property", propertyMatch[1]);
    if (nameMatch) element.setAttribute("name", nameMatch[1]);
    if (relMatch) element.setAttribute("rel", relMatch[1]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function setMeta(title: string, description: string, imageUrl: string, pageUrl: string): void {
  document.title = title;
  upsertMeta('meta[name="description"]', "content", description);
  upsertMeta('link[rel="canonical"]', "href", pageUrl);
  upsertMeta('meta[property="og:site_name"]', "content", SITE_NAME);
  upsertMeta('meta[property="og:type"]', "content", "article");
  upsertMeta('meta[property="og:title"]', "content", title);
  upsertMeta('meta[property="og:description"]', "content", description);
  upsertMeta('meta[property="og:url"]', "content", pageUrl);
  upsertMeta('meta[property="og:image"]', "content", imageUrl);
  upsertMeta('meta[property="og:image:secure_url"]', "content", imageUrl);
  upsertMeta('meta[property="og:image:alt"]', "content", title);
  upsertMeta('meta[name="twitter:card"]', "content", "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', "content", title);
  upsertMeta('meta[name="twitter:description"]', "content", description);
  upsertMeta('meta[name="twitter:image"]', "content", imageUrl);
}

export function setDefaultSocialMeta(): void {
  setMeta(
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
    absoluteUrl(DEFAULT_IMAGE),
    new URL("/", window.location.origin).toString(),
  );
  upsertMeta('meta[property="og:type"]', "content", "website");
}

export function setPostSocialMeta(post: PostItem): void {
  const description = (post.caption || postPlainBodyForPreview(post) || DEFAULT_DESCRIPTION)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
  const imageUrl = absoluteUrl(getFirstImageUrlFromPost(post) || DEFAULT_IMAGE);
  const pageUrl = new URL(`/share/${encodeURIComponent(post.id)}`, window.location.origin).toString();
  setMeta(post.title, description || DEFAULT_DESCRIPTION, imageUrl, pageUrl);
}
