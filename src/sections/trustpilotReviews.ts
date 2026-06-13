import { siteText } from "../newsLanguage";

const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/tannehub.com";

function renderTrustpilotStars(): string {
  return `
    <div class="flex items-center gap-1" aria-label="${siteText("trustpilotStarRating")}">
      ${Array.from({ length: 5 })
        .map(
          () => `
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-[3px] bg-[#00b67a] text-[19px] font-black leading-none text-white">
              ★
            </span>`,
        )
        .join("")}
    </div>`;
}

export function renderTrustpilotReviews(): string {
  return `
    <section class="theme-smooth rounded-[14px] border border-[#00b67a]/35 bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-5" aria-labelledby="trustpilot-heading">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#00b67a]">Trustpilot</p>
          <h2 id="trustpilot-heading" class="mt-1 text-[21px] font-extrabold leading-tight">${siteText("publicCustomerFeedback")}</h2>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--panel-muted)]">
            ${siteText("trustpilotDescription")}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center lg:min-w-[460px]">
          <div class="rounded-xl border border-[#00b67a]/30 bg-[#00b67a]/10 p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-[12px] font-extrabold text-[#00b67a]">${siteText("trustpilotProfile")}</p>
              <span class="rounded-full border border-[#00b67a]/35 bg-white/10 px-2 py-0.5 text-[11px] font-bold text-[#00b67a]">Tannehub</span>
            </div>
            <div class="mt-2 flex flex-wrap items-end gap-3">
              ${renderTrustpilotStars()}
              <p class="pb-1 text-sm font-extrabold text-[var(--panel-text)]">${siteText("trustpilotReviews")}</p>
            </div>
            <p class="mt-2 text-[12px] leading-snug text-[var(--panel-muted)]">${siteText("trustpilotLiveReviews")}</p>
          </div>
          <a
            href="${TRUSTPILOT_PROFILE_URL}"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#00b67a] px-4 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110"
          >
            ${siteText("viewTrustpilot")}
          </a>
        </div>
      </div>
    </section>`;
}
