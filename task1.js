
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const MAX_LIVES = 3;

let currentNumber;
let lives;
let streak;
let bestStreak = 0;
let gameOver;

const numberElement = document.querySelector("#number");
const livesElement = document.querySelector("#lives");
const streakElement = document.querySelector("#streak");
const bestElement = document.querySelector("#best");
const messageElement = document.querySelector("#message");

const higherButton = document.querySelector("#higher");
const lowerButton = document.querySelector("#lower");
const restartButton = document.querySelector("#restart");

function randomNumber() {
  return Math.floor(
    Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)
  ) + MIN_NUMBER;
}

function render() {
  numberElement.textContent = currentNumber;
  livesElement.textContent = lives;
  streakElement.textContent = streak;
  bestElement.textContent = bestStreak;

  higherButton.disabled = gameOver;
  lowerButton.disabled = gameOver;
}

function showMessage(text, type = "") {
  messageElement.textContent = text;
  messageElement.className = "message";

  if (type === "success" || type === "error") {
    messageElement.classList.add(type);
  }
}

function makeGuess(direction) {
  if (gameOver) {
    showMessage("Game is over. Restart to play again.", "error");
    return;
  }

  if (direction !== "higher" && direction !== "lower") {
    showMessage("Invalid move!", "error");
    return;
  }

  const nextNumber = randomNumber();

  const correct =
    (direction === "higher" && nextNumber >= currentNumber) ||
    (direction === "lower" && nextNumber <= currentNumber);

  if (correct === true) {
    streak++;

    if (streak > bestStreak) {
      bestStreak = streak;
    }

    showMessage(
      `Correct! The next number was ${nextNumber}.`,
      "success"
    );
  } else {
    lives--;
    streak = 0;

    showMessage(
      `Wrong! The next number was ${nextNumber}.`,
      "error"
    );
  }

  currentNumber = nextNumber;

  if (lives === 0) {
    gameOver = true;
    showMessage(
      `Game over! Your best streak was ${bestStreak}.`,
      "error"
    );
  }

  render();
}

function restartGame() {
  currentNumber = randomNumber();
  lives = MAX_LIVES;
  streak = 0;
  gameOver = false;

  showMessage("Make your first guess!");
  render();
}

higherButton.addEventListener("click", function () {
  makeGuess("higher");
});

lowerButton.addEventListener("click", function () {
  makeGuess("lower");
});

restartButton.addEventListener("click", restartGame);


restartGame();
