import { isSupabaseReady, supabaseClient } from "./supabase";

export type ProfitTradeStatus = "in_stock" | "reserved" | "sold";

export type ProfitTrade = {
  id: string;
  accountName: string;
  game: string;
  buyDate: string;
  buyPrice: number;
  sellDate?: string;
  sellPrice?: number;
  paymentMethod?: string;
  customerName?: string;
  status: ProfitTradeStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

type ProfitTradeRow = {
  id: string;
  account_name: string;
  game: string | null;
  buy_date: string | null;
  buy_price: number | string | null;
  sell_date: string | null;
  sell_price: number | string | null;
  payment_method: string | null;
  customer_name: string | null;
  status: ProfitTradeStatus | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const STORAGE_KEY = "tanne-profit-trades-v1";

function parseMoney(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function validStatus(value: unknown): value is ProfitTradeStatus {
  return value === "in_stock" || value === "reserved" || value === "sold";
}

function sanitizeTrade(value: unknown): ProfitTrade | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || item.id.trim() === "") return null;
  if (typeof item.accountName !== "string" || item.accountName.trim() === "") return null;
  const sellDate =
    typeof item.sellDate === "string" && item.sellDate.trim() ? item.sellDate.trim() : undefined;
  const sellPrice =
    item.sellPrice === undefined || item.sellPrice === null ? undefined : parseMoney(item.sellPrice);
  const status =
    validStatus(item.status) && item.status !== "in_stock"
      ? item.status
      : sellDate || (sellPrice ?? 0) > 0
        ? "sold"
        : validStatus(item.status)
          ? item.status
          : "in_stock";

  return {
    id: item.id,
    accountName: item.accountName.trim().slice(0, 100),
    game: typeof item.game === "string" ? item.game.trim().slice(0, 80) : "Raid Shadow Legends",
    buyDate: typeof item.buyDate === "string" ? item.buyDate : "",
    buyPrice: parseMoney(item.buyPrice),
    sellDate,
    sellPrice,
    paymentMethod: typeof item.paymentMethod === "string" ? item.paymentMethod.trim().slice(0, 80) || undefined : undefined,
    customerName: typeof item.customerName === "string" ? item.customerName.trim().slice(0, 80) || undefined : undefined,
    status,
    notes: typeof item.notes === "string" ? item.notes.trim().slice(0, 500) || undefined : undefined,
    createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
    updatedAt: typeof item.updatedAt === "number" ? item.updatedAt : Date.now(),
  };
}

function mapRowToTrade(row: ProfitTradeRow): ProfitTrade | null {
  return sanitizeTrade({
    id: row.id,
    accountName: row.account_name,
    game: row.game ?? "Raid Shadow Legends",
    buyDate: row.buy_date ?? "",
    buyPrice: parseMoney(row.buy_price),
    sellDate: row.sell_date ?? undefined,
    sellPrice: row.sell_price === null ? undefined : parseMoney(row.sell_price),
    paymentMethod: row.payment_method ?? undefined,
    customerName: row.customer_name ?? undefined,
    status: row.status ?? "in_stock",
    notes: row.notes ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  });
}

function rowFromTrade(trade: ProfitTrade): Record<string, unknown> {
  return {
    id: trade.id,
    account_name: trade.accountName,
    game: trade.game,
    buy_date: trade.buyDate || null,
    buy_price: trade.buyPrice,
    sell_date: trade.sellDate || null,
    sell_price: trade.sellPrice ?? null,
    payment_method: trade.paymentMethod ?? null,
    customer_name: trade.customerName ?? null,
    status: trade.status,
    notes: trade.notes ?? null,
    updated_at: new Date(trade.updatedAt).toISOString(),
  };
}

function readLocal(): ProfitTrade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeTrade)
      .filter((item): item is ProfitTrade => Boolean(item))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function getProfitTrades(): ProfitTrade[] {
  return readLocal();
}

function saveLocal(items: ProfitTrade[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...items].sort((a, b) => b.updatedAt - a.updatedAt)),
  );
}

export async function syncProfitTradesFromRemote(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabaseClient) return { ok: true };
  const { data, error } = await supabaseClient
    .from("profit_trades")
    .select("id, account_name, game, buy_date, buy_price, sell_date, sell_price, payment_method, customer_name, status, notes, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) return { ok: false, error: error.message };
  if (!Array.isArray(data)) return { ok: true };
  const mapped = (data as ProfitTradeRow[])
    .map(mapRowToTrade)
    .filter((item): item is ProfitTrade => Boolean(item));
  saveLocal(mapped);
  return { ok: true };
}

export async function upsertProfitTrade(input: Omit<ProfitTrade, "createdAt" | "updatedAt">): Promise<{
  ok: boolean;
  trade: ProfitTrade;
  error?: string;
}> {
  const now = Date.now();
  const trades = readLocal();
  const existing = trades.find((item) => item.id === input.id);
  const trade: ProfitTrade = {
    ...input,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  saveLocal([trade, ...trades.filter((item) => item.id !== trade.id)]);

  if (!supabaseClient) return { ok: true, trade };
  const { error } = await supabaseClient
    .from("profit_trades")
    .upsert(rowFromTrade(trade), { onConflict: "id" });
  if (error) return { ok: false, trade, error: error.message };
  return { ok: true, trade };
}

export async function deleteProfitTrade(id: string): Promise<{ ok: boolean; error?: string }> {
  const trades = readLocal();
  saveLocal(trades.filter((item) => item.id !== id));
  if (!supabaseClient) return { ok: true };
  const { error } = await supabaseClient.from("profit_trades").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
