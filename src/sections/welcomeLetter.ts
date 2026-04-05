/** Thư chào mừng hiển thị sau khi bấm CTA ở hero. */
export function renderWelcomeLetter(): string {
  return `
        <section id="welcome-letter" class="hidden absolute inset-0 z-30 flex items-end justify-center bg-black/55 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-[3px] sm:items-center sm:px-4 sm:pb-6 sm:pt-6">
          <article class="welcome-letter-card pointer-events-auto relative max-h-[min(88dvh,calc(100vh-2rem))] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-t-2xl border border-[#d5c29a] bg-[#f8f1dd] p-4 pb-6 text-[#3f2f1a] shadow-[0_18px_40px_rgba(0,0,0,0.25)] sm:rounded-2xl sm:p-6 md:p-7">
            <div class="welcome-letter-edge" aria-hidden="true"></div>
            <button
              id="close-welcome-letter"
              type="button"
              aria-label="Close welcome letter"
              class="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#8a5f24] bg-[#f6e8c8] text-[18px] text-[#5f3d14] shadow-[0_2px_6px_rgba(91,59,22,0.25)] transition hover:bg-[#efd6a8] sm:right-4 sm:top-4"
            >
              <span aria-hidden="true">🏃</span>
            </button>
            <p class="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8a6632]">Welcome Letter</p>
            <h2 class="mt-2 text-[22px] font-extrabold leading-tight md:text-[28px]">Please Read Before You Explore</h2>
            <p class="mt-3 text-[14px] leading-[1.65] md:text-[15px]">
              Welcome to Tanne Hub. If you are new here, no worries - I am always around to support you in a friendly and transparent way so you can feel safe from the start.
              Most people who come here already know my name from when I was a former mod on EpicNPC, and from other platforms such as G2G and the EpicNPC Facebook Group.
            </p>
            <p class="mt-2.5 text-[14px] leading-[1.65] md:text-[15px]">
              This is a mini forum where you can find accounts that fit your needs, or contact me directly if you want to consign your account for sale.
              It is also where I share notes about Raid: Shadow Legends and reroll-friendly play when relevant.
            </p>
            <p class="mt-2.5 text-[14px] leading-[1.65] md:text-[15px]">
              We also provide exchange services if you need to convert cryptocurrency into PayPal, Wise, Revolut, or transfer to your bank.
              Please read more details about that service on the Exchange page.
            </p>
            <p class="mt-3.5 text-[14px] font-semibold md:text-[15px]">Thank you for visiting and trusting Tanne Hub.</p>
          </article>
          <div aria-hidden="true" class="welcome-scroll-hint pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[26px] text-white/90">
            ↓
          </div>
        </section>`;
}
