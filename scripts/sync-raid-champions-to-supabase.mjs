/**
 * Đồng bộ champion từ HellHades API v3 → public.raid_champions.
 * GET https://hellhades.com/wp-json/hh-api/v3/champions?mode=raid
 *
 * Tuỳ chọn: lấy URL ảnh portrait từ trang champion HellHades (HTML), lưu cột portrait_url.
 *   npm run sync:champions -- --portraits
 *   npm run sync:champions -- --portraits --only-missing   (chỉ crawl khi portrait_url đang trống)
 *
 * Số lượng: API v3 trả ~1038 dòng nhưng ~31 dòng trùng hellhades_id → còn 1007 champion duy nhất
 * (trùng khớp tier list v1). Meta pagination HH ghi total_champions 1038 — không có endpoint 1075
 * trong JSON công khai; số 1075 trên web có thể đếm khác (boss, bản sao, v.v.).
 *
 * Lưu ý: crawl nhiều URL — chạy ít, tránh spam; tuân ToS HellHades. Ảnh là hotlink HTTPS.
 *
 * Migration portrait_url: supabase/migrations/20260404100000_raid_champions_portrait_url.sql
 *
 * Chạy: npm run sync:champions
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const HELLHADES_V3 =
  "https://hellhades.com/wp-json/hh-api/v3/champions?mode=raid";

const PORTRAIT_RE =
  /https:\/\/hellhades\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s<>]+-Portrait\.(?:jpg|jpeg|png|webp)/gi;
const PORTRAIT_LOOSE_RE =
  /https:\/\/hellhades\.com\/wp-content\/uploads\/\d{4}\/\d{2}\/[^"'\s<>]*Portrait[^"'\s<>]*\.(?:jpg|jpeg|png|webp)/gi;
const OG_IMAGE_RE =
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
const OG_IMAGE_RE_ALT =
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i;

const FETCH_HEADERS = {
  Accept: "text/html,application/xhtml+xml",
  "User-Agent":
    "Mozilla/5.0 (compatible; TanneShopChampionSync/1.0; catalog backup)",
};

function loadDotEnv() {
  const p = join(ROOT, ".env");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function parseArgs() {
  const argv = process.argv.slice(2);
  return {
    portraits: argv.includes("--portraits"),
    onlyMissing: argv.includes("--only-missing"),
  };
}

function extractPortraitUrl(html) {
  const pickFirst = (arr) =>
    arr?.length ? [...new Set(arr.map((u) => u.replace(/\/$/, "")))][0] ?? null : null;

  const strict = pickFirst(html.match(PORTRAIT_RE));
  if (strict) return strict;

  const loose = pickFirst(html.match(PORTRAIT_LOOSE_RE));
  if (loose) return loose;

  const ogM = html.match(OG_IMAGE_RE) ?? html.match(OG_IMAGE_RE_ALT);
  const og = ogM?.[1]?.trim();
  if (og && /^https:\/\/hellhades\.com\/wp-content\/uploads\//i.test(og)) {
    return og;
  }

  return null;
}

async function fetchPortraitFromPage(pageUrl) {
  const res = await fetch(pageUrl, { headers: FETCH_HEADERS, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const html = await res.text();
  return extractPortraitUrl(html);
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} concurrency
 * @param {(item: T, index: number) => Promise<void>} fn
 */
async function runPool(items, concurrency, fn) {
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) break;
      await fn(items[i], i);
    }
  });
  await Promise.all(workers);
}

loadDotEnv();

const { portraits, onlyMissing } = parseArgs();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Thiếu SUPABASE_URL (hoặc VITE_SUPABASE_URL) hoặc SUPABASE_SERVICE_ROLE_KEY trong môi trường / .env",
  );
  process.exit(1);
}

const res = await fetch(HELLHADES_V3, { headers: { Accept: "application/json" } });
if (!res.ok) {
  console.error("HellHades API:", res.status, res.statusText);
  process.exit(1);
}

const body = await res.json();
const champions = body.champions;
if (!Array.isArray(champions) || champions.length === 0) {
  console.error("API không trả mảng champions.");
  process.exit(1);
}

const rows = champions.map((ch) => ({
  hellhades_id: String(ch.id),
  name: ch.champion,
  faction: ch.faction_index ?? ch.faction ?? null,
  hellhades_url: ch.url ?? null,
  portrait_url: null,
  rarity: ch.rarity ?? null,
  role: ch.role ?? null,
  updated_at: new Date().toISOString(),
}));

const byId = new Map();
for (const row of rows) {
  byId.set(row.hellhades_id, row);
}
const uniqueRows = [...byId.values()];
if (uniqueRows.length < rows.length) {
  console.warn(
    `Đã xoá ${rows.length - uniqueRows.length} bản ghi trùng hellhades_id (bỏ bản đầu, giữ bản cuối).`,
  );
}
console.log(
  `Catalog: ${uniqueRows.length} champion duy nhất (API gốc ${rows.length} dòng — HellHades tier list JSON = 1007 id, không phải 1075).`,
);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existingRows, error: existingErr } = await supabase
  .from("raid_champions")
  .select("hellhades_id, portrait_url");

if (existingErr && !/column .* does not exist|Could not find/i.test(existingErr.message)) {
  console.warn("Không đọc được portrait_url cũ (bảng mới?):", existingErr.message);
}

const prevPortrait = new Map();
for (const r of existingRows ?? []) {
  if (r?.hellhades_id && r.portrait_url) prevPortrait.set(r.hellhades_id, r.portrait_url);
}

for (const row of uniqueRows) {
  row.portrait_url = prevPortrait.get(row.hellhades_id) ?? null;
}

if (portraits) {
  const targets = uniqueRows.filter((row) => {
    if (!row.hellhades_url) return false;
    if (onlyMissing && row.portrait_url) return false;
    return true;
  });

  console.log(
    `Đang crawl portrait HellHades: ${targets.length} trang (song song 6, ~250ms giữa batch)…`,
  );

  let ok = 0;
  let fail = 0;
  const BATCH = 6;
  for (let i = 0; i < targets.length; i += BATCH) {
    const chunk = targets.slice(i, i + BATCH);
    await runPool(chunk, BATCH, async (row) => {
      try {
        const url = await fetchPortraitFromPage(row.hellhades_url);
        if (url) {
          row.portrait_url = url;
          ok++;
        } else {
          fail++;
          console.warn(`Không tìm thấy portrait: ${row.name} (${row.hellhades_url})`);
        }
      } catch (e) {
        fail++;
        console.warn(`Lỗi fetch ${row.name}:`, e?.message ?? e);
      }
    });
    if (i + BATCH < targets.length) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  console.log(`Portrait: ${ok} OK, ${fail} thiếu/lỗi.`);
}

const BATCH = 400;
for (let i = 0; i < uniqueRows.length; i += BATCH) {
  const batch = uniqueRows.slice(i, i + BATCH);
  const { error } = await supabase.from("raid_champions").upsert(batch, {
    onConflict: "hellhades_id",
  });
  if (error) {
    console.error(error.message);
    if (/column .* does not exist|Could not find/i.test(error.message)) {
      console.error(
        "→ Chạy migration SQL trong Supabase: migrations 20260403160000 (rarity/role) và 20260404100000 (portrait_url).",
      );
    }
    process.exit(1);
  }
  console.log(`Upsert ${Math.min(i + BATCH, uniqueRows.length)} / ${uniqueRows.length}`);
}

console.log(
  portraits
    ? "Hoàn tất (API + portrait_url). App load catalog sẽ có portraitUrl."
    : "Hoàn tất (API). Để lấy ảnh: npm run sync:champions -- --portraits",
);
