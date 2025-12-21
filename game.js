/* ===== CANVAS ===== */
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

/* ===== IMAGES ===== */
const images = {};
const imageNames = [
    "background_menu","collector","deliver",
    "background_game1","background_game2",
    "snow","gold_snow","dead_snow",
    "player_stand","player_go_left","player_go_right","player_go_up","player_go_down",
    "house_red","house_green","house_blue","error_house",
    "present_red","present_green","present_blue",
    "BAM"
];
let loaded=0;
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
const keys={};
window.addEventListener("keydown", e=>keys[e.key]=true);
window.addEventListener("keyup", e=>keys[e.key]=false);

canvas.addEventListener("pointerdown", e=>{
    if(!musicStarted){musicStarted=true;}
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if(globalState==="menu"){
        if(mx>btnGame1.x && mx<btnGame1.x+btnGame1.w &&
           my>btnGame1.y && my<btnGame1.y+btnGame1.h){
            initGame1();
            globalState="game1";
        }
        if(mx>btnGame2.x && mx<btnGame2.x+btnGame2.w &&
           my>btnGame2.y && my<btnGame2.y+btnGame2.h){
            initGame2();
            globalState="game2";
        }
    }

    if(globalState==="game1"){
        handleSnowClick(mx,my);
    }
});

/* ===== GAME 1 (SNOW) ===== */
let snowflakes=[],effects=[];
let score1=0,lives1=3;

class Snow {
    constructor(type){
        this.type=type;
        this.size=100 + Math.random()*30;
        this.x=Math.random()*(canvas.width-this.size);
        this.y=-50;
        this.speed=1+Math.random()*2;
    }
    update(){ this.y+=this.speed; }
    draw(){ ctx.drawImage(images[this.type], this.x, this.y, this.size, this.size); }
}

class Effect {
    constructor(x,y){this.x=x; this.y=y; this.life=15;}
    draw(){ ctx.drawImage(images.BAM,this.x-25,this.y-25,50,50);}
}

function spawnSnow(){
    const r=Math.random();
    let t="snow";
    if(r>0.9) t="gold_snow";
    else if(r<0.15) t="dead_snow";
    snowflakes.push(new Snow(t));
}

function initGame1(){
    snowflakes=[]; effects=[];
    score1=0; lives1=3;
}

const HITBOX = 150;
function handleSnowClick(mx,my){
    snowflakes.forEach((s,i)=>{
        const cx=s.x+s.size/2;
        const cy=s.y+s.size/2;
        const dx=mx-cx, dy=my-cy;
        if(Math.sqrt(dx*dx+dy*dy)<HITBOX){
            effects.push(new Effect(mx,my));
            if(s.type==="snow") score1++;
            if(s.type==="gold_snow") score1+=5;
            if(s.type==="dead_snow") lives1--;
            snowflakes.splice(i,1);
        }
    });
    if(lives1<=0) globalState="menu";
}

/* ===== GAME 2 (DELIVERY) ===== */
let player={x:200,y:200,w:90,h:90,dir:"stand",has:null};
let presents=[],houses=[],score2=0;
const PRESENT_SIZE=80;
const HOUSE_SIZE=130;

function initGame2(){
    score2=0;
    player.x=200; player.y=300; player.has=null;
    presents=[
        {x:100,y:400,color:"red"},
        {x:400,y:400,color:"green"},
        {x:700,y:400,color:"blue"}
    ];
    houses=[
        {x:100,y:100,color:"red",type:"normal"},
        {x:400,y:100,color:"green",type:"normal"},
        {x:700,y:100,color:"blue",type:"normal"},
        {x:350,y:500,type:"error"}
    ];
}

function movePlayer(){
    if(globalState!=="game2") return;
    if(keys.a||keys.ArrowLeft){player.x-=player.speed; player.dir="go_left";}
    else if(keys.d||keys.ArrowRight){player.x+=player.speed; player.dir="go_right";}
    else if(keys.w||keys.ArrowUp){player.y-=player.speed; player.dir="go_up";}
    else if(keys.s||keys.ArrowDown){player.y+=player.speed; player.dir="go_down";}
    else player.dir="stand";

    player.x=Math.max(0,Math.min(canvas.width-player.w,player.x));
    player.y=Math.max(0,Math.min(canvas.height-player.h,player.y));
}

function handlePresents(){
    presents.forEach((p,i)=>{
        if(!player.has &&
           player.x<p.x+PRESENT_SIZE && player.x+player.w>p.x &&
           player.y<p.y+PRESENT_SIZE && player.y+player.h>p.y){
            player.has=p.color;
            presents.splice(i,1);
        }
    });

    if(player.has){
        houses.forEach(h=>{
            if(h.type==="normal" && h.color===player.has){
                if(player.x<h.x+HOUSE_SIZE && player.x+player.w>h.x &&
                   player.y<h.y+HOUSE_SIZE && player.y+player.h>h.y){
                    score2++;
                    player.has=null;
                }
            } else if(h.type==="error"){
                const d=Math.hypot(player.x-h.x,player.y-h.y);
                if(d<80) globalState="menu";
            }
        });
    }
}

/* ===== LOOP ===== */
function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(loaded<imageNames.length){
        ctx.fillStyle="#45bbff";
        ctx.font="30px Arial";
        ctx.fillText("Загрузка...",canvas.width/2-80,canvas.height/2);
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

    // игра 1
    if(globalState==="game1"){
        ctx.drawImage(images.background_game1,0,0,canvas.width,canvas.height);
        if(Math.random()<0.03) spawnSnow();
        snowflakes.forEach((s,i)=>{
            s.update();
            s.draw();
            if(s.y>canvas.height) snowflakes.splice(i,1);
        });
        effects.forEach((e,i)=>{
            e.draw();
            e.life--;
            if(e.life<=0) effects.splice(i,1);
        });
        ctx.fillStyle="#45bbff";
        ctx.font="24px Arial";
        ctx.fillText("Очки: "+score1,20,40);
        ctx.fillText("Жизни: "+lives1,20,70);
    }

    // игра 2
    if(globalState==="game2"){
        movePlayer();
        handlePresents();

        ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);

        houses.forEach(h=>{
            ctx.drawImage(h.type==="normal"?images["house_"+h.color]:images.error_house,h.x,h.y,HOUSE_SIZE,HOUSE_SIZE);
        });
        presents.forEach(p=>ctx.drawImage(images["present_"+p.color],p.x,p.y,PRESENT_SIZE,PRESENT_SIZE));
        ctx.drawImage(images["player_"+player.dir],player.x,player.y,player.w,player.h);
        ctx.fillStyle="#45bbff";
        ctx.font="24px Arial";
        ctx.fillText("Очки: "+score2,20,40);
    }

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
