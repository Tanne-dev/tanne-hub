import { footerLinkColumns } from "../content";
import { pageInner } from "../layout";
import { brandLogoImg } from "../partials/brandLogo";

/** Chân trang: logo, link theo cột, bản quyền. */
export function renderSiteFooter(): string {
  const columnsHtml = footerLinkColumns
    .map(
      (col) => `
            <div class="flex min-w-0 flex-col gap-2.5">
              ${col
                .map(
                  (l) =>
                    `<a class="text-[13px] text-[#c7ceef] no-underline transition hover:text-white" href="${l.href}">${l.label}</a>`,
                )
                .join("")}
            </div>`,
    )
    .join("");

  return `
      <footer class="theme-smooth mt-8 w-full bg-[#12172a] pb-8 pt-6 text-[#d6dbf0] sm:pb-10 sm:pt-7">
        <div class="${pageInner}">
          <div class="site-footer-inner px-2.5 sm:px-4 lg:px-5 xl:px-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <a href="/" class="flex w-fit min-w-0 items-center gap-2 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#12172a]">
                ${brandLogoImg()}
                <span class="text-[#7fe9ff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">Tanne Hub</span>
              </a>
              <div class="shrink-0 text-sm text-[#c7ceef] sm:max-w-[50%] sm:text-right">USD $ / EN</div>
            </div>

            <nav
              class="mt-6 grid grid-cols-1 gap-8 border-t border-white/[0.08] pt-6 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 md:mt-8 md:grid-cols-3 md:gap-x-12 md:pt-8"
              aria-label="Footer links"
            >
              ${columnsHtml}
            </nav>

            <div class="mt-8 border-t border-white/[0.08] pt-5 text-xs text-[#98a0be] md:mt-9 md:pt-6">
              © 2026 Tanne Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>`;
}
