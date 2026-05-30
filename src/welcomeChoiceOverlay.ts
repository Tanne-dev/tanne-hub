const WELCOME_STORAGE_KEY = "tanne-welcome-choice-seen-v2";

const newsIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M4 5h13a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3Z"></path>
    <path d="M8 9h7"></path>
    <path d="M8 13h8"></path>
    <path d="M8 17h4"></path>
  </svg>`;

const accountIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
    <circle cx="9" cy="10" r="2"></circle>
    <path d="M6.5 16a3.5 3.5 0 0 1 5 0"></path>
    <path d="M14 9h4"></path>
    <path d="M14 13h4"></path>
  </svg>`;

const exchangeIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M7 7h11"></path>
    <path d="M15 3l4 4-4 4"></path>
    <path d="M17 17H6"></path>
    <path d="M9 13l-4 4 4 4"></path>
  </svg>`;

function renderWelcomeChoiceOverlay(): string {
  return `
    <div id="welcome-choice-overlay" class="fixed inset-0 z-[92] flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(127,233,255,0.12),rgba(0,0,0,0.58)_56%,rgba(0,0,0,0.78))] px-4 py-6 backdrop-blur-[3px]">
      <div class="welcome-choice-card relative w-full max-w-[760px] overflow-hidden rounded-2xl border border-[#f6c44c]/38 bg-[linear-gradient(145deg,rgba(8,18,34,0.96),rgba(16,34,56,0.92))] p-4 text-[#eaf6ff] shadow-[0_0_0_1px_rgba(127,233,255,0.14),0_24px_70px_rgba(0,0,0,0.52),0_0_44px_rgba(246,196,76,0.16)] sm:p-5 md:p-6">
        <button
          id="welcome-choice-close"
          type="button"
          class="absolute right-3 top-3 z-10 grid min-h-10 min-w-10 place-items-center rounded-lg border border-[#f6c44c]/34 bg-black/24 text-sm font-extrabold text-[#ffd36a] transition hover:bg-[#f6c44c]/12"
          aria-label="Close welcome"
        >
          X
        </button>

        <div class="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,#f6c44c,transparent)]"></div>
        <div class="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,transparent,#7fe9ff,transparent)]"></div>
        <div class="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#f6c44c]/20 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-24 -left-24 h-52 w-52 rounded-full bg-[#7fe9ff]/16 blur-3xl"></div>

        <div class="relative z-[1] text-center">
          <p class="inline-flex rounded-md border border-[#f6c44c]/46 bg-[#f6c44c]/14 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ffd36a] shadow-[0_0_18px_rgba(246,196,76,0.18)]">
            New quest unlocked
          </p>
          <h2 class="mt-3 text-[29px] font-extrabold leading-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.35)] sm:text-[36px]">
            Welcome to Tanne Hub
          </h2>
          <p class="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#c7d6e8] sm:text-[15px]">
            Choose your path for today. News, accounts, or money exchange support.
          </p>
        </div>

        <div class="relative z-[1] mt-5 grid gap-3 md:grid-cols-3">
          <a
            href="/?page=news"
            class="welcome-choice-option group rounded-xl border border-[#7fe9ff]/20 bg-[#07111f]/70 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-1 hover:border-[#7fe9ff]/55 hover:bg-[#7fe9ff]/10 hover:shadow-[0_0_24px_rgba(127,233,255,0.16)]"
          >
            <span class="grid h-10 w-10 place-items-center rounded-lg bg-[#7fe9ff]/16 text-[#7fe9ff]">${newsIcon}</span>
            <span class="mt-3 block text-base font-extrabold">News & promo codes</span>
            <span class="mt-1 block text-[13px] leading-snug text-[#aebfd2]">Read new Raid info and check fresh RSL codes.</span>
          </a>

          <a
            href="/?page=raid-accounts"
            class="welcome-choice-option group rounded-xl border border-[#f6c44c]/24 bg-[#07111f]/70 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-1 hover:border-[#f6c44c]/60 hover:bg-[#f6c44c]/10 hover:shadow-[0_0_24px_rgba(246,196,76,0.16)]"
          >
            <span class="grid h-10 w-10 place-items-center rounded-lg bg-[#f6c44c]/18 text-[#f6c44c]">${accountIcon}</span>
            <span class="mt-3 block text-base font-extrabold">Find an account</span>
            <span class="mt-1 block text-[13px] leading-snug text-[#aebfd2]">Browse selected Raid accounts and ask for help.</span>
          </a>

          <a
            href="/?page=exchange"
            class="welcome-choice-option group rounded-xl border border-[#31d58a]/22 bg-[#07111f]/70 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:-translate-y-1 hover:border-[#31d58a]/55 hover:bg-[#31d58a]/10 hover:shadow-[0_0_24px_rgba(49,213,138,0.14)]"
          >
            <span class="grid h-10 w-10 place-items-center rounded-lg bg-[#31d58a]/16 text-[#31d58a]">${exchangeIcon}</span>
            <span class="mt-3 block text-base font-extrabold">Exchange money</span>
            <span class="mt-1 block text-[13px] leading-snug text-[#aebfd2]">Check PayPal, crypto, Wise, or bank transfer support.</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

function closeWelcomeChoiceOverlay(): void {
  document.querySelector("#welcome-choice-overlay")?.remove();
  localStorage.setItem(WELCOME_STORAGE_KEY, "1");
}

export function initWelcomeChoiceOverlay(): void {
  if (localStorage.getItem(WELCOME_STORAGE_KEY) === "1") return;
  if (new URLSearchParams(window.location.search).get("page") === "dashboard") return;
  if (window.location.search.includes("post=")) return;

  document.body.insertAdjacentHTML("beforeend", renderWelcomeChoiceOverlay());
  const overlay = document.querySelector<HTMLElement>("#welcome-choice-overlay");
  const close = document.querySelector<HTMLButtonElement>("#welcome-choice-close");
  if (!overlay || !close) return;

  close.addEventListener("click", closeWelcomeChoiceOverlay);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeWelcomeChoiceOverlay();
  });
  overlay.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    link.addEventListener("click", () => {
      localStorage.setItem(WELCOME_STORAGE_KEY, "1");
    });
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeWelcomeChoiceOverlay();
  });
}
