/**
 * Tối ưu tải ảnh không cần lưu binary trong DB (chỉ URL trong DB vẫn OK).
 * - preconnect tới origin Supabase → ảnh Storage/remote nhanh hơn.
 * - preload ảnh hero/logo mặc định (light) để LCP nền sớm hơn một chút.
 */

function appendUniqueLink(rel: string, href: string, extra?: Record<string, string>) {
  const dup = [...document.head.querySelectorAll(`link[rel="${rel}"]`)].some(
    (l) => l.getAttribute("href") === href,
  );
  if (dup) return;
  const l = document.createElement("link");
  l.rel = rel;
  l.href = href;
  if (extra) for (const [k, v] of Object.entries(extra)) l.setAttribute(k, v);
  document.head.appendChild(l);
}

function preconnectSupabase(): void {
  const raw = import.meta.env.VITE_SUPABASE_URL;
  if (typeof raw !== "string" || !raw.trim()) return;
  try {
    const origin = new URL(raw.trim()).origin;
    appendUniqueLink("preconnect", origin);
    appendUniqueLink("dns-prefetch", origin);
  } catch {
    /* ignore invalid URL */
  }
}

/** Preload ảnh nền / logo thường gặp (theme light mặc định). */
function preloadCriticalStaticImages(): void {
  appendUniqueLink("preload", "/hero-bg.png", { as: "image" });
  appendUniqueLink("preload", "/logo.png", { as: "image" });
}

export function initImageOptimizations(): void {
  preconnectSupabase();
  preloadCriticalStaticImages();
}
