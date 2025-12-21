/* ===== CANVAS ===== */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== MUSIC ===== */
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
    currentMusic=music;
    currentMusic.currentTime=0;
    currentMusic.play().catch(()=>{});
}

/* ===== STATE ===== */
let globalState="menu";
const images = {};
const imageNames=[
    "background_menu","collector","deliver",
    "background_game1","background_game2",
    "snow","gold_snow","dead_snow",
    "player_stand","player_go_left","player_go_right","player_go_up","player_go_down",
    "house_red","house_green","house_blue","error_house",
    "present_red","present_green","present_blue","BAM"
];
let loaded=0;
imageNames.forEach(n=>{
    const img=new Image();
    img.src=n+".png";
    img.onload=()=>loaded++;
    images[n]=img;
});

/* ===== BUTTONS ===== */
const btnGame1={w:300,h:150,get x(){return canvas.width/2-340/2},get y(){return canvas.height/2-75}};
const btnGame2={w:300,h:150,get x(){return canvas.width/2+40},get y(){return canvas.height/2-75}};

/* ===== GAME 1 ===== */
let score1=0,lives1=3,snowflakes=[],effects=[];
const HITBOX=100;
const GAME_TIME=60;
let timeLeft=GAME_TIME,timer1;

class Snow {
    constructor(type){
        this.type=type;
        this.size=100+Math.random()*30;
        this.x=Math.random()*(canvas.width-this.size);
        this.y=-50;
        this.speed=1+Math.random()*2;
    }
    update(){ this.y+=this.speed; }
    draw(){ ctx.drawImage(images[this.type],this.x,this.y,this.size,this.size); }
}

class Effect {
    constructor(x,y){ this.x=x; this.y=y; this.life=15; }
    draw(){ ctx.drawImage(images.BAM,this.x-25,this.y-25,50,50); this.life--; }
}

function spawnSnow(){
    const r=Math.random();
    let t="snow";
    if(r>0.9) t="gold_snow";
    else if(r<0.15) t="dead_snow";
    snowflakes.push(new Snow(t));
}

function startGame1(){
    score1=0;lives1=3;timeLeft=GAME_TIME;snowflakes=[];effects=[];
    clearInterval(timer1);
    timer1=setInterval(()=>{ timeLeft--; if(timeLeft<=0 || lives1<=0) endGame1(); },1000);
    globalState="game1";
    playMusic(game1Music);
}

function endGame1(){
    clearInterval(timer1);
    globalState="menu";
}

/* ===== GAME 2 ===== */
let player={x:200,y:200,w:90,h:90,dir:"stand",speed:6};
let presents=[],houses=[],score2=0;
const keys={};
const PRESENT_SIZE=80,HOUSE_SIZE=130;

function initGame2(){
    score2=0;
    player.x=200; player.y=200;
    presents=[
        {x:200,y:300,color:"red"},
        {x:600,y:250,color:"green"},
        {x:900,y:400,color:"blue"}
    ];
    houses=[
        {x:200,y:50,color:"red",type:"normal"},
        {x:600,y:50,color:"green",type:"normal"},
        {x:900,y:50,color:"blue",type:"normal"},
        {x:canvas.width-200,y:canvas.height-200,type:"error"}
    ];
    globalState="game2";
    playMusic(game2Music);
}

/* ===== INPUT ===== */
window.addEventListener("keydown", e=>keys[e.key]=true);
window.addEventListener("keyup", e=>keys[e.key]=false);

canvas.addEventListener("pointerdown", e=>{
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left;
    const my=e.clientY-rect.top;

    if(!musicStarted) musicStarted=true;

    if(globalState==="menu"){
        if(mx>btnGame1.x && mx<btnGame1.x+btnGame1.w &&
           my>btnGame1.y && my<btnGame1.y+btnGame1.h) startGame1();
        if(mx>btnGame2.x && mx<btnGame2.x+btnGame2.w &&
           my>btnGame2.y && my<btnGame2.y+btnGame2.h) initGame2();
    }

    if(globalState==="game1"){
        snowflakes.forEach((s,i)=>{
            const dx=mx-(s.x+s.size/2);
            const dy=my-(s.y+s.size/2);
            if(Math.sqrt(dx*dx+dy*dy)<HITBOX){
                effects.push(new Effect(mx,my));
                if(s.type==="snow") score1++;
                else if(s.type==="gold_snow") score1+=5;
                else if(s.type==="dead_snow") lives1--;
                snowflakes.splice(i,1);
            }
        });
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

    // музыка
    if(globalState==="menu") playMusic(menuMusic);
    else if(globalState==="game1") playMusic(game1Music);
    else if(globalState==="game2") playMusic(game2Music);

    // MENU
    if(globalState==="menu"){
        ctx.drawImage(images.background_menu,0,0,canvas.width,canvas.height);
        ctx.drawImage(images.collector,btnGame1.x,btnGame1.y,btnGame1.w,btnGame1.h);
        ctx.drawImage(images.deliver,btnGame2.x,btnGame2.y,btnGame2.w,btnGame2.h);
    }

    // GAME1
    if(globalState==="game1"){
        ctx.drawImage(images.background_game1,0,0,canvas.width,canvas.height);
        if(Math.random()<0.03) spawnSnow();
        snowflakes.forEach((s,i)=>{ s.update(); s.draw(); if(s.y>canvas.height) snowflakes.splice(i,1); });
        effects.forEach((e,i)=>{ e.draw(); if(e.life<=0) effects.splice(i,1); });

        ctx.fillStyle="#45bbff";
        ctx.font="24px Arial";
        ctx.fillText("Очки: "+score1,20,40);
        ctx.fillText("Жизни: "+lives1,20,70);
        ctx.fillText("Время: "+timeLeft,20,100);
    }

    // GAME2
    if(globalState==="game2"){
        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);

        // движение игрока
        if(keys.a||keys.ArrowLeft) player.x-=player.speed, player.dir="go_left";
        else if(keys.d||keys.ArrowRight) player.x+=player.speed, player.dir="go_right";
        else if(keys.w||keys.ArrowUp) player.y-=player.speed, player.dir="go_up";
        else if(keys.s||keys.ArrowDown) player.y+=player.speed, player.dir="go_down";
        else player.dir="stand";

        // перемещение подарков игроком
        presents.forEach(p=>{
            const dx=player.x+player.w/2-PRESENT_SIZE/2-p.x;
            const dy=player.y+player.h/2-PRESENT_SIZE/2-p.y;
            if(Math.abs(dx)<player.w && Math.abs(dy)<player.h) { p.x=player.x+player.w/2-PRESENT_SIZE/2; p.y=player.y+player.h/2-PRESENT_SIZE/2; }
        });

        // проверка домов
        presents=presents.filter(p=>{
            let delivered=false;
            houses.forEach(h=>{
                const near=p.x+PRESENT_SIZE>h.x && p.x<h.x+HOUSE_SIZE && p.y+PRESENT_SIZE>h.y && p.y<h.y+HOUSE_SIZE;
                if(near){
                    if(h.type==="normal" && h.color===p.color) { score2++; delivered=true; }
                    else if(h.type==="error") delivered=true;
                }
            });
            return !delivered;
        });

        houses.forEach(h=>{
            ctx.drawImage(h.type==="normal"?images["house_"+h.color]:images.error_house,h.x,h.y,HOUSE_SIZE,HOUSE_SIZE);
        });

        presents.forEach(p=> ctx.drawImage(images["present_"+p.color],p.x,p.y,PRESENT_SIZE,PRESENT_SIZE));
        ctx.drawImage(images["player_"+player.dir],player.x,player.y,player.w,player.h);

        ctx.fillStyle="#45bbff";
        ctx.font="24px Arial";
        ctx.fillText("Очки: "+score2,20,40);
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
