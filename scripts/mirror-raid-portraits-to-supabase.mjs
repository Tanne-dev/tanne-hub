/**
 * Tải portrait từ URL hiện có (thường HellHades) → upload Supabase Storage → cập nhật portrait_url.
 *
 * Không gói "một file" cho cả nghìn ảnh: trình duyệt cần URL riêng cho từng <img>.
 * Cách này: một lần chạy script (batch), sau đó user chỉ tải từ CDN Supabase (cache), không spam HellHades.
 *
 * Trước khi chạy:
 * 1) Migration 20260404150000_raid_portraits_storage_bucket.sql (bucket raid-portraits + policy đọc public).
 * 2) Đã có portrait_url hợp lệ: npm run sync:champions -- --portraits
 *
 * Biến môi trường: SUPABASE_URL hoặc VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * tuỳ chọn SUPABASE_RAID_PORTRAITS_BUCKET (mặc định raid-portraits).
 *
 * Chạy:
 *   node scripts/mirror-raid-portraits-to-supabase.mjs
 *   node scripts/mirror-raid-portraits-to-supabase.mjs --dry-run
 *   node scripts/mirror-raid-portraits-to-supabase.mjs --force   (upload lại cả dòng đã trỏ Storage)
 *   node scripts/mirror-raid-portraits-to-supabase.mjs --limit 50
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FETCH_HEADERS = {
  Accept: "image/*,*/*;q=0.8",
  "User-Agent": "Mozilla/5.0 (compatible; TanneShopPortraitMirror/1.0)",
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
    dryRun: argv.includes("--dry-run"),
    force: argv.includes("--force"),
    limit: (() => {
      const i = argv.indexOf("--limit");
      if (i < 0 || !argv[i + 1]) return null;
      const n = Number(argv[i + 1], 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    })(),
  };
}

function extFromContentType(ct) {
  const s = (ct || "").split(";")[0].trim().toLowerCase();
  if (s === "image/jpeg" || s === "image/jpg") return "jpg";
  if (s === "image/png") return "png";
  if (s === "image/webp") return "webp";
  return null;
}

function extFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\.(jpe?g|png|webp)$/i);
    if (!m) return null;
    const e = m[1].toLowerCase();
    return e === "jpeg" ? "jpg" : e;
  } catch {
    return null;
  }
}

function isHellhadesPortraitUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname.endsWith("hellhades.com") && /\/wp-content\/uploads\//i.test(u.pathname);
  } catch {
    return false;
  }
}

function isOurStorageUrl(url, supabaseOrigin, bucket) {
  if (!supabaseOrigin || !bucket) return false;
  try {
    const u = new URL(url);
    const o = new URL(supabaseOrigin);
    return (
      u.hostname === o.hostname &&
      u.pathname.includes(`/storage/v1/object/public/${bucket}/`)
    );
  } catch {
    return false;
  }
}

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
const { dryRun, force, limit } = parseArgs();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_RAID_PORTRAITS_BUCKET || "raid-portraits";

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Thiếu SUPABASE_URL (hoặc VITE_SUPABASE_URL) hoặc SUPABASE_SERVICE_ROLE_KEY trong .env",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: rows, error: selErr } = await supabase
  .from("raid_champions")
  .select("hellhades_id, name, portrait_url")
  .order("hellhades_id");

if (selErr) {
  console.error(selErr.message);
  process.exit(1);
}

let list = rows ?? [];
if (limit) list = list.slice(0, limit);

const work = list.filter((r) => {
  const u = r.portrait_url?.trim();
  if (!u) return false;
  if (!force && isOurStorageUrl(u, supabaseUrl, bucket)) return false;
  if (!isHellhadesPortraitUrl(u)) return false;
  return true;
});

const skippedNoUrl = list.filter((r) => !r.portrait_url?.trim()).length;
const skippedAlreadyOurs = list.filter(
  (r) => r.portrait_url?.trim() && isOurStorageUrl(r.portrait_url, supabaseUrl, bucket),
).length;
const skippedOtherHost = list.filter((r) => {
  const u = r.portrait_url?.trim();
  return u && !isHellhadesPortraitUrl(u) && !isOurStorageUrl(u, supabaseUrl, bucket);
}).length;

console.log(
  `Mirror: ${work.length} dòng HellHades (dry-run=${dryRun}, force=${force}). ` +
    `Bỏ qua: không URL=${skippedNoUrl}, đã Storage=${skippedAlreadyOurs}, host khác=${skippedOtherHost}.`,
);

let ok = 0;
let fail = 0;

await runPool(work, 5, async (row) => {
  const src = row.portrait_url.trim();
  try {
    const res = await fetch(src, { headers: FETCH_HEADERS, redirect: "follow" });
    if (!res.ok) {
      fail++;
      console.warn(`HTTP ${res.status}: ${row.name} (${row.hellhades_id})`);
      return;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 256) {
      fail++;
      console.warn(`Quá nhỏ / không phải ảnh: ${row.name}`);
      return;
    }
    const ct = res.headers.get("content-type");
    const ext = extFromContentType(ct) || extFromUrl(src) || "jpg";
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    const path = `portraits/${row.hellhades_id}.${ext}`;

    if (dryRun) {
      console.log(`[dry-run] ${row.name} → ${path} (${buf.length} bytes)`);
      ok++;
      return;
    }

    const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
      contentType: mime,
      upsert: true,
      cacheControl: "31536000",
    });

    if (upErr) {
      fail++;
      console.warn(`Upload ${row.name}:`, upErr.message);
      return;
    }

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) {
      fail++;
      console.warn(`Không lấy được public URL: ${row.name}`);
      return;
    }

    const { error: updErr } = await supabase
      .from("raid_champions")
      .update({ portrait_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("hellhades_id", row.hellhades_id);

    if (updErr) {
      fail++;
      console.warn(`Update DB ${row.name}:`, updErr.message);
      return;
    }

    ok++;
    if (ok % 100 === 0) console.log(`… ${ok} xong`);
  } catch (e) {
    fail++;
    console.warn(`${row.name}:`, e?.message ?? e);
  }
});

console.log(`Hoàn tất: ${ok} OK, ${fail} lỗi.`);
