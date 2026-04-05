type Theme = "light" | "dark";

const HERO_LIGHT_BGS = ["/hero-bg.png", "/hero-bg-trio.png"];
const HERO_DARK_BGS = ["/hero-bg-moon.png", "/hero-bg-trio.png"];

const SITE_LIGHT_BG = "/hero-bg.png";
const SITE_DARK_BG = "/hero-bg-moon.png";

const THEME_KEY = "tanne-theme";
const HERO_ROTATE_MS = 10_000;

let currentTheme: Theme = "light";
let isAnimating = false;
let transitionCounter = 0;
let heroRotationTimer: number | null = null;
const heroBgIndexByTheme: Record<Theme, number> = {
  light: 0,
  dark: 0,
};

function setThemeLabel(theme: Theme): void {
  const labelEl = document.querySelector<HTMLSpanElement>(
    "#theme-toggle-label",
  );
  if (!labelEl) return;

  // Label shows the "next" theme action (like: if current is dark -> show Light).
  labelEl.textContent = theme === "dark" ? "Light" : "Dark";

  const sunEl = document.querySelector<SVGElement>("#theme-icon-sun");
  const moonEl = document.querySelector<SVGElement>("#theme-icon-moon");

  if (sunEl && moonEl) {
    // If current theme is dark -> show "sun" icon (action: switch to light)
    // If current theme is light -> show "moon" icon (action: switch to dark)
    if (theme === "dark") {
      sunEl.classList.remove("hidden");
      moonEl.classList.add("hidden");
    } else {
      moonEl.classList.remove("hidden");
      sunEl.classList.add("hidden");
    }
  }
}

function getHeroEls() {
  const baseEl = document.querySelector<HTMLElement>("#hero-bg-base");
  const slideEl = document.querySelector<HTMLElement>("#hero-bg-slide");
  const toggleBtn = document.querySelector<HTMLButtonElement>("#theme-toggle");
  const sideVisualEl = document.querySelector<HTMLElement>("#hero-side-visual");

  return { baseEl, slideEl, toggleBtn, sideVisualEl };
}

function getSiteEls() {
  const baseEl = document.querySelector<HTMLElement>("#site-bg-base");
  const slideEl = document.querySelector<HTMLElement>("#site-bg-slide");
  const headerEl = document.querySelector<HTMLElement>("#site-header");
  return { baseEl, slideEl, headerEl };
}

function getBgSrc(theme: Theme): { hero: string; site: string } {
  const heroList = theme === "dark" ? HERO_DARK_BGS : HERO_LIGHT_BGS;
  const heroIndex = heroBgIndexByTheme[theme] % heroList.length;
  return {
    hero: heroList[heroIndex],
    site: theme === "dark" ? SITE_DARK_BG : SITE_LIGHT_BG,
  };
}

/** Nền toàn trang: trang có hero dùng ảnh cố định; trang không có hero (vd. dashboard) dùng cùng bộ ảnh xoay như hero. */
function siteWallpaperUrl(theme: Theme, hasHeroLayers: boolean): string {
  const bg = getBgSrc(theme);
  return hasHeroLayers ? bg.site : bg.hero;
}

function shouldShowHeroSideVisual(heroSrc: string): boolean {
  return heroSrc !== "/hero-bg-trio.png";
}

function isFullContainHeroBg(heroSrc: string): boolean {
  return heroSrc === "/hero-bg-trio.png";
}

function setLayerBgFit(el: HTMLElement, src: string): void {
  el.style.backgroundPosition = "center";
  el.style.backgroundRepeat = "no-repeat";
  el.style.backgroundSize = isFullContainHeroBg(src) ? "100% 100%" : "cover";
}

function setHeroSideVisual(heroSrc: string): void {
  const { sideVisualEl } = getHeroEls();
  if (!sideVisualEl) return;
  sideVisualEl.classList.toggle("hidden", !shouldShowHeroSideVisual(heroSrc));
}

function setPageBgVar(theme: Theme): void {
  const isDark = theme === "dark";

  document.documentElement.style.setProperty(
    "--page-bg",
    isDark ? "#0b1020" : "#f4f6fb",
  );

  // Panels / cards
  document.documentElement.style.setProperty(
    "--panel-bg",
    isDark ? "#0d2740" : "#ffffff",
  );
  document.documentElement.style.setProperty(
    "--panel-text",
    isDark ? "#e6f6ff" : "#1f2433",
  );
  document.documentElement.style.setProperty(
    "--panel-muted",
    isDark ? "#98a0be" : "#727b8c",
  );
  document.documentElement.style.setProperty(
    "--news-card-bg",
    isDark ? "#09182a" : "#ffffff",
  );
  document.documentElement.style.setProperty(
    "--news-card-text",
    isDark ? "#ffffff" : "#000000",
  );
  document.documentElement.style.setProperty(
    "--news-card-muted",
    isDark ? "#ffffff" : "#000000",
  );
  document.documentElement.style.setProperty(
    "--news-card-border",
    isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)",
  );

  // Promo cards
  document.documentElement.style.setProperty(
    "--promo1-bg",
    isDark ? "#1f2747" : "#f3deb3",
  );
  document.documentElement.style.setProperty(
    "--promo2-bg",
    isDark ? "#172241" : "#d6f299",
  );

  // Icon tiles inside Popular grids
  document.documentElement.style.setProperty(
    "--icon-bg",
    isDark ? "#121a2f" : "#eef2ff",
  );

  document.documentElement.style.setProperty(
    "--header-bg-start",
    isDark ? "#05182f" : "#ffffff",
  );
  document.documentElement.style.setProperty(
    "--header-bg-end",
    isDark ? "#0b1020" : "#e8edf4",
  );
  document.documentElement.style.setProperty(
    "--header-search-border",
    isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.14)",
  );
  document.documentElement.style.setProperty(
    "--header-search-bg",
    isDark ? "rgba(0,0,0,0.22)" : "rgba(241,245,249,0.96)",
  );
  document.documentElement.style.setProperty(
    "--header-search-icon",
    isDark ? "#a6dcff" : "#0e7490",
  );
  document.documentElement.style.setProperty(
    "--header-search-text",
    isDark ? "#e6f6ff" : "#1e293b",
  );
  document.documentElement.style.setProperty(
    "--header-search-placeholder",
    isDark ? "#9ccff7" : "#64748b",
  );
  document.documentElement.style.setProperty(
    "--header-brand-text",
    isDark ? "#7fe9ff" : "#0f766e",
  );
  document.documentElement.style.setProperty(
    "--header-accent",
    isDark ? "#7fe9ff" : "#0e7490",
  );
  document.documentElement.style.setProperty(
    "--header-nav-text",
    isDark ? "#d6dbf0" : "#334155",
  );
  document.documentElement.style.setProperty(
    "--header-nav-hover",
    isDark ? "#ffffff" : "#0f172a",
  );
  document.documentElement.style.setProperty(
    "--header-nav-border",
    isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.1)",
  );
  document.documentElement.style.setProperty(
    "--header-muted",
    isDark ? "#c7ceef" : "#475569",
  );
  document.documentElement.style.setProperty(
    "--header-login-border",
    isDark ? "#ffcc33" : "#ca8a04",
  );
  document.documentElement.style.setProperty(
    "--header-login-text",
    isDark ? "#ffcc33" : "#a16207",
  );
  document.documentElement.style.setProperty(
    "--header-accent-hover-bg",
    isDark ? "rgba(127,233,255,0.12)" : "rgba(14,116,144,0.12)",
  );
  document.documentElement.style.setProperty(
    "--header-login-hover-bg",
    isDark ? "rgba(255,204,51,0.12)" : "rgba(202,138,4,0.14)",
  );

  document.documentElement.dataset.tanneTheme = isDark ? "dark" : "light";

  // Admin dashboard (theo nền sáng / tối)
  document.documentElement.style.setProperty(
    "--admin-heading",
    isDark ? "#e6f6ff" : "#0f172a",
  );
  document.documentElement.style.setProperty(
    "--admin-subtle",
    isDark ? "#c7ceef" : "#475569",
  );
  document.documentElement.style.setProperty(
    "--admin-muted",
    isDark ? "#98a0be" : "#64748b",
  );
  document.documentElement.style.setProperty(
    "--admin-border",
    isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.14)",
  );
  document.documentElement.style.setProperty(
    "--admin-inner-bg",
    isDark ? "rgba(0,0,0,0.2)" : "rgba(241,245,249,0.92)",
  );
  document.documentElement.style.setProperty(
    "--admin-card-bg",
    isDark ? "rgba(0,0,0,0.22)" : "#f1f5f9",
  );
  document.documentElement.style.setProperty(
    "--admin-input-bg",
    isDark ? "#0b1f35" : "#ffffff",
  );
  document.documentElement.style.setProperty(
    "--admin-input-border",
    isDark ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.2)",
  );
  document.documentElement.style.setProperty(
    "--admin-input-text",
    isDark ? "#e6f6ff" : "#1e293b",
  );
  document.documentElement.style.setProperty(
    "--admin-label",
    isDark ? "#98a8bc" : "#64748b",
  );
  document.documentElement.style.setProperty(
    "--admin-accent",
    isDark ? "#7fe9ff" : "#0e7490",
  );
  document.documentElement.style.setProperty(
    "--admin-accent-muted",
    isDark ? "#aeefff" : "#0f766e",
  );
  document.documentElement.style.setProperty(
    "--admin-tab-active-bg",
    isDark ? "rgba(127,233,255,0.12)" : "rgba(14,116,144,0.14)",
  );
  document.documentElement.style.setProperty(
    "--admin-tab-active-border",
    isDark ? "rgba(127,233,255,0.45)" : "rgba(14,116,144,0.45)",
  );
  document.documentElement.style.setProperty(
    "--admin-tab-idle-border",
    isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.14)",
  );
  document.documentElement.style.setProperty(
    "--admin-tab-idle-text",
    isDark ? "#d6dbf0" : "#334155",
  );
  document.documentElement.style.setProperty(
    "--admin-tab-idle-hover",
    isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
  );
  document.documentElement.style.setProperty(
    "--admin-btn-ghost-text",
    isDark ? "#d6dbf0" : "#475569",
  );
  document.documentElement.style.setProperty(
    "--admin-submit-text",
    isDark ? "#0d2740" : "#ffffff",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-ok-bg",
    isDark ? "rgba(34,197,94,0.22)" : "rgba(34,197,94,0.14)",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-ok-text",
    isDark ? "#bbf7d0" : "#166534",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-warn-bg",
    isDark ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.16)",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-warn-text",
    isDark ? "#fde68a" : "#92400e",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-err-bg",
    isDark ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.12)",
  );
  document.documentElement.style.setProperty(
    "--admin-feedback-err-text",
    isDark ? "#fecaca" : "#991b1b",
  );
  document.documentElement.style.setProperty(
    "--admin-success-inline",
    isDark ? "#86efac" : "#15803d",
  );
  document.documentElement.style.setProperty(
    "--admin-danger-text",
    isDark ? "#fca5a5" : "#b91c1c",
  );
  document.documentElement.style.setProperty(
    "--admin-danger-border",
    isDark ? "rgba(248,113,113,0.5)" : "rgba(220,38,38,0.45)",
  );
}

function setHeaderBackground(): void {
  const { headerEl } = getSiteEls();
  if (!headerEl) return;
  headerEl.style.backgroundImage =
    "linear-gradient(180deg, var(--header-bg-start) 0%, var(--header-bg-end) 100%)";
  headerEl.style.backgroundColor = "var(--header-bg-end)";
}

function applyInitialTheme(theme: Theme): void {
  const { baseEl: heroBaseEl, slideEl: heroSlideEl } = getHeroEls();
  const { baseEl: siteBaseEl, slideEl: siteSlideEl } = getSiteEls();
  if (!siteBaseEl || !siteSlideEl) return;

  currentTheme = theme;
  const bg = getBgSrc(theme);

  const hasHeroLayers = Boolean(heroBaseEl && heroSlideEl);

  if (heroBaseEl && heroSlideEl) {
    heroBaseEl.style.backgroundImage = `url('${bg.hero}')`;
    setLayerBgFit(heroBaseEl, bg.hero);
    setHeroSideVisual(bg.hero);
    heroBaseEl.classList.remove("opacity-0");
    heroSlideEl.classList.add("hidden");
    heroSlideEl.classList.remove("hero-bg-slide-up");
  }

  const siteUrl = siteWallpaperUrl(theme, hasHeroLayers);
  siteBaseEl.style.backgroundImage = `url('${siteUrl}')`;
  setLayerBgFit(siteBaseEl, siteUrl);
  siteBaseEl.classList.remove("opacity-0");
  siteSlideEl.classList.add("hidden");
  siteSlideEl.classList.remove("hero-bg-slide-up");

  setPageBgVar(theme);
  setHeaderBackground();
}

function startTransition(nextTheme: Theme): void {
  const { baseEl: heroBaseEl, slideEl: heroSlideEl } = getHeroEls();
  const { baseEl: siteBaseEl, slideEl: siteSlideEl, headerEl } = getSiteEls();
  if (!siteBaseEl || !siteSlideEl) return;
  if (!headerEl) return;
  if (isAnimating) return;

  const hasHeroLayers = Boolean(heroBaseEl && heroSlideEl);
  transitionCounter = hasHeroLayers ? 2 : 1;
  isAnimating = true;

  const outgoing = getBgSrc(currentTheme);
  const incoming = getBgSrc(nextTheme);
  const incomingSiteUrl = siteWallpaperUrl(nextTheme, hasHeroLayers);
  const outgoingSiteUrl = siteWallpaperUrl(currentTheme, hasHeroLayers);

  // Đồng bộ biến màu (header dùng --header-*) rồi áp gradient header.
  setPageBgVar(nextTheme);
  setHeaderBackground();

  // Chuẩn bị ảnh đích sẵn ở layer nền (incoming) để tránh "trống" giữa animation.
  if (heroBaseEl && heroSlideEl) {
    heroBaseEl.style.backgroundImage = `url('${incoming.hero}')`;
    setLayerBgFit(heroBaseEl, incoming.hero);
    setHeroSideVisual(incoming.hero);
    heroBaseEl.classList.remove("opacity-0");
  }

  siteBaseEl.style.backgroundImage = `url('${incomingSiteUrl}')`;
  setLayerBgFit(siteBaseEl, incomingSiteUrl);
  siteBaseEl.classList.remove("opacity-0");

  // Hero: trượt ảnh cũ (outgoing) lên trên để lộ ảnh mới bên dưới.
  if (heroSlideEl) {
    heroSlideEl.style.backgroundImage = `url('${outgoing.hero}')`;
    setLayerBgFit(heroSlideEl, outgoing.hero);
    heroSlideEl.classList.remove("hidden");
    heroSlideEl.classList.remove("hero-bg-slide-up");
    void heroSlideEl.offsetHeight;
    heroSlideEl.classList.add("hero-bg-slide-up");
  }

  // Site: tương tự với layer nền toàn trang.
  siteSlideEl.style.backgroundImage = `url('${outgoingSiteUrl}')`;
  setLayerBgFit(siteSlideEl, outgoingSiteUrl);
  siteSlideEl.classList.remove("hidden");
  siteSlideEl.classList.remove("hero-bg-slide-up");
  void siteSlideEl.offsetHeight;
  siteSlideEl.classList.add("hero-bg-slide-up");

  const onHeroEnd = (): void => {
    if (heroSlideEl) {
      heroSlideEl.classList.add("hidden");
      heroSlideEl.classList.remove("hero-bg-slide-up");
    }
    transitionCounter -= 1;
    if (transitionCounter > 0) return;

    siteSlideEl.classList.add("hidden");
    siteSlideEl.classList.remove("hero-bg-slide-up");

    currentTheme = nextTheme;
    isAnimating = false;
  };

  const onSiteEnd = (): void => {
    siteSlideEl.classList.add("hidden");
    siteSlideEl.classList.remove("hero-bg-slide-up");
    transitionCounter -= 1;
    if (transitionCounter > 0) return;

    if (heroSlideEl) {
      heroSlideEl.classList.add("hidden");
      heroSlideEl.classList.remove("hero-bg-slide-up");
    }

    currentTheme = nextTheme;
    isAnimating = false;
  };

  if (heroSlideEl) {
    heroSlideEl.addEventListener("animationend", onHeroEnd, { once: true });
  }
  siteSlideEl.addEventListener("animationend", onSiteEnd, { once: true });
}

function rotateHeroBackground(): void {
  const { baseEl: heroBaseEl, slideEl: heroSlideEl } = getHeroEls();
  if (!heroBaseEl || !heroSlideEl) return;
  if (isAnimating) return;

  const heroList = currentTheme === "dark" ? HERO_DARK_BGS : HERO_LIGHT_BGS;
  if (heroList.length <= 1) return;

  const currentIndex = heroBgIndexByTheme[currentTheme] % heroList.length;
  const nextIndex = (currentIndex + 1) % heroList.length;
  const outgoing = heroList[currentIndex];
  const incoming = heroList[nextIndex];

  isAnimating = true;
  heroBaseEl.style.backgroundImage = `url('${incoming}')`;
  setLayerBgFit(heroBaseEl, incoming);
  setHeroSideVisual(incoming);
  heroBaseEl.classList.remove("opacity-0");

  heroSlideEl.style.backgroundImage = `url('${outgoing}')`;
  setLayerBgFit(heroSlideEl, outgoing);
  heroSlideEl.classList.remove("hidden");
  heroSlideEl.classList.remove("hero-bg-slide-up");
  void heroSlideEl.offsetHeight;
  heroSlideEl.classList.add("hero-bg-slide-up");

  const onHeroEnd = (): void => {
    heroSlideEl.classList.add("hidden");
    heroSlideEl.classList.remove("hero-bg-slide-up");
    heroBgIndexByTheme[currentTheme] = nextIndex;
    isAnimating = false;
  };

  heroSlideEl.addEventListener("animationend", onHeroEnd, { once: true });
}

/** Trang không có hero (dashboard, tin, bài viết): xoay nền toàn trang giống logic hero. */
function rotateSiteBackground(): void {
  const { baseEl: siteBaseEl, slideEl: siteSlideEl } = getSiteEls();
  if (!siteBaseEl || !siteSlideEl) return;
  if (isAnimating) return;

  const list = currentTheme === "dark" ? HERO_DARK_BGS : HERO_LIGHT_BGS;
  if (list.length <= 1) return;

  const currentIndex = heroBgIndexByTheme[currentTheme] % list.length;
  const nextIndex = (currentIndex + 1) % list.length;
  const outgoing = list[currentIndex];
  const incoming = list[nextIndex];

  isAnimating = true;
  siteBaseEl.style.backgroundImage = `url('${incoming}')`;
  setLayerBgFit(siteBaseEl, incoming);
  siteBaseEl.classList.remove("opacity-0");

  siteSlideEl.style.backgroundImage = `url('${outgoing}')`;
  setLayerBgFit(siteSlideEl, outgoing);
  siteSlideEl.classList.remove("hidden");
  siteSlideEl.classList.remove("hero-bg-slide-up");
  void siteSlideEl.offsetHeight;
  siteSlideEl.classList.add("hero-bg-slide-up");

  const onEnd = (): void => {
    siteSlideEl.classList.add("hidden");
    siteSlideEl.classList.remove("hero-bg-slide-up");
    heroBgIndexByTheme[currentTheme] = nextIndex;
    isAnimating = false;
  };

  siteSlideEl.addEventListener("animationend", onEnd, { once: true });
}

function startBackgroundRotation(): void {
  if (heroRotationTimer !== null) {
    window.clearInterval(heroRotationTimer);
  }
  const { baseEl: heroBaseEl, slideEl: heroSlideEl } = getHeroEls();
  const { baseEl: siteBaseEl, slideEl: siteSlideEl } = getSiteEls();
  if (heroBaseEl && heroSlideEl) {
    heroRotationTimer = window.setInterval(rotateHeroBackground, HERO_ROTATE_MS);
    return;
  }
  if (siteBaseEl && siteSlideEl) {
    heroRotationTimer = window.setInterval(rotateSiteBackground, HERO_ROTATE_MS);
  }
}

export function initTheme(): void {
  const { toggleBtn } = getHeroEls();
  if (!toggleBtn) return;

  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  const initialTheme: Theme =
    saved === "dark" || saved === "light" ? saved : "light";

  applyInitialTheme(initialTheme);
  setThemeLabel(initialTheme);
  startBackgroundRotation();

  toggleBtn.addEventListener("click", () => {
    const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    startTransition(nextTheme);
    setThemeLabel(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

