/** Gan hanh vi CTA: mo thu chao mung va cuon toi noi dung. */
export function initWelcomeLetter(): void {
  const trigger = document.querySelector<HTMLButtonElement>("#read-before-explore");
  const letter = document.querySelector<HTMLElement>("#welcome-letter");
  const closeButton = document.querySelector<HTMLButtonElement>("#close-welcome-letter");

  if (!trigger || !letter) {
    return;
  }

  let isClosing = false;

  const openLetter = () => {
    if (!letter.classList.contains("hidden") || isClosing) {
      return;
    }
    letter.classList.remove("hidden");
    letter.classList.remove("welcome-letter-closing");
    letter.classList.remove("welcome-letter-open");
    void letter.offsetWidth;
    letter.classList.add("welcome-letter-open");
  };

  const closeLetter = () => {
    if (letter.classList.contains("hidden") || isClosing) {
      return;
    }
    isClosing = true;
    letter.classList.remove("welcome-letter-open");
    letter.classList.add("welcome-letter-closing");

    window.setTimeout(() => {
      letter.classList.add("hidden");
      letter.classList.remove("welcome-letter-closing");
      isClosing = false;
    }, 420);
  };

  trigger.addEventListener("click", openLetter);
  closeButton?.addEventListener("click", closeLetter);

  // Bấm vào vùng nền mờ thì đóng thư.
  letter.addEventListener("click", (event) => {
    if (event.target === letter) {
      closeLetter();
    }
  });

  // Nếu người dùng cuộn trang, tự động đóng thư.
  window.addEventListener(
    "scroll",
    () => {
      if (!letter.classList.contains("hidden")) {
        closeLetter();
      }
    },
    { passive: true }
  );
}
