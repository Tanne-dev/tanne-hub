function updateCalculator(calculator: HTMLElement): void {
  const target = Number.parseInt(calculator.dataset.target || "100", 10);
  const total = Number.parseInt(calculator.dataset.total || "150", 10);
  const isVi = calculator.dataset.locale === "vi";
  const checked = [...calculator.querySelectorAll<HTMLInputElement>(".fragment-calc-checkbox:checked")];
  const score = checked.reduce((sum, checkbox) => {
    return sum + Number.parseInt(checkbox.dataset.fragments || "0", 10);
  }, 0);
  const remaining = Math.max(target - score, 0);
  const skipped = Math.max(total - score, 0);
  const progress = Math.min(score / target, 1) * 100;

  const scoreNode = calculator.querySelector<HTMLElement>(".fragment-calc-score");
  const progressNode = calculator.querySelector<HTMLElement>(".fragment-calc-progress");
  const statusNode = calculator.querySelector<HTMLElement>(".fragment-calc-status");
  const detailNode = calculator.querySelector<HTMLElement>(".fragment-calc-detail");

  if (scoreNode) scoreNode.textContent = String(score);
  if (progressNode) progressNode.style.width = `${progress}%`;

  if (statusNode) {
    statusNode.textContent =
      score >= target
        ? isVi
          ? `Đã đủ summon. Bạn dư ${score - target} fragments so với mục tiêu.`
          : `Ready to summon. You are ${score - target} fragments above the goal.`
        : isVi
          ? `Còn thiếu ${remaining} fragments.`
          : `${remaining} fragments still needed.`;
    statusNode.classList.toggle("text-[#7fe9ff]", score >= target);
    statusNode.classList.toggle("text-[#ffd58a]", score < target);
  }

  if (detailNode) {
    detailNode.textContent =
      score >= target
        ? isVi
          ? `Bạn có thể bỏ qua khoảng ${skipped} fragments trên toàn lịch. Nhớ kiểm tra điểm yêu cầu trong game trước khi dùng shard.`
          : `You can skip about ${skipped} fragments from the full calendar. Check in-game point requirements before spending shards.`
        : isVi
          ? "Hãy thêm các mốc dễ trước, rồi mới quyết định có cần Summon Rush hoặc Champion Chase không."
          : "Add more safe events first, then decide if Summon Rush or Champion Chase is needed.";
  }
}

function applyCalculatorAction(calculator: HTMLElement, action: string): void {
  const checkboxes = [...calculator.querySelectorAll<HTMLInputElement>(".fragment-calc-checkbox")];

  for (const checkbox of checkboxes) {
    const group = checkbox.dataset.group;
    if (action === "clear") checkbox.checked = false;
    if (action === "all") checkbox.checked = true;
    if (action === "safe") checkbox.checked = group === "low";
    if (action === "no-summon") checkbox.checked = group !== "summon";
  }

  updateCalculator(calculator);
}

export function bindFragmentEventCalculators(root: ParentNode = document): void {
  const calculators = [...root.querySelectorAll<HTMLElement>(".fragment-calc")];
  for (const calculator of calculators) {
    updateCalculator(calculator);
  }
}

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains("fragment-calc-checkbox")) return;
  const calculator = target.closest<HTMLElement>(".fragment-calc");
  if (!calculator) return;
  updateCalculator(calculator);
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest<HTMLButtonElement>("[data-fragment-calc-action]");
  if (!button) return;
  const calculator = button.closest<HTMLElement>(".fragment-calc");
  if (!calculator) return;
  applyCalculatorAction(calculator, button.dataset.fragmentCalcAction || "clear");
});
