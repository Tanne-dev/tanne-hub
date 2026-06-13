/** Quy trình mua account nhỏ gọn. */
import { siteText } from "../newsLanguage";

export function renderSafeTrading(): string {
  return `
        <section>
          <h2 class="mb-2.5 text-[17px] font-semibold text-[var(--panel-text)] md:text-[20px]">${siteText("buyingWorksTitle")}</h2>
          <p class="max-w-3xl text-[14px] leading-[1.5] text-[var(--panel-muted)] md:text-[15px]">
            ${siteText("buyingWorksDescription")}
          </p>
          <div class="mt-3 rounded-[14px] bg-gradient-to-br from-[#1f2747] to-[#313d6a] p-4 text-[#f8faff] md:p-6">
            <h3 class="text-[16px] font-bold md:text-[18px]">${siteText("simplePurchaseFlow")}</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-3">
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">${siteText("chooseIdTitle")}</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  ${siteText("chooseIdDescription")}
                </p>
              </article>
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">${siteText("contactSupportTitle")}</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  ${siteText("contactSupportDescription")}
                </p>
              </article>
              <article class="rounded-lg bg-white/10 p-3">
                <p class="text-[13px] font-semibold md:text-[14px]">${siteText("safeDeliveryTitle")}</p>
                <p class="mt-1 text-[13px] leading-[1.45] text-white/90 md:text-[14px]">
                  ${siteText("safeDeliveryDescription")}
                </p>
              </article>
            </div>
          </div>
        </section>`;
}
