import confetti from "canvas-confetti";
import type { ConfettiOptions } from "canvas-confetti";

const palette = ["#7fe9ff", "#fde68a", "#c4b5fd", "#fb923c", "#f472b6", "#86efac", "#ffffff"];

/** Paper confetti burst when a Raid account listing is saved successfully. */
export function fireAccountListingConfetti(): void {
  const burst = (opts: ConfettiOptions) => {
    void confetti({ disableForReducedMotion: true, ...opts });
  };

  burst({
    particleCount: 72,
    spread: 62,
    origin: { x: 0.5, y: 0.42 },
    colors: palette,
    ticks: 320,
    gravity: 1.02,
    scalar: 1,
    startVelocity: 38,
  });

  window.setTimeout(() => {
    burst({
      particleCount: 36,
      angle: 55,
      spread: 50,
      origin: { x: 0.08, y: 0.62 },
      colors: palette,
    });
    burst({
      particleCount: 36,
      angle: 125,
      spread: 50,
      origin: { x: 0.92, y: 0.62 },
      colors: palette,
    });
  }, 200);
}
