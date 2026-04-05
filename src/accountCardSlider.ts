/** Gắn scroll + auto-advance cho slider nhiều ảnh (tắt khi reduced-motion / thẻ ngoài màn hình). */
const AUTO_SLIDE_MS = 5_000;
const COOLDOWN_AFTER_USER_SCROLL_MS = 12_000;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function bindAccountCardSliders(scope: ParentNode = document): void {
  scope.querySelectorAll<HTMLElement>(".account-card-media").forEach((media) => {
    const viewport = media.querySelector<HTMLElement>(".account-card-slider-viewport");
    if (!viewport || viewport.dataset.sliderInit === "1") return;
    const slides = viewport.querySelectorAll(".account-card-slide");
    if (slides.length <= 1) return;

    viewport.dataset.sliderInit = "1";

    let userScrollCooldownUntil = 0;
    let hoverPause = false;
    let focusPause = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const clearAuto = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const cleanupIfGone = () => {
      if (!viewport.isConnected) {
        clearAuto();
        io.disconnect();
      }
    };

    const syncDots = () => {
      const w = viewport.clientWidth || 1;
      const idx = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(viewport.scrollLeft / w)),
      );
      media.querySelectorAll<HTMLButtonElement>(".account-card-slider-dot").forEach((dot, i) => {
        const on = i === idx;
        dot.classList.toggle("account-card-slider-dot-active", on);
        dot.setAttribute("aria-current", on ? "true" : "false");
      });
    };

    const advanceAuto = () => {
      cleanupIfGone();
      if (!viewport.isConnected) return;
      if (prefersReducedMotion()) return;
      if (document.hidden) return;
      if (Date.now() < userScrollCooldownUntil) return;
      if (hoverPause || focusPause) return;

      const w = viewport.clientWidth || 1;
      const idx = Math.min(
        slides.length - 1,
        Math.max(0, Math.round(viewport.scrollLeft / w)),
      );
      const next = (idx + 1) % slides.length;
      viewport.scrollTo({ left: next * w, behavior: "auto" });
      requestAnimationFrame(syncDots);
    };

    const tryStartAuto = () => {
      if (prefersReducedMotion() || !viewport.isConnected) return;
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(advanceAuto, AUTO_SLIDE_MS);
    };

    viewport.addEventListener(
      "scroll",
      () => {
        userScrollCooldownUntil = Date.now() + COOLDOWN_AFTER_USER_SCROLL_MS;
        syncDots();
      },
      { passive: true },
    );

    media.addEventListener("mouseenter", () => {
      hoverPause = true;
    });
    media.addEventListener("mouseleave", () => {
      hoverPause = false;
    });
    media.addEventListener("focusin", () => {
      focusPause = true;
    });
    media.addEventListener("focusout", () => {
      focusPause = false;
    });

    const io = new IntersectionObserver(
      (entries) => {
        cleanupIfGone();
        if (!viewport.isConnected) return;
        const e = entries[0];
        const visible = !!e?.isIntersecting;
        if (visible && !prefersReducedMotion()) tryStartAuto();
        else clearAuto();
      },
      { root: null, threshold: 0.2 },
    );
    io.observe(media);

    requestAnimationFrame(syncDots);
  });
}
