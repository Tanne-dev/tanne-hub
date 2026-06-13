import { getMemberSession } from "./login";
import {
  getMemberAlertPreferences,
  saveMemberAlertPreferences,
  syncMemberAlertPreferencesFromRemote,
} from "./memberAlertsStore";
import { siteText } from "./newsLanguage";
import { renderMemberAlerts } from "./sections/memberAlerts";

function openLogin(message?: string): void {
  const loginBtn = document.querySelector<HTMLButtonElement>("#open-login-modal");
  loginBtn?.click();
  if (!message) return;
  window.setTimeout(() => {
    const feedback = document.querySelector<HTMLElement>("#login-feedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.remove("hidden");
  }, 80);
}

function renderSection(): void {
  const section = document.querySelector<HTMLElement>("#member-alerts-section");
  if (!section) return;
  section.outerHTML = renderMemberAlerts();
  bindMemberAlerts();
}

function setStatus(message: string, kind: "success" | "error" = "success"): void {
  const status = document.querySelector<HTMLElement>("#member-alerts-status");
  if (!status) return;
  status.textContent = message;
  status.className =
    kind === "success"
      ? "mt-1 text-sm font-semibold text-[var(--admin-success-inline)]"
      : "mt-1 text-sm font-semibold text-red-500";
}

function bindMemberAlerts(): void {
  const section = document.querySelector<HTMLElement>("#member-alerts-section");
  const promoBtn = document.querySelector<HTMLButtonElement>("#member-alert-promo");
  const postsBtn = document.querySelector<HTMLButtonElement>("#member-alert-posts");
  if (!section || section.dataset.bound === "1" || !promoBtn || !postsBtn) return;
  section.dataset.bound = "1";

  const toggle = async (key: "notifyPromoCodes" | "notifyPosts") => {
    const session = getMemberSession();
    if (!session) {
      openLogin(siteText("loginToEnableAlerts"));
      return;
    }
    const prefs = getMemberAlertPreferences();
    const next = { ...prefs, [key]: !prefs[key] };
    const result = await saveMemberAlertPreferences(next);
    if (!result.ok) {
      setStatus(result.error ?? siteText("saveAlertPreferenceFailed"), "error");
      return;
    }
    renderSection();
    setStatus(siteText("alertPreferencesSaved"));
  };

  promoBtn.addEventListener("click", () => {
    void toggle("notifyPromoCodes");
  });
  postsBtn.addEventListener("click", () => {
    void toggle("notifyPosts");
  });
}

export function initMemberAlertsManager(): void {
  if (!document.querySelector("#member-alerts-section")) return;
  bindMemberAlerts();
  void syncMemberAlertPreferencesFromRemote().then(renderSection);
  window.addEventListener("tanne-auth-changed", () => {
    void syncMemberAlertPreferencesFromRemote().then(renderSection);
  });
}
