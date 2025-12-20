const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== МУЗЫКА ===== */
let musicStarted = false;

/* ===== СОСТОЯНИЕ ИГРЫ ===== */
let gameState = "menu2"; // "menu2", "game2", "end2"
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 60,
    height: 60,
    speed: 4,
    direction: "stand",
    hasPresent: null
};
let score = 0;
let presents = [];
let houses = [];
const keys = {};

/* ===== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ===== */
const images = {};
const imageNames = [
  "background_game2",
  "player_stand",
  "player_go_left",
  "player_go_right",
  "player_go_up",
  "player_go_down",
  "house_blue",
  "house_red",
  "house_green",
  "error_house",
  "present_red",
  "present_green",
  "present_blue",
  "deliver"
];

imageNames.forEach(name => {
    const img = new Image();
    img.src = name + ".png";
    images[name] = img;
});

/* ===== КНОПКА START ===== */
const startButton2 = {
    width: 300,
    height: 120,
    get x() { return canvas.width/2 - this.width/2 },
    get y() { return canvas.height/2 + 100 }
};

/* ===== СОЗДАНИЕ ПОДАРКОВ И ДОМОВ ===== */
function initGame2() {
    presents = [
        {x: 100, y: 200, color: "red"},
        {x: 400, y: 100, color: "green"},
        {x: 600, y: 300, color: "blue"},
    ];
    houses = [
        {x: 50, y: 50, color: "red", type: "normal"},
        {x: 700, y: 50, color: "green", type: "normal"},
        {x: 400, y: 400, color: "blue", type: "normal"},
        {x: 300, y: 200, type: "error"} // секретный дом
    ];
    score = 0;
    player.hasPresent = null;
}

/* ===== ОБРАБОТКА ДВИЖЕНИЯ ===== */
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function movePlayer() {
    if (keys["ArrowLeft"] || keys["a"]) { player.x -= player.speed; player.direction="go_left"; }
    else if (keys["ArrowRight"] || keys["d"]) { player.x += player.speed; player.direction="go_right"; }
    else if (keys["ArrowUp"] || keys["w"]) { player.y -= player.speed; player.direction="go_up"; }
    else if (keys["ArrowDown"] || keys["s"]) { player.y += player.speed; player.direction="go_down"; }
    else { player.direction="stand"; }

    // Ограничения карты
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

/* ===== ПОДБОР ПОДАРКА ===== */
function pickupPresent() {
    if (player.hasPresent) return; // уже несёт подарок
    presents.forEach((p, i) => {
        if (player.x < p.x + 50 && player.x + player.width > p.x &&
            player.y < p.y + 50 && player.y + player.height > p.y) {
            player.hasPresent = p.color;
            presents.splice(i,1);
        }
    });
}

/* ===== ДОСТАВКА В ДОМ ===== */
function deliverPresent() {
    if (!player.hasPresent) return;
    houses.forEach(h => {
        if (player.x < h.x + 70 && player.x + player.width > h.x &&
            player.y < h.y + 70 && player.y + player.height > h.y) {
            if (h.type === "normal" && h.color === player.hasPresent) {
                score++;
                player.hasPresent = null;
            } else if (h.type === "error") {
                gameState = "end2";
            }
        }
    });
}

/* ===== POINTER ДЛЯ МЕНЮ (кнопка deliver.png) ===== */
canvas.addEventListener("pointerdown", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (gameState === "menu2") {
        if (mx > startButton2.x && mx < startButton2.x + startButton2.width &&
            my > startButton2.y && my < startButton2.y + startButton2.height) {
            initGame2();
            gameState = "game2";
        }
    }
});

/* ===== КНОПКА ДОСТАВКИ НА ТАЧЕ/ПК ===== */
canvas.addEventListener("pointerup", e => {
    if (gameState === "game2") deliverPresent();
});

/* ===== ЦИКЛ ИГРЫ ===== */
function gameLoop2() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (gameState === "menu2") {
        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);
        ctx.drawImage(images.deliver, startButton2.x, startButton2.y, startButton2.width, startButton2.height);
    }

    if (gameState === "game2") {
        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);

        // рисуем дома
        houses.forEach(h => {
            if (h.type === "normal") ctx.drawImage(images["house_"+h.color], h.x, h.y, 70,70);
            else ctx.drawImage(images.error_house, h.x, h.y, 70,70);
        });

        // рисуем подарки
        presents.forEach(p => {
            ctx.drawImage(images["present_"+p.color], p.x, p.y, 50,50);
        });

        movePlayer();
        pickupPresent();

        // рисуем игрока
        ctx.drawImage(images["player_"+player.direction], player.x, player.y, player.width, player.height);

        // очки
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText("Score: "+score, 20, 40);
    }

    if (gameState === "end2") {
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("Ты вернулся домой!", canvas.width/2-200, canvas.height/2);
        ctx.fillText("Очки: "+score, canvas.width/2-100, canvas.height/2+60);
    }

    requestAnimationFrame(gameLoop2);
}

requestAnimationFrame(gameLoop2);
