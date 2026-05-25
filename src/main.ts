import "./style.css";
import { inject } from "@vercel/analytics";
import { initAdminDashboardPage } from "./adminDashboardPage";
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
import { initNewsArchive } from "./newsArchive";
import { initPostsManager } from "./postsManager";
import { initTheme } from "./theme";
import { initAccountStockUi } from "./accountStockUi";
import { initSellingAccountsManager } from "./sellingAccountsManager";
import { initWelcomeLetter } from "./welcomeLetter";
import { initImageOptimizations } from "./initImageOptimizations";
import { initHeroHotNews } from "./heroHotNews";
import { initPromoCodeManager } from "./promoCodeManager";
import { initLegitReviewsManager } from "./legitReviewsManager";
import { initMemberAlertsManager } from "./memberAlertsManager";
import { initExchangeCalculator } from "./exchangeCalculator";
import { initFloatingContact } from "./floatingContact";
import { initWelcomeChoiceOverlay } from "./welcomeChoiceOverlay";
import { initLazySections } from "./lazySections";

initImageOptimizations();
inject();

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error('Missing root element "#app"');
}

const params = new URLSearchParams(window.location.search);
const postId = params.get("post");
const page = params.get("page");

if (postId) {
  renderPostDetail(root, postId);
} else if (page === "news") {
  renderNewsArchive(root);
} else if (page === "raid-accounts") {
  renderRaidAccountsPage(root);
} else if (page === "honeygain") {
  renderHoneygainPage(root);
} else if (page === "exchange") {
  renderExchangePage(root);
} else if (page === "dashboard") {
  renderAdminDashboardPage(root);
} else {
  renderLanding(root);
}

initLogin();
initPostsManager();
initHeroHotNews();
initNewsArchive();
initAdminDashboardPage();
initTheme();
initWelcomeLetter();
initAccountStockUi();
initSellingAccountsManager();
initPromoCodeManager();
initLegitReviewsManager();
initMemberAlertsManager();
initExchangeCalculator();
initFloatingContact();
initWelcomeChoiceOverlay();
initLazySections();
