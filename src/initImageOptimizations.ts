/**
 * Tối ưu tải ảnh không cần lưu binary trong DB (chỉ URL trong DB vẫn OK).
 * - preconnect tới origin Supabase → ảnh Storage/remote nhanh hơn.
 * - preload logo nhỏ, không preload ảnh nền lớn trên mọi route.
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

/** Preload logo nhỏ; ảnh hero tự tải khi trang chủ thật sự render. */
function preloadCriticalStaticImages(): void {
  appendUniqueLink("preload", "/logo.png", { as: "image" });
}

export function initImageOptimizations(): void {
  preconnectSupabase();
  preloadCriticalStaticImages();
}
