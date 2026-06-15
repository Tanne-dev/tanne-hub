const DEFAULT_TITLE = "Tanne Hub";
const DEFAULT_DESCRIPTION =
  "Selected Raid accounts, Raid Shadow Legends updates, promo codes, and helpful account service notes.";
const DEFAULT_IMAGE = "/hero-bg.png";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function absoluteUrl(value, origin) {
  try {
    return new URL(value || DEFAULT_IMAGE, origin).toString();
  } catch {
    return new URL(DEFAULT_IMAGE, origin).toString();
  }
}

function socialImageSource(value) {
  if (String(value || "").endsWith("/news-images/clan-boss-demon-lord-guide.svg")) {
    return "/news-images/clan-boss-demon-lord-guide.png";
  }
  return value;
}

function firstImageFromContent(content) {
  try {
    const blocks = JSON.parse(content || "[]");
    if (!Array.isArray(blocks)) return "";
    const image = blocks.find((block) => block?.type === "image" && String(block.url || "").trim());
    return image ? String(image.url).trim() : "";
  } catch {
    return "";
  }
}

function plainTextFromContent(content) {
  try {
    const blocks = JSON.parse(content || "[]");
    if (!Array.isArray(blocks)) return "";
    return blocks
      .filter((block) => block?.type === "text")
      .map((block) => String(block.text || ""))
      .join(" ")
      .replace(/::[^ ]+?\{.*?\}|::end[a-z]+/gi, " ")
      .replace(/\[\/?color[^\]]*\]/gi, " ")
      .replace(/[*#`>\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return "";
  }
}

async function loadPost(id) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !id) return null;

  const url = new URL("/rest/v1/posts", supabaseUrl);
  url.searchParams.set("id", `eq.${id}`);
  url.searchParams.set(
    "select",
    "id,title,caption,content,image_url,title_vi,caption_vi,content_vi,created_at",
  );
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function renderHtml({ title, description, imageUrl, canonicalUrl, appUrl }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(imageUrl);
  const safeCanonicalUrl = escapeHtml(canonicalUrl);
  const safeAppUrl = escapeHtml(appUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeCanonicalUrl}" />
    <meta property="og:site_name" content="Tanne Hub" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeCanonicalUrl}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:image:secure_url" content="${safeImageUrl}" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
    <meta http-equiv="refresh" content="0;url=${safeAppUrl}" />
  </head>
  <body>
    <p><a href="${safeAppUrl}">Open ${safeTitle}</a></p>
    <script>window.location.replace(${JSON.stringify(appUrl)});</script>
  </body>
</html>`;
}

export default async function handler(request, response) {
  const host = request.headers.host || "tannehub.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const id = String(request.query.id || "").trim();
  const lang = request.query.lang === "vi" || request.query.lang === "en" ? request.query.lang : "";
  const canonicalUrl = id ? `${origin}/share/${encodeURIComponent(id)}` : `${origin}/`;
  const appUrl = id
    ? `${origin}/?post=${encodeURIComponent(id)}${lang ? `&lang=${encodeURIComponent(lang)}` : ""}`
    : `${origin}/`;

  const post = await loadPost(id).catch(() => null);
  const content = post?.content_vi || post?.content || "";
  const title = post?.title_vi || post?.title || DEFAULT_TITLE;
  const description = (post?.caption_vi || post?.caption || plainTextFromContent(content) || DEFAULT_DESCRIPTION)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
  const imageUrl = absoluteUrl(
    socialImageSource(post?.image_url || firstImageFromContent(content) || DEFAULT_IMAGE),
    origin,
  );

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  response.status(200).send(renderHtml({ title, description, imageUrl, canonicalUrl, appUrl }));
}
