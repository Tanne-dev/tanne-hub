import {
  getPromoCodeSettings,
  savePromoCodeSettings,
  syncPromoCodeSettingsFromRemote,
} from "./promoCodeStore";
import { renderNavbarPromoCodeHtml } from "./promoCodeNav";

export function renderPromoCodeSection(): void {
  const promoEl = document.querySelector<HTMLElement>("#navbar-promo-code");
  if (!promoEl) return;
  promoEl.outerHTML = renderNavbarPromoCodeHtml();
  bindNavbarPromoCode();
}

function setPromoScrollOpen(open: boolean): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-promo-code");
  const button = document.querySelector<HTMLButtonElement>("#navbar-promo-code-button");
  const panel = document.querySelector<HTMLElement>("#navbar-promo-scroll");
  if (!wrap || !button || !panel) return;
  wrap.classList.toggle("promo-scroll-open", open);
  button.setAttribute("aria-expanded", open ? "true" : "false");
  panel.setAttribute("aria-hidden", open ? "false" : "true");
}

function bindNavbarPromoCode(): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-promo-code");
  const button = document.querySelector<HTMLButtonElement>("#navbar-promo-code-button");
  const close = document.querySelector<HTMLButtonElement>("#navbar-promo-close");
  if (!wrap || !button || wrap.dataset.bound === "1") return;
  wrap.dataset.bound = "1";

  button.addEventListener("click", () => {
    setPromoScrollOpen(!wrap.classList.contains("promo-scroll-open"));
  });
  close?.addEventListener("click", () => {
    setPromoScrollOpen(false);
  });
}

export function initPromoCodeManager(): void {
  savePromoCodeSettings(getPromoCodeSettings());
  renderPromoCodeSection();
  void syncPromoCodeSettingsFromRemote().then(() => {
    renderPromoCodeSection();
  });

  window.addEventListener("tanne-promo-code-updated", () => {
    renderPromoCodeSection();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setPromoScrollOpen(false);
  });
  window.addEventListener("click", (event) => {
    const wrap = document.querySelector<HTMLElement>("#navbar-promo-code");
    if (!wrap || !wrap.classList.contains("promo-scroll-open")) return;
    if (!wrap.contains(event.target as Node)) setPromoScrollOpen(false);
  });
}
