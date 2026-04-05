import { getShopCart, pruneShopCart } from "./shopCartStore";
import { getSellingAccounts } from "./sellingAccountsStore";

function syncHeaderShopCart(): void {
  const link = document.querySelector<HTMLElement>("#header-shop-cart-link");
  const badge = document.querySelector<HTMLElement>("#header-shop-cart-badge");
  if (!link || !badge) return;

  const accounts = getSellingAccounts();
  const ids = new Set(accounts.map((a) => a.id.trim()).filter(Boolean));
  pruneShopCart(ids);

  const n = getShopCart().length;
  badge.textContent = String(n);
  if (n > 0) {
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

export function initHeaderShopCart(): void {
  syncHeaderShopCart();
  window.addEventListener("tanne-shop-cart-updated", syncHeaderShopCart);
  window.addEventListener("tanne-selling-accounts-updated", syncHeaderShopCart);
}
