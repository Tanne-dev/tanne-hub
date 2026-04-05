import { escapeHtml } from "../postBody";

/**
 * Icon thanh toán: PNG trong `public/payment-icons/` (logo bạn cung cấp) hoặc SVG gợi ý cho các kênh còn lại.
 */
const box =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--news-card-border)] bg-[color-mix(in_srgb,var(--panel-bg)_88%,white_12%)] p-1";

function wrap(svg: string): string {
  return `<span class="${box}" aria-hidden="true">${svg}</span>`;
}

function wrapImg(src: string, alt: string): string {
  const safeSrc = escapeHtml(src);
  const safeAlt = escapeHtml(alt);
  return `<span class="${box}"><img src="${safeSrc}" alt="${safeAlt}" class="max-h-9 max-w-full w-auto object-contain" width="36" height="36" loading="lazy" decoding="async" /></span>`;
}

/** Visa / Mastercard + Stripe (thẻ qua Stripe). */
export const checkoutIconStripeCard = wrap(`
  <svg class="h-7 w-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="28" height="18" rx="3" fill="#1a1f36" stroke="currentColor" class="text-[var(--news-card-border)]" stroke-width="1"/>
    <rect x="2" y="12" width="28" height="4" fill="#635BFF"/>
    <rect x="5" y="19" width="7" height="3" rx="0.5" fill="#1A1F71"/>
    <circle cx="23" cy="20.5" r="2.25" fill="#EB001B"/>
    <circle cx="25.5" cy="20.5" r="2.25" fill="#F79E1B"/>
  </svg>
`);

export const checkoutIconPayPal = wrapImg("/payment-icons/paypal.png", "PayPal");

export const checkoutIconWise = wrapImg("/payment-icons/wise.png", "Wise");

export const checkoutIconBinance = wrap(`
  <svg class="h-7 w-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 16l5.5-5.5L21.5 16l-5.5 5.5L10.5 16z" fill="#F0B90B"/>
    <path d="M16 6l3 3-3 3-3-3 3-3zM16 20l3 3-3 3-3-3 3-3zM6 16l3 3-3 3-3-3 3-3zM26 16l3 3-3 3-3-3 3-3z" fill="#F0B90B" opacity="0.75"/>
  </svg>
`);

export const checkoutIconRemitly = wrapImg("/payment-icons/remitly.png", "Remitly");

export const checkoutIconRevolut = wrapImg("/payment-icons/revolut.png", "Revolut");
