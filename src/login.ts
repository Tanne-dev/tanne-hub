import {
  authenticateMemberRemote,
  getCurrentMemberRemote,
  isSupabaseReady,
  registerMemberRemote,
  signOutRemote,
} from "./supabase";

type MemberSession = {
  userId: string;
  email: string;
  displayName?: string;
  role: "member" | "admin";
  loggedInAt: number;
};

const MEMBER_SESSION_KEY = "tanne-member-session";

function launchFireworks(): void {
  const layer = document.createElement("div");
  layer.className = "pointer-events-none fixed inset-0 z-[70] overflow-hidden";
  document.body.appendChild(layer);

  const colors = ["#7fe9ff", "#ffcc33", "#ff6b6b", "#7cff95", "#c58dff", "#ffffff"];
  const particleCount = 90;
  const originX = window.innerWidth * 0.5;
  const originY = window.innerHeight * 0.45;

  for (let i = 0; i < particleCount; i += 1) {
    const dot = document.createElement("span");
    const size = 4 + Math.random() * 6;
    const angle = Math.random() * Math.PI * 2;
    const distance = 110 + Math.random() * 260;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance + 90;

    dot.style.position = "absolute";
    dot.style.left = `${originX}px`;
    dot.style.top = `${originY}px`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.borderRadius = "999px";
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    dot.style.boxShadow = "0 0 10px rgba(255,255,255,0.45)";
    layer.appendChild(dot);

    dot.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0 },
      ],
      {
        duration: 900 + Math.random() * 500,
        easing: "cubic-bezier(0.2, 0.85, 0.35, 1)",
        fill: "forwards",
      },
    );
  }

  window.setTimeout(() => {
    layer.remove();
  }, 1600);
}

function showBossWelcomeToast(): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed right-4 top-4 z-[80] rounded-lg border border-[#7fe9ff]/45 bg-[#0d2740] px-4 py-3 text-sm font-semibold text-[#e6f6ff] shadow-[0_12px_30px_rgba(0,0,0,0.35)]";
  toast.textContent = "Welcome back, Boss";
  document.body.appendChild(toast);

  toast.animate(
    [
      { opacity: 0, transform: "translateY(-8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 220, easing: "ease-out", fill: "forwards" },
  );

  window.setTimeout(() => {
    toast.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      { duration: 220, easing: "ease-in", fill: "forwards" },
    );
    window.setTimeout(() => toast.remove(), 240);
  }, 2200);
}

async function authenticateMember(
  email: string,
  password: string,
): Promise<{ ok: boolean; session?: MemberSession }> {
  if (!email || !password) return { ok: false };
  const result = await authenticateMemberRemote(email, password);
  if (!result.ok || !result.session) return { ok: false };
  return {
    ok: true,
    session: {
      userId: result.session.userId,
      email: result.session.email,
      displayName: result.session.displayName,
      role: result.session.role,
      loggedInAt: Date.now(),
    },
  };
}

function getSession(): MemberSession | null {
  const raw = localStorage.getItem(MEMBER_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberSession;
  } catch {
    return null;
  }
}

/** Dùng cho header / badge: đã đăng nhập và role admin. */
export function isMemberAdmin(): boolean {
  return getSession()?.role === "admin";
}

/** Đã đăng nhập thành viên (member hoặc admin). */
export function isMemberLoggedIn(): boolean {
  return getSession() !== null;
}

export function getLoggedInMemberEmail(): string | null {
  const s = getSession();
  const e = s?.email?.trim();
  return e ? e : null;
}

/** Mở modal đăng nhập (ví dụ từ trang thanh toán / giỏ hàng). */
export function requestLoginModal(): void {
  if (getSession()) return;
  const modal = document.querySelector<HTMLElement>("#login-modal");
  const emailInput = document.querySelector<HTMLInputElement>("#login-email");
  if (!modal || !emailInput) return;
  modal.classList.remove("hidden");
  emailInput.focus();
}

function setSession(session: MemberSession): void {
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("tanne-auth-changed"));
}

function clearSession(): void {
  localStorage.removeItem(MEMBER_SESSION_KEY);
  window.dispatchEvent(new CustomEvent("tanne-auth-changed"));
}

export function initLogin(): void {
  const openBtn = document.querySelector<HTMLButtonElement>("#open-login-modal");
  const accountMenuWrap = document.querySelector<HTMLElement>("#account-menu-wrap");
  const accountCaret = document.querySelector<HTMLElement>("#account-menu-caret");
  const accountMenu = document.querySelector<HTMLElement>("#account-options-menu");
  const logoutOption = document.querySelector<HTMLButtonElement>("#account-logout-option");
  const closeBtn = document.querySelector<HTMLButtonElement>("#close-login-modal");
  const modal = document.querySelector<HTMLElement>("#login-modal");
  const overlay = document.querySelector<HTMLElement>("#login-modal-overlay");
  const form = document.querySelector<HTMLFormElement>("#login-form");
  const emailInput = document.querySelector<HTMLInputElement>("#login-email");
  const passwordInput = document.querySelector<HTMLInputElement>("#login-password");
  const loginPasswordToggle = document.querySelector<HTMLInputElement>("#toggle-login-passwords");
  const feedback = document.querySelector<HTMLElement>("#login-feedback");
  const submitBtn = document.querySelector<HTMLButtonElement>("#login-submit");
  const loginLabel = document.querySelector<HTMLElement>("#login-btn-label");
  const accountMenuIdentity = document.querySelector<HTMLElement>("#account-menu-identity");
  const accountMenuIdentityRole = document.querySelector<HTMLElement>("#account-menu-identity-role");
  const accountMenuIdentityDetail = document.querySelector<HTMLElement>("#account-menu-identity-detail");
  const accountAdminDashboardSubmenu = document.querySelector<HTMLElement>(
    "#account-admin-dashboard-submenu",
  );
  const registerForm = document.querySelector<HTMLFormElement>("#register-email-form");
  const registerPanel = document.querySelector<HTMLElement>("#register-panel");
  const toggleRegisterBtn = document.querySelector<HTMLButtonElement>("#toggle-register-panel");
  const registerEmailInput = document.querySelector<HTMLInputElement>("#register-email-input");
  const registerPasswordInput = document.querySelector<HTMLInputElement>("#register-password-input");
  const registerPasswordConfirmInput = document.querySelector<HTMLInputElement>(
    "#register-password-confirm-input",
  );
  const registerPasswordToggle = document.querySelector<HTMLInputElement>("#toggle-register-passwords");
  const registerFeedback = document.querySelector<HTMLElement>("#register-email-feedback");
  const registerSubmit = document.querySelector<HTMLButtonElement>("#register-email-submit");

  if (
    !openBtn ||
    !accountMenuWrap ||
    !accountCaret ||
    !accountMenu ||
    !logoutOption ||
    !modal ||
    !form ||
    !emailInput ||
    !passwordInput ||
    !loginPasswordToggle ||
    !feedback ||
    !submitBtn ||
    !loginLabel ||
    !registerForm ||
    !registerPanel ||
    !toggleRegisterBtn ||
    !registerEmailInput ||
    !registerPasswordInput ||
    !registerPasswordConfirmInput ||
    !registerPasswordToggle ||
    !registerFeedback ||
    !registerSubmit
  )
    return;

  const syncLoginLabel = () => {
    const session = getSession();
    if (!session) {
      loginLabel.textContent = "Log in";
      openBtn.removeAttribute("aria-label");
      accountCaret.classList.add("hidden");
      accountMenu.classList.add("hidden");
      accountAdminDashboardSubmenu?.classList.add("hidden");
      accountMenuIdentity?.classList.add("hidden");
      return;
    }
    const identityLine =
      session.displayName?.trim() || session.email;
    accountMenuIdentity?.classList.remove("hidden");
    if (accountMenuIdentityRole) {
      accountMenuIdentityRole.textContent =
        session.role === "admin" ? "Admin" : "Member";
    }
    if (accountMenuIdentityDetail) {
      accountMenuIdentityDetail.textContent = identityLine;
      accountMenuIdentityDetail.title = session.email;
    }
    accountAdminDashboardSubmenu?.classList.toggle("hidden", session.role !== "admin");
    accountCaret.classList.remove("hidden");
    loginLabel.textContent = session.role === "admin" ? "Admin" : "Member";
    openBtn.setAttribute(
      "aria-label",
      `Account menu — ${session.role === "admin" ? "Admin" : "Member"}, ${identityLine}`,
    );
  };

  const hideAccountMenu = () => {
    accountMenu.classList.add("hidden");
    accountCaret.classList.remove("-rotate-180");
  };

  const hideModal = () => {
    modal.classList.add("hidden");
    feedback.classList.add("hidden");
    feedback.textContent = "";
    registerFeedback.classList.add("hidden");
    registerFeedback.textContent = "";
    registerFeedback.className = "hidden rounded-md px-3 py-2 text-xs";
    form.reset();
    registerForm.reset();
    passwordInput.type = "password";
    registerPasswordInput.type = "password";
    registerPasswordConfirmInput.type = "password";
    loginPasswordToggle.checked = false;
    registerPasswordToggle.checked = false;
    registerPanel.classList.add("hidden");
    toggleRegisterBtn.textContent = "Register account";
    hideAccountMenu();
  };

  const showModal = () => {
    const session = getSession();
    if (session) {
      const willOpen = accountMenu.classList.contains("hidden");
      accountMenu.classList.toggle("hidden", !willOpen);
      accountCaret.classList.toggle("-rotate-180", willOpen);
      return;
    }
    hideAccountMenu();
    modal.classList.remove("hidden");
    emailInput.focus();
  };

  openBtn.addEventListener("click", showModal);
  loginPasswordToggle.addEventListener("change", () => {
    passwordInput.type = loginPasswordToggle.checked ? "text" : "password";
  });
  registerPasswordToggle.addEventListener("change", () => {
    const type = registerPasswordToggle.checked ? "text" : "password";
    registerPasswordInput.type = type;
    registerPasswordConfirmInput.type = type;
  });
  toggleRegisterBtn.addEventListener("click", () => {
    const willOpen = registerPanel.classList.contains("hidden");
    registerPanel.classList.toggle("hidden", !willOpen);
    toggleRegisterBtn.textContent = willOpen ? "Hide register form" : "Register account";
    if (willOpen) registerEmailInput.focus();
  });
  logoutOption.addEventListener("click", async () => {
    await signOutRemote();
    clearSession();
    syncLoginLabel();
    hideAccountMenu();
  });

  closeBtn?.addEventListener("click", hideModal);
  overlay?.addEventListener("click", hideModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      hideModal();
    }
  });
  window.addEventListener("click", (event) => {
    if (accountMenu.classList.contains("hidden")) return;
    const target = event.target as Node;
    if (!accountMenuWrap.contains(target)) {
      hideAccountMenu();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.classList.add("hidden");

    if (!isSupabaseReady()) {
      feedback.textContent =
        "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
      feedback.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const authResult = await authenticateMember(email, password);
    if (!authResult.ok || !authResult.session) {
      feedback.textContent = "Invalid credentials. Please try again.";
      feedback.classList.remove("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
      return;
    }

    setSession(authResult.session);
    if (authResult.session.role === "admin") {
      showBossWelcomeToast();
    }
    syncLoginLabel();
    hideAccountMenu();
    hideModal();
    submitBtn.disabled = false;
    submitBtn.textContent = "Log in";

    if (window.location.search.includes("page=dashboard")) {
      window.location.reload();
    }
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = registerEmailInput.value.trim().toLowerCase();
    const password = registerPasswordInput.value;
    const confirmPassword = registerPasswordConfirmInput.value;
    if (!email) return;
    if (password.length < 6) {
      registerFeedback.textContent = "Password must be at least 6 characters.";
      registerFeedback.className = "rounded-md bg-red-900/35 px-3 py-2 text-xs text-red-200";
      return;
    }
    if (password !== confirmPassword) {
      registerFeedback.textContent = "Password confirmation does not match.";
      registerFeedback.className = "rounded-md bg-red-900/35 px-3 py-2 text-xs text-red-200";
      return;
    }

    registerSubmit.disabled = true;
    if (!isSupabaseReady()) {
      registerFeedback.textContent =
        "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
      registerFeedback.className = "rounded-md bg-amber-900/35 px-3 py-2 text-xs text-amber-200";
      registerSubmit.disabled = false;
      return;
    }

    registerMemberRemote(email, password)
      .then((result) => {
        if (!result.ok) {
          registerFeedback.textContent = result.error ?? "Registration failed.";
          registerFeedback.className = "rounded-md bg-red-900/35 px-3 py-2 text-xs text-red-200";
          return;
        }

        registerFeedback.textContent = "Member account registered successfully.";
        registerFeedback.className = "rounded-md bg-green-900/35 px-3 py-2 text-xs text-green-200";
        launchFireworks();
        registerForm.reset();
        window.setTimeout(() => {
          if (modal.classList.contains("hidden")) return;
          registerPanel.classList.add("hidden");
          toggleRegisterBtn.textContent = "Register account";
          registerFeedback.classList.add("hidden");
          registerFeedback.textContent = "";
          registerFeedback.className = "hidden rounded-md px-3 py-2 text-xs";
          emailInput.focus();
        }, 2000);
      })
      .catch(() => {
        registerFeedback.textContent = "Registration failed. Please try again.";
        registerFeedback.className = "rounded-md bg-red-900/35 px-3 py-2 text-xs text-red-200";
      })
      .finally(() => {
        registerSubmit.disabled = false;
      });
  });

  void getCurrentMemberRemote().then((remoteSession) => {
    if (remoteSession) {
      setSession({
        userId: remoteSession.userId,
        email: remoteSession.email,
        displayName: remoteSession.displayName,
        role: remoteSession.role,
        loggedInAt: Date.now(),
      });
    } else {
      clearSession();
    }
    syncLoginLabel();
  });
}
