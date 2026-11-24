(() => {
"use strict";
const $ = id => document.getElementById(id);
const screens = ["home","select","how","battle"];
const roster = [
 {id:"gojo",image:"https://risibank.fr/cache/medias/0/40/4096/409603/full.png",name:"SATORU GOJO",short:"GOJO",role:"O MAIS FORTE",desc:"O feiticeiro mais poderoso. Usa o Ilimitado para controlar o espaço e manter os inimigos à distância.",color:"#8d72f5",glow:"#7352db",power:82,speed:96,tech:100,mark:"無",special:"Lapse Blue"},
 {id:"yuji",image:"https://i.pinimg.com/originals/e2/a8/3f/e2a83f055ba14fc63721f6089c1f7d08.jpg",name:"YUJI ITADORI",short:"YUJI",role:"RECIPIENTE",desc:"Combate corpo a corpo com força física absurda e energia amaldiçoada. Um lutador equilibrado.",color:"#e46b91",glow:"#9e315b",power:90,speed:84,tech:72,mark:"虎",special:"Punho Divergente"},
 {id:"megumi",image:"https://i.pinimg.com/originals/b6/91/ec/b691ec93472b5e1f93f34bcd4002a0cb.jpg",name:"MEGUMI FUSHIGURO",short:"MEGUMI",role:"USUÁRIO DAS SOMBRAS",desc:"Invoca shikigamis e controla o ritmo da luta com técnicas estratégicas das Dez Sombras.",color:"#6879c9",glow:"#384a9a",power:73,speed:80,tech:94,mark:"影",special:"Nue"},
 {id:"nobara",image:"https://i.pinimg.com/originals/85/19/67/851967be3b9fcca0670b6850b57904de.jpg",name:"NOBARA KUGISAKI",short:"NOBARA",role:"FEITICEIRA DE 1ª CLASSE",desc:"Usa martelo, pregos e ressonância para atingir o adversário com precisão.",color:"#dc8b65",glow:"#a85437",power:77,speed:83,tech:90,mark:"釘",special:"Hairpin"},
 {id:"sukuna",image:"https://i.pinimg.com/originals/a9/d7/39/a9d73956ecaa6a4b27bf757c00846f53.jpg",name:"RYOMEN SUKUNA",short:"SUKUNA",role:"REI DAS MALDIÇÕES",desc:"Uma presença aterradora com cortes invisíveis e poder destrutivo. Alto dano e pressão constante.",color:"#d94c70",glow:"#9c234b",power:100,speed:86,tech:98,mark:"宿",special:"Desmantelar"},
 {id:"todo",image:"https://us.oricon-group.com/upimg/detail/3000/3331/img660/Aoi-Todo-jjk-EP16%20%285%29.jpg",name:"AOI TODO",short:"TODO",role:"FEITICEIRO DE 1ª CLASSE",desc:"Força física monstruosa e uma técnica que troca posições. Especialista em combate direto.",color:"#a66dd6",glow:"#633b91",power:96,speed:78,tech:82,mark:"拍",special:"Boogie Woogie"}
];
let selected=roster[0],enemyChoice=roster[4],game=null,raf=0,last=0,keys={},paused=false,finished=false;
const canvas=$("gameCanvas"),ctx=canvas.getContext("2d");
function show(name){screens.forEach(s=>$(s).classList.toggle("hidden",s!==name));}
function buildRoster(){const root=$("roster");root.innerHTML="";roster.forEach(f=>{const b=document.createElement("button");b.className="fighter-card"+(f.id===selected.id?" selected":"");b.innerHTML='<div class="portrait" style="--glow:'+f.glow+'"><img src="'+f.image+'" alt="'+f.name+'" loading="lazy" referrerpolicy="no-referrer"></div><strong>'+f.name+'</strong><small>'+f.role+'</small>';b.addEventListener("click",()=>{selected=f;buildRoster();showDetail();});root.appendChild(b);});}
function showDetail(){$("fighterRole").textContent=selected.role;$("fighterName").textContent=selected.name;$("fighterDesc").textContent=selected.desc;$("detailArt").innerHTML='<img src="'+selected.image+'" alt="'+selected.name+'" referrerpolicy="no-referrer">';$("detailArt").style.background="radial-gradient(circle,"+selected.glow+"88,transparent 70%),#0d0b15";$("powerBar").style.width=selected.power+"%";$("speedBar").style.width=selected.speed+"%";$("techBar").style.width=selected.tech+"%";}
function fighter(x,side,data){return{x,y:0,vx:0,vy:0,ground:0,onGround:true,hp:100,energy:25,side,data,face:side===1?1:-1,action:"idle",actionTime:0,attackCooldown:0,attackEvent:null,hitFlash:0,combo:0,comboTime:0,blocking:false,stun:0,walk:0,breath:Math.random()*6,charging:false,chargePulse:0,aiMode:"approach",aiModeTime:0};}
function startFight(){enemyChoice=selected.id==="sukuna"?roster[0]:roster[4];game={p:fighter(220,1,selected),e:fighter(740,-1,enemyChoice),time:99,particles:[],shake:0,hitstop:0,flash:0,frame:0,aiWait:35,message:"FIGHT!",messageTime:90,stage:Math.floor(Math.random()*3),domain:null,domainPulse:0,projectiles:[]};paused=false;finished=false;$("pName").textContent=selected.short;$("eName").textContent=enemyChoice.short;$("overlay").classList.add("hidden");$("battleMessage").textContent="FIGHT!";show("battle");updateHud();last=0;cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
function input(key){return !!keys[key];}
function setMessage(t){game.message=t;game.messageTime=70;$("battleMessage").textContent=t;}
function spawn(x,y,color,count=10){for(let i=0;i<count;i++)game.particles.push({x,y,vx:(Math.random()-.5)*8,vy:(Math.random()-.7)*8,life:25+Math.random()*20,color,size:2+Math.random()*5});}
function attack(a,target,type){
 if(a.attackCooldown>0||a.stun>0||a.action==="jump"||a.action==="dash")return;
 const cost=type==="ultimate"?70:type==="special"?35:0;
 if(a.energy<cost){if(a===game.p)setMessage("ENERGIA INSUFICIENTE");return;}
 a.energy-=cost;
 const startup=type==="ultimate"?17:type==="special"?12:type==="heavy"?9:5;
 const duration=type==="ultimate"?52:type==="special"?36:type==="heavy"?27:18;
 a.action=type;a.actionTime=duration;a.attackCooldown=duration+(type==="ultimate"?24:10);a.blocking=false;
 a.attackEvent={type,target,resolveAt:game.frame+startup,resolved:false};
 spawn(a.x+a.face*24,370+a.y-126,a.data.color,type==="ultimate"?24:type==="special"?14:5);
}
function endFight(title){if(finished)return;finished=true;paused=true;$("overlayTitle").textContent=title;$("overlayText").textContent=title==="VITÓRIA!"?"Você venceu o combate. A arena reconhece sua força.":"A CPU venceu desta vez. Tente outra estratégia!";$("resumeBtn").textContent="VOLTAR À SELEÇÃO";$("overlay").classList.remove("hidden");}
function updateFighter(a,other,dt,isPlayer){
 a.face=other.x>=a.x?1:-1;
 if(a.attackCooldown>0)a.attackCooldown=Math.max(0,a.attackCooldown-dt);
 if(a.hitFlash>0)a.hitFlash=Math.max(0,a.hitFlash-dt);
 if(a.stun>0){
  a.stun=Math.max(0,a.stun-dt);a.vx*=Math.pow(.88,dt);
 }else if(a.actionTime>0){
  a.actionTime=Math.max(0,a.actionTime-dt);
  if(a.actionTime===0){a.action="idle";a.blocking=false;}
 }else if(a.action!=="jump"&&a.action!=="dash"){
  if(isPlayer){
   const left=input("a")||input("arrowleft"),right=input("d")||input("arrowright");
   a.charging=input("c")&&a.energy<100;
   if(a.charging){
    a.energy=Math.min(100,a.energy+.42*dt);
    a.vx*=.55;a.action="charge";a.blocking=false;a.chargePulse+=.22*dt;
    if(Math.random()<.24)spawn(a.x+(Math.random()-.5)*42,370+a.y-95-Math.random()*95,a.data.color,1);
   }else{
   a.blocking=input("s")||input("arrowdown");
   if(a.blocking){a.action="block";a.vx*=.35;}
   else{
    const dir=(right?1:0)-(left?1:0);
    if(dir){
     if(input("shift")){a.vx=dir*10;a.action="dash";a.actionTime=8;spawn(a.x,370+a.y-70,a.data.color,5);}
     else{a.vx=dir*(4.2+a.data.speed*.018);a.action="walk";a.walk+=dt;}
    }else{a.vx*=.72;a.action="idle";}
    if((input("w")||input("arrowup"))&&a.onGround){a.vy=-13.5;a.onGround=false;a.action="jump";spawn(a.x,374,"#cbb6ff",7);}
    if(input("j"))attack(a,other,"light");
    else if(input("k"))attack(a,other,"heavy");
    else if(input("l"))attack(a,other,"special");
    else if(input("u"))attack(a,other,"ultimate");
   }
   }
  }else{
   const dist=Math.abs(other.x-a.x),roll=Math.random();
   a.aiModeTime-=dt;
   a.blocking=false;
   if(a.aiMode==="charge"){
    a.charging=true;a.vx*=.48;a.action="charge";a.chargePulse+=.22*dt;
    a.energy=Math.min(100,a.energy+.52*dt);
    if(Math.random()<.20)spawn(a.x+(Math.random()-.5)*42,370+a.y-95-Math.random()*95,a.data.color,1);
    if(a.energy>=82||a.aiModeTime<=0){a.aiMode="approach";a.aiModeTime=0;a.charging=false;game.aiWait=8;}
   }else if(a.aiMode==="retreat"){
    a.charging=false;
    if(dist<255){a.vx=-a.face*(3.4+a.data.speed*.012);a.action="walk";}
    else{a.aiMode="charge";a.aiModeTime=48+Math.random()*35;a.vx=0;a.action="charge";}
   }else{
    a.charging=false;
    // A CPU that has spent energy sometimes creates distance to recover it.
    if((a.energy<58&&dist<300&&roll<.045)||(a.energy<35&&roll<.10)){
     a.aiMode="retreat";a.aiModeTime=0;a.vx=-a.face*4.2;a.action="walk";
    }else{
     game.aiWait-=dt;
     if(game.aiWait<=0){
      if(dist>185&&dist<365&&a.energy>=35&&roll<.48){attack(a,other,"special");}
      else if(dist>185){a.vx=a.face*(2.6+a.data.speed*.012);a.action="walk";}
      else if(roll<.17){a.blocking=true;a.action="block";a.actionTime=11;a.vx=0;}
      else{attack(a,other,roll<.30&&a.energy>=70?"ultimate":roll<.57&&a.energy>=35?"special":roll<.78?"heavy":"light");}
      game.aiWait=16+Math.random()*23;
     }
    }
   }
  }
 }
 a.x+=a.vx*dt;a.vx*=Math.pow(a.action==="dash"?.9:.82,dt);
 a.y+=a.vy*dt;a.vy+=.72*dt;
 if(a.y>=0){a.y=0;a.vy=0;if(!a.onGround)spawn(a.x,376,"#9880c7",4);a.onGround=true;if(a.action==="jump")a.action="idle";}
 a.x=Math.max(58,Math.min(902,a.x));
 if(!a.charging)a.energy=Math.min(100,a.energy+.035*dt);
 if(a.comboTime>0)a.comboTime-=dt;else a.combo=0;
 a.breath+=.06*dt;
}
function resolveAttack(a){
 const ev=a.attackEvent;if(!ev||ev.resolved||game.frame<ev.resolveAt)return;
 ev.resolved=true;const target=ev.target,type=ev.type;
 const range=type==="ultimate"?350:type==="special"?260:type==="heavy"?130:98;
 let damage=type==="ultimate"?Math.round(38+a.data.tech*.19):type==="special"?Math.round(21+a.data.tech*.12):type==="heavy"?Math.round(15+a.data.power*.07):Math.round(9+a.data.speed*.03);
 let blackFlash=false;
 if(a.data.id==="yuji"&&type!=="ultimate"&&Math.random()<.19){damage=Math.round(damage*2.15);blackFlash=true;game.flash=14;game.shake=12;spawn(a.x+a.face*55,225,"#ffdf9b",28);}
 if(a.data.id==="sukuna"&&type==="special")damage=Math.round(damage*1.18);
 if(a.data.id==="nobara"&&type==="special")damage=Math.round(damage*1.22);
 if(a.data.id==="todo"&&type==="special"){target.x=Math.max(70,Math.min(890,a.x+a.face*105));target.vx=a.face*2;spawn(target.x,260,"#d8a9ff",22);}
 if(a.data.id==="megumi"&&type==="special"){spawn(a.x+a.face*80,270,"#8294d8",28);target.stun+=5;}
 if(a.data.id==="gojo"&&type==="special"){target.vx=a.face*10;spawn(target.x,240,"#78d9f0",20);}
 if(a.data.id==="yuji"&&type==="special"){spawn(target.x,245,"#ffb3c8",14);}
 if(a.data.id==="nobara"&&type==="special"){spawn(target.x,240,"#d99a6c",18);}
 if(a.data.id==="megumi"&&type==="special"){spawn(a.x+a.face*65,290,"#16182c",24);}
 if(a.data.id==="todo"&&type==="special"){spawn(a.x,235,"#d5b4ff",16);}
 if(a.data.id==="sukuna"&&type==="ultimate"){spawn(target.x,240,"#ef4c78",40);}
 if(type==="ultimate"){
  const finishers={
   gojo:{name:"EXPANSÃO DE DOMÍNIO: VAZIO ILIMITADO",kind:"void",life:190},
   megumi:{name:"EXPANSÃO DE DOMÍNIO: JARDIM DAS SOMBRAS QUIMÉRICAS",kind:"shadows",life:210},
   sukuna:{name:"EXPANSÃO DE DOMÍNIO: SANTUÁRIO MALEVOLENTE",kind:"shrine",life:230}
  };
  const domain=finishers[a.data.id];
  if(domain){
   game.domain={...domain,color:a.data.color,owner:a.side,target,life:domain.life,tick:0,age:0};
   game.domainPulse=1;
   if(domain.kind==="void"){target.stun=Math.max(target.stun,95);target.action="hurt";spawn(target.x,220,"#b7d9ff",38);game.flash=18;}
   if(domain.kind==="shadows"){spawn(a.x,370,"#111326",46);target.stun=Math.max(target.stun,18);}
   if(domain.kind==="shrine"){spawn(target.x,245,"#ef4c78",42);target.stun=Math.max(target.stun,12);}
  }else{
   const names={yuji:"BLACK FLASH: IMPACTO DA ALMA",nobara:"RESSONÂNCIA: BONECO DE PALHA",todo:"BOOGIE WOOGIE: TROCA E COMBO"};
   game.domain={name:names[a.data.id],kind:"finisher",color:a.data.color,life:95,owner:a.side,target,tick:0,age:0};
  }
 }
 if(type==="special"){
  const shots={
   gojo:{kind:"blue",speed:10.5,damage:Math.round(damage*1.08),size:24,life:95},
   yuji:{kind:"shock",speed:12,damage:Math.round(damage*.95),size:19,life:78},
   megumi:{kind:"nue",speed:8.5,damage:Math.round(damage*1.12),size:25,life:90},
   nobara:{kind:"nail",speed:13.5,damage:Math.round(damage*1.08),size:9,life:90},
   sukuna:{kind:"slash",speed:14,damage:Math.round(damage*1.16),size:30,life:85},
   todo:{kind:"clap",speed:11,damage:Math.round(damage*.9),size:22,life:80}
  };
  const shot=shots[a.data.id]||shots.yuji;
  game.projectiles.push({x:a.x+a.face*48,y:238+a.y,vx:a.face*shot.speed,life:shot.life,maxLife:shot.life,owner:a.side,target,color:a.data.color,...shot,angle:0,trail:[]});
  spawn(a.x+a.face*48,238,a.data.color,18);
  if(a===game.p)setMessage(({gojo:"AZUL: LAPSE",yuji:"PUNHO DIVERGENTE",megumi:"NUE",nobara:"HAIRPIN",sukuna:"DESMANTELAR",todo:"BOOGIE WOOGIE"})[a.data.id]);
  return;
 }
 const inFront=Math.sign(target.x-a.x)===a.face;
 if(Math.abs(target.x-a.x)<=range&&inFront&&target.hp>0){
  const blocked=target.blocking&&target.face===-a.face;
  const dealt=Math.max(2,Math.round(damage*(blocked?.2:1)));
  target.hp=Math.max(0,target.hp-dealt);target.stun=blocked?5:type==="ultimate"?25:type==="special"?16:10;
  target.action=blocked?"block":"hurt";target.actionTime=blocked?4:12;target.vx=a.face*(blocked?2:type==="ultimate"?11:type==="special"?8:6);
  target.hitFlash=12;target.combo++;target.comboTime=78;a.energy=Math.min(100,a.energy+(blocked?4:11));
  const color=blocked?"#c8b4ff":a.data.color;
  spawn(target.x,target.y+270,color,blocked?8:type==="ultimate"?34:18);
  game.shake=type==="ultimate"?15:type==="special"?8:4;
  game.hitstop=type==="ultimate"?9:type==="heavy"?4:2;
  game.flash=type==="ultimate"?10:0;
  if(type==="special"||type==="ultimate"){
   for(let i=0;i<3;i++)game.particles.push({x:a.x+a.face*(45+i*22),y:225-i*24,vx:a.face*(3+i),vy:(i-1)*1.7,life:28,color:a.data.color,size:16+i*8,orb:true});
  }
  if(a===game.p){
   const moveNames={
    gojo:{light:"SOCO",heavy:"AZUL: LAPSE",special:"AZUL: LAPSE",ultimate:"VAZIO ILIMITADO"},
    yuji:{light:"SOCO DE ENERGIA AMALDIÇOADA",heavy:"PUNHO DIVERGENTE",special:"PUNHO DIVERGENTE",ultimate:"BLACK FLASH"},
    megumi:{light:"COMBATE CORPO A CORPO",heavy:"CÃES DIVINOS",special:"NUE",ultimate:"JARDIM DAS SOMBRAS QUIMÉRICAS"},
    nobara:{light:"MARTELO",heavy:"RESSONÂNCIA",special:"HAIRPIN",ultimate:"RESSONÂNCIA: BONECO DE PALHA"},
    sukuna:{light:"GOLPE",heavy:"CLIVAR",special:"DESMANTELAR",ultimate:"SANTUÁRIO MALEVOLENTE"},
    todo:{light:"SOCO",heavy:"GOLPE DE BOOGIE",special:"BOOGIE WOOGIE",ultimate:"BOOGIE WOOGIE: TROCA"}
   };
   setMessage((blackFlash?"BLACK FLASH! ":moveNames[a.data.id]?.[type]||"TÉCNICA")+"  •  "+dealt);
  }
  if(target.hp<=0)endFight(a===game.p?"VITÓRIA!":"DERROTA!");
 }else if(a===game.p&&type!=="light")setMessage("GOLPE NÃO ALCANÇOU");
}
function update(dt){
 if(!game||paused||finished)return;
 if(game.hitstop>0){game.hitstop-=dt;return;}
 game.frame+=dt;if(game.domain){
  const d=game.domain;d.life-=dt;d.age+=dt;d.tick-=dt;
  if(d.life<=0)game.domain=null;
  else if(d.target&&d.target.hp>0&&d.tick<=0){
   if(d.kind==="shrine"&&d.age>8){const hit= Math.min(d.target.hp,4);d.target.hp-=hit;d.target.stun=Math.max(d.target.stun,3);spawn(d.target.x+(Math.random()-.5)*70,235+(Math.random()-.5)*90,"#ef4c78",5);game.shake=4;d.tick=13;}
   if(d.kind==="shadows"&&d.age>12){const hit=Math.min(d.target.hp,5);d.target.hp-=hit;d.target.stun=Math.max(d.target.stun,5);spawn(d.target.x,250,"#7885d8",8);d.tick=25;}
   if(d.kind==="void"&&d.age>28&&d.age<100){const hit=Math.min(d.target.hp,2);d.target.hp-=hit;d.tick=22;}
   if(d.kind==="finisher"&&d.age>8){const hit=Math.min(d.target.hp,3);d.target.hp-=hit;spawn(d.target.x,245,d.color,6);d.tick=18;}
   if(d.target.hp<=0)endFight(d.owner===1?"VITÓRIA!":"DERROTA!");
  }
 }game.time=Math.max(0,game.time-dt/60);
 if(game.time<=0){endFight(game.p.hp>=game.e.hp?"TEMPO ESGOTADO: VITÓRIA":"TEMPO ESGOTADO: DERROTA");return;}
 updateFighter(game.p,game.e,dt,true);updateFighter(game.e,game.p,dt,false);
 resolveAttack(game.p);resolveAttack(game.e);
 game.projectiles=game.projectiles.filter(q=>q.life>0);
 game.projectiles.forEach(q=>{
  q.trail.push({x:q.x,y:q.y});if(q.trail.length>9)q.trail.shift();
  q.x+=q.vx*dt;q.life-=dt;q.angle+=.18*dt;
  const victim=q.target;
  if(victim&&Math.abs(q.x-victim.x)<34&&Math.abs(q.y-(370+victim.y-125))<105){
   const blocked=victim.blocking&&victim.face===-Math.sign(q.vx);
   const dealt=Math.max(2,Math.round(q.damage*(blocked?.2:1)));
   victim.hp=Math.max(0,victim.hp-dealt);victim.stun=blocked?4:12;victim.action=blocked?"block":"hurt";victim.actionTime=10;victim.vx=Math.sign(q.vx)*(blocked?2:7);victim.hitFlash=10;
   spawn(victim.x,245,q.color,blocked?8:20);game.shake=blocked?3:7;game.hitstop=3;q.life=0;
   if(victim.hp<=0)endFight(q.owner===1?"VITÓRIA!":"DERROTA!");
  }
 });
 const gap=game.e.x-game.p.x;
 if(Math.abs(gap)<62){const push=(62-Math.abs(gap))*.5;game.p.x-=Math.sign(gap||1)*push;game.e.x+=Math.sign(gap||1)*push;}
 game.particles=game.particles.filter(p=>p.life>0);
 game.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.orb?-.015:.15*dt;p.life-=dt;p.size*=p.orb?1.001:.995;});
 game.shake=Math.max(0,game.shake-dt);game.flash=Math.max(0,(game.flash||0)-dt);
 updateHud();
}
function drawFighter(a){
 const x=a.x,y=370+a.y,face=a.face,t=game.frame,walk=a.walk;
 const isGojo=a.data.id==="gojo",isYuji=a.data.id==="yuji",isMegumi=a.data.id==="megumi",isNobara=a.data.id==="nobara",isSukuna=a.data.id==="sukuna",isTodo=a.data.id==="todo";
 const hair=isGojo?"#f1f0ff":isYuji?"#d98b91":isMegumi?"#171a27":isNobara?"#9a563b":isSukuna?"#ce7788":"#302b34";
 const outfit=isGojo?"#171827":isYuji?"#a83255":isMegumi?"#172238":isNobara?"#6c4238":isSukuna?"#431c32":"#4d3b65";
 const skin=isSukuna?"#e7b5a8":"#e9c4b5";
 const moving=a.action==="walk"||a.action==="dash";
 const attacking=["light","heavy","special","ultimate"].includes(a.action);
 const jump=a.action==="jump",block=a.blocking||a.action==="block";
 const bob=a.action==="idle"?Math.sin(a.breath)*2.8:moving?Math.sin(t*.42)*1.7:0;
 const stride=moving?Math.sin(t*.48)*13:jump?8:0;
 ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.translate(0,bob);
 if(attacking){const phase=1-a.actionTime/(a.action==="ultimate"?52:a.action==="special"?36:a.action==="heavy"?27:18);ctx.translate(Math.sin(phase*Math.PI)*5,0);ctx.rotate((a.action==="special"?.045:a.action==="heavy"?.075:.025)*Math.sin(phase*Math.PI));}
 // Ground aura and shadow
 const aura=ctx.createRadialGradient(0,-28,8,0,-28,78);
 aura.addColorStop(0,a.data.color+"55");aura.addColorStop(1,a.data.color+"00");
 ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-28,76,32,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#03030a99";ctx.beginPath();ctx.ellipse(0,5,38,9,0,0,Math.PI*2);ctx.fill();
 if(a.action==="dash"){ctx.globalAlpha=.22;for(let i=0;i<3;i++){ctx.fillStyle=a.data.color;ctx.beginPath();ctx.ellipse(-22-i*18,-90,24,58,0,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
 // legs and boots
 ctx.lineCap="round";ctx.lineJoin="round";
 const legColor=isGojo?"#20253b":isYuji?"#292333":isMegumi?"#111c31":isNobara?"#25202a":isSukuna?"#421e36":"#27212e";
 ctx.strokeStyle=legColor;ctx.lineWidth=17;
 ctx.beginPath();ctx.moveTo(-10,-65);ctx.lineTo(-13-stride,-25);ctx.lineTo(-16-stride,-5);ctx.moveTo(10,-65);ctx.lineTo(13+stride,-25);ctx.lineTo(16+stride,-5);ctx.stroke();
 ctx.fillStyle=isYuji?"#e9d2cc":isNobara?"#bd9a85":"#24202e";
 ctx.beginPath();ctx.ellipse(-18-stride,-3,17,7,0,0,Math.PI*2);ctx.ellipse(15+stride,-3,17,7,0,0,Math.PI*2);ctx.fill();
 // torso silhouette
 const torso=ctx.createLinearGradient(-30,-155,30,-45);torso.addColorStop(0,outfit);torso.addColorStop(.55,outfit);torso.addColorStop(1,"#0b0b15");
 ctx.fillStyle=torso;ctx.beginPath();ctx.moveTo(-25,-151);ctx.quadraticCurveTo(-35,-135,-29,-85);ctx.lineTo(-23,-54);ctx.quadraticCurveTo(0,-44,24,-54);ctx.lineTo(30,-85);ctx.quadraticCurveTo(35,-135,24,-151);ctx.closePath();ctx.fill();
 // jacket / uniform lapels
 ctx.fillStyle=isGojo?"#303047":isYuji?"#cf496b":isMegumi?"#34445d":isNobara?"#9a6752":isSukuna?"#8c3658":"#80609c";
 ctx.beginPath();ctx.moveTo(-23,-149);ctx.lineTo(-8,-128);ctx.lineTo(-1,-70);ctx.lineTo(-26,-87);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(23,-149);ctx.lineTo(8,-128);ctx.lineTo(1,-70);ctx.lineTo(27,-87);ctx.closePath();ctx.fill();
 // high collar
 ctx.fillStyle=isGojo?"#101321":outfit;ctx.beginPath();ctx.moveTo(-24,-151);ctx.lineTo(-19,-179);ctx.quadraticCurveTo(0,-187,20,-178);ctx.lineTo(25,-151);ctx.lineTo(10,-137);ctx.lineTo(-10,-137);ctx.closePath();ctx.fill();
 ctx.strokeStyle=a.data.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-19,-151);ctx.lineTo(-12,-140);ctx.lineTo(10,-140);ctx.lineTo(21,-151);ctx.stroke();
 // Arms with animated combat pose
 const armSwing=attacking?Math.min(1,(a.actionTime/(a.action==="ultimate"?52:36))):0;
 const forward=block?22:attacking?65: moving?28:19;
 ctx.strokeStyle=skin;ctx.lineWidth=13;ctx.beginPath();
 ctx.moveTo(-22,-139);ctx.quadraticCurveTo(-40,-116,-(block?8:forward),-105);ctx.moveTo(22,-139);ctx.quadraticCurveTo(39,-117,block?8:attacking?70:31,-(attacking?112:104));ctx.stroke();
 ctx.fillStyle=isGojo?"#dedcf0":outfit;ctx.beginPath();ctx.ellipse(-forward,-106,11,15,-.3,0,Math.PI*2);ctx.ellipse(attacking?70:31,-105,11,15,.3,0,Math.PI*2);ctx.fill();
 if(block){ctx.strokeStyle="#d8c8ff";ctx.lineWidth=8;ctx.globalAlpha=.75;ctx.beginPath();ctx.arc(29,-126,46,-2.5,-.35);ctx.stroke();ctx.globalAlpha=1;}
 // Neck and face
 ctx.fillStyle=skin;ctx.fillRect(-8,-183,16,20);
 ctx.fillStyle=skin;ctx.beginPath();ctx.ellipse(0,-198,23,29,0,0,Math.PI*2);ctx.fill();
 // ears
 ctx.beginPath();ctx.ellipse(-22,-198,5,9,0,0,Math.PI*2);ctx.ellipse(22,-198,5,9,0,0,Math.PI*2);ctx.fill();
 // Hair silhouette, unique profiles
 ctx.fillStyle=hair;ctx.beginPath();
 if(isGojo){ctx.moveTo(-23,-209);ctx.lineTo(-34,-230);ctx.lineTo(-17,-220);ctx.lineTo(-13,-241);ctx.lineTo(-2,-221);ctx.lineTo(10,-244);ctx.lineTo(15,-220);ctx.lineTo(33,-231);ctx.lineTo(25,-205);ctx.lineTo(18,-184);ctx.lineTo(8,-199);ctx.lineTo(-2,-181);ctx.lineTo(-12,-201);ctx.lineTo(-23,-188);ctx.closePath();}
 else if(isYuji){ctx.moveTo(-23,-211);ctx.lineTo(-28,-229);ctx.lineTo(-14,-222);ctx.lineTo(-8,-238);ctx.lineTo(1,-222);ctx.lineTo(14,-235);ctx.lineTo(17,-219);ctx.lineTo(29,-224);ctx.lineTo(23,-199);ctx.lineTo(12,-190);ctx.lineTo(-12,-191);ctx.closePath();}
 else if(isMegumi){ctx.moveTo(-23,-211);ctx.lineTo(-27,-238);ctx.lineTo(-13,-220);ctx.lineTo(-6,-246);ctx.lineTo(2,-222);ctx.lineTo(16,-242);ctx.lineTo(14,-219);ctx.lineTo(29,-233);ctx.lineTo(23,-201);ctx.lineTo(11,-190);ctx.lineTo(-15,-190);ctx.closePath();}
 else if(isNobara){ctx.moveTo(-23,-207);ctx.lineTo(-30,-235);ctx.lineTo(-12,-224);ctx.lineTo(-4,-239);ctx.lineTo(7,-222);ctx.lineTo(24,-231);ctx.lineTo(25,-205);ctx.lineTo(18,-187);ctx.lineTo(-19,-187);ctx.closePath();}
 else if(isSukuna){ctx.moveTo(-23,-208);ctx.lineTo(-29,-231);ctx.lineTo(-13,-222);ctx.lineTo(-5,-239);ctx.lineTo(6,-220);ctx.lineTo(21,-235);ctx.lineTo(28,-210);ctx.lineTo(19,-187);ctx.lineTo(-18,-187);ctx.closePath();}
 else{ctx.moveTo(-24,-208);ctx.lineTo(-28,-230);ctx.lineTo(-10,-221);ctx.lineTo(3,-236);ctx.lineTo(16,-220);ctx.lineTo(27,-230);ctx.lineTo(23,-199);ctx.lineTo(13,-187);ctx.lineTo(-18,-188);ctx.closePath();}
 ctx.fill();
 // Fringe / face details
 ctx.fillStyle=hair;ctx.beginPath();ctx.moveTo(-19,-213);ctx.quadraticCurveTo(-8,-222,0,-211);ctx.lineTo(-3,-194);ctx.lineTo(-11,-203);ctx.lineTo(-18,-192);ctx.closePath();ctx.fill();
 ctx.fillStyle="#27202a";ctx.beginPath();ctx.ellipse(-9,-198,5,2,0,0,Math.PI*2);ctx.ellipse(9,-198,5,2,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=isGojo?"#74d9f0":isSukuna?"#d84c67":"#d5c8af";ctx.beginPath();ctx.arc(-8,-198,2.2,0,Math.PI*2);ctx.arc(8,-198,2.2,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#694b50";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-6,-184);ctx.quadraticCurveTo(0,-181,6,-184);ctx.stroke();
 if(isGojo){
  // Gojo's recognizable black blindfold and pale spiky hair
  ctx.fillStyle="#090b16";ctx.beginPath();ctx.roundRect(-24,-207,48,12,5);ctx.fill();
  ctx.strokeStyle="#55536b";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-20,-201);ctx.lineTo(20,-201);ctx.stroke();
  ctx.fillStyle="#f8f7ff";ctx.beginPath();ctx.moveTo(-20,-220);ctx.lineTo(-31,-239);ctx.lineTo(-11,-226);ctx.lineTo(-4,-248);ctx.lineTo(7,-225);ctx.lineTo(20,-243);ctx.lineTo(27,-216);ctx.fill();
 }
 if(isSukuna){
  // Sukuna's distinctive facial curse markings
  ctx.strokeStyle="#641c39";ctx.lineWidth=2.7;ctx.lineCap="round";ctx.beginPath();
  ctx.moveTo(-19,-207);ctx.lineTo(-9,-202);ctx.moveTo(19,-207);ctx.lineTo(9,-202);
  ctx.moveTo(-18,-193);ctx.lineTo(-10,-188);ctx.moveTo(18,-193);ctx.lineTo(10,-188);
  ctx.moveTo(-14,-180);ctx.lineTo(-5,-176);ctx.moveTo(14,-180);ctx.lineTo(5,-176);ctx.stroke();
  ctx.strokeStyle="#8d294b";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,-128);ctx.lineTo(-7,-118);ctx.moveTo(18,-128);ctx.lineTo(7,-118);ctx.stroke();
 }
 if(isNobara){
  // Auburn bob, side fringe and small gold hair clip
  ctx.fillStyle="#d08b45";ctx.beginPath();ctx.arc(18,-216,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#9a563b";ctx.beginPath();ctx.arc(-20,-199,6,0,Math.PI*2);ctx.arc(20,-199,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#e5b45f";ctx.fillRect(11,-221,9,3);
 }
 if(isYuji){
  // Red hood visible behind the dark school uniform
  ctx.fillStyle="#a83255";ctx.beginPath();ctx.moveTo(-25,-151);ctx.quadraticCurveTo(-37,-176,0,-184);ctx.quadraticCurveTo(37,-176,25,-151);ctx.fill();
  ctx.fillStyle="#e6a0a0";ctx.beginPath();ctx.moveTo(-18,-220);ctx.lineTo(-27,-232);ctx.lineTo(-8,-225);ctx.lineTo(0,-238);ctx.lineTo(9,-224);ctx.lineTo(22,-232);ctx.lineTo(19,-211);ctx.fill();
 }
 if(isMegumi){
  // Dark navy high collar and angular shadow-like spikes
  ctx.fillStyle="#101a30";ctx.fillRect(-23,-151,46,8);
  ctx.fillStyle="#171a27";ctx.beginPath();ctx.moveTo(-22,-218);ctx.lineTo(-31,-244);ctx.lineTo(-12,-227);ctx.lineTo(-5,-249);ctx.lineTo(5,-225);ctx.lineTo(18,-246);ctx.lineTo(17,-221);ctx.lineTo(30,-235);ctx.lineTo(22,-205);ctx.fill();
 }
 if(isTodo){
  // Broad shoulders and characteristic tied-back dark hair
  ctx.fillStyle="#302b34";ctx.beginPath();ctx.arc(0,-231,10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#bd987b";ctx.fillRect(-23,-170,46,7);
 }
 if(isTodo){ctx.fillStyle="#c69d78";ctx.fillRect(-20,-174,40,5);}
 // Sustained cursed-energy charging aura, with expanding rings and rising sparks
 if(a.charging){
  ctx.save();ctx.globalCompositeOperation="lighter";
  const pulse=1+Math.sin(a.chargePulse)*.12;
  const aura=ctx.createRadialGradient(0,-115,12,0,-115,82*pulse);
  aura.addColorStop(0,a.data.color+"66");aura.addColorStop(.55,a.data.color+"22");aura.addColorStop(1,a.data.color+"00");
  ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-116,58*pulse,108*pulse,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=a.data.color;ctx.globalAlpha=.55;ctx.lineWidth=2;
  for(let ring=0;ring<3;ring++){ctx.beginPath();ctx.ellipse(0,-112,34+ring*13+Math.sin(a.chargePulse+ring)*4,58+ring*16,game.frame*.018*(ring%2?1:-1),0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=.95;ctx.fillStyle="#fff";ctx.font="900 12px 'Barlow Condensed',sans-serif";ctx.textAlign="center";ctx.fillText("CARREGANDO",0,-258);
  ctx.restore();
 }
 // Layered cursed-energy charge: anticipation, rotating seals and character-colored sparks
 if(a.action==="special"||a.action==="ultimate"){
  const ultimate=a.action==="ultimate",phase=1-a.actionTime/(ultimate?52:36);
  const radius=(ultimate?68:43)*(0.82+Math.sin(game.frame*.34)*.12);
  const cx=a.face*(ultimate?56:48),cy=ultimate?-135:-126;
  ctx.save();ctx.globalCompositeOperation="lighter";ctx.shadowColor=a.data.color;ctx.shadowBlur=ultimate?34:23;
  ctx.globalAlpha=.35+.5*Math.sin(Math.min(1,phase+.15)*Math.PI);
  ctx.strokeStyle=a.data.color;ctx.lineWidth=ultimate?7:4;
  for(let ring=0;ring<(ultimate?3:2);ring++){
   ctx.beginPath();ctx.ellipse(cx,cy,radius+ring*12,(radius+ring*12)*.56,game.frame*.025*(ring%2?1:-1),-.95,1.35);ctx.stroke();
  }
  ctx.globalAlpha=.9;
  for(let spark=0;spark<7;spark++){
   const ang=game.frame*.11+spark*Math.PI*2/7;
   const sx=cx+Math.cos(ang)*radius,sy=cy+Math.sin(ang)*radius*.56;
   ctx.fillStyle=spark%2?"#ffffff":a.data.color;ctx.beginPath();ctx.arc(sx,sy,2.5+(spark%3),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
 if(a.hitFlash>0){ctx.globalCompositeOperation="screen";ctx.fillStyle="#ffffff66";ctx.fillRect(-32,-240,64,240);}
 ctx.restore();
}
function draw(){
 const w=960,h=480;ctx.save();
 if(game.shake>0)ctx.translate((Math.random()-.5)*game.shake,(Math.random()-.5)*game.shake);
 const stages=[["#111326","#292044","#704d83"],["#0b1b2a","#1c4054","#66859b"],["#1a1020","#3b1b38","#a34c70"]][game.stage];
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,stages[0]);sky.addColorStop(.68,stages[1]);sky.addColorStop(1,"#15101c");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 // moonlight and drifting atmosphere
 const moon=ctx.createRadialGradient(740,104,8,740,104,190);moon.addColorStop(0,"#d7c8ff55");moon.addColorStop(1,"#a68aff00");ctx.fillStyle=moon;ctx.fillRect(520,-80,440,360);
 ctx.fillStyle="#ffffff16";for(let i=0;i<65;i++){const px=(i*137+game.frame*.18)%960,py=(i*71)%325;ctx.fillRect(px,py,1.5,1.5);}
 // skyline / temple silhouettes
 for(let layer=0;layer<3;layer++){ctx.fillStyle=layer===0?"#080b19aa":layer===1?"#111224bb":"#171326";const base=315+layer*19;for(let i=0;i<11;i++){const bx=i*105-20+layer*15,bw=55+(i%3)*12,bh=85+(i*37%105);ctx.fillRect(bx,base-bh,bw,bh);ctx.fillRect(bx-8,base-bh-7,bw+16,7);if(i%3===0){ctx.fillRect(bx+bw/2-3,base-bh-26,6,20);ctx.beginPath();ctx.moveTo(bx-15,base-bh-7);ctx.lineTo(bx+bw/2,base-bh-20);ctx.lineTo(bx+bw+15,base-bh-7);ctx.fill();}}}
 // Character-specific domain visuals
 if(game.domain){
  const d=game.domain, pulse=1+Math.sin(game.frame*.16)*.045;
  ctx.save();ctx.globalCompositeOperation="screen";
  if(d.kind==="void"){
   const g=ctx.createRadialGradient(480,230,10,480,230,600);g.addColorStop(0,"#dcecffaa");g.addColorStop(.35,"#6379c955");g.addColorStop(1,"#080817ee");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
   for(let i=0;i<24;i++){const x=(i*83+game.frame*1.7)%960,y=(i*47+game.frame*.8)%380;ctx.fillStyle="#ffffffaa";ctx.beginPath();ctx.arc(x,y,1+(i%3),0,Math.PI*2);ctx.fill();}
  }else if(d.kind==="shrine"){
   ctx.fillStyle="#3b081dcc";ctx.fillRect(0,0,w,h);
   ctx.strokeStyle="#f35c78aa";ctx.lineWidth=3;
   for(let i=0;i<9;i++){const x=(i*127+game.frame*2)%1050-40;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-85,390);ctx.stroke();}
   ctx.fillStyle="#b92b4d55";ctx.fillRect(0,340,w,44);
  }else if(d.kind==="shadows"){
   ctx.fillStyle="#070916dd";ctx.fillRect(0,0,w,h);
   for(let i=0;i<8;i++){const x=i*145-30+Math.sin(game.frame*.04+i)*22;ctx.fillStyle=i%2?"#242b54aa":"#11152fee";ctx.beginPath();ctx.moveTo(x,385);ctx.quadraticCurveTo(x-35,235,x+35,150+(i%3)*35);ctx.quadraticCurveTo(x+90,260,x+115,385);ctx.fill();}
   ctx.strokeStyle="#8797e988";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(480,360,360*pulse,45,0,0,Math.PI*2);ctx.stroke();
  }else{
   ctx.fillStyle=d.color+"22";ctx.fillRect(0,0,w,h);
   for(let i=0;i<5;i++){ctx.strokeStyle=d.color+"99";ctx.lineWidth=2;ctx.beginPath();ctx.arc(480,245,55+i*43+Math.sin(game.frame*.1+i)*8,0,Math.PI*2);ctx.stroke();}
  }
  ctx.restore();
  ctx.textAlign="center";ctx.font="900 24px 'Barlow Condensed',sans-serif";ctx.fillStyle="#fff";ctx.shadowColor=d.color;ctx.shadowBlur=24;ctx.fillText(d.name,480,142);ctx.shadowBlur=0;
 }
 // large torii-inspired frame and stage banners
 ctx.globalAlpha=.38;ctx.fillStyle=stages[2];ctx.fillRect(85,165,13,185);ctx.fillRect(862,150,13,200);ctx.fillRect(65,157,830,12);ctx.fillRect(120,172,720,5);ctx.globalAlpha=1;
 ctx.strokeStyle="#d5c4ff18";ctx.lineWidth=1;for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(40+i*85,340);ctx.lineTo(480+(i-6)*18,390);ctx.stroke();}
 // floor with perspective grid
 ctx.fillStyle="#080711";ctx.fillRect(0,384,w,96);const floor=ctx.createLinearGradient(0,384,0,480);floor.addColorStop(0,"#21172b");floor.addColorStop(1,"#080711");ctx.fillStyle=floor;ctx.fillRect(0,384,w,96);
 ctx.strokeStyle="#a88acb35";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,385);ctx.lineTo(w,385);for(let i=0;i<=12;i++){ctx.moveTo(i*80,385);ctx.lineTo(480+(i-6)*115,480);}for(let j=0;j<5;j++){const yy=390+j*j*4+2;ctx.moveTo(0,yy);ctx.lineTo(w,yy);}ctx.stroke();
 // animated ground seals
 ctx.save();ctx.translate(480,390);ctx.rotate(game.frame*.003);ctx.strokeStyle="#b18aff25";ctx.setLineDash([8,12]);ctx.beginPath();ctx.ellipse(0,0,195,28,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
 // Ranged cursed techniques with distinct shapes, trails and animated cores
 game.projectiles.forEach(q=>{
  ctx.save();ctx.globalCompositeOperation="lighter";
  q.trail.forEach((pt,i)=>{ctx.globalAlpha=(i/q.trail.length)*.34;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(pt.x,pt.y,Math.max(2,q.size*(i/q.trail.length)*.55),0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=.95;ctx.translate(q.x,q.y);ctx.rotate(q.angle);ctx.shadowColor=q.color;ctx.shadowBlur=25;
  ctx.strokeStyle=q.color;ctx.fillStyle=q.color;
  if(q.kind==="nail"){
   ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(17,0);ctx.stroke();ctx.beginPath();ctx.moveTo(12,-7);ctx.lineTo(23,0);ctx.lineTo(12,7);ctx.stroke();
   ctx.fillStyle="#f2c77b";ctx.beginPath();ctx.arc(-18,0,4,0,Math.PI*2);ctx.fill();
  }else if(q.kind==="slash"){
   ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,q.size,-1.05,1.05);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.size*.68,-.85,.85);ctx.stroke();
  }else if(q.kind==="blue"){
   const g=ctx.createRadialGradient(-5,-5,2,0,0,q.size);g.addColorStop(0,"#ffffff");g.addColorStop(.28,"#b9f5ff");g.addColorStop(1,"#397bff00");
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,q.size,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8beaff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.size*.72,0,Math.PI*2);ctx.stroke();
  }else if(q.kind==="nue"){
   ctx.beginPath();ctx.moveTo(-q.size,0);ctx.quadraticCurveTo(-8,-q.size*1.3,q.size,0);ctx.quadraticCurveTo(8,q.size*1.3,-q.size,0);ctx.fill();
   ctx.strokeStyle="#d9e7ff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-q.size*.65,-4);ctx.lineTo(q.size*.65,4);ctx.stroke();
  }else if(q.kind==="clap"){
   ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,q.size*(.55+i*.35),-.75,.75);ctx.stroke();}
   ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
  }else{
   ctx.fillStyle=q.color;ctx.beginPath();ctx.ellipse(0,0,q.size,q.size*.48,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,q.size*.7,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
 });
 // energy particles and hit sparks
 game.particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/35);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=p.orb?24:8;if(p.orb){ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.size*1.7,0,Math.PI*2);ctx.stroke();}else{ctx.beginPath();ctx.arc(p.x,p.y,p.size*.6,0,Math.PI*2);ctx.fill();}});ctx.globalAlpha=1;ctx.shadowBlur=0;
 drawFighter(game.p);drawFighter(game.e);
 // action labels and combo callouts
 if(game.messageTime>0){game.messageTime--;ctx.textAlign="center";ctx.font="900 39px 'Barlow Condensed',sans-serif";ctx.fillStyle="#fff";ctx.shadowColor="#9d65ff";ctx.shadowBlur=18;ctx.fillText(game.message,480,92);ctx.shadowBlur=0;}
 if(game.p.combo>=2&&game.p.comboTime>0){ctx.textAlign="left";ctx.font="900 24px 'Barlow Condensed'";ctx.fillStyle="#e6d4ff";ctx.fillText(game.p.combo+" HIT COMBO",48,145);}
 if(game.flash>0){ctx.globalAlpha=game.flash/16*.28;ctx.fillStyle="#e8d8ff";ctx.fillRect(0,0,w,h);}
 ctx.restore();
}
function updateHud(){if(!game)return;$("pHealth").style.width=game.p.hp+"%";$("eHealth").style.width=game.e.hp+"%";$("pEnergy").style.width=game.p.energy+"%";$("eEnergy").style.width=game.e.energy+"%";$("timer").textContent=Math.ceil(game.time);}
function loop(t){if(!game)return;const dt=last?Math.min(2.2,(t-last)/16.67):1;last=t;update(dt);draw();if(!finished)raf=requestAnimationFrame(loop);}
function pause(){if(!game||finished)return;paused=!paused;$("overlay").classList.toggle("hidden",!paused);$("overlayTitle").textContent="PAUSADO";$("overlayText").textContent="A batalha está em pausa.";$("resumeBtn").textContent="CONTINUAR";if(!paused){last=0;raf=requestAnimationFrame(loop);}else cancelAnimationFrame(raf);}
$("startBtn").onclick=()=>{show("select");buildRoster();showDetail();};$("backHome").onclick=()=>show("home");$("howBtn").onclick=$("howBtn2").onclick=()=>show("how");$("closeHow").onclick=()=>show("home");$("fightBtn").onclick=startFight;$("pauseBtn").onclick=pause;$("resumeBtn").onclick=()=>{if(finished){show("select");buildRoster();showDetail();}else pause();};$("quitBtn").onclick=()=>{cancelAnimationFrame(raf);game=null;show("select");buildRoster();showDetail();};
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if([" ","arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();keys[k]=true;if(k==="escape")pause();});window.addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false;});
document.querySelectorAll(".mobile-controls button").forEach(b=>{const k=b.dataset.key;b.addEventListener("pointerdown",e=>{e.preventDefault();keys[k]=true;});["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false));});
buildRoster();showDetail();show("home");
})();