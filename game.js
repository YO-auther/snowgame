/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== МУЗЫКА ===== */
const menuMusic = new Audio("menu.mp3");
const game1Music = new Audio("game.mp3");
const game2Music = new Audio("game.mp3"); // можно заменить на другую
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
let globalState = "menu"; // "menu", "game1", "game2"
const images = {};
const imageNames = [
    "background_menu","collector","deliver",
    "background_game1","background_game2",
    "snow","gold_snow","dead_snow",
    "player_stand","player_go_left","player_go_right","player_go_up","player_go_down",
    "house_red","house_green","house_blue","error_house",
    "present_red","present_green","present_blue"
];
let loaded = 0;

// загрузка изображений
imageNames.forEach(n => {
    const img = new Image();
    img.src = n + ".png";
    img.onload = () => loaded++;
    images[n] = img;
});

/* ===== КНОПКИ МЕНЮ ===== */
const btnGame1 = { w:300, h:150, get x(){ return canvas.width/2-350/2 }, get y(){ return canvas.height/2-75 } };
const btnGame2 = { w:300, h:150, get x(){ return canvas.width/2+50 }, get y(){ return canvas.height/2-75 } };

/* ===== INPUT ===== */
canvas.addEventListener("pointerdown", e => {
    if (!musicStarted) musicStarted = true;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (globalState === "menu") {
        if (mx > btnGame1.x && mx < btnGame1.x+btnGame1.w &&
            my > btnGame1.y && my < btnGame1.y+btnGame1.h) {
            globalState = "game1";
        }
        if (mx > btnGame2.x && mx < btnGame2.x+btnGame2.w &&
            my > btnGame2.y && my < btnGame2.y+btnGame2.h) {
            initGame2();
            globalState = "game2";
        }
    }
});

/* ===== GAME 1 (SNOW) ===== */
let score1 = 0, lives1 = 3;
let snowflakes = [];

class Snow {
    constructor(type){
        this.type = type;
        this.size = 100;
        this.x = Math.random()*(canvas.width-this.size);
        this.y = -50;
        this.speed = 1+Math.random()*2;
    }
    update(){ this.y += this.speed; }
    draw(){ ctx.drawImage(images[this.type], this.x, this.y, this.size, this.size); }
}

function spawnSnow(){
    const r = Math.random();
    let t = "snow";
    if(r > 0.9) t = "gold_snow";
    else if(r < 0.15) t = "dead_snow";
    snowflakes.push(new Snow(t));
}

/* ===== GAME 2 (DELIVERY) ===== */
let player, presents, houses, score2, keys;

function initGame2(){
    player = { x:200, y:200, w:90, h:90, speed:5, dir:"stand", has:null };
    keys = {};
    presents = [
        {x:100,y:200,color:"red"},
        {x:400,y:200,color:"green"},
        {x:600,y:200,color:"blue"}
    ];
    houses = [
        {x:100,y:50,color:"red",type:"normal"},
        {x:400,y:50,color:"green",type:"normal"},
        {x:700,y:50,color:"blue",type:"normal"},
        {x:350,y:350,type:"error"} // дом персонажа
    ];
    score2 = 0;
}

window.addEventListener("keydown", e => { if(keys) keys[e.key]=true; });
window.addEventListener("keyup", e => { if(keys) keys[e.key]=false; });

function movePlayer(){
    if(keys.a || keys.ArrowLeft) player.x -= player.speed, player.dir="go_left";
    else if(keys.d || keys.ArrowRight) player.x += player.speed, player.dir="go_right";
    else if(keys.w || keys.ArrowUp) player.y -= player.speed, player.dir="go_up";
    else if(keys.s || keys.ArrowDown) player.y += player.speed, player.dir="go_down";
    else player.dir="stand";

    // границы экрана
    player.x = Math.max(0, Math.min(canvas.width-player.w, player.x));
    player.y = Math.max(0, Math.min(canvas.height-player.h, player.y));
}

/* ===== GAME LOOP ===== */
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(loaded < imageNames.length){
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Загрузка...", canvas.width/2-80, canvas.height/2);
        requestAnimationFrame(loop);
        return;
    }

    // музыка
    if(globalState==="menu") playMusic(menuMusic);
    else if(globalState==="game1") playMusic(game1Music);
    else if(globalState==="game2") playMusic(game2Music);

    // меню
    if(globalState==="menu"){
        ctx.drawImage(images.background_menu,0,0,canvas.width,canvas.height);
        ctx.drawImage(images.collector,btnGame1.x,btnGame1.y,btnGame1.w,btnGame1.h);
        ctx.drawImage(images.deliver,btnGame2.x,btnGame2.y,btnGame2.w,btnGame2.h);
    }

    // Игра 1
    if(globalState==="game1"){
        ctx.drawImage(images.background_game1,0,0,canvas.width,canvas.height);
        if(Math.random()<0.03) spawnSnow();
        snowflakes.forEach((s,i) => {
            s.update(); s.draw();
            if(s.y>canvas.height) snowflakes.splice(i,1);
        });
    }

    // Игра 2
    if(globalState==="game2"){
        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);
        movePlayer();

        // сбор подарков
        presents.forEach((p,i)=>{
            ctx.drawImage(images["present_"+p.color], p.x, p.y, 50, 50);
            if(!player.has &&
               player.x<p.x+50 && player.x+player.w>p.x &&
               player.y<p.y+50 && player.y+player.h>p.y){
                player.has = p.color;
                presents.splice(i,1);
            }
        });

        // дома
        let nearHome = false;
        houses.forEach(h=>{
            ctx.drawImage(h.type==="normal"?images["house_"+h.color]:images.error_house,
                          h.x, h.y, 70, 70);

            // проверка на дом персонажа
            if(h.type==="error"){
                const d = Math.hypot(player.x - h.x, player.y - h.y);
                if(d<200) nearHome = true;
                if(d<80) globalState="menu"; // конец игры
            }
        });

        // подсказка если близко к дому персонажа
        if(nearHome){
            ctx.fillStyle="rgba(0,0,0,0.7)";
            ctx.fillRect(0, canvas.height-100, canvas.width, 100);
            ctx.fillStyle="white";
            ctx.font="28px Arial";
            ctx.fillText("Ты почти дома... но возвращаться нельзя.", 50, canvas.height-40);
        }

        // игрок
        ctx.drawImage(images["player_"+player.dir], player.x, player.y, player.w, player.h);

        // очки
        ctx.fillStyle="white";
        ctx.font="24px Arial";
        ctx.fillText("Очки: "+score2, 20, 40);
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
