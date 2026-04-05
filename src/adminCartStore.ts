const ADMIN_CART_KEY = "tanne-admin-raid-cart";

export type AdminCartEntry = {
  accountId: string;
  priceLabel: string;
  /** One-line preview (e.g. champions) */
  preview: string;
};

function readRaw(): AdminCartEntry[] {
  const raw = localStorage.getItem(ADMIN_CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const accountId = typeof o.accountId === "string" ? o.accountId.trim() : "";
        const priceLabel = typeof o.priceLabel === "string" ? o.priceLabel.trim() : "";
        const preview = typeof o.preview === "string" ? o.preview.trim() : "";
        if (!accountId) return null;
        return { accountId, priceLabel, preview };
      })
      .filter((x): x is AdminCartEntry => Boolean(x));
  } catch {
    return [];
  }
}

function write(lines: AdminCartEntry[]): void {
  localStorage.setItem(ADMIN_CART_KEY, JSON.stringify(lines));
}

export function getAdminCart(): AdminCartEntry[] {
  return readRaw();
}

export function saveAdminCart(lines: AdminCartEntry[]): void {
  write(lines);
}

export function upsertAdminCartEntry(entry: AdminCartEntry): void {
  const cur = readRaw();
  const idx = cur.findIndex((x) => x.accountId === entry.accountId);
  if (idx >= 0) cur[idx] = entry;
  else cur.unshift(entry);
  write(cur);
}

export function removeAdminCartEntry(accountId: string): void {
  write(readRaw().filter((x) => x.accountId !== accountId));
}

export function clearAdminCart(): void {
  write([]);
}

/** Drop lines whose account no longer exists in the given ID set. */
export function pruneAdminCart(validIds: Set<string>): AdminCartEntry[] {
  const cur = readRaw();
  const next = cur.filter((x) => validIds.has(x.accountId));
  if (next.length !== cur.length) write(next);
  return next;
}
