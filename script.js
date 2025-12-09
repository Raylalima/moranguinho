// =======================
// 1) Tema (Light/Dark)
// =======================
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);

  if (theme === "dark") {
    themeIcon.classList.remove("bi-sun-fill");
    themeIcon.classList.add("bi-moon-fill");
  } else {
    themeIcon.classList.remove("bi-moon-fill");
    themeIcon.classList.add("bi-sun-fill");
  }

  localStorage.setItem("moranguinho_theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("moranguinho_theme");
  if (saved) return applyTheme(saved);
  applyTheme("light");
}

themeToggle.addEventListener("click", () => {
  const current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(current);
});

menuBtn.addEventListener("click", () => {
  mobileMenu.toggleAttribute("hidden");
});

// Fecha menu ao clicar em links
document.querySelectorAll(".mobile-link").forEach(link => {
  link.addEventListener("click", () => mobileMenu.setAttribute("hidden", ""));
});

// =======================
// 2) Personagens
// =======================
const characters = [
  { name: "Moranguinho", emoji: "🍓", color: "linear-gradient(135deg, #ff5fb8, #a08bff)", desc: "Doce e criativa." },
  { name: "Amora", emoji: "🌺", color: "linear-gradient(135deg, #7b6aff, #5ee6c5)", desc: "Cheia de ideias." },
  { name: "Framboesa", emoji: "🍒", color: "linear-gradient(135deg, #ff4fb1, #ff9bd8)", desc: "Energética e divertida." },
  { name: "Laranja Doce", emoji: "🍊", color: "linear-gradient(135deg, #ff9f3d, #ff5fb8)", desc: "Ilumina tudo." },
  { name: "Limãozinha", emoji: "🍋", color: "linear-gradient(135deg, #ffe05a, #5ee6c5)", desc: "Esperta e direta." },
  { name: "Mirtilo", emoji: "🍇", color: "linear-gradient(135deg, #6a5cff, #ff5fb8)", desc: "Organizada e gentil." },
  { name: "Pão de Mel", emoji: "🍯", color: "linear-gradient(135deg, #ffbd6a, #8a5cff)", desc: "Carinhoso e calmo." },
];

function renderCharacters() {
  const grid = document.getElementById("charactersGrid");
  grid.innerHTML = characters.map(c => `
    <article class="card">
      <div class="avatar" style="background:${c.color}">${c.emoji}</div>
      <div>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
      </div>
    </article>
  `).join("");
}

// =======================
// 3) Galeria
// =======================
function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  grid.innerHTML = characters.map(c => `
    <div class="g-item">
      <div class="g-top">
        <div class="g-badge" style="background:${c.color}">${c.emoji}</div>
        <div class="g-title">${c.name}</div>
      </div>
    </div>
  `).join("");
}

// =======================
// 4) Jogo da Memória
// =======================

const board = document.getElementById("memoryBoard");
const movesEl = document.getElementById("moves");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const winModal = document.getElementById("winModal");
const winText = document.getElementById("winText");
const closeModal = document.getElementById("closeModal");

let deck = [];
let first = null;
let second = null;
let lock = false;
let moves = 0;
let elapsed = 0;
let timerId = null;
let running = false;

const memCards = [
  { id: "straw", emoji: "🍓" },
  { id: "berry", emoji: "🌺" },
  { id: "rasp", emoji: "🍒" },
  { id: "orange", emoji: "🍊" },
  { id: "lemon", emoji: "🍋" },
  { id: "grape", emoji: "🍇" },
  { id: "honey", emoji: "🍯" },
  { id: "melon", emoji: "🍈" },
];

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function format(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function startTimer() {
  timerId = setInterval(() => {
    elapsed++;
    timerEl.textContent = format(elapsed);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
}

function makeDeck() {
  return shuffle(memCards.flatMap(c => [c, c]));
}

function renderBoard() {
  board.innerHTML = deck.map((card, i) => `
    <button class="mem-card" data-index="${i}" data-token="${card.id}">
      <span class="mem-face mem-front"></span>
      <span class="mem-face mem-back">${card.emoji}</span>
    </button>
  `).join("");

  document.querySelectorAll(".mem-card").forEach(card =>
    card.addEventListener("click", () => flip(card))
  );
}

function flip(card) {
  if (lock || card.dataset.state === "flipped") return;

  card.dataset.state = "flipped";

  if (!first) {
    first = card;
    return;
  }

  second = card;
  moves++;
  movesEl.textContent = moves;

  lock = true;

  if (first.dataset.token === second.dataset.token) {
    first.dataset.matched = "true";
    second.dataset.matched = "true";
    resetPair();
  } else {
    setTimeout(() => {
      first.dataset.state = "";
      second.dataset.state = "";
      resetPair();
    }, 600);
  }

  const remaining = [...document.querySelectorAll(".mem-card")].filter(c => !c.dataset.matched);
  if (remaining.length === 0) winGame();
}

function resetPair() {
  first = null;
  second = null;
  lock = false;
}

function winGame() {
  stopTimer();
  winText.textContent = `Você venceu em ${format(elapsed)} com ${moves} jogadas.`;
  winModal.setAttribute("aria-hidden", "false");
}

startBtn.addEventListener("click", () => {
  deck = makeDeck();
  moves = 0;
  elapsed = 0;
  movesEl.textContent = 0;
  timerEl.textContent = "00:00";
  resetBtn.disabled = false;

  renderBoard();
  stopTimer();
  startTimer();
});

resetBtn.addEventListener("click", () => startBtn.click());

closeModal.addEventListener("click", () => {
  winModal.setAttribute("aria-hidden", "true");
  startBtn.click();
});

// =======================
// 5) Boot
// =======================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderCharacters();
  renderGallery();
});
