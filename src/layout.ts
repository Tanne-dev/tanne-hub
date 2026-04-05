/**
 * Lớp giới hạn chiều ngang + padding (header, hero, main, footer).
 * Dùng max-w-screen-2xl thay vì 7xl để khớp màn rộng — tránh cảm giác header/content “co” giữa viewport.
 */
export const pageInner =
  "mx-auto w-full max-w-screen-2xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10";
