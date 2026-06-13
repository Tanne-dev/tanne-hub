/** Thư chào mừng hiển thị sau khi bấm CTA ở hero. */
import { siteText } from "../newsLanguage";

export function renderWelcomeLetter(): string {
  return `
        <section id="welcome-letter" class="hidden absolute inset-0 z-30 flex items-end justify-center bg-black/55 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-[3px] sm:items-center sm:px-4 sm:pb-6 sm:pt-6">
          <article class="welcome-letter-card pointer-events-auto relative max-h-[min(88dvh,calc(100vh-2rem))] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-2xl border border-[#d5c29a] bg-[#f8f1dd] p-4 pb-6 text-[#3f2f1a] shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:p-6 md:p-7">
            <div class="welcome-letter-edge" aria-hidden="true"></div>
            <button
              id="close-welcome-letter"
              type="button"
              aria-label="${siteText("welcomeClose")}"
              class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#8a5f24] bg-[#f6e8c8] text-[18px] text-[#5f3d14] shadow-[0_2px_6px_rgba(91,59,22,0.25)] transition hover:bg-[#efd6a8] sm:right-4 sm:top-4"
            >
              <span aria-hidden="true">🏃</span>
            </button>
            <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8a6632]">${siteText("welcomeLetter")}</p>
            <h2 class="mt-2 text-[22px] font-extrabold leading-tight md:text-[28px]">${siteText("welcomeTitle")}</h2>
            <p class="mt-3 text-[14px] leading-[1.65] md:text-[15px]">
              ${siteText("welcomeParagraphOne")}
            </p>
            <p class="mt-2.5 text-[14px] leading-[1.65] md:text-[15px]">
              ${siteText("welcomeParagraphTwo")}
            </p>
            <p class="mt-2.5 text-[14px] leading-[1.65] md:text-[15px]">
              ${siteText("welcomeParagraphThree")}
            </p>
            <p class="mt-3.5 text-[14px] font-semibold md:text-[15px]">${siteText("welcomeThanks")}</p>
          </article>
          <div aria-hidden="true" class="welcome-scroll-hint pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[26px] text-white/90">
            ↓
          </div>
        </section>`;
}
