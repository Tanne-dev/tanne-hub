import { bindAccountCardSliders } from "./accountCardSlider";
import {
  getSellingAccounts,
  saveSellingAccounts,
  syncSellingAccountsFromRemote,
} from "./sellingAccountsStore";
import { renderSellingAccountsGrid } from "./sections/popularAccounts";

export function renderSellingAccountsSection(): void {
  const wrap = document.querySelector<HTMLElement>("#account-stock-grid");
  if (!wrap) return;
  wrap.innerHTML = renderSellingAccountsGrid(getSellingAccounts());
  bindAccountCardSliders(wrap);
}

export function initSellingAccountsManager(): void {
  // Seed local cache for first load without remote.
  saveSellingAccounts(getSellingAccounts());
  renderSellingAccountsSection();
  void syncSellingAccountsFromRemote().then(() => {
    renderSellingAccountsSection();
    window.dispatchEvent(new CustomEvent("tanne-selling-accounts-updated"));
  });
}
