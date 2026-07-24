import { escapeHtml } from "../postBody";
import { getLegitReviews, type LegitReview } from "../legitReviewsStore";
import { siteText } from "../newsLanguage";

function renderStars(rating: number): string {
  const safe = Math.min(5, Math.max(1, Math.round(rating)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

function averageRating(reviews: LegitReview[]): string {
  if (reviews.length === 0) return "5.0";
  const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  return avg.toFixed(1);
}

function countryFlag(countryCode?: string): string {
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return "🌐";
  const codePoints = [...countryCode].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function renderReviewCard(review: LegitReview): string {
  const starLabel = siteText("starsOutOfFive").replace("{count}", String(review.rating));
  const flag = countryFlag(review.countryCode);
  const countryTitle = review.countryCode ? `Country: ${escapeHtml(review.countryCode)}` : "Country not provided";
  return `
    <article class="rounded-lg border border-[var(--admin-border)] bg-[var(--panel-bg)] p-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <span class="truncate text-[15px] font-black text-[#36b8ff]">${escapeHtml(review.displayName)}</span>
            <span class="inline-flex shrink-0 items-center gap-1 rounded-sm border border-[#52d6aa]/45 bg-[#52d6aa]/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.06em] text-[#7ff0c8]">
              <span class="grid h-3.5 w-3.5 place-items-center rounded-full bg-[#52d6aa] text-[10px] leading-none text-[#083225]">✓</span>
              Trusted
            </span>
            <span class="inline-flex h-5 min-w-8 shrink-0 items-center justify-center rounded-[2px] border border-white/15 bg-white/10 px-1 text-base leading-none shadow-sm" title="${countryTitle}">${flag}</span>
          </div>
          ${review.orderRef ? `<p class="mt-0.5 text-[11px] font-semibold text-[var(--panel-muted)]">${escapeHtml(review.orderRef)}</p>` : ""}
        </div>
        <p class="shrink-0 text-[12px] font-bold text-[#f6c44c]" aria-label="${starLabel}">${renderStars(review.rating)}</p>
      </div>
      <p class="mt-2 line-clamp-3 text-[13px] leading-snug text-[var(--panel-muted)]">${escapeHtml(review.message)}</p>
    </article>`;
}

export function renderLegitCheck(): string {
  const reviews = getLegitReviews();
  const rollingReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];
  const reviewCount =
    reviews.length === 1
      ? siteText("reviewCountOne")
      : siteText("reviewCount").replace("{count}", String(reviews.length));
  const allReviews = siteText("allReviews").replace("{count}", String(reviews.length));
  return `
    <section id="legit-check-section" class="theme-smooth rounded-[14px] border border-[var(--admin-border)] bg-[var(--panel-bg)] p-4 text-[var(--panel-text)] shadow-[0_4px_14px_rgba(31,36,51,0.06)] md:p-5" aria-labelledby="legit-check-heading">
      <div class="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div class="rounded-xl border border-[#7fe9ff]/30 bg-[#7fe9ff]/10 p-4">
          <p class="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--header-accent)]">${siteText("checkLegit")}</p>
          <h2 id="legit-check-heading" class="mt-1 text-[21px] font-extrabold leading-tight text-[var(--panel-text)]">${siteText("buyerFeedback")}</h2>
          <div class="mt-3 flex items-end gap-2">
            <span id="legit-check-average" class="text-[34px] font-extrabold leading-none text-[var(--panel-text)]">${averageRating(reviews)}</span>
            <span class="pb-1 text-sm font-bold text-[#f6c44c]">/ 5 ★</span>
          </div>
          <p id="legit-check-count" class="mt-1 text-xs font-semibold text-[var(--panel-muted)]">${reviewCount}</p>
          <p class="mt-3 text-[13px] leading-snug text-[var(--panel-muted)]">${siteText("buyerFeedbackDescription")}</p>
        </div>

        <div class="grid gap-3">
          <div class="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-2">
            <div class="mb-2 flex items-center justify-between gap-2 px-1">
              <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--header-accent)]">${siteText("liveFeedbackRoll")}</p>
              <p class="text-[11px] font-semibold text-[var(--panel-muted)]">${allReviews}</p>
            </div>
            <div id="legit-review-list" class="legit-review-marquee flex gap-2" aria-label="${siteText("buyerFeedbackCarousel")}">
              ${rollingReviews.map(renderReviewCard).join("")}
            </div>
          </div>

          <details class="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card-bg)] p-3">
            <summary class="cursor-pointer text-sm font-extrabold text-[var(--panel-text)]">${siteText("leaveFeedbackAfterPurchase")}</summary>
            <form id="legit-review-form" class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <div class="grid gap-2 sm:grid-cols-2">
                <input id="legit-review-name" type="text" maxlength="48" placeholder="${siteText("yourName")}" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" required />
                <input id="legit-review-order" type="text" maxlength="60" placeholder="${siteText("orderAccountIdOptional")}" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" />
                <select id="legit-review-country" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm font-semibold text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]">
                  <option value="">🌐 Country</option>
                  <option value="SE">🇸🇪 Sweden</option>
                  <option value="VN">🇻🇳 Vietnam</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="DE">🇩🇪 Germany</option>
                  <option value="FR">🇫🇷 France</option>
                  <option value="NL">🇳🇱 Netherlands</option>
                  <option value="NO">🇳🇴 Norway</option>
                  <option value="DK">🇩🇰 Denmark</option>
                  <option value="FI">🇫🇮 Finland</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                </select>
                <select id="legit-review-rating" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm font-semibold text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]">
                  <option value="5">★★★★★ ${siteText("fiveStars")}</option>
                  <option value="4">★★★★☆ ${siteText("fourStars")}</option>
                  <option value="3">★★★☆☆ ${siteText("threeStars")}</option>
                  <option value="2">★★☆☆☆ ${siteText("twoStars")}</option>
                  <option value="1">★☆☆☆☆ ${siteText("oneStar")}</option>
                </select>
                <input id="legit-review-message" type="text" maxlength="260" placeholder="${siteText("shortFeedback")}" class="admin-dash-input rounded-md border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" required />
              </div>
              <button type="submit" class="rounded-md bg-[var(--admin-accent)] px-4 py-2 text-sm font-extrabold text-[var(--admin-submit-text)] transition hover:brightness-110">
                ${siteText("submitFeedback")}
              </button>
              <p id="legit-review-feedback" class="hidden text-xs sm:col-span-2"></p>
            </form>
          </details>
        </div>
      </div>
    </section>`;
}
