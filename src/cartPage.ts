import { getLoggedInMemberEmail, isMemberLoggedIn, requestLoginModal } from "./login";
import { escapeHtml } from "./postBody";
import {
  clearShopCart,
  getCheckoutBuyerProfile,
  getCheckoutContactEmail,
  getShopCart,
  pruneShopCart,
  removeShopCartEntry,
  setCheckoutContactEmail,
  updateCheckoutBuyerProfile,
  type CheckoutPaymentMethod,
  type ShopCartEntry,
} from "./shopCartStore";
import { getSellingAccounts } from "./sellingAccountsStore";

function notifyShopCart(): void {
  window.dispatchEvent(new CustomEvent("tanne-shop-cart-updated"));
}

function renderLinesHtml(entries: ShopCartEntry[]): string {
  const accounts = getSellingAccounts();
  if (entries.length === 0) {
    return `<p class="rounded-xl border border-dashed border-[var(--news-card-border)] px-4 py-10 text-center text-[15px] text-[var(--panel-muted)]">Your cart is empty.<br /><a href="/" class="mt-3 inline-block font-semibold text-[#7fe9ff] underline-offset-2 hover:underline">Browse Raid accounts</a> or <a href="/?page=raid-accounts" class="font-semibold text-[#7fe9ff] underline-offset-2 hover:underline">see all listings</a>.</p>`;
  }
  return entries
    .map((line) => {
      const acc = accounts.find((a) => a.id === line.accountId);
      const price = escapeHtml(acc?.priceLabel ?? line.priceLabel);
      const prev = escapeHtml(line.preview || "—");
      return `<div class="flex flex-col gap-3 rounded-xl border border-[var(--news-card-border)] bg-[var(--panel-bg)] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div class="min-w-0 flex-1">
          <p class="font-mono text-sm font-semibold text-[var(--panel-text)]">ID: ${escapeHtml(line.accountId)}</p>
          <p class="mt-1 text-lg font-bold text-[#7fe9ff]">${price}</p>
          <p class="mt-1 line-clamp-2 text-sm text-[var(--panel-muted)]">${prev}</p>
        </div>
        <button type="button" data-shop-cart-remove="${escapeHtml(line.accountId)}" class="shrink-0 rounded-lg border border-[var(--news-card-border)] px-4 py-2 text-sm font-semibold text-[var(--panel-text)] transition hover:bg-[var(--icon-bg)]">Remove</button>
      </div>`;
    })
    .join("");
}

function syncCheckoutStep2Ui(): void {
  const entries = getShopCart();
  const cartEmpty = entries.length === 0;
  const loggedIn = isMemberLoggedIn();

  const loginReq = document.querySelector<HTMLElement>("#shop-checkout-login-required");
  const loggedInBox = document.querySelector<HTMLElement>("#shop-checkout-logged-in");
  const memberEmailEl = document.querySelector<HTMLElement>("#shop-checkout-member-email");
  const emailInput = document.querySelector<HTMLInputElement>("#shop-checkout-email");

  if (loginReq) loginReq.classList.toggle("hidden", loggedIn);
  if (loggedInBox) loggedInBox.classList.toggle("hidden", !loggedIn);
  if (memberEmailEl) memberEmailEl.textContent = getLoggedInMemberEmail() ?? "—";

  if (emailInput) {
    const canEdit = loggedIn && !cartEmpty;
    emailInput.disabled = !canEdit;
    if (document.activeElement !== emailInput) {
      const stored = getCheckoutContactEmail();
      const sessionEmail = getLoggedInMemberEmail() ?? "";
      emailInput.value = stored || sessionEmail || "";
    }
    emailInput.placeholder = loggedIn
      ? "email@example.com"
      : "Đăng nhập để nhập email liên kết";
  }
}

function syncCheckoutStep3Ui(): void {
  const entries = getShopCart();
  const cartEmpty = entries.length === 0;
  const loggedIn = isMemberLoggedIn();
  const canEdit = loggedIn && !cartEmpty;

  const step3 = document.querySelector<HTMLElement>("#shop-cart-step-payment");
  if (step3) {
    step3.classList.toggle("opacity-50", cartEmpty);
    step3.classList.toggle("pointer-events-none", cartEmpty);
  }

  const profile = getCheckoutBuyerProfile();
  const nameInput = document.querySelector<HTMLInputElement>("#shop-checkout-full-name");
  const birthInput = document.querySelector<HTMLInputElement>("#shop-checkout-birth-date");
  const radios = document.querySelectorAll<HTMLInputElement>('input[name="shop-payment-method"]');

  if (nameInput) {
    nameInput.disabled = !canEdit;
    if (document.activeElement !== nameInput) nameInput.value = profile.fullName;
  }
  if (birthInput) {
    birthInput.disabled = !canEdit;
    if (document.activeElement !== birthInput) birthInput.value = profile.birthDate;
  }

  radios.forEach((r) => {
    r.disabled = !canEdit;
    r.checked = Boolean(profile.paymentMethod && r.value === profile.paymentMethod);
  });
}

function refreshCartDom(): void {
  const mount = document.querySelector<HTMLElement>("#shop-cart-lines");
  if (!mount) return;
  const accounts = getSellingAccounts();
  const ids = new Set(accounts.map((a) => a.id.trim()).filter(Boolean));
  pruneShopCart(ids);
  const entries = getShopCart();
  mount.innerHTML = renderLinesHtml(entries);

  const step2 = document.querySelector<HTMLElement>("#shop-cart-step-contact");
  if (step2) {
    step2.classList.toggle("opacity-50", entries.length === 0);
    step2.classList.toggle("pointer-events-none", entries.length === 0);
  }

  syncCheckoutStep2Ui();
}

export function initCartPage(): void {
  const root = document.querySelector("#shop-cart-page");
  if (!root) return;

  refreshCartDom();

  const emailInput = document.querySelector<HTMLInputElement>("#shop-checkout-email");
  const persistEmail = (): void => {
    if (!emailInput || emailInput.disabled) return;
    setCheckoutContactEmail(emailInput.value);
  };
  emailInput?.addEventListener("change", persistEmail);
  emailInput?.addEventListener("blur", persistEmail);

  window.addEventListener("tanne-auth-changed", () => {
    if (!document.querySelector("#shop-cart-page")) return;
    syncCheckoutStep2Ui();
    syncCheckoutStep3Ui();
  });

  const nameInput = document.querySelector<HTMLInputElement>("#shop-checkout-full-name");
  const birthInput = document.querySelector<HTMLInputElement>("#shop-checkout-birth-date");
  const persistName = (): void => {
    if (!nameInput || nameInput.disabled) return;
    updateCheckoutBuyerProfile({ fullName: nameInput.value });
  };
  const persistBirth = (): void => {
    if (!birthInput || birthInput.disabled) return;
    updateCheckoutBuyerProfile({ birthDate: birthInput.value });
  };
  nameInput?.addEventListener("change", persistName);
  nameInput?.addEventListener("blur", persistName);
  birthInput?.addEventListener("change", persistBirth);
  birthInput?.addEventListener("blur", persistBirth);

  root.addEventListener("change", (event) => {
    const t = event.target as HTMLInputElement;
    if (t.name === "shop-payment-method" && t.type === "radio" && t.checked) {
      updateCheckoutBuyerProfile({ paymentMethod: t.value as CheckoutPaymentMethod });
    }
  });

  root.addEventListener("click", (event) => {
    const t = event.target as HTMLElement;
    if (t.closest("#shop-checkout-open-login")) {
      requestLoginModal();
      return;
    }
    const rm = t.closest<HTMLButtonElement>("[data-shop-cart-remove]");
    if (rm) {
      const id = rm.getAttribute("data-shop-cart-remove");
      if (id) {
        removeShopCartEntry(id);
        notifyShopCart();
        refreshCartDom();
      }
      return;
    }
    const clr = t.closest<HTMLButtonElement>("#shop-cart-clear");
    if (clr) {
      clearShopCart();
      notifyShopCart();
      refreshCartDom();
    }
  });
}
