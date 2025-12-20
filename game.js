const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== МУЗЫКА ===== */
const menuMusic = new Audio("menu.mp3");
const gameMusic = new Audio("game.mp3");
menuMusic.loop = true;
gameMusic.loop = true;
let musicStarted = false;

/* ===== ВРЕМЯ И РЕКОРД ===== */
const GAME_TIME = 60;
let timeLeft = GAME_TIME;
let timer = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

/* ===== ЗАГРУЗКА КАРТИНОК ===== */
const images = {};
const imageNames = [
  "background_menu",
  "background_game1",
  "collector",
  "snow",
  "gold_snow",
  "dead_snow",
  "BAM"
];

let loaded = 0;

imageNames.forEach(name => {
  const img = new Image();
  img.src = name + ".png";
  img.onload = () => {
    loaded++;
    console.log(`Загружено ${loaded}/${imageNames.length}: ${name}`);
  };
  images[name] = img;
});

/* ===== СОСТОЯНИЕ ИГРЫ ===== */
let gameState = "menu";
let score = 0;
let lives = 3;
let snowflakes = [];
let effects = [];

/* ===== КНОПКА ===== */
const startButton = {
  width: 300,
  height: 120,
  get x() { return canvas.width / 2 - this.width / 2; },
  get y() { return canvas.height / 2 + 100; }
};

/* ===== КЛАССЫ ===== */
class Snow {
  constructor(type) {
    this.type = type;
    this.size = 80;
    this.x = Math.random() * (canvas.width - this.size);
    this.y = -50;
    this.speed = 2 + Math.random() * 3;
  }
  update() { this.y += this.speed; }
  draw() {
    ctx.drawImage(images[this.type], this.x, this.y, this.size, this.size);
  }
}

class Effect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 15;
  }
  draw() {
    ctx.drawImage(images.BAM, this.x - 25, this.y - 25, 50, 50);
  }
}

/* ===== ЛОГИКА ===== */
function spawnSnow() {
  const r = Math.random();
  let type = "snow";
  if (r > 0.9) type = "gold_snow";
  else if (r < 0.15) type = "dead_snow";
  snowflakes.push(new Snow(type));
}

/* ===== СТАРТ ИГРЫ ===== */
function startGame() {
  score = 0;
  lives = 3;
  timeLeft = GAME_TIME;
  snowflakes = [];
  effects = [];

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) endGame();
  }, 1000);

  menuMusic.pause();
  gameMusic.currentTime = 0;
  gameMusic.play().catch(()=>{});
  gameState = "game";
}

/* ===== КОНЕЦ ИГРЫ ===== */
function endGame() {
  clearInterval(timer);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bestScore", bestScore);
  }

  gameMusic.pause();
  menuMusic.currentTime = 0;
  menuMusic.play().catch(()=>{});
  gameState = "menu";
}

/* ===== КЛИК ===== */
canvas.addEventListener("click", e => {
  const mx = e.clientX;
  const my = e.clientY;

  if (!musicStarted) {
    menuMusic.play().catch(()=>{});
    musicStarted = true;
  }

  if (gameState === "menu") {
    if (
      mx > startButton.x &&
      mx < startButton.x + startButton.width &&
      my > startButton.y &&
      my < startButton.y + startButton.height
    ) {
      startGame();
    }
    return;
  }

  snowflakes.forEach((s, i) => {
    if (
      mx > s.x && mx < s.x + s.size &&
      my > s.y && my < s.y + s.size
    ) {
      effects.push(new Effect(mx, my));
      if (s.type === "snow") score++;
      if (s.type === "gold_snow") score += 5;
      if (s.type === "dead_snow") lives--;
      snowflakes.splice(i, 1);
    }
  });

  if (lives <= 0) endGame();
});

/* ===== ЦИКЛ ===== */
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "menu") {
    ctx.drawImage(images.background_menu, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText("Рекорд: " + bestScore, 20, 50);

    ctx.drawImage(
      images.collector,
      startButton.x,
      startButton.y,
      startButton.width,
      startButton.height
    );
  }

  if (gameState === "game") {
    ctx.drawImage(images.background_game1, 0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.03) spawnSnow();

    snowflakes.forEach((s, i) => {
      s.update();
      s.draw();
      if (s.y > canvas.height) snowflakes.splice(i, 1);
    });

    effects.forEach((e, i) => {
      e.draw();
      e.life--;
      if (e.life <= 0) effects.splice(i, 1);
    });

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Очки: " + score, 20, 40);
    ctx.fillText("Жизни: " + lives, 20, 70);
    ctx.fillText("Время: " + timeLeft, 20, 100);
  }

  requestAnimationFrame(gameLoop);
}

/* ===== ЗАПУСК ЦИКЛА ===== */
requestAnimationFrame(gameLoop);
