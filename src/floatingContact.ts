import {
  CONTACT_DISCORD_ADD_FRIEND_URL,
  CONTACT_DISCORD_USERNAME,
  CONTACT_EMAIL,
  CONTACT_EPICNPC_MESSAGE_URL,
} from "./contactLinks";

const contactIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true">
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
    <path d="M8 9h8"></path>
    <path d="M8 13h5"></path>
  </svg>`;

const discordIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
    <path d="M8 12.5h.01"></path>
    <path d="M16 12.5h.01"></path>
    <path d="M7.5 17c2.9 1.4 6.1 1.4 9 0"></path>
    <path d="M6.5 6.5A14 14 0 0 1 10 5.4l.7 1.3a12 12 0 0 1 2.6 0l.7-1.3a14 14 0 0 1 3.5 1.1c1.3 2 2 4.3 2.1 7-.9 1.4-2 2.4-3.3 3.1l-.8-1.4a9 9 0 0 1-7 0l-.8 1.4c-1.3-.7-2.4-1.7-3.3-3.1.1-2.7.8-5 2.1-7Z"></path>
  </svg>`;

const externalIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
    <path d="M15 3h6v6"></path>
    <path d="M10 14 21 3"></path>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
  </svg>`;

const mailIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
    <path d="m3 7 9 6 9-6"></path>
  </svg>`;

function renderFloatingContact(): string {
  return `
    <div id="floating-contact" class="fixed bottom-4 right-4 z-[88] sm:bottom-5 sm:right-5">
      <div
        id="floating-contact-panel"
        class="mb-2 hidden w-[min(calc(100vw-2rem),310px)] rounded-xl border border-white/15 bg-[#0d2740] p-2.5 text-[#e6f6ff] shadow-[0_18px_42px_rgba(0,0,0,0.45)]"
      >
        <div class="px-2 pb-2">
          <p class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7fe9ff]/75">Contact Tanne</p>
          <p class="mt-1 text-[13px] leading-snug text-[#c7ceef]">Choose the fastest way to ask about an account, exchange, or support.</p>
        </div>

        <button
          id="floating-contact-discord"
          type="button"
          class="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#e6f6ff] transition hover:bg-white/10"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#5865f2]/20 text-[#aeb8ff]">${discordIcon}</span>
            <span class="min-w-0">
              <span class="block">Discord</span>
              <span id="floating-contact-discord-label" class="block truncate text-[11px] font-medium text-[#c7ceef]">Add friend: ${CONTACT_DISCORD_USERNAME}</span>
            </span>
          </span>
          <span class="text-[11px] font-bold text-[#7fe9ff]">Open</span>
        </button>

        <a
          href="${CONTACT_EPICNPC_MESSAGE_URL}"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1 flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#e6f6ff] transition hover:bg-white/10"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#f6c44c]/18 text-[#f6c44c]">${externalIcon}</span>
            <span class="min-w-0">
              <span class="block">EpicNPC</span>
              <span class="block truncate text-[11px] font-medium text-[#c7ceef]">Send message to tanne</span>
            </span>
          </span>
          <span class="text-[11px] font-bold text-[#7fe9ff]">Open</span>
        </a>

        <a
          href="mailto:${CONTACT_EMAIL}?subject=Tanne%20Hub%20contact"
          class="mt-1 flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#e6f6ff] transition hover:bg-white/10"
        >
          <span class="flex min-w-0 items-center gap-2">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#7fe9ff]/16 text-[#7fe9ff]">${mailIcon}</span>
            <span class="min-w-0">
              <span class="block">Email</span>
              <span class="block truncate text-[11px] font-medium text-[#c7ceef]">${CONTACT_EMAIL}</span>
            </span>
          </span>
          <span class="text-[11px] font-bold text-[#7fe9ff]">Send</span>
        </a>
      </div>

      <button
        id="floating-contact-toggle"
        type="button"
        class="flex min-h-12 items-center gap-2 rounded-full border border-[#7fe9ff]/45 bg-[#0d2740] px-4 py-3 text-sm font-extrabold text-[#e6f6ff] shadow-[0_14px_34px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:bg-[#133756] active:translate-y-0"
        aria-expanded="false"
        aria-controls="floating-contact-panel"
      >
        <span class="grid h-8 w-8 place-items-center rounded-full bg-[#7fe9ff] text-[#0d2740]">${contactIcon}</span>
        <span class="hidden sm:inline">Contact</span>
      </button>
    </div>
  `;
}

function setFloatingContactOpen(open: boolean): void {
  const panel = document.querySelector<HTMLElement>("#floating-contact-panel");
  const toggle = document.querySelector<HTMLButtonElement>("#floating-contact-toggle");
  if (!panel || !toggle) return;
  panel.classList.toggle("hidden", !open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

export function initFloatingContact(): void {
  document.querySelector("#floating-contact")?.remove();
  document.body.insertAdjacentHTML("beforeend", renderFloatingContact());

  const wrap = document.querySelector<HTMLElement>("#floating-contact");
  const toggle = document.querySelector<HTMLButtonElement>("#floating-contact-toggle");
  const discordBtn = document.querySelector<HTMLButtonElement>("#floating-contact-discord");
  const discordLabel = document.querySelector<HTMLElement>("#floating-contact-discord-label");
  if (!wrap || !toggle || !discordBtn || !discordLabel) return;

  toggle.addEventListener("click", () => {
    setFloatingContactOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  discordBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_DISCORD_USERNAME);
      discordLabel.textContent = "Copied username, opening Discord";
      window.setTimeout(() => {
        discordLabel.textContent = `Add friend: ${CONTACT_DISCORD_USERNAME}`;
      }, 1400);
    } catch {
      discordLabel.textContent = `Add friend: ${CONTACT_DISCORD_USERNAME}`;
    }
    window.open(CONTACT_DISCORD_ADD_FRIEND_URL, "_blank", "noopener,noreferrer");
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setFloatingContactOpen(false);
  });

  window.addEventListener("click", (event) => {
    if (wrap.contains(event.target as Node)) return;
    setFloatingContactOpen(false);
  });
}
