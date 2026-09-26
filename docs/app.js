const GOAL_KEY = "savings.goalAmount";
const CURRENT_KEY = "savings.currentAmount";

const goalInput = document.getElementById("goal-amount");
const currentInput = document.getElementById("current-amount");
const differenceEl = document.getElementById("difference");
const achievementRateEl = document.getElementById("achievement-rate");
const progressBarEl = document.querySelector(".progress-bar");
const progressBarFillEl = document.getElementById("progress-bar-fill");

function formatYen(amount) {
  return `${amount.toLocaleString("ja-JP")}円`;
}

function render() {
  const goal = Number(goalInput.value);
  const current = Number(currentInput.value);

  if (!goalInput.value || !currentInput.value || Number.isNaN(goal) || Number.isNaN(current)) {
    differenceEl.textContent = "-";
    achievementRateEl.textContent = "-";
    setProgressBar(0);
    return;
  }

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

function setProgressBar(rate) {
  const clampedRate = Math.min(100, Math.max(0, rate));
  progressBarFillEl.style.width = `${clampedRate}%`;
  progressBarEl.setAttribute("aria-valuenow", Math.round(clampedRate));
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
}

goalInput.addEventListener("input", () => {
  save();
  render();
});
currentInput.addEventListener("input", () => {
  save();
  render();
});

load();
render();
