import { type AccountStockCard } from "../content";
import { getSellingAccounts } from "../sellingAccountsStore";
import { renderAccountStockGrid } from "../partials/accountStockCards";

/** Kho tài khoản — lưới thẻ kiểu marketplace (ID, chỉ số, preview tướng, giá). */
export function renderPopularAccounts(): string {
  const items = getSellingAccounts();
  return `
        <section class="gloss-hover-frame theme-smooth rounded-[14px] p-5 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] sm:p-6 md:p-7" aria-labelledby="account-stock-heading">
          <div class="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="account-stock-heading" class="text-[19px] font-semibold text-[var(--panel-text)] sm:text-[20px] md:text-[22px]">
                Raid Account Marketplace
              </h2>
              <p class="mt-1 text-[14px] leading-snug text-[var(--panel-muted)] sm:text-[15px]">Photos + description are enough for a listing; champions are optional. ID is copyable — stock syncs from admin.</p>
            </div>
            <a
              href="/?page=raid-accounts"
              class="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-lg border border-[#7fe9ff]/45 bg-[var(--panel-bg)] px-3.5 py-2.5 text-[15px] font-semibold text-[#7fe9ff] shadow-sm transition hover:bg-[#7fe9ff]/10 active:opacity-90 sm:w-auto sm:py-2 sm:text-[14px]"
            >
              View all Raid accounts
            </a>
          </div>
          <div id="account-stock-grid" class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            ${renderAccountStockGrid(items)}
          </div>
        </section>`;
}

export function renderSellingAccountsGrid(items: AccountStockCard[]): string {
  if (items.length === 0) {
    return '<p class="rounded-md border border-[var(--news-card-border)] bg-[var(--panel-bg)] px-4 py-3.5 text-[15px] text-[var(--panel-muted)]">No active accounts for sale yet.</p>';
  }
  return renderAccountStockGrid(items);
}
