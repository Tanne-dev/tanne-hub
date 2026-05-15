import { getMemberSession } from "../login";
import { getMemberAlertPreferences } from "../memberAlertsStore";

function renderAlertButton(
  id: string,
  enabled: boolean,
  label: string,
  description: string,
): string {
  return `
    <button
      id="${id}"
      type="button"
      aria-pressed="${enabled ? "true" : "false"}"
      class="rounded-lg border ${enabled ? "border-[#7fe9ff]/60 bg-[#7fe9ff]/15" : "border-[var(--admin-border)] bg-[var(--panel-bg)]"} px-3 py-2.5 text-left transition hover:border-[#7fe9ff]/60 hover:bg-[#7fe9ff]/10"
    >
      <span class="block text-sm font-extrabold text-[var(--panel-text)]">${enabled ? "On" : "Off"} · ${label}</span>
      <span class="mt-1 block text-[12px] leading-snug text-[var(--panel-muted)]">${description}</span>
    </button>`;
}

export function renderMemberAlerts(): string {
  const prefs = getMemberAlertPreferences();
  const session = getMemberSession();
  return `
    <section id="member-alerts-section" class="theme-smooth rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--header-accent)]">Member alerts</p>
          <h2 class="mt-1 text-[20px] font-extrabold leading-tight">Get updates when something new drops</h2>
          <p id="member-alerts-status" class="mt-1 text-sm text-[var(--panel-muted)]">
            ${session ? `Signed in as ${session.email}` : "Register or log in to receive new promo-code and post alerts."}
          </p>
        </div>
        <div class="grid shrink-0 gap-2 sm:grid-cols-2 md:min-w-[420px]">
          ${renderAlertButton("member-alert-promo", prefs.notifyPromoCodes, "RSL promo codes", "Notify me when new reward codes are updated.")}
          ${renderAlertButton("member-alert-posts", prefs.notifyPosts, "New posts", "Notify me when Raid news or guides are published.")}
        </div>
      </div>
    </section>`;
}
