/** Giỏ mua Raid account (khách) — localStorage. */
const SHOP_CART_KEY = "tanne-shop-raid-cart";

export type ShopCartEntry = {
  accountId: string;
  priceLabel: string;
  preview: string;
};

function readRaw(): ShopCartEntry[] {
  const raw = localStorage.getItem(SHOP_CART_KEY);
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
      .filter((x): x is ShopCartEntry => Boolean(x));
  } catch {
    return [];
  }
}

function write(lines: ShopCartEntry[]): void {
  localStorage.setItem(SHOP_CART_KEY, JSON.stringify(lines));
}

export function getShopCart(): ShopCartEntry[] {
  return readRaw();
}

export function upsertShopCartEntry(entry: ShopCartEntry): void {
  const cur = readRaw();
  const idx = cur.findIndex((x) => x.accountId === entry.accountId);
  if (idx >= 0) cur[idx] = entry;
  else cur.unshift(entry);
  write(cur);
}

export function removeShopCartEntry(accountId: string): void {
  write(readRaw().filter((x) => x.accountId !== accountId));
}

export function clearShopCart(): void {
  write([]);
}

export function pruneShopCart(validIds: Set<string>): ShopCartEntry[] {
  const cur = readRaw();
  const next = cur.filter((x) => validIds.has(x.accountId));
  if (next.length !== cur.length) write(next);
  return next;
}

const CHECKOUT_EMAIL_KEY = "tanne-shop-checkout-email";

export function getCheckoutContactEmail(): string {
  try {
    const v = localStorage.getItem(CHECKOUT_EMAIL_KEY);
    return typeof v === "string" ? v.trim() : "";
  } catch {
    return "";
  }
}

export function setCheckoutContactEmail(email: string): void {
  const t = email.trim();
  if (!t) localStorage.removeItem(CHECKOUT_EMAIL_KEY);
  else localStorage.setItem(CHECKOUT_EMAIL_KEY, t);
}

/** Các lựa chọn hiển thị ở bước 3 — map tới tích hợp thực tế xem `docs/checkout-payment-plan.md`. */
export type CheckoutPaymentMethod =
  | "stripe_card"
  | "paypal"
  | "wise"
  | "binance"
  | "remitly"
  | "revolut";

export type CheckoutBuyerProfile = {
  fullName: string;
  /** YYYY-MM-DD */
  birthDate: string;
  paymentMethod: CheckoutPaymentMethod | "";
};

const PROFILE_KEY = "tanne-shop-checkout-profile";

const PAYMENT_METHODS: CheckoutPaymentMethod[] = [
  "stripe_card",
  "paypal",
  "wise",
  "binance",
  "remitly",
  "revolut",
];

function isPaymentMethod(v: string): v is CheckoutPaymentMethod {
  return PAYMENT_METHODS.includes(v as CheckoutPaymentMethod);
}

export function getCheckoutBuyerProfile(): CheckoutBuyerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { fullName: "", birthDate: "", paymentMethod: "" };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return { fullName: "", birthDate: "", paymentMethod: "" };
    const o = parsed as Record<string, unknown>;
    const fullName = typeof o.fullName === "string" ? o.fullName.trim() : "";
    const birthDate = typeof o.birthDate === "string" ? o.birthDate.trim() : "";
    const pmRaw = typeof o.paymentMethod === "string" ? o.paymentMethod.trim() : "";
    const paymentMethod = isPaymentMethod(pmRaw) ? pmRaw : "";
    return { fullName, birthDate, paymentMethod };
  } catch {
    return { fullName: "", birthDate: "", paymentMethod: "" };
  }
}

export function updateCheckoutBuyerProfile(patch: Partial<CheckoutBuyerProfile>): void {
  const cur = getCheckoutBuyerProfile();
  let paymentMethod: CheckoutBuyerProfile["paymentMethod"] = cur.paymentMethod;
  if (patch.paymentMethod !== undefined) {
    if (patch.paymentMethod === "" || isPaymentMethod(patch.paymentMethod)) {
      paymentMethod = patch.paymentMethod;
    }
  }
  const next: CheckoutBuyerProfile = {
    fullName: patch.fullName !== undefined ? patch.fullName.trim() : cur.fullName,
    birthDate: patch.birthDate !== undefined ? patch.birthDate.trim() : cur.birthDate,
    paymentMethod,
  };
  const empty = !next.fullName && !next.birthDate && !next.paymentMethod;
  if (empty) localStorage.removeItem(PROFILE_KEY);
  else localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
}
