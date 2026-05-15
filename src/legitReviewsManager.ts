import {
  createLegitReviewRemote,
  getLegitReviews,
  syncLegitReviewsFromRemote,
} from "./legitReviewsStore";
import { getMemberSession } from "./login";
import { renderLegitCheck } from "./sections/legitCheck";

function setFeedback(message: string, kind: "success" | "error"): void {
  const feedback = document.querySelector<HTMLElement>("#legit-review-feedback");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className =
    kind === "success"
      ? "text-xs font-semibold text-[var(--admin-success-inline)] sm:col-span-2"
      : "text-xs font-semibold text-red-500 sm:col-span-2";
}

function bindLegitReviewForm(): void {
  const form = document.querySelector<HTMLFormElement>("#legit-review-form");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!getMemberSession()) {
      const loginBtn = document.querySelector<HTMLButtonElement>("#open-login-modal");
      loginBtn?.click();
      window.setTimeout(() => {
        const loginFeedback = document.querySelector<HTMLElement>("#login-feedback");
        if (!loginFeedback) return;
        loginFeedback.textContent = "Please register or log in before leaving buyer feedback.";
        loginFeedback.classList.remove("hidden");
      }, 80);
      setFeedback("Please register or log in before leaving feedback.", "error");
      return;
    }
    const nameInput = document.querySelector<HTMLInputElement>("#legit-review-name");
    const orderInput = document.querySelector<HTMLInputElement>("#legit-review-order");
    const ratingInput = document.querySelector<HTMLSelectElement>("#legit-review-rating");
    const messageInput = document.querySelector<HTMLInputElement>("#legit-review-message");
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!nameInput || !ratingInput || !messageInput || !submit) return;

    const displayName = nameInput.value.trim();
    const message = messageInput.value.trim();
    const rating = Number(ratingInput.value);
    if (!displayName || !message) {
      setFeedback("Please enter your name and feedback.", "error");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Sending...";
    const result = await createLegitReviewRemote({
      displayName,
      rating,
      message,
      orderRef: orderInput?.value.trim() || undefined,
    });
    submit.disabled = false;
    submit.textContent = "Submit";

    if (!result.ok) {
      setFeedback(`Could not save feedback: ${result.error ?? "Unknown error"}`, "error");
      return;
    }

    form.reset();
    renderLegitReviewSection();
    setFeedback("Thank you. Your legit check is now saved.", "success");
  });
}

function renderLegitReviewSection(): void {
  const section = document.querySelector<HTMLElement>("#legit-check-section");
  if (!section) return;
  section.outerHTML = renderLegitCheck();
  bindLegitReviewForm();
}

export function initLegitReviewsManager(): void {
  const section = document.querySelector<HTMLElement>("#legit-check-section");
  if (!section) return;
  if (getLegitReviews().length > 0) renderLegitReviewSection();
  void syncLegitReviewsFromRemote().then(() => {
    renderLegitReviewSection();
  });
  bindLegitReviewForm();
}
