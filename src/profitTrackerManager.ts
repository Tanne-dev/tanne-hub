import { getMemberSession } from "./login";
import { fireAccountListingConfetti } from "./accountListingConfetti";
import {
  deleteProfitTrade,
  getProfitTrades,
  syncProfitTradesFromRemote,
  upsertProfitTrade,
  type ProfitTrade,
  type ProfitTradeStatus,
} from "./profitTrackerStore";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function money(value: number): string {
  return currency.format(value);
}

function parseAmount(value: string): number {
  const n = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function dateForSummary(trade: ProfitTrade): Date | null {
  const raw = trade.status === "sold" ? trade.sellDate || trade.buyDate : trade.buyDate;
  if (!raw) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function profitOf(trade: ProfitTrade): number {
  return trade.status === "sold" ? (trade.sellPrice ?? 0) - trade.buyPrice : 0;
}

function renderMetric(label: string, value: string, tone = "text-[var(--admin-heading)]"): string {
  return `
    <article class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
      <p class="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">${label}</p>
      <p class="mt-1 text-xl font-extrabold ${tone}">${value}</p>
    </article>`;
}

function statusLabel(status: ProfitTradeStatus): string {
  if (status === "sold") return "Sold";
  if (status === "reserved") return "Reserved";
  return "In stock";
}

function renderProfitSummary(): void {
  const wrap = document.querySelector<HTMLElement>("#profit-summary-grid");
  if (!wrap) return;
  const trades = getProfitTrades();
  const sold = trades.filter((item) => item.status === "sold");
  const now = new Date();
  const currentWeek = weekKey(now);
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalBuy = trades.reduce((sum, item) => sum + item.buyPrice, 0);
  const revenue = sold.reduce((sum, item) => sum + (item.sellPrice ?? 0), 0);
  const profit = sold.reduce((sum, item) => sum + profitOf(item), 0);
  const stockValue = trades
    .filter((item) => item.status !== "sold")
    .reduce((sum, item) => sum + item.buyPrice, 0);
  const weekProfit = sold.reduce((sum, item) => {
    const d = dateForSummary(item);
    return d && weekKey(d) === currentWeek ? sum + profitOf(item) : sum;
  }, 0);
  const monthProfit = sold.reduce((sum, item) => {
    const d = dateForSummary(item);
    const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "";
    return key === currentMonth ? sum + profitOf(item) : sum;
  }, 0);

  wrap.innerHTML = [
    renderMetric("Total buy cost", money(totalBuy)),
    renderMetric("Revenue sold", money(revenue)),
    renderMetric("Total profit", money(profit), profit >= 0 ? "text-[var(--admin-success-inline)]" : "text-red-500"),
    renderMetric("Inventory capital", money(stockValue)),
    renderMetric("Profit this week", money(weekProfit), weekProfit >= 0 ? "text-[var(--admin-success-inline)]" : "text-red-500"),
    renderMetric("Profit this month", money(monthProfit), monthProfit >= 0 ? "text-[var(--admin-success-inline)]" : "text-red-500"),
  ].join("");
}

function renderProfitTradesList(): void {
  const list = document.querySelector<HTMLElement>("#profit-trades-list");
  if (!list) return;
  const trades = getProfitTrades();
  if (trades.length === 0) {
    list.innerHTML =
      '<p class="rounded-md border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-3 py-2 text-xs text-[var(--admin-subtle)]">No trades yet. Add your first account purchase or sale above.</p>';
    return;
  }

  list.innerHTML = trades
    .map((trade) => {
      const profit = profitOf(trade);
      return `
        <article class="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="text-sm font-extrabold text-[var(--admin-heading)]">${trade.accountName}</h3>
                <span class="rounded-full border border-[var(--admin-input-border)] px-2 py-0.5 text-[10px] font-bold text-[var(--admin-subtle)]">${statusLabel(trade.status)}</span>
              </div>
              <p class="mt-1 text-[11px] text-[var(--admin-muted)]">${trade.game || "Game"} · Buy ${trade.buyDate || "-"}${trade.sellDate ? ` · Sold ${trade.sellDate}` : ""}</p>
              <p class="mt-1 text-xs text-[var(--admin-subtle)]">Buy ${money(trade.buyPrice)}${trade.sellPrice !== undefined ? ` · Sell ${money(trade.sellPrice)}` : ""} · Profit <span class="${profit >= 0 ? "text-[var(--admin-success-inline)]" : "text-red-500"} font-bold">${money(profit)}</span></p>
              ${trade.customerName || trade.paymentMethod ? `<p class="mt-1 text-[11px] text-[var(--admin-muted)]">${trade.customerName ?? "No customer"} · ${trade.paymentMethod ?? "No payment method"}</p>` : ""}
              ${trade.notes ? `<p class="mt-1 line-clamp-2 text-[11px] text-[var(--admin-muted)]">${trade.notes}</p>` : ""}
            </div>
            <div class="flex shrink-0 gap-1.5">
              <button type="button" data-profit-edit="${trade.id}" class="rounded border border-[var(--admin-tab-active-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-accent-muted)] hover:bg-[var(--admin-tab-active-bg)]">Edit</button>
              <button type="button" data-profit-delete="${trade.id}" class="rounded border border-[var(--admin-danger-border)] px-2 py-1 text-[11px] font-semibold text-[var(--admin-danger-text)] hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

function setProfitFeedback(message: string, kind: "success" | "error" | "warn"): void {
  const feedback = document.querySelector<HTMLElement>("#profit-tracker-feedback");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className =
    kind === "success"
      ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-ok-bg)] text-[var(--admin-feedback-ok-text)]"
      : kind === "warn"
        ? "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-warn-bg)] text-[var(--admin-feedback-warn-text)]"
        : "rounded-md px-3 py-2 text-xs bg-[var(--admin-feedback-err-bg)] text-[var(--admin-feedback-err-text)]";
}

function refreshProfitUi(): void {
  renderProfitSummary();
  renderProfitTradesList();
}

function fillForm(trade: ProfitTrade): void {
  const form = document.querySelector<HTMLFormElement>("#profit-tracker-form");
  if (!form) return;
  form.dataset.editingId = trade.id;
  (document.querySelector<HTMLInputElement>("#profit-account-name")!).value = trade.accountName;
  (document.querySelector<HTMLInputElement>("#profit-game")!).value = trade.game;
  (document.querySelector<HTMLInputElement>("#profit-buy-date")!).value = trade.buyDate;
  (document.querySelector<HTMLInputElement>("#profit-buy-price")!).value = String(trade.buyPrice);
  (document.querySelector<HTMLInputElement>("#profit-sell-date")!).value = trade.sellDate ?? "";
  (document.querySelector<HTMLInputElement>("#profit-sell-price")!).value =
    trade.sellPrice === undefined ? "" : String(trade.sellPrice);
  (document.querySelector<HTMLSelectElement>("#profit-status")!).value = trade.status;
  (document.querySelector<HTMLInputElement>("#profit-payment-method")!).value = trade.paymentMethod ?? "";
  (document.querySelector<HTMLInputElement>("#profit-customer-name")!).value = trade.customerName ?? "";
  (document.querySelector<HTMLTextAreaElement>("#profit-notes")!).value = trade.notes ?? "";
  const submit = document.querySelector<HTMLButtonElement>("#profit-tracker-submit");
  if (submit) submit.textContent = "Update trade";
}

function resetForm(): void {
  const form = document.querySelector<HTMLFormElement>("#profit-tracker-form");
  const submit = document.querySelector<HTMLButtonElement>("#profit-tracker-submit");
  if (!form) return;
  form.reset();
  delete form.dataset.editingId;
  const game = document.querySelector<HTMLInputElement>("#profit-game");
  if (game) game.value = "Raid Shadow Legends";
  const status = document.querySelector<HTMLSelectElement>("#profit-status");
  if (status) status.value = "in_stock";
  if (submit) submit.textContent = "Save trade";
}

export function initProfitTrackerManager(): void {
  const panel = document.querySelector<HTMLElement>("#admin-panel-profit");
  const form = document.querySelector<HTMLFormElement>("#profit-tracker-form");
  const list = document.querySelector<HTMLElement>("#profit-trades-list");
  if (!panel || !form || !list || panel.dataset.bound === "1") return;
  panel.dataset.bound = "1";

  refreshProfitUi();
  void syncProfitTradesFromRemote().then((result) => {
    refreshProfitUi();
    if (!result.ok) setProfitFeedback(`Database sync failed: ${result.error ?? "Unknown error"}. Local copy still works.`, "warn");
  });

  document.querySelector<HTMLButtonElement>("#profit-tracker-reset")?.addEventListener("click", () => {
    resetForm();
    setProfitFeedback("Form cleared.", "success");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const session = getMemberSession();
    if (!session || session.role !== "admin") {
      setProfitFeedback("Admin permission required.", "error");
      return;
    }
    const accountName = document.querySelector<HTMLInputElement>("#profit-account-name")?.value.trim() ?? "";
    const game = document.querySelector<HTMLInputElement>("#profit-game")?.value.trim() || "Raid Shadow Legends";
    const buyDate = document.querySelector<HTMLInputElement>("#profit-buy-date")?.value ?? "";
    const buyPrice = parseAmount(document.querySelector<HTMLInputElement>("#profit-buy-price")?.value ?? "");
    const sellDate = document.querySelector<HTMLInputElement>("#profit-sell-date")?.value.trim() || undefined;
    const sellRaw = document.querySelector<HTMLInputElement>("#profit-sell-price")?.value.trim() ?? "";
    const sellPrice = sellRaw ? parseAmount(sellRaw) : undefined;
    const status = (document.querySelector<HTMLSelectElement>("#profit-status")?.value ?? "in_stock") as ProfitTradeStatus;
    const paymentMethod = document.querySelector<HTMLInputElement>("#profit-payment-method")?.value.trim() || undefined;
    const customerName = document.querySelector<HTMLInputElement>("#profit-customer-name")?.value.trim() || undefined;
    const notes = document.querySelector<HTMLTextAreaElement>("#profit-notes")?.value.trim() || undefined;

    if (!accountName || !buyDate || buyPrice <= 0) {
      setProfitFeedback("Account name, buy date, and buy price are required.", "error");
      return;
    }
    if (status === "sold" && (sellPrice === undefined || sellPrice <= 0)) {
      setProfitFeedback("Sold trades need a sell price.", "error");
      return;
    }

    const result = await upsertProfitTrade({
      id: form.dataset.editingId || crypto.randomUUID(),
      accountName,
      game,
      buyDate,
      buyPrice,
      sellDate,
      sellPrice,
      paymentMethod,
      customerName,
      status,
      notes,
    });
    refreshProfitUi();
    resetForm();
    fireAccountListingConfetti();
    setProfitFeedback(
      result.ok ? "Trade saved." : `Trade saved locally, but database sync failed: ${result.error ?? "Unknown error"}`,
      result.ok ? "success" : "warn",
    );
  });

  list.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const edit = target.closest<HTMLButtonElement>("[data-profit-edit]");
    if (edit) {
      const trade = getProfitTrades().find((item) => item.id === edit.dataset.profitEdit);
      if (trade) fillForm(trade);
      return;
    }
    const del = target.closest<HTMLButtonElement>("[data-profit-delete]");
    if (!del?.dataset.profitDelete) return;
    const trade = getProfitTrades().find((item) => item.id === del.dataset.profitDelete);
    if (!trade) return;
    const ok = window.confirm(`Delete trade "${trade.accountName}"?`);
    if (!ok) return;
    const result = await deleteProfitTrade(trade.id);
    refreshProfitUi();
    fireAccountListingConfetti();
    setProfitFeedback(result.ok ? "Trade deleted." : `Deleted locally, database delete failed: ${result.error ?? "Unknown error"}`, result.ok ? "success" : "warn");
  });
}
