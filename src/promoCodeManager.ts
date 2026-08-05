import {
  getPromoCodeSettings,
  savePromoCodeSettings,
  syncPromoCodeSettingsFromRemote,
} from "./promoCodeStore";
import { renderNavbarPromoCodeHtml } from "./promoCodeNav";
import { siteText } from "./newsLanguage";

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
  if (open) {
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>("#promo-code-search")?.focus({ preventScroll: true });
    }, 80);
  }
}

async function copyPromoCode(code: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(code);
    return true;
  } catch {
    const input = document.createElement("input");
    input.value = code;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    input.remove();
    return ok;
  }
}

function filterPromoCodes(query: string): void {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-promo-code-row]")];
  const empty = document.querySelector<HTMLElement>("#promo-code-empty-search");
  const needle = query.trim().toLowerCase();
  let visible = 0;

  rows.forEach((row) => {
    const section = row.closest<HTMLElement>("[data-promo-code-section]");
    if (section?.classList.contains("hidden")) {
      row.classList.add("hidden");
      return;
    }
    const haystack = row.dataset.promoSearch ?? "";
    const show = !needle || haystack.includes(needle);
    row.classList.toggle("hidden", !show);
    if (show) visible += 1;
  });

  empty?.classList.toggle("hidden", visible !== 0);
}

function setPromoCategory(category: string): void {
  const list = document.querySelector<HTMLElement>("#promo-code-list");
  const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-promo-category]")];
  const sections = [...document.querySelectorAll<HTMLElement>("[data-promo-code-section]")];
  const search = document.querySelector<HTMLInputElement>("#promo-code-search");
  if (!list || tabs.length === 0 || sections.length === 0) return;

  list.dataset.activePromoCategory = category;
  tabs.forEach((tab) => {
    const active = tab.dataset.promoCategory === category;
    tab.classList.toggle("promo-category-tab-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
  sections.forEach((section) => {
    section.classList.toggle("hidden", section.dataset.promoCodeSection !== category);
  });
  if (search) search.value = "";
  filterPromoCodes("");
}

function bindNavbarPromoCode(): void {
  const wrap = document.querySelector<HTMLElement>("#navbar-promo-code");
  const button = document.querySelector<HTMLButtonElement>("#navbar-promo-code-button");
  const close = document.querySelector<HTMLButtonElement>("#navbar-promo-close");
  const search = document.querySelector<HTMLInputElement>("#promo-code-search");
  if (!wrap || !button || wrap.dataset.bound === "1") return;
  wrap.dataset.bound = "1";

  button.addEventListener("click", () => {
    setPromoScrollOpen(!wrap.classList.contains("promo-scroll-open"));
  });
  close?.addEventListener("click", () => {
    setPromoScrollOpen(false);
  });
  search?.addEventListener("input", () => {
    filterPromoCodes(search.value);
  });
  wrap.querySelectorAll<HTMLButtonElement>("[data-promo-category]").forEach((categoryButton) => {
    categoryButton.addEventListener("click", () => {
      const category = categoryButton.dataset.promoCategory;
      if (!category) return;
      setPromoCategory(category);
    });
  });
  wrap.querySelectorAll<HTMLButtonElement>("[data-promo-copy]").forEach((copyButton) => {
    copyButton.addEventListener("click", () => {
      const code = copyButton.dataset.promoCopy;
      if (!code) return;
      void copyPromoCode(code).then((ok) => {
        if (!ok) return;
        const original = copyButton.textContent ?? siteText("copyPromoCode");
        copyButton.textContent = siteText("copiedPromoCode");
        copyButton.classList.add("promo-copy-done");
        window.setTimeout(() => {
          copyButton.textContent = original;
          copyButton.classList.remove("promo-copy-done");
        }, 1200);
      });
    });
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
