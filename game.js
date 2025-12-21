const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ===== GLOBAL STATE ===== */
let globalState = "menu1";

/* ===== MUSIC ===== */
const menuMusic = new Audio("menu.mp3");
const gameMusic = new Audio("game.mp3");
menuMusic.loop = true;
gameMusic.loop = true;
let musicStarted = false;

/* ===== IMAGES ===== */
const images = {};
const imageNames = [
  "background_menu","background_game1","background_game2",
  "collector","snow","gold_snow","dead_snow","BAM",
  "player_stand","player_go_left","player_go_right",
  "player_go_up","player_go_down",
  "house_blue","house_red","house_green","error_house",
  "present_red","present_green","present_blue","deliver"
];

imageNames.forEach(n=>{
  const img=new Image();
  img.src=n+".png";
  images[n]=img;
});

/* =======================
   ===== GAME 1 ==========
   ======================= */
const GAME_TIME = 60;
let timeLeft = GAME_TIME;
let timer = 0;
let score1 = 0;
let lives = 3;
let snowflakes = [];
let effects = [];

const startButton1 = {
  width: 400,
  height: 200,
  get x(){return canvas.width/2-this.width/2},
  get y(){return canvas.height/2+100}
};

class Snow {
  constructor(type){
    this.type=type;
    this.size=120;
    this.x=Math.random()*(canvas.width-this.size);
    this.y=-50;
    this.speed=1+Math.random()*2;
  }
  update(){this.y+=this.speed}
  draw(){ctx.drawImage(images[this.type],this.x,this.y,this.size,this.size)}
}

class Effect{
  constructor(x,y){this.x=x;this.y=y;this.life=15}
  draw(){ctx.drawImage(images.BAM,this.x-25,this.y-25,50,50)}
}

function spawnSnow(){
  const r=Math.random();
  let t="snow";
  if(r>0.9)t="gold_snow";
  else if(r<0.15)t="dead_snow";
  snowflakes.push(new Snow(t));
}

function startGame1(){
  score1=0; lives=3; timeLeft=GAME_TIME;
  snowflakes=[]; effects=[];
  clearInterval(timer);
  timer=setInterval(()=>{
    timeLeft--;
    if(timeLeft<=0) endGame1();
  },1000);
  menuMusic.pause();
  gameMusic.play().catch(()=>{});
  globalState="game1";
}

function endGame1(){
  clearInterval(timer);
  gameMusic.pause();
  globalState="menu2";
}

/* =======================
   ===== GAME 2 ==========
   ======================= */
let player={
  x:200,y:200,width:60,height:60,
  speed:4,direction:"stand",hasPresent:null
};
let score2=0;
let presents=[];
let houses=[];
const keys={};

const startButton2={
  width:300,height:120,
  get x(){return canvas.width/2-this.width/2},
  get y(){return canvas.height/2+100}
};

function initGame2(){
  presents=[
    {x:100,y:200,color:"red"},
    {x:400,y:100,color:"green"},
    {x:600,y:300,color:"blue"}
  ];
  houses=[
    {x:50,y:50,color:"red",type:"normal"},
    {x:700,y:50,color:"green",type:"normal"},
    {x:400,y:400,color:"blue",type:"normal"},
    {x:300,y:200,type:"error"}
  ];
  score2=0;
  player.hasPresent=null;
  player.x=200; player.y=200;
}

window.addEventListener("keydown",e=>keys[e.key]=true);
window.addEventListener("keyup",e=>keys[e.key]=false);

function movePlayer(){
  if(keys.a||keys.ArrowLeft){player.x-=player.speed;player.direction="go_left"}
  else if(keys.d||keys.ArrowRight){player.x+=player.speed;player.direction="go_right"}
  else if(keys.w||keys.ArrowUp){player.y-=player.speed;player.direction="go_up"}
  else if(keys.s||keys.ArrowDown){player.y+=player.speed;player.direction="go_down"}
  else player.direction="stand";

  player.x=Math.max(0,Math.min(canvas.width-player.width,player.x));
  player.y=Math.max(0,Math.min(canvas.height-player.height,player.y));
}

function pickupPresent(){
  if(player.hasPresent) return;
  for(let i=presents.length-1;i>=0;i--){
    const p=presents[i];
    if(player.x<p.x+50&&player.x+60>p.x&&player.y<p.y+50&&player.y+60>p.y){
      player.hasPresent=p.color;
      presents.splice(i,1);
    }
  }
}

function deliverPresent(){
  if(!player.hasPresent) return;
  houses.forEach(h=>{
    if(player.x<h.x+70&&player.x+60>h.x&&player.y<h.y+70&&player.y+60>h.y){
      if(h.type==="normal"&&h.color===player.hasPresent){
        score2++; player.hasPresent=null;
      }else if(h.type==="error"){
        globalState="end";
      }
    }
  });
}

/* ===== INPUT ===== */
canvas.addEventListener("pointerdown",e=>{
  const r=canvas.getBoundingClientRect();
  const mx=e.clientX-r.left;
  const my=e.clientY-r.top;

  if(!musicStarted){
    menuMusic.play().catch(()=>{});
    musicStarted=true;
  }

  if(globalState==="menu1"){
    if(mx>startButton1.x&&mx<startButton1.x+startButton1.width&&
       my>startButton1.y&&my<startButton1.y+startButton1.height){
      startGame1();
    }
  }

  if(globalState==="menu2"){
    if(mx>startButton2.x&&mx<startButton2.x+startButton2.width&&
       my>startButton2.y&&my<startButton2.y+startButton2.height){
      initGame2();
      globalState="game2";
    }
  }
});

canvas.addEventListener("pointerup",()=>{
  if(globalState==="game2") deliverPresent();
});

/* ===== MAIN LOOP ===== */
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(globalState==="menu1"){
    ctx.drawImage(images.background_menu,0,0,canvas.width,canvas.height);
    ctx.drawImage(images.collector,startButton1.x,startButton1.y,startButton1.width,startButton1.height);
  }

  if(globalState==="game1"){
    ctx.drawImage(images.background_game1,0,0,canvas.width,canvas.height);
    if(Math.random()<0.03) spawnSnow();

    for(let i=snowflakes.length-1;i>=0;i--){
      const s=snowflakes[i];
      s.update(); s.draw();
      if(s.y>canvas.height) snowflakes.splice(i,1);
    }

    effects.forEach(e=>{e.draw();e.life--});
  }

  if(globalState==="menu2"){
    ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);
    ctx.drawImage(images.deliver,startButton2.x,startButton2.y,startButton2.width,startButton2.height);
  }

  if(globalState==="game2"){
    ctx.drawImage(images.background_game2,0,0,canvas.width,canvas.height);
    houses.forEach(h=>{
      ctx.drawImage(
        h.type==="normal"?images["house_"+h.color]:images.error_house,
        h.x,h.y,70,70
      );
    });
    presents.forEach(p=>{
      ctx.drawImage(images["present_"+p.color],p.x,p.y,50,50);
    });
    movePlayer();
    pickupPresent();
    ctx.drawImage(images["player_"+player.direction],player.x,player.y,60,60);
    ctx.fillStyle="white";
    ctx.fillText("Score: "+score2,20,40);
  }

  if(globalState==="end"){
    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="white";
    ctx.font="48px Arial";
    ctx.fillText("Ты вернулся домой!",canvas.width/2-200,canvas.height/2);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

