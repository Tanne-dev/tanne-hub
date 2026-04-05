/**
 * Logo (`public/logo.png`).
 * Nền đen PNG: `mix-blend-mode: lighten` trên nền tối → nền đen “biến mất”.
 * Trên header light, `.site-header-brand .brand-logo-shell` có nền tối nhỏ để blend đúng
 * (lighten trực tiếp lên nền trắng sẽ làm cả logo biến mất).
 */
export function brandLogoImg(): string {
  return `<span class="brand-logo-shell inline-flex shrink-0 leading-none">
    <img
      src="/logo.png"
      alt="Tanne Hub"
      width="54"
      height="54"
      class="brand-logo size-[54px] shrink-0 object-contain"
      decoding="async"
    />
  </span>`;
}
