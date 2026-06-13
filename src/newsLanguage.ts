import type { PostItem } from "./postsStore";

export type NewsLanguage = "en" | "vi";

const NEWS_LANGUAGE_KEY = "tanne-news-language";

export function getNewsLanguage(): NewsLanguage {
  try {
    return localStorage.getItem(NEWS_LANGUAGE_KEY) === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

export function setNewsLanguage(lang: NewsLanguage): void {
  try {
    localStorage.setItem(NEWS_LANGUAGE_KEY, lang);
  } catch {
    // Ignore storage failures; the current render still uses the selected value.
  }
}

export function getLocalizedPost(post: PostItem, lang = getNewsLanguage()): PostItem {
  if (lang !== "vi") return post;
  return {
    ...post,
    title: post.titleVi?.trim() || post.title,
    caption: post.captionVi?.trim() || post.caption,
    content: post.contentVi?.trim() || post.content,
  };
}

export function postHasVietnamese(post: PostItem): boolean {
  return Boolean(post.titleVi?.trim() || post.captionVi?.trim() || post.contentVi?.trim());
}

const siteCopy = {
  en: {
    heroTitle: "Game accounts, Raid updates, and promo codes",
    heroSubtitle:
      "A small game hub for selected Raid accounts, useful news, fresh RSL codes, and extra ways to earn.",
    browseRaidAccounts: "Browse Raid accounts",
    readLatestInfo: "Read latest info",
    startHere: "Start here",
    hotNews: "Hot news",
    hotNewsSubtitle: "Raid updates, codes, and shop notes",
    allArticles: "All articles",
    readArticle: "Read article",
    previousHotNewsSlide: "Previous hot news slide",
    nextHotNewsSlide: "Next hot news slide",
    noHotPosts: "No hot posts yet",
    noHotPostsSubtitle: "Raid news will appear here when published.",
    browseArchive: "Browse archive",
    gameInfoFirst: "Game info first",
    latestRaidUpdates: "Latest Raid updates",
    raidNewsDescription: "News, promo-code notes, guides, and quick context for Raid players.",
    prev: "Prev",
    next: "Next",
    featuredRaidAccounts: "Featured Raid accounts",
    featuredRaidAccountsDescription:
      "Selected accounts for players who want a faster start. Use the ID when contacting us so the right listing is easy to find.",
    viewAllRaidAccounts: "View all Raid accounts",
    noAccountsForSale: "No active accounts for sale yet.",
    lazySuffix: "This section loads when you scroll close to it, so the first screen stays faster.",
    loadingRaidNews: "Loading latest Raid updates...",
    loadingMemberAlerts: "Preparing member alert options...",
    loadingPopularAccounts: "Loading featured Raid accounts...",
    loadingSafeTrading: "Loading safe buying guide...",
    loadingLegitCheck: "Loading buyer feedback...",
    loadingTrustpilot: "Loading public review area...",
    loadingPromos: "Loading support highlights...",
    buyingWorksTitle: "How buying works",
    buyingWorksDescription:
      "Tanne Hub is a small account shop, so every purchase should feel direct and clear: pick an account ID, contact us, confirm details, then complete delivery safely.",
    simplePurchaseFlow: "Simple purchase flow",
    chooseIdTitle: "1. Choose an ID",
    chooseIdDescription: "Open a listing, check screenshots/details, and copy the account ID you want.",
    contactSupportTitle: "2. Contact support",
    contactSupportDescription: "Send the ID, ask questions, and confirm price/payment before anything moves.",
    safeDeliveryTitle: "3. Safe delivery",
    safeDeliveryDescription: "Delivery happens only after both sides are clear on the account and transfer steps.",
    checkLegit: "Check legit",
    buyerFeedback: "Buyer feedback",
    reviewCount: "{count} reviews from buyers",
    reviewCountOne: "1 review from buyers",
    buyerFeedbackDescription: "A compact place for new buyers to leave a quick legit check after an order.",
    liveFeedbackRoll: "Live feedback roll",
    allReviews: "All {count} reviews",
    buyerFeedbackCarousel: "Buyer feedback carousel",
    starsOutOfFive: "{count} out of 5 stars",
    leaveFeedbackAfterPurchase: "Leave feedback after purchase",
    yourName: "Your name",
    orderAccountIdOptional: "Order / account ID (optional)",
    shortFeedback: "Short feedback...",
    submitFeedback: "Submit",
    fiveStars: "5 stars",
    fourStars: "4 stars",
    threeStars: "3 stars",
    twoStars: "2 stars",
    oneStar: "1 star",
    trustpilotStarRating: "Trustpilot star rating",
    publicCustomerFeedback: "Public customer feedback",
    trustpilotDescription:
      "Check Tannehub on Trustpilot to read public reviews or leave your own review after using our account or exchange service.",
    trustpilotProfile: "Trustpilot profile",
    trustpilotReviews: "Trustpilot reviews",
    trustpilotLiveReviews:
      "Live public reviews are available on Trustpilot. The score should be checked on the official profile.",
    viewTrustpilot: "View Trustpilot",
    checkedAccountDetails: "Checked account details",
    checkedAccountDetailsDescription:
      "Listings focus on clear screenshots, IDs, prices, and useful notes before you buy.",
    learnMore: "Learn More",
    directSupport: "Direct support",
    directSupportDescription: "Ask about a listing, promo code, or Raid update before making a decision.",
    getHelp: "Get Help",
    memberAlertsEyebrow: "Member alerts",
    memberAlertsTitle: "Get updates when something new drops",
    signedInAs: "Signed in as {email}",
    memberAlertsSignedOut: "Register or log in to receive new promo-code and post alerts.",
    alertOn: "On",
    alertOff: "Off",
    rslPromoCodes: "RSL promo codes",
    rslPromoCodesDescription: "Notify me when new reward codes are updated.",
    newPosts: "New posts",
    newPostsDescription: "Notify me when Raid news or guides are published.",
    loginToEnableAlerts: "Please register or log in to enable member alerts.",
    saveAlertPreferenceFailed: "Could not save alert preference.",
    alertPreferencesSaved: "Alert preferences saved.",
    welcomeClose: "Close welcome letter",
    welcomeLetter: "Welcome Letter",
    welcomeTitle: "Please Read Before You Explore",
    welcomeParagraphOne:
      "Welcome to Tanne Hub. If you are new here, no worries - I am always around to support you in a friendly and transparent way so you can feel safe from the start. Most people who come here already know my name from when I was a former mod on EpicNPC, and from other platforms such as G2G and the EpicNPC Facebook Group.",
    welcomeParagraphTwo:
      "This is a mini forum where you can find accounts that fit your needs, or contact me directly if you want to consign your account for sale. It is also where I share notes about Raid: Shadow Legends and reroll-friendly play when relevant.",
    welcomeParagraphThree:
      "We also provide exchange services if you need to convert cryptocurrency into PayPal, Wise, Revolut, or transfer to your bank. Please read more details about that service on the Exchange page.",
    welcomeThanks: "Thank you for visiting and trusting Tanne Hub.",
    promoCodeLabel: "Promo Code",
    raidRewards: "Raid Shadow Legends rewards",
    rslPromoCodesTitle: "RSL Promo Codes",
    rslPromoCodesIntro: "Use these codes in Raid: Shadow Legends to claim in-game rewards.",
    promoReward: "Reward",
    promoUpdated: "Updated",
    noPromoCodes: "No RSL promo codes have been updated yet.",
    closePromoCodes: "Close promo codes",
    close: "Close",
    helpCenter: "Help Center",
    cookiePolicy: "Cookie Policy",
    sell: "Sell",
    privacyPolicy: "Privacy Policy",
    contactUs: "Contact Us",
    careers: "Careers",
    footerLocale: "USD $ / EN",
    allRightsReserved: "All rights reserved.",
  },
  vi: {
    heroTitle: "Tài khoản game, tin Raid và mã promo",
    heroSubtitle:
      "Một hub nhỏ cho tài khoản Raid chọn lọc, tin tức hữu ích, mã RSL mới và các cách kiếm thêm.",
    browseRaidAccounts: "Xem tài khoản Raid",
    readLatestInfo: "Đọc tin mới nhất",
    startHere: "Bắt đầu",
    hotNews: "Tin nổi bật",
    hotNewsSubtitle: "Cập nhật Raid, mã code và ghi chú shop",
    allArticles: "Tất cả bài viết",
    readArticle: "Đọc bài viết",
    previousHotNewsSlide: "Tin nổi bật trước",
    nextHotNewsSlide: "Tin nổi bật tiếp theo",
    noHotPosts: "Chưa có tin nổi bật",
    noHotPostsSubtitle: "Tin Raid sẽ xuất hiện ở đây khi được đăng.",
    browseArchive: "Xem kho bài viết",
    gameInfoFirst: "Thông tin game trước",
    latestRaidUpdates: "Cập nhật Raid mới nhất",
    raidNewsDescription: "Tin tức, ghi chú promo-code, hướng dẫn và ngữ cảnh nhanh cho người chơi Raid.",
    prev: "Trước",
    next: "Tiếp",
    featuredRaidAccounts: "Tài khoản Raid nổi bật",
    featuredRaidAccountsDescription:
      "Các tài khoản được chọn cho người chơi muốn khởi đầu nhanh hơn. Hãy dùng ID khi liên hệ để tìm đúng listing.",
    viewAllRaidAccounts: "Xem tất cả tài khoản Raid",
    noAccountsForSale: "Hiện chưa có tài khoản nào đang bán.",
    lazySuffix: "Phần này chỉ tải khi bạn cuộn gần tới nó, giúp màn hình đầu tiên nhanh hơn.",
    loadingRaidNews: "Đang tải cập nhật Raid mới nhất...",
    loadingMemberAlerts: "Đang chuẩn bị tùy chọn thông báo thành viên...",
    loadingPopularAccounts: "Đang tải tài khoản Raid nổi bật...",
    loadingSafeTrading: "Đang tải hướng dẫn mua bán an toàn...",
    loadingLegitCheck: "Đang tải phản hồi người mua...",
    loadingTrustpilot: "Đang tải khu vực đánh giá công khai...",
    loadingPromos: "Đang tải điểm nổi bật hỗ trợ...",
    buyingWorksTitle: "Quy trình mua hoạt động như thế nào",
    buyingWorksDescription:
      "Tanne Hub là shop tài khoản nhỏ, nên mỗi giao dịch cần rõ ràng và trực tiếp: chọn ID tài khoản, liên hệ shop, xác nhận chi tiết, rồi nhận bàn giao an toàn.",
    simplePurchaseFlow: "Quy trình mua đơn giản",
    chooseIdTitle: "1. Chọn ID",
    chooseIdDescription: "Mở listing, kiểm tra ảnh/chỉ số/ghi chú và copy ID tài khoản bạn muốn.",
    contactSupportTitle: "2. Liên hệ hỗ trợ",
    contactSupportDescription: "Gửi ID, đặt câu hỏi và xác nhận giá/phương thức thanh toán trước khi giao dịch.",
    safeDeliveryTitle: "3. Bàn giao an toàn",
    safeDeliveryDescription: "Chỉ bàn giao khi hai bên đã rõ thông tin tài khoản và các bước chuyển giao.",
    checkLegit: "Kiểm tra uy tín",
    buyerFeedback: "Phản hồi người mua",
    reviewCount: "{count} đánh giá từ người mua",
    reviewCountOne: "1 đánh giá từ người mua",
    buyerFeedbackDescription: "Nơi gọn nhẹ để người mua mới để lại đánh giá uy tín sau khi hoàn tất đơn hàng.",
    liveFeedbackRoll: "Phản hồi đang chạy",
    allReviews: "Tất cả {count} đánh giá",
    buyerFeedbackCarousel: "Băng chuyền phản hồi người mua",
    starsOutOfFive: "{count} trên 5 sao",
    leaveFeedbackAfterPurchase: "Để lại phản hồi sau khi mua",
    yourName: "Tên của bạn",
    orderAccountIdOptional: "Mã đơn / ID tài khoản (không bắt buộc)",
    shortFeedback: "Phản hồi ngắn...",
    submitFeedback: "Gửi",
    fiveStars: "5 sao",
    fourStars: "4 sao",
    threeStars: "3 sao",
    twoStars: "2 sao",
    oneStar: "1 sao",
    trustpilotStarRating: "Xếp hạng sao Trustpilot",
    publicCustomerFeedback: "Phản hồi khách hàng công khai",
    trustpilotDescription:
      "Xem Tannehub trên Trustpilot để đọc đánh giá công khai hoặc để lại đánh giá của bạn sau khi dùng dịch vụ tài khoản hoặc đổi tiền.",
    trustpilotProfile: "Hồ sơ Trustpilot",
    trustpilotReviews: "Đánh giá Trustpilot",
    trustpilotLiveReviews:
      "Đánh giá công khai có trên Trustpilot. Điểm số nên được kiểm tra trên hồ sơ chính thức.",
    viewTrustpilot: "Xem Trustpilot",
    checkedAccountDetails: "Thông tin tài khoản đã kiểm tra",
    checkedAccountDetailsDescription:
      "Listing tập trung vào ảnh rõ ràng, ID, giá và ghi chú hữu ích trước khi bạn mua.",
    learnMore: "Tìm hiểu thêm",
    directSupport: "Hỗ trợ trực tiếp",
    directSupportDescription: "Hỏi về listing, mã promo hoặc tin Raid trước khi bạn quyết định.",
    getHelp: "Nhận hỗ trợ",
    memberAlertsEyebrow: "Thông báo thành viên",
    memberAlertsTitle: "Nhận cập nhật khi có nội dung mới",
    signedInAs: "Đã đăng nhập bằng {email}",
    memberAlertsSignedOut: "Đăng ký hoặc đăng nhập để nhận thông báo mã promo và bài viết mới.",
    alertOn: "Bật",
    alertOff: "Tắt",
    rslPromoCodes: "Mã promo RSL",
    rslPromoCodesDescription: "Thông báo cho tôi khi mã thưởng mới được cập nhật.",
    newPosts: "Bài viết mới",
    newPostsDescription: "Thông báo cho tôi khi tin Raid hoặc hướng dẫn mới được đăng.",
    loginToEnableAlerts: "Vui lòng đăng ký hoặc đăng nhập để bật thông báo thành viên.",
    saveAlertPreferenceFailed: "Không thể lưu tùy chọn thông báo.",
    alertPreferencesSaved: "Đã lưu tùy chọn thông báo.",
    welcomeClose: "Đóng thư chào mừng",
    welcomeLetter: "Thư chào mừng",
    welcomeTitle: "Vui lòng đọc trước khi khám phá",
    welcomeParagraphOne:
      "Chào mừng bạn đến với Tanne Hub. Nếu bạn mới ghé lần đầu, đừng lo - tôi luôn sẵn sàng hỗ trợ một cách thân thiện và minh bạch để bạn cảm thấy an toàn ngay từ đầu. Nhiều người biết tôi từ thời tôi từng là mod trên EpicNPC, cũng như từ G2G và nhóm Facebook EpicNPC.",
    welcomeParagraphTwo:
      "Đây là một mini forum nơi bạn có thể tìm tài khoản phù hợp với nhu cầu, hoặc liên hệ trực tiếp nếu bạn muốn ký gửi tài khoản để bán. Đây cũng là nơi tôi chia sẻ ghi chú về Raid: Shadow Legends và lối chơi reroll khi cần.",
    welcomeParagraphThree:
      "Chúng tôi cũng cung cấp dịch vụ đổi tiền nếu bạn cần chuyển cryptocurrency sang PayPal, Wise, Revolut hoặc chuyển về ngân hàng. Hãy đọc thêm chi tiết ở trang Exchange.",
    welcomeThanks: "Cảm ơn bạn đã ghé thăm và tin tưởng Tanne Hub.",
    promoCodeLabel: "Mã promo",
    raidRewards: "Phần thưởng Raid Shadow Legends",
    rslPromoCodesTitle: "Mã promo RSL",
    rslPromoCodesIntro: "Dùng các mã này trong Raid: Shadow Legends để nhận phần thưởng trong game.",
    promoReward: "Phần thưởng",
    promoUpdated: "Cập nhật",
    noPromoCodes: "Chưa có mã promo RSL nào được cập nhật.",
    closePromoCodes: "Đóng mã promo",
    close: "Đóng",
    helpCenter: "Trung tâm hỗ trợ",
    cookiePolicy: "Chính sách cookie",
    sell: "Bán",
    privacyPolicy: "Chính sách riêng tư",
    contactUs: "Liên hệ",
    careers: "Tuyển dụng",
    footerLocale: "USD $ / VI",
    allRightsReserved: "Đã đăng ký bản quyền.",
  },
} as const;

export type SiteCopyKey = keyof typeof siteCopy.en;

export function siteText(key: SiteCopyKey): string {
  return siteCopy[getNewsLanguage()][key];
}
