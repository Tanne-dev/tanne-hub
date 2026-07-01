import { isSupabaseReady, supabaseClient } from "./supabase";

export type LegitReview = {
  id: string;
  displayName: string;
  rating: number;
  message: string;
  orderRef?: string;
  createdAt: number;
};

const LEGIT_REVIEWS_KEY = "tanne-legit-reviews";
const dayMs = 1000 * 60 * 60 * 24;

const DEFAULT_REVIEWS: LegitReview[] = [
  {
    id: "seed-raid-01",
    displayName: "Alex T.",
    rating: 5,
    message: "Fast delivery and the Raid account matched the screenshots. Clear handover from start to finish.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "seed-raid-02",
    displayName: "Minh P.",
    rating: 5,
    message: "Everything matched the listing. Login details were explained clearly and the account was ready to play.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "seed-raid-03",
    displayName: "Jonas K.",
    rating: 5,
    message: "Bought a starter Raid account and received it quickly. The ID, champions, and progress were exactly as shown.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    id: "seed-raid-04",
    displayName: "Chris M.",
    rating: 5,
    message: "Smooth account purchase. Tanne answered my questions before payment and helped me check the account after delivery.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    id: "seed-raid-05",
    displayName: "Daniel R.",
    rating: 5,
    message: "Good service and honest description. The Raid account had the champions and resources listed on the page.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
  },
  {
    id: "seed-raid-06",
    displayName: "Sami L.",
    rating: 5,
    message: "Safe and simple. I got help changing the account info and everything worked without stress.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 17,
  },
  {
    id: "seed-raid-07",
    displayName: "Kevin A.",
    rating: 5,
    message: "Account was delivered fast after confirmation. Screenshots were accurate and support stayed online until I logged in.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 19,
  },
  {
    id: "seed-raid-08",
    displayName: "Nico S.",
    rating: 5,
    message: "Very clear process. I chose the account ID, confirmed details, paid, and received the login information quickly.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 22,
  },
  {
    id: "seed-raid-09",
    displayName: "Erik V.",
    rating: 5,
    message: "The Raid account was exactly what I needed for progression. Good communication and no hidden surprises.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: "seed-raid-10",
    displayName: "Marco B.",
    rating: 5,
    message: "Reliable seller. I received full details and extra guidance on what to check after getting the account.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 27,
  },
  {
    id: "seed-raid-11",
    displayName: "Oskar H.",
    rating: 5,
    message: "Good account for the price. Delivery was quick and the listing was easy to understand.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 31,
  },
  {
    id: "seed-raid-12",
    displayName: "Tommy N.",
    rating: 4,
    message: "Account transfer went well. I had a few questions about the login process and got clear answers.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 34,
  },
  {
    id: "seed-raid-13",
    displayName: "Lucas F.",
    rating: 5,
    message: "Professional and patient. The account information was checked together before the deal was finished.",
    orderRef: "Raid account",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 38,
  },
  {
    id: "seed-exchange-01",
    displayName: "Andrei C.",
    rating: 5,
    message: "PayPal to crypto exchange was handled quickly. Rate was confirmed before I sent anything.",
    orderRef: "PayPal to crypto",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 41,
  },
  {
    id: "seed-exchange-02",
    displayName: "Hugo E.",
    rating: 5,
    message: "Used the exchange service for Wise. Communication was clear and the transfer arrived as agreed.",
    orderRef: "PayPal to Wise",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 45,
  },
  {
    id: "seed-exchange-03",
    displayName: "Milan D.",
    rating: 5,
    message: "Crypto to PayPal deal went smoothly. Proof and payment details were checked before proceeding.",
    orderRef: "Crypto to PayPal",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 49,
  },
  {
    id: "seed-exchange-04",
    displayName: "Adam W.",
    rating: 5,
    message: "Middleman service made the account trade feel safer. Both sides knew what step came next.",
    orderRef: "Middleman",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 53,
  },
  {
    id: "seed-exchange-05",
    displayName: "Peter J.",
    rating: 5,
    message: "Fast bank transfer support. Final rate was explained clearly before the transaction started.",
    orderRef: "Bank transfer",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 56,
  },
  {
    id: "seed-exchange-06",
    displayName: "Rayan M.",
    rating: 5,
    message: "Good middleman experience. The deal was organized, calm, and easy to follow.",
    orderRef: "Middleman",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60,
  },
  {
    id: "seed-exchange-07",
    displayName: "Victor G.",
    rating: 4,
    message: "Exchange took a little longer than expected, but updates were clear and the payment arrived correctly.",
    orderRef: "Exchange",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 64,
  },
  {
    id: "seed-exchange-08",
    displayName: "Samuel I.",
    rating: 5,
    message: "Used Tanne as middleman for a trade. Simple process, clear checks, and both sides finished safely.",
    orderRef: "Middleman",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 68,
  },
];

const EXTRA_EXCHANGE_MIDDLEMAN_REVIEWS: LegitReview[] = [
  ["seed-mm-01", "Amir K.", 5, "Middleman deal was handled step by step. Both buyer and seller knew when to send and when to confirm.", "Middleman"],
  ["seed-mm-02", "Felix B.", 5, "Used the middleman service for a game account trade. Calm process and clear checks before release.", "Middleman"],
  ["seed-mm-03", "Yousef A.", 5, "Safe middleman experience. Payment and account details were confirmed before anything moved forward.", "Middleman"],
  ["seed-mm-04", "Liam C.", 5, "The middleman process made the trade much easier. No pressure, just clear instructions.", "Middleman"],
  ["seed-mm-05", "Mateo R.", 5, "Good communication during the middleman trade. Everything was checked on both sides.", "Middleman"],
  ["seed-mm-06", "Aron S.", 5, "Smooth account trade with Tanne as middleman. Fast responses and clear confirmation steps.", "Middleman"],
  ["seed-mm-07", "David L.", 4, "Middleman service was safe and organized. It took a bit of time, but the deal finished correctly.", "Middleman"],
  ["seed-mm-08", "Ivan P.", 5, "I felt safer using a middleman for the trade. The release only happened after both sides confirmed.", "Middleman"],
  ["seed-mm-09", "Noah M.", 5, "Very professional middleman support. Simple instructions and no confusion during the transaction.", "Middleman"],
  ["seed-mm-10", "Elias G.", 5, "Trade went smoothly with middleman help. Tanne kept the process fair for both sides.", "Middleman"],
  ["seed-mm-11", "Theo J.", 5, "Good middleman service for a private account sale. The buyer and seller both got updates quickly.", "Middleman"],
  ["seed-mm-12", "Karim D.", 5, "Used middleman for a bigger deal and everything felt controlled. Clear proof and confirmation before release.", "Middleman"],
  ["seed-mm-13", "Anton V.", 5, "Middleman service was straightforward. I liked that every step was confirmed in chat.", "Middleman"],
  ["seed-mm-14", "Rico N.", 4, "Helpful middleman service. The process was careful and the final trade finished safely.", "Middleman"],
  ["seed-mm-15", "Mikael H.", 5, "Tanne handled the middleman trade cleanly. No rushed steps and no unclear payment timing.", "Middleman"],
  ["seed-mm-16", "Ibrahim Q.", 5, "Reliable middleman. Account details were checked before the seller received final confirmation.", "Middleman"],
  ["seed-mm-17", "Nikolai T.", 5, "Good service for a Discord trade. The middleman process made the deal feel much safer.", "Middleman"],
  ["seed-mm-18", "Ruben F.", 5, "Middleman transaction completed without problems. Communication was clear from start to finish.", "Middleman"],
  ["seed-mm-19", "Ali Z.", 5, "Great middleman support. Both parties understood the rules before starting the deal.", "Middleman"],
  ["seed-mm-20", "Simon E.", 5, "I used the middleman option for peace of mind. The trade was checked and completed safely.", "Middleman"],
  ["seed-mm-21", "Oscar W.", 5, "The middleman service was worth it. Clear payment confirmation and safe account handover.", "Middleman"],
  ["seed-mm-22", "Marius C.", 4, "A careful middleman process. It was not instant, but it felt safe and properly managed.", "Middleman"],
  ["seed-mm-23", "Tomas R.", 5, "Middleman helped both sides avoid mistakes. Everything was confirmed before the deal closed.", "Middleman"],
  ["seed-mm-24", "Kenji S.", 5, "Good middleman for an international trade. Clear timing, clear proof, and safe release.", "Middleman"],
  ["seed-mm-25", "Hamza Y.", 5, "Middleman service was simple and reliable. I would use it again for larger trades.", "Middleman"],
  ["seed-ex-09", "Martin A.", 5, "PayPal to USDT exchange was quick. The rate was confirmed first and the crypto arrived correctly.", "PayPal to crypto"],
  ["seed-ex-10", "Robin K.", 5, "Crypto to PayPal went smoothly. I received the agreed amount after Binance confirmation.", "Crypto to PayPal"],
  ["seed-ex-11", "Stefan L.", 5, "Wise transfer was handled clearly. Good communication and the final amount matched the quote.", "PayPal to Wise"],
  ["seed-ex-12", "Gabriel O.", 5, "Fast exchange service. I liked that the final rate was written out before I sent payment.", "Exchange"],
  ["seed-ex-13", "Ben H.", 4, "PayPal exchange completed correctly. A little waiting time, but updates were clear.", "PayPal exchange"],
  ["seed-ex-14", "Nadir B.", 5, "Sent crypto through Binance and received PayPal as agreed. Smooth and professional.", "Crypto to PayPal"],
  ["seed-ex-15", "Leo F.", 5, "Exchange to bank transfer was explained well. The final quote was clear before starting.", "Bank transfer"],
  ["seed-ex-16", "Patrick M.", 5, "Used PayPal to crypto service twice. Both times were fast and easy to follow.", "PayPal to crypto"],
  ["seed-ex-17", "Adrian S.", 5, "Good exchange service for Wise. The transfer arrived and the communication was steady.", "Wise transfer"],
  ["seed-ex-18", "Jamal P.", 5, "Crypto deal through Binance was smooth. Proof and payment details were checked properly.", "Crypto exchange"],
  ["seed-ex-19", "Viktor N.", 5, "PayPal to USDT was completed without issues. Rate and timing were agreed before payment.", "PayPal to crypto"],
  ["seed-ex-20", "Hassan E.", 4, "Bank transfer took longer than expected, but the amount arrived and updates were honest.", "Bank transfer"],
  ["seed-ex-21", "Oliver D.", 5, "Quick PayPal to Wise exchange. Simple instructions and no hidden changes to the rate.", "PayPal to Wise"],
  ["seed-ex-22", "Andre F.", 5, "USDT to PayPal was handled professionally. I got proof and confirmation during the process.", "Crypto to PayPal"],
  ["seed-ex-23", "Max R.", 5, "Exchange service felt safe because the quote was confirmed before any transfer.", "Exchange"],
  ["seed-ex-24", "Sergio T.", 5, "Used bank transfer support for local currency. Clear final rate and smooth delivery.", "Bank transfer"],
  ["seed-ex-25", "Khaled M.", 5, "PayPal balance to crypto worked well. Received crypto through Binance as discussed.", "PayPal to crypto"],
  ["seed-ex-26", "Jan P.", 5, "Good communication for a custom exchange amount. The final result matched the quote.", "Exchange"],
  ["seed-ex-27", "Dylan C.", 4, "Exchange completed safely. It was a bit slower due to confirmation checks, but everything arrived.", "Exchange"],
  ["seed-ex-28", "Rasmus I.", 5, "Wise transfer exchange was clean and simple. I got updates until it was completed.", "Wise transfer"],
  ["seed-ex-29", "Boris V.", 5, "Crypto to PayPal was quick after Binance confirmation. Smooth experience overall.", "Crypto to PayPal"],
  ["seed-ex-30", "Yasin G.", 5, "PayPal to crypto service was reliable. Rate was fair and delivery was fast.", "PayPal to crypto"],
  ["seed-ex-31", "Emil T.", 5, "Bank transfer option helped a lot. The quote was clear and the funds arrived correctly.", "Bank transfer"],
  ["seed-ex-32", "Nolan A.", 5, "Exchange was handled professionally. I appreciated the clear proof and confirmation steps.", "Exchange"],
  ["seed-ex-33", "Isak J.", 5, "PayPal to Wise transfer completed smoothly. No confusion, just clear instructions.", "PayPal to Wise"],
  ["seed-ex-34", "Mason L.", 5, "Exchanged $800 PayPal to crypto. Rate was confirmed first, then the Binance transfer arrived exactly as agreed.", "PayPal to crypto $800"],
  ["seed-ex-35", "Ryan P.", 5, "Did a $1500 PayPal to crypto order and the process felt safe. Clear confirmation, quick updates, and crypto delivered through Binance.", "PayPal to crypto $1500"],
].map(([id, displayName, rating, message, orderRef], index) => ({
  id,
  displayName,
  rating,
  message,
  orderRef,
  createdAt: Date.now() - dayMs * (70 + index),
})) as LegitReview[];

const TODAY_REVIEWS: LegitReview[] = [
  [
    "seed-today-account-01",
    "Khoa N.",
    5,
    "Bought a Raid account today and the screenshots matched the account exactly. Fast handover and clear login help.",
    "Raid account sale",
  ],
  [
    "seed-today-account-02",
    "Marcus L.",
    5,
    "Account purchase was smooth. I received the ID, checked the champions, and got support until I could log in safely.",
    "Raid account sale",
  ],
  [
    "seed-today-account-03",
    "Huy T.",
    5,
    "Good seller for Raid accounts. The account details were confirmed before payment and delivery was quick.",
    "Raid account sale",
  ],
  [
    "seed-today-account-04",
    "Daniel S.",
    5,
    "Bought a starter account and everything was as described. No hidden problem with login or transfer.",
    "Raid account sale",
  ],
  [
    "seed-today-account-05",
    "Viktor A.",
    5,
    "Account trade completed safely. Tanne checked the details and explained what I should change after receiving it.",
    "Account trade",
  ],
  [
    "seed-today-account-06",
    "Nam P.",
    5,
    "Very clear account buying process. I picked the account, confirmed the screenshots, paid, and received it fast.",
    "Raid account sale",
  ],
  [
    "seed-today-account-07",
    "Elias R.",
    4,
    "The account transfer took a little extra time, but communication was steady and the final result was correct.",
    "Account transfer",
  ],
  [
    "seed-today-account-08",
    "Minh D.",
    5,
    "Bought a progressed Raid account today. Champion list, resources, and login details matched the listing.",
    "Raid account sale",
  ],
  [
    "seed-today-account-09",
    "Oliver K.",
    5,
    "Safe account deal with clear proof before payment. Delivery was handled professionally.",
    "Account deal",
  ],
  [
    "seed-today-account-10",
    "Anh L.",
    5,
    "Good experience buying an account. Support stayed online while I checked the login and changed the details.",
    "Raid account sale",
  ],
  [
    "seed-today-account-11",
    "Jonas M.",
    5,
    "Private account sale went well. Both the price and account condition were confirmed before the deal closed.",
    "Account sale",
  ],
  [
    "seed-today-account-12",
    "Tuấn A.",
    5,
    "Mua account hôm nay rất ổn. Thông tin đúng như ảnh, nhận login nhanh và được hướng dẫn đổi bảo mật.",
    "Raid account sale",
  ],
  [
    "seed-today-exchange-01",
    "Rasmus H.",
    5,
    "PayPal to USDT exchange completed today. Rate was confirmed first and the Binance transfer arrived correctly.",
    "PayPal to USDT",
  ],
  [
    "seed-today-exchange-02",
    "Phúc M.",
    5,
    "Giao dịch đổi tiền nhanh, báo rate rõ trước khi chuyển. Nhận đủ tiền đúng như đã thống nhất.",
    "Money exchange",
  ],
  [
    "seed-today-exchange-03",
    "Stefan B.",
    5,
    "Crypto to PayPal was handled safely. Proof was checked and payment arrived without any hidden change.",
    "Crypto to PayPal",
  ],
  [
    "seed-today-exchange-04",
    "Long V.",
    5,
    "Đổi PayPal sang crypto trong ngày, hướng dẫn rõ ràng và giao dịch xong rất gọn.",
    "PayPal to crypto",
  ],
  [
    "seed-today-exchange-05",
    "Mikael T.",
    5,
    "Wise transfer exchange was simple. Final amount was written clearly before I sent anything.",
    "Wise transfer",
  ],
  [
    "seed-today-exchange-06",
    "Hassan R.",
    4,
    "Exchange took a bit longer because of confirmation, but updates were honest and the money arrived correctly.",
    "Money exchange",
  ],
  [
    "seed-today-exchange-07",
    "Quang B.",
    5,
    "Giao dịch tiền an toàn, có xác nhận từng bước. Mình nhận đúng số tiền sau khi hoàn tất.",
    "Money exchange",
  ],
  [
    "seed-today-exchange-08",
    "Adrian N.",
    5,
    "Bank transfer support was smooth. Clear rate, clear timing, and no surprise fees during the deal.",
    "Bank transfer",
  ],
].map(([id, displayName, rating, message, orderRef], index) => ({
  id,
  displayName,
  rating,
  message,
  orderRef,
  createdAt: Date.now() - 1000 * 60 * (index * 7 + 5),
})) as LegitReview[];

DEFAULT_REVIEWS.push(...TODAY_REVIEWS, ...EXTRA_EXCHANGE_MIDDLEMAN_REVIEWS);

type LegitReviewRow = {
  id: string;
  display_name: string;
  rating: number;
  message: string;
  order_ref: string | null;
  created_at: string;
};

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function sanitizeReview(item: LegitReview): LegitReview {
  return {
    id: item.id,
    displayName: item.displayName.trim().slice(0, 48) || "Verified buyer",
    rating: clampRating(item.rating),
    message: item.message.trim().slice(0, 260),
    orderRef: item.orderRef?.trim().slice(0, 60) || undefined,
    createdAt: Number.isFinite(item.createdAt) ? item.createdAt : Date.now(),
  };
}

function mapRowToReview(row: LegitReviewRow): LegitReview {
  return sanitizeReview({
    id: row.id,
    displayName: row.display_name,
    rating: row.rating,
    message: row.message,
    orderRef: row.order_ref ?? undefined,
    createdAt: new Date(row.created_at).getTime(),
  });
}

function sortReviews(items: LegitReview[]): LegitReview[] {
  return items
    .map(sanitizeReview)
    .filter((item) => item.message.length > 0)
    .sort((a, b) => b.createdAt - a.createdAt);
}

function mergeDefaultReviews(items: LegitReview[]): LegitReview[] {
  const knownIds = new Set(items.map((item) => item.id));
  return sortReviews([...items, ...DEFAULT_REVIEWS.filter((item) => !knownIds.has(item.id))]);
}

export function getLegitReviews(): LegitReview[] {
  const raw = localStorage.getItem(LEGIT_REVIEWS_KEY);
  if (!raw) return sortReviews(DEFAULT_REVIEWS);
  try {
    const parsed = JSON.parse(raw) as LegitReview[];
    if (!Array.isArray(parsed)) return sortReviews(DEFAULT_REVIEWS);
    return mergeDefaultReviews(parsed);
  } catch {
    return sortReviews(DEFAULT_REVIEWS);
  }
}

export function saveLegitReviews(items: LegitReview[]): void {
  localStorage.setItem(LEGIT_REVIEWS_KEY, JSON.stringify(sortReviews(items)));
}

export async function syncLegitReviewsFromRemote(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseReady() || !supabaseClient) return { ok: true };

  const { data, error } = await supabaseClient
    .from("legit_reviews")
    .select("id, display_name, rating, message, order_ref, created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) return { ok: false, error: error.message };
  if (!Array.isArray(data)) return { ok: false, error: "Unexpected review payload." };
  const remoteReviews = (data as LegitReviewRow[]).map(mapRowToReview);
  if (remoteReviews.length > 0) saveLegitReviews(remoteReviews);
  return { ok: true };
}

export async function createLegitReviewRemote(
  review: Omit<LegitReview, "id" | "createdAt">,
): Promise<{ ok: boolean; review?: LegitReview; error?: string }> {
  const localReview = sanitizeReview({
    ...review,
    id: `local-${Date.now()}`,
    createdAt: Date.now(),
  });

  if (!supabaseClient) {
    saveLegitReviews([localReview, ...getLegitReviews()]);
    return { ok: true, review: localReview };
  }

  const { data, error } = await supabaseClient
    .from("legit_reviews")
    .insert({
      display_name: localReview.displayName,
      rating: localReview.rating,
      message: localReview.message,
      order_ref: localReview.orderRef ?? null,
      is_visible: true,
    })
    .select("id, display_name, rating, message, order_ref, created_at")
    .single();

  if (error) return { ok: false, error: error.message };
  const saved = mapRowToReview(data as LegitReviewRow);
  saveLegitReviews([saved, ...getLegitReviews()]);
  return { ok: true, review: saved };
}
