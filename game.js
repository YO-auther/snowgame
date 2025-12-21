const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== МУЗЫКА ===== */
const menuMusic = new Audio("menu.mp3");
const game1Music = new Audio("game.mp3");
const game2Music = new Audio("game.mp3");
menuMusic.loop = game1Music.loop = game2Music.loop = true;
let musicStarted = false;
let currentMusic = null;
function playMusic(music){
    if(!musicStarted) return;
    if(currentMusic===music) return;
    if(currentMusic) currentMusic.pause();
    currentMusic = music;
    currentMusic.currentTime=0;
    currentMusic.play().catch(()=>{});
}

/* ===== STATE ===== */
let globalState = "menu"; // menu, game1, game2
const images = {};
const imageNames = ["background_menu","collector","deliver","background_game1","background_game2"];
let loaded=0;

// загрузка картинок
imageNames.forEach(n=>{
    const img = new Image();
    img.src = n+".png";
    img.onload = ()=>loaded++;
    images[n]=img;
});

/* ===== BUTTONS ===== */
const btnGame1 = {w:300,h:150,get x(){return canvas.width/2-350/2},get y(){return canvas.height/2-75}};
const btnGame2 = {w:300,h:150,get x(){return canvas.width/2+50},get y(){return canvas.height/2-75}};

/* ===== INPUT ===== */
canvas.addEventListener("pointerdown", e=>{
    if(!musicStarted){musicStarted=true;}
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if(globalState==="menu"){
        if(mx>btnGame1.x && mx<btnGame1.x+btnGame1.w &&
           my>btnGame1.y && my<btnGame1.y+btnGame1.h){
            globalState="game1";
        }
        if(mx>btnGame2.x && mx<btnGame2.x+btnGame2.w &&
           my>btnGame2.y && my<btnGame2.y+btnGame2.h){
            globalState="game2";
        }
    }
});

/* ===== LOOP ===== */
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(loaded<imageNames.length){
        ctx.fillStyle="white";
        ctx.font="30px Arial";
        ctx.fillText("Загрузка...",canvas.width/2-80,canvas.height/2);
        requestAnimationFrame(loop);
        return;
    }

    if(globalState==="menu") { playMusic(menuMusic); }
    else if(globalState==="game1") { playMusic(game1Music); }
    else if(globalState==="game2") { playMusic(game2Music); }

    // меню
    if(globalState==="menu"){
        ctx.drawImage(images.background_menu,0,0,canvas.width,canvas.height);
        ctx.drawImage(images.collector,btnGame1.x,btnGame1.y,btnGame1.w,btnGame1.h);
        ctx.drawImage(images.deliver,btnGame2.x,btnGame2.y,btnGame2.w,btnGame2.h);
    }

    // игры
    if(globalState==="game1"){
        ctx.drawImage(images.background_game1,0,0,canvas.width,canvas.height);
    }
    if(globalState==="game2"){
        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
