/** Hai thẻ Money-Back và 24/7 Support. */
export function renderPromos(): string {
  return `
        <div class="grid gap-3.5 md:grid-cols-2">
          <section class="theme-smooth flex items-center justify-between gap-3 rounded-[14px] bg-[var(--promo1-bg)] p-4 md:p-6">
            <div>
              <h3 class="text-[19px] font-bold text-[var(--panel-text)]">Money-Back Guarantee</h3>
              <p class="text-sm text-[var(--panel-muted)] md:text-[15px]">Every order is protected for extra peace of mind.</p>
              <button type="button" class="mt-3 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800">Learn More</button>
            </div>
            <div class="text-[42px] leading-none select-none" aria-hidden="true">🛡️</div>
          </section>

          <section class="theme-smooth flex items-center justify-between gap-3 rounded-[14px] bg-[var(--promo2-bg)] p-4 md:p-6">
            <div>
              <h3 class="text-[19px] font-bold text-[var(--panel-text)]">24/7 Live Support</h3>
              <p class="text-sm text-[var(--panel-muted)] md:text-[15px]">Questions? Team support is always online for you.</p>
              <button type="button" class="mt-3 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800">Get Help</button>
            </div>
            <div class="text-[42px] leading-none select-none" aria-hidden="true">🧑‍💻</div>
          </section>
        </div>`;
}
