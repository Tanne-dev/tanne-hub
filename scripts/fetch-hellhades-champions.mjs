/**
 * Tải danh sách champion + điểm tier từ API công khai HellHades (cùng nguồn với trang tier list).
 * Trang web: https://hellhades.com/raid/tier-list/
 * Endpoint:   GET https://hellhades.com/wp-json/hh-api/v1/champions/tierlist
 *
 * Chạy: node scripts/fetch-hellhades-champions.mjs
 * Hoặc: npm run fetch:champions
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "data");
const URL = "https://hellhades.com/wp-json/hh-api/v1/champions/tierlist";

function csvEscape(s) {
  if (s == null) return "";
  const t = String(s);
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

async function main() {
  const res = await fetch(URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const data = await res.json();
  const rows = data.champions ?? [];
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error("Unexpected response: no champions array");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const jsonPath = join(OUT_DIR, "hellhades-champions-tierlist.json");
  await writeFile(jsonPath, JSON.stringify(data, null, 2), "utf8");

  const header = ["id", "champion", "faction", "url"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.id, r.champion, r.faction, r.url].map(csvEscape).join(","),
    ),
  ];
  const csvPath = join(OUT_DIR, "hellhades-champions.csv");
  await writeFile(csvPath, lines.join("\n"), "utf8");

  console.log(`Wrote ${rows.length} champions`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${csvPath}`);
  if (data.pagination) {
    console.log("Pagination meta:", data.pagination);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
