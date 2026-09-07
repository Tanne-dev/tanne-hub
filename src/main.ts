import "./style.css";
import { inject } from "@vercel/analytics";
import {
  renderAdminDashboardPage,
  renderExchangePage,
  renderHoneygainPage,
  renderLanding,
  renderNewsArchive,
  renderPostDetail,
  renderRaidAccountsPage,
} from "./render";
import { initLogin } from "./login";
import { initTheme } from "./theme";
import { initWelcomeLetter } from "./welcomeLetter";
import { initImageOptimizations } from "./initImageOptimizations";
import { initPromoCodeManager } from "./promoCodeManager";
import { initFloatingContact } from "./floatingContact";
import { initWelcomeChoiceOverlay } from "./welcomeChoiceOverlay";
import { initLazySections } from "./lazySections";
import { setNewsLanguage } from "./newsLanguage";
import { setDefaultSocialMeta } from "./socialMeta";

initImageOptimizations();
inject();
setDefaultSocialMeta();

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error('Missing root element "#app"');
}

const params = new URLSearchParams(window.location.search);
const sharePostMatch = window.location.pathname.match(/^\/share\/([^/]+)\/?$/);
const postId = params.get("post") || (sharePostMatch ? decodeURIComponent(sharePostMatch[1]) : null);
const page = params.get("page");
const lang = params.get("lang");

if (lang === "en" || lang === "vi") {
  setNewsLanguage(lang);
}

if (postId) {
  if (params.get("post")) {
    const nextUrl = new URL(`/share/${encodeURIComponent(postId)}`, window.location.origin);
    if (lang === "en" || lang === "vi") nextUrl.searchParams.set("lang", lang);
    window.history.replaceState({}, "", nextUrl);
  }
  renderPostDetail(root, postId);
} else if (page === "news") {
  renderNewsArchive(root);
  void import("./newsArchive").then(({ initNewsArchive }) => initNewsArchive());
} else if (page === "raid-accounts") {
  renderRaidAccountsPage(root);
  void import("./accountStockUi").then(({ initAccountStockUi }) => initAccountStockUi());
  void import("./sellingAccountsManager").then(({ initSellingAccountsManager }) =>
    initSellingAccountsManager(),
  );
} else if (page === "honeygain") {
  renderHoneygainPage(root);
} else if (page === "exchange") {
  renderExchangePage(root);
  void import("./exchangeCalculator").then(({ initExchangeCalculator }) => initExchangeCalculator());
} else if (page === "dashboard") {
  renderAdminDashboardPage(root);
  void import("./adminDashboardPage").then(({ initAdminDashboardPage }) => initAdminDashboardPage());
} else {
  renderLanding(root);
  void import("./heroHotNews").then(({ initHeroHotNews }) => initHeroHotNews());
}

initLogin();
initTheme();
initWelcomeLetter();
initPromoCodeManager();
initFloatingContact();
initWelcomeChoiceOverlay();
initLazySections();
