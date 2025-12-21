const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================== GLOBAL ================== */
let globalState = "menu1";

/* ================== IMAGES ================== */
const images = {};
const imageNames = [
  "background_menu",
  "background_game1",
  "background_game2",
  "collector",
  "snow",
  "gold_snow",
  "dead_snow",
  "deliver",
  "player_stand",
  "player_go_left",
  "player_go_right",
  "player_go_up",
  "player_go_down",
  "house_red",
  "house_green",
  "house_blue",
  "error_house",
  "present_red",
  "present_green",
  "present_blue"
];

let imagesLoaded = 0;

imageNames.forEach(name => {
  const img = new Image();
  img.src = name + ".png";
  img.onload = () => imagesLoaded++;
  images[name] = img;
});

/* ================== BUTTONS ================== */
const startButton1 = {
  width: 300,
  height: 150,
  get x() { return canvas.width / 2 - this.width / 2 },
  get y() { return canvas.height / 2 - this.height / 2 }
};

const startButton2 = {
  width: 300,
  height: 120,
  get x() { return canvas.width / 2 - this.width / 2 },
  get y() { return canvas.height / 2 - this.height / 2 }
};

/* ================== GAME 1 ================== */
let game1Timer = 5; // коротко, чтобы точно дойти до game2
let game1Interval = null;

function startGame1() {
  game1Timer = 5;
  clearInterval(game1Interval);
  game1Interval = setInterval(() => {
    game1Timer--;
    if (game1Timer <= 0) {
      clearInterval(game1Interval);
      globalState = "menu2";
    }
  }, 1000);
  globalState = "game1";
}

/* ================== GAME 2 ================== */
let player = {
  x: 200,
  y: 200,
  w: 60,
  h: 60,
  speed: 4,
  dir: "stand",
  hasPresent: null
};

let presents = [];
let houses = [];
let score2 = 0;
const keys = {};

function initGame2() {
  player.x = 200;
  player.y = 200;
  player.hasPresent = null;
  score2 = 0;

  presents = [
    { x: 100, y: 200, color: "red" },
    { x: 400, y: 200, color: "green" },
    { x: 600, y: 200, color: "blue" }
  ];

  houses = [
    { x: 100, y: 50, color: "red", type: "normal" },
    { x: 400, y: 50, color: "green", type: "normal" },
    { x: 700, y: 50, color: "blue", type: "normal" },
    { x: 350, y: 350, type: "error" }
  ];
}

/* ================== INPUT ================== */
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("pointerdown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (globalState === "menu1") {
    if (mx > startButton1.x && mx < startButton1.x + startButton1.width &&
        my > startButton1.y && my < startButton1.y + startButton1.height) {
      startGame1();
    }
  }

  if (globalState === "menu2") {
    if (mx > startButton2.x && mx < startButton2.x + startButton2.width &&
        my > startButton2.y && my < startButton2.y + startButton2.height) {
      initGame2();
      globalState = "game2";
    }
  }
});

canvas.addEventListener("pointerup", () => {
  if (globalState !== "game2") return;
  if (!player.hasPresent) return;

  houses.forEach(h => {
    if (player.x < h.x + 70 && player.x + player.w > h.x &&
        player.y < h.y + 70 && player.y + player.h > h.y) {
      if (h.type === "normal" && h.color === player.hasPresent) {
        score2++;
        player.hasPresent = null;
      }
      if (h.type === "error") {
        globalState = "end";
      }
    }
  });
});

/* ================== GAME LOOP ================== */
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (imagesLoaded < imageNames.length) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Загрузка...", canvas.width / 2 - 80, canvas.height / 2);
    requestAnimationFrame(gameLoop);
    return;
  }

  // DEBUG STATE
  ctx.fillStyle = "red";
  ctx.font = "16px Arial";
  ctx.fillText("STATE: " + globalState, 20, 20);

  if (globalState === "menu1") {
    ctx.drawImage(images.background_menu, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.collector, startButton1.x, startButton1.y,
      startButton1.width, startButton1.height);
  }

  if (globalState === "game1") {
    ctx.drawImage(images.background_game1, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Игра 1: " + game1Timer, canvas.width / 2 - 100, canvas.height / 2);
  }

  if (globalState === "menu2") {
    ctx.drawImage(images.background_game2, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.deliver, startButton2.x, startButton2.y,
      startButton2.width, startButton2.height);
  }

  if (globalState === "game2") {
    ctx.drawImage(images.background_game2, 0, 0, canvas.width, canvas.height);

    if (keys.a || keys.ArrowLeft) { player.x -= player.speed; player.dir = "go_left"; }
    else if (keys.d || keys.ArrowRight) { player.x += player.speed; player.dir = "go_right"; }
    else if (keys.w || keys.ArrowUp) { player.y -= player.speed; player.dir = "go_up"; }
    else if (keys.s || keys.ArrowDown) { player.y += player.speed; player.dir = "go_down"; }
    else player.dir = "stand";

    presents.forEach((p, i) => {
      ctx.drawImage(images["present_" + p.color], p.x, p.y, 50, 50);
      if (!player.hasPresent &&
          player.x < p.x + 50 && player.x + player.w > p.x &&
          player.y < p.y + 50 && player.y + player.h > p.y) {
        player.hasPresent = p.color;
        presents.splice(i, 1);
      }
    });

    houses.forEach(h => {
      ctx.drawImage(
        h.type === "normal" ? images["house_" + h.color] : images.error_house,
        h.x, h.y, 70, 70
      );
    });

    ctx.drawImage(images["player_" + player.dir], player.x, player.y, player.w, player.h);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText("Очки: " + score2, 20, 50);
  }

  if (globalState === "end") {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("Ты вернулся домой!", canvas.width / 2 - 220, canvas.height / 2);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

