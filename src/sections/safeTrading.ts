/** Khối “Safe and Easy Trading” + phản hồi khách hàng. */
export function renderSafeTrading(): string {
  return `
        <section>
          <h2 class="mb-2.5 text-[17px] font-semibold text-[var(--panel-text)] md:text-[20px]">Safe and Easy Trading</h2>
          <p class="max-w-3xl text-[14px] leading-[1.5] text-[var(--panel-muted)] md:text-[15px]">
            Start shopping in a few clicks with trusted sellers and instant delivery. Built for gamers who need speed and safety.
          </p>
          <div class="mt-3 rounded-[14px] bg-gradient-to-br from-[#1f2747] to-[#313d6a] p-4 text-[#f8faff] md:p-6">
            <h3 class="text-[16px] font-bold md:text-[18px]">Customer Feedback</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">Alex T. · ★★★★★</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  Fast delivery and clear account details. Support replied quickly and helped me finish safely.
                </p>
              </article>
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">Minh P. · ★★★★★</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  Smooth transaction from start to finish. I got exactly what was listed and everything worked.
                </p>
              </article>
            </div>

            <div class="mt-4 rounded-xl border border-white/20 bg-white/10 p-3.5 md:p-4">
              <h4 class="text-[14px] font-bold md:text-[15px]">Forum Member: Add Your Feedback</h4>
              <form class="mt-3 grid gap-2.5 md:grid-cols-2" action="#" method="post">
                <input
                  type="text"
                  name="displayName"
                  placeholder="Your name"
                  class="w-full rounded-md border border-white/25 bg-[#0f1e3a]/70 px-3 py-2 text-[13px] text-white placeholder:text-white/60 outline-none transition focus:border-[#7fe9ff]"
                />
                <select
                  name="rating"
                  class="w-full rounded-md border border-white/25 bg-[#0f1e3a]/70 px-3 py-2 text-[13px] text-white outline-none transition focus:border-[#7fe9ff]"
                >
                  <option value="5">★★★★★ (5/5)</option>
                  <option value="4">★★★★☆ (4/5)</option>
                  <option value="3">★★★☆☆ (3/5)</option>
                  <option value="2">★★☆☆☆ (2/5)</option>
                  <option value="1">★☆☆☆☆ (1/5)</option>
                </select>
                <textarea
                  name="message"
                  rows="3"
                  placeholder="Share your service experience..."
                  class="md:col-span-2 w-full resize-y rounded-md border border-white/25 bg-[#0f1e3a]/70 px-3 py-2 text-[13px] text-white placeholder:text-white/60 outline-none transition focus:border-[#7fe9ff]"
                ></textarea>
                <div class="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    class="rounded-full bg-[#7fe9ff] px-4 py-2 text-[13px] font-bold text-[#0d2740] transition hover:brightness-110"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>`;
}
