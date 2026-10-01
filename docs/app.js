const GOAL_KEY = "savings.goalAmount";
const CURRENT_KEY = "savings.currentAmount";

const goalInput = document.getElementById("goal-amount");
const currentInput = document.getElementById("current-amount");
const differenceEl = document.getElementById("difference");
const achievementRateEl = document.getElementById("achievement-rate");
const mugContainerEl = document.querySelector(".mug-container");
const mugFillEl = document.getElementById("mug-fill");
const mugFoamEl = document.getElementById("mug-foam");

const MUG_TOP = 15;
const MUG_BOTTOM = 145;
const MUG_HEIGHT = MUG_BOTTOM - MUG_TOP;
const MUG_FOAM_HEIGHT = 16;
const previousDiffEl = document.getElementById("previous-diff");
const diffInput = document.getElementById("diff-amount");
const diffPreviewEl = document.getElementById("diff-preview");
const diffSaveButton = document.getElementById("diff-save-button");
const goalAmountErrorEl = document.getElementById("goal-amount-error");
const currentAmountErrorEl = document.getElementById("current-amount-error");

let previousCurrentAmount = null;

function formatYen(amount) {
  return `${amount.toLocaleString("ja-JP")}円`;
}

function validateAmount(value) {
  if (value === "") {
    return { valid: true, amount: null };
  }

  const amount = Number(value);
  if (Number.isNaN(amount) || !Number.isInteger(amount) || amount < 0) {
    return { valid: false, amount: null };
  }

  return { valid: true, amount };
}

function render() {
  const goalCheck = validateAmount(goalInput.value);
  const currentCheck = validateAmount(currentInput.value);

  goalAmountErrorEl.textContent = goalCheck.valid ? "" : "0円以上の整数で入力してください";
  currentAmountErrorEl.textContent = currentCheck.valid ? "" : "0円以上の整数で入力してください";

  renderPreviousDiff(currentCheck.valid ? currentCheck.amount : null);

  if (goalCheck.amount === null || currentCheck.amount === null) {
    differenceEl.textContent = "-";
    achievementRateEl.textContent = "-";
    setProgressBar(0);
    return;
  }

  const goal = goalCheck.amount;
  const current = currentCheck.amount;

  differenceEl.textContent = formatYen(goal - current);

  if (goal <= 0) {
    achievementRateEl.textContent = "-";
    setProgressBar(0);
  } else {
    const rate = (current / goal) * 100;
    achievementRateEl.textContent = `${Math.round(rate)}%`;
    setProgressBar(rate);
  }
}

function renderPreviousDiff(current) {
  previousDiffEl.classList.remove("increase", "decrease");

  if (previousCurrentAmount === null || current === null) {
    previousDiffEl.textContent = "";
    return;
  }

  const diff = current - previousCurrentAmount;

  if (diff > 0) {
    previousDiffEl.textContent = `前回より +${diff.toLocaleString("ja-JP")}円`;
    previousDiffEl.classList.add("increase");
  } else if (diff < 0) {
    previousDiffEl.textContent = `前回より -${Math.abs(diff).toLocaleString("ja-JP")}円`;
    previousDiffEl.classList.add("decrease");
  } else {
    previousDiffEl.textContent = "前回と同じ";
  }
}

function getDiffPlan() {
  const currentCheck = validateAmount(currentInput.value);

  if (!diffInput.value) {
    return { message: "", disabled: true };
  }

  if (currentCheck.amount === null) {
    return { message: "先に現在の貯金額を入力してください", disabled: true };
  }

  const diff = Number(diffInput.value);
  if (Number.isNaN(diff) || !Number.isInteger(diff)) {
    return { message: "整数で入力してください", disabled: true };
  }

  const newTotal = currentCheck.amount + diff;
  if (newTotal < 0) {
    return { message: "合計金額が0円未満になるため保存できません", disabled: true };
  }

  return { message: `→ 新しい合計金額: ${formatYen(newTotal)}`, disabled: false, newTotal };
}

function updateDiffPreview() {
  const plan = getDiffPlan();
  diffPreviewEl.textContent = plan.message;
  diffSaveButton.disabled = plan.disabled;
}

function saveDiff() {
  const plan = getDiffPlan();
  if (plan.disabled) {
    return;
  }

  currentInput.value = String(plan.newTotal);
  save();
  render();

  diffInput.value = "";
  diffPreviewEl.textContent = "";
  diffSaveButton.disabled = true;
}

function setProgressBar(rate) {
  const clampedRate = Math.min(100, Math.max(0, rate));

  const fillHeight = (clampedRate / 100) * MUG_HEIGHT;
  const fillY = MUG_BOTTOM - fillHeight;
  mugFillEl.setAttribute("y", fillY);
  mugFillEl.setAttribute("height", fillHeight);

  const foamHeight = Math.min(MUG_FOAM_HEIGHT, fillHeight);
  mugFoamEl.setAttribute("y", fillY);
  mugFoamEl.setAttribute("height", foamHeight);

  mugContainerEl.setAttribute("aria-valuenow", Math.round(clampedRate));
}

function save() {
  localStorage.setItem(GOAL_KEY, goalInput.value);
  localStorage.setItem(CURRENT_KEY, currentInput.value);
}

function load() {
  const savedGoal = localStorage.getItem(GOAL_KEY);
  const savedCurrent = localStorage.getItem(CURRENT_KEY);
  if (savedGoal !== null) goalInput.value = savedGoal;
  if (savedCurrent !== null) currentInput.value = savedCurrent;
  previousCurrentAmount = savedCurrent !== null && savedCurrent !== "" ? Number(savedCurrent) : null;
}

goalInput.addEventListener("input", () => {
  save();
  render();
});
currentInput.addEventListener("input", () => {
  save();
  render();
  updateDiffPreview();
});
diffInput.addEventListener("input", updateDiffPreview);
diffSaveButton.addEventListener("click", saveDiff);

load();
render();
