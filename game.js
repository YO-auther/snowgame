/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ===== MUSIC ===== */
const menuMusic = new Audio("menu.mp3");
const game1Music = new Audio("game.mp3");
const game2Music = new Audio("game.mp3");
menuMusic.loop = game1Music.loop = game2Music.loop = true;

let musicStarted = false;
let currentMusic = null;

function playMusic(music) {
    if (!musicStarted) return;
    if (currentMusic === music) return;
    if (currentMusic) currentMusic.pause();
    currentMusic = music;
    currentMusic.currentTime = 0;
    currentMusic.play().catch(() => {});
}

/* ===== STATE ===== */
let globalState = "menu";

/* ===== IMAGES ===== */
const images = {};
const imageNames = [
    "background_menu","background_game1","background_game2",
    "collector","deliver",
    "snow","gold_snow","dead_snow",
    "player_stand","player_go_left","player_go_right","player_go_up","player_go_down",
    "house_red","house_green","house_blue","error_house",
    "present_red","present_green","present_blue",
    "BAM"
];

imageNames.forEach(n => {
    const img = new Image();
    img.src = n + ".png";
    images[n] = img;
});

/* ===== BUTTONS ===== */
const btnGame1 = { w: 300, h: 150 };
const btnGame2 = { w: 300, h: 150 };

function updateButtons() {
    btnGame1.x = canvas.width / 2 - 350;
    btnGame1.y = canvas.height / 2 - 75;
    btnGame2.x = canvas.width / 2 + 50;
    btnGame2.y = canvas.height / 2 - 75;
}
updateButtons();

/* ===== INPUT ===== */
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("pointerdown", e => {
    musicStarted = true;
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    if (globalState === "menu") {
        if (mx > btnGame1.x && mx < btnGame1.x + btnGame1.w &&
            my > btnGame1.y && my < btnGame1.y + btnGame1.h) {
            initGame1();
            globalState = "game1";
        }
        if (mx > btnGame2.x && mx < btnGame2.x + btnGame2.w &&
            my > btnGame2.y && my < btnGame2.y + btnGame2.h) {
            initGame2();
            globalState = "game2";
        }
    }

    if (globalState === "game1") handleSnowClick(mx, my);
});

/* ===== GAME 1 ===== */
let snowflakes = [], effects = [];
let score1 = 0, lives1 = 3;

class Snow {
    constructor(type) {
        this.type = type;
        this.size = 80;
        this.x = Math.random() * (canvas.width - this.size);
        this.y = -100;
        this.speed = 1 + Math.random() * 2;
    }
    update() { this.y += this.speed; }
    draw() { ctx.drawImage(images[this.type], this.x, this.y, this.size, this.size); }
}

class Effect {
    constructor(x, y) { this.x = x; this.y = y; this.life = 15; }
    update() { this.life--; }
    draw() { ctx.drawImage(images.BAM, this.x - 25, this.y - 25, 50, 50); }
}

function spawnSnow() {
    let r = Math.random();
    let t = r > 0.9 ? "gold_snow" : r < 0.15 ? "dead_snow" : "snow";
    snowflakes.push(new Snow(t));
}

function initGame1() {
    snowflakes = [];
    effects = [];
    score1 = 0;
    lives1 = 3;
}

function handleSnowClick(mx, my) {
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        const s = snowflakes[i];
        const dx = mx - (s.x + s.size / 2);
        const dy = my - (s.y + s.size / 2);
        if (Math.hypot(dx, dy) < 80) {
            effects.push(new Effect(mx, my));
            if (s.type === "snow") score1++;
            if (s.type === "gold_snow") score1 += 5;
            if (s.type === "dead_snow") lives1--;
            snowflakes.splice(i, 1);
        }
    }
    if (lives1 <= 0) globalState = "menu";
}

/* ===== GAME 2 ===== */
const PRESENT_SIZE = 80;
const HOUSE_SIZE = 130;

let player = {
    x: 200, y: 300, w: 90, h: 90,
    speed: 4, dir: "stand"
};

let presents = [];
let houses = [];
let score2 = 0;

function initGame2() {
    score2 = 0;
    player.x = 200;
    player.y = 300;

    presents = [
        { x: 100, y: 400, color: "red" },
        { x: 400, y: 400, color: "green" },
        { x: 700, y: 400, color: "blue" }
    ];

    houses = [
        { x: 100, y: 100, color: "red", type: "normal" },
        { x: 400, y: 100, color: "green", type: "normal" },
        { x: 700, y: 100, color: "blue", type: "normal" },
        { x: 350, y: 500, type: "error" }
    ];
}

function movePlayer() {
    if (keys.a || keys.ArrowLeft) { player.x -= player.speed; player.dir = "go_left"; }
    else if (keys.d || keys.ArrowRight) { player.x += player.speed; player.dir = "go_right"; }
    else if (keys.w || keys.ArrowUp) { player.y -= player.speed; player.dir = "go_up"; }
    else if (keys.s || keys.ArrowDown) { player.y += player.speed; player.dir = "go_down"; }
    else player.dir = "stand";

    player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.h, player.y));
}

function handlePresents() {
    presents.forEach(p => {
        if (
            player.x < p.x + PRESENT_SIZE &&
            player.x + player.w > p.x &&
            player.y < p.y + PRESENT_SIZE &&
            player.y + player.h > p.y
        ) {
            if (player.dir === "go_left")  p.x -= player.speed;
            if (player.dir === "go_right") p.x += player.speed;
            if (player.dir === "go_up")    p.y -= player.speed;
            if (player.dir === "go_down")  p.y += player.speed;
        }

        p.x = Math.max(0, Math.min(canvas.width - PRESENT_SIZE, p.x));
        p.y = Math.max(0, Math.min(canvas.height - PRESENT_SIZE, p.y));
    });

    for (let i = presents.length - 1; i >= 0; i--) {
        const p = presents[i];
        houses.forEach(h => {
            if (h.type !== "normal") return;
            if (
                p.x < h.x + HOUSE_SIZE &&
                p.x + PRESENT_SIZE > h.x &&
                p.y < h.y + HOUSE_SIZE &&
                p.y + PRESENT_SIZE > h.y &&
                p.color === h.color
            ) {
                score2++;
                presents.splice(i, 1);
            }
        });
    }
}

/* ===== DRAW ===== */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (globalState === "menu") {
        playMusic(menuMusic);
        ctx.drawImage(images.background_menu, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(images.collector, btnGame1.x, btnGame1.y, btnGame1.w, btnGame1.h);
        ctx.drawImage(images.deliver, btnGame2.x, btnGame2.y, btnGame2.w, btnGame2.h);
    }

    if (globalState === "game1") {
        playMusic(game1Music);
        ctx.drawImage(images.background_game1, 0, 0, canvas.width, canvas.height);
        if (Math.random() < 0.02) spawnSnow();
        snowflakes.forEach(s => { s.update(); s.draw(); });
        effects.forEach((e, i) => { e.update(); e.draw(); if (e.life <= 0) effects.splice(i, 1); });
        ctx.fillStyle = "#fff";
        ctx.fillText(`Score: ${score1}`, 20, 40);
        ctx.fillText(`Lives: ${lives1}`, 20, 70);
    }

    if (globalState === "game2") {
        playMusic(game2Music);
        ctx.drawImage(images.background_game2, 0, 0, canvas.width, canvas.height);
        movePlayer();
        handlePresents();

        presents.forEach(p => ctx.drawImage(images["present_" + p.color], p.x, p.y, PRESENT_SIZE, PRESENT_SIZE));
        houses.forEach(h => {
            const img = h.type === "error" ? images.error_house : images["house_" + h.color];
            ctx.drawImage(img, h.x, h.y, HOUSE_SIZE, HOUSE_SIZE);
        });

        let img = images["player_" + player.dir] || images.player_stand;
        ctx.drawImage(img, player.x, player.y, player.w, player.h);

        ctx.fillStyle = "#fff";
        ctx.fillText(`Score: ${score2}`, 20, 40);
    }

    requestAnimationFrame(draw);
}

draw();
