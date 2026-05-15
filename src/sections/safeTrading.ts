/** Quy trình mua account nhỏ gọn. */
export function renderSafeTrading(): string {
  return `
        <section>
          <h2 class="mb-2.5 text-[17px] font-semibold text-[var(--panel-text)] md:text-[20px]">How buying works</h2>
          <p class="max-w-3xl text-[14px] leading-[1.5] text-[var(--panel-muted)] md:text-[15px]">
            Tanne Hub is a small account shop, so every purchase should feel direct and clear: pick an account ID, contact us, confirm details, then complete delivery safely.
          </p>
          <div class="mt-3 rounded-[14px] bg-gradient-to-br from-[#1f2747] to-[#313d6a] p-4 text-[#f8faff] md:p-6">
            <h3 class="text-[16px] font-bold md:text-[18px]">Simple purchase flow</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-3">
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">1. Choose an ID</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  Open a listing, check screenshots/details, and copy the account ID you want.
                </p>
              </article>
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">2. Contact support</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  Send the ID, ask questions, and confirm price/payment before anything moves.
                </p>
              </article>
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">3. Safe delivery</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  Delivery happens only after both sides are clear on the account and transfer steps.
                </p>
              </article>
            </div>
          </div>
        </section>`;
}
