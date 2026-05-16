const FIXED_RATE_MIN = 0.95;
const FIXED_RATE_MAX = 0.96;

const serviceLabels: Record<string, { from: string; to: string; note: string; fixedRate: boolean }> = {
  crypto_paypal: {
    from: "crypto via Binance",
    to: "PayPal",
    note: "PayPal F&F or G&S can be discussed.",
    fixedRate: true,
  },
  paypal_crypto: {
    from: "PayPal",
    to: "crypto via Binance",
    note: "BTC, ETH, USDT, BNB and other supported assets can be discussed.",
    fixedRate: true,
  },
  paypal_wise: {
    from: "PayPal",
    to: "Wise",
    note: "Wise transfer currency depends on Wise support.",
    fixedRate: true,
  },
  bank_transfer: {
    from: "Crypto / PayPal / Wise",
    to: "bank account",
    note: "Rate depends on live market, currency, destination, and transfer method.",
    fixedRate: false,
  },
};

function money(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function updateExchangeEstimate(): void {
  const serviceInput = document.querySelector<HTMLSelectElement>("#exchange-service");
  const amountInput = document.querySelector<HTMLInputElement>("#exchange-amount");
  const currencyInput = document.querySelector<HTMLSelectElement>("#exchange-currency");
  const result = document.querySelector<HTMLElement>("#exchange-estimate-result");
  const detail = document.querySelector<HTMLElement>("#exchange-estimate-detail");
  if (!serviceInput || !amountInput || !currencyInput || !result || !detail) return;

  const service = serviceLabels[serviceInput.value] ?? serviceLabels.crypto_paypal;
  const currency = currencyInput.value || "USD";
  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    result.textContent = "Enter an amount to estimate.";
    detail.textContent = service.note;
    return;
  }

  if (!service.fixedRate) {
    result.textContent = "Custom quote";
    detail.textContent = `You send ${money(amount, currency)} from ${service.from} and want ${service.to}. Contact me for the final rate. ${service.note}`;
    return;
  }

  const low = amount * FIXED_RATE_MIN;
  const high = amount * FIXED_RATE_MAX;
  result.textContent = `${money(low, currency)} – ${money(high, currency)}`;
  detail.textContent = `You send ${money(amount, currency)} from ${service.from}. You receive about ${money(low, currency)} to ${money(high, currency)} in ${service.to}. ${service.note}`;
}

export function initExchangeCalculator(): void {
  const form = document.querySelector<HTMLElement>("#exchange-calculator");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("input", updateExchangeEstimate);
  form.addEventListener("change", updateExchangeEstimate);
  updateExchangeEstimate();
}
