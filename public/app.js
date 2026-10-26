
(function(){
"use strict";
var GENRES=["Reggaetón","Salsa","Vallenato","Champeta","Cumbia","Bachata","Merengue","Rock","Rock en español","Pop","K-pop","Hip hop / Rap","Trap","R&B","Electrónica","Metal","Punk","Indie","Baladas","Boleros","Jazz / Blues","Clásica","Reggae","Country"];
var ENERGY=["Reggaetón","Trap","Metal","Punk","Electrónica","Rock","Rock en español","Hip hop / Rap","Champeta","K-pop"];
var MELLOW=["Baladas","Boleros","Jazz / Blues","Clásica","Indie","R&B","Country","Reggae"];
var HORAS=["Un susurro: menos de 1 hora","Un rato en la neblina: 1 a 2 horas","Una noche larga: 3 a 4 horas","Poseíd@ todo el día: 5 horas o más"];
var HP=["menos de una hora","una o dos horas","tres o cuatro horas","cinco horas o más"];
var DONDE=["Entre las sombras de la calle y el transporte","En mi guarida, o sea, mi casa","Encadenad@ al estudio o al trabajo","En el carro, de noche","En el gimnasio, como en un exorcismo","En fiestas y reuniones de brujas"];
var DP=["en la calle y el transporte","en casa","mientras estudian o trabajan","en el carro","en el gimnasio","en fiestas y reuniones"];
var DESC=["Un amigo me los susurra al oído","El algoritmo me encuentra (Spotify, YouTube)","TikTok y Reels me hipnotizan","La radio y la tele, como voces de ultratumba","Los descubro en conciertos y fiestas","Los desentierro armando mis playlists","Shazam, cuando suena algo y no sé qué es"];
var DESCS=["Amigos","Algoritmo","TikTok y Reels","Radio y TV","Conciertos y fiestas","Mis playlists","Shazam"];
var DESCP=["por recomendaciones de amigos","por el algoritmo","en TikTok y Reels","en la radio y la tele","en conciertos y fiestas","armando sus propias playlists","con Shazam"];
var RECO=["Sí, hechízame","Tal vez, según la luna","Prefiero que no"];
var SIT=[
  {k:"road",   q:"Ocho horas de carretera sin luz y el motor empieza a toser. ¿Qué suena para no perder la cordura?",           short:"Road trip de 8 horas",       why:function(g){return "Para un road trip de 8 horas, los dos ponen "+g}},
  {k:"fiesta", q:"Organizas un aquelarre. ¿Qué sonido NO puede faltar o la fiesta muere?",                  short:"No puede faltar en la fiesta",why:function(g){return "Para los dos, en una fiesta no puede faltar "+g}},
  {k:"prota",  q:"Caminas sol@ de noche y hasta los monstruos se apartan a tu paso. ¿Qué suena en tu escena?",      short:"Caminar como protagonista",   why:function(g){return "Caminan como protagonistas al ritmo de "+g}},
  {k:"dia",    q:"Un día maldito te dejó sin alma. ¿Qué sonido te devuelve a la vida?",                          short:"Día horrible",                why:function(g){return "Cuando el día sale horrible, los dos se refugian en "+g}},
  {k:"arranca",q:"Tus amigos y tú llegan a una casa abandonada y el aquelarre empieza. ¿Qué suena?",                 short:"Arranca la fiesta con amigos",why:function(g){return "Cuando arranca la fiesta con amigos, los dos ponen "+g}},
  {k:"crush",  q:"Vas a poseer, con cariño, a la persona que te gusta. ¿Qué género le susurras de fondo?",                            short:"Cuando te gusta alguien",     why:function(g){return "Cuando les gusta alguien, los dos escuchan "+g}}
];
var STEPS=[{id:"name"},{id:"genres"},{id:"habits"},{id:"discover"}]
  .concat(SIT.map(function(s){return {id:"sit",sit:s}}))
  .concat([{id:"artist"}]);
var CREATURES={
  bruja:{name:"Bruja del sótano",txt:"Te atreves a probar lo que nadie más osa escuchar."},
  lobo:{name:"Hombre lobo",txt:"Aúllas con todo lo que tenga fuerza y ritmo."},
  fantasma:{name:"Fantasma",txt:"Flotas entre melodías tristes y hermosas."},
  vampiro:{name:"Vampiro",txt:"Vives de noche con los audífonos puestos y no piensas parar."},
  momia:{name:"Momia",txt:"Fiel a tu territorio musical desde hace siglos."},
  zombi:{name:"Zombi",txt:"Bailas lo que suene, aunque sea tambaleándote."}
};
function creatureOf(d){
  var all=(d.genres||[]).concat(SIT.map(function(s){return d[s.k]}).filter(Boolean)),e=0,m=0;
  all.forEach(function(g){if(ENERGY.indexOf(g)>-1)e++;if(MELLOW.indexOf(g)>-1)m++});
  var ap=d.apertura==null?50:d.apertura;
  if(ap>=80)return CREATURES.bruja;
  if(e>=m+3)return CREATURES.lobo;
  if(m>=e+2)return CREATURES.fantasma;
  if((d.horas||0)>=3)return CREATURES.vampiro;
  if(ap<=30)return CREATURES.momia;
  return CREATURES.zombi;
}
function defaultForm(){
  return {name:"",genres:[],horas:null,donde:null,descubre:[],apertura:50,recomienda:null,road:null,fiesta:null,prota:null,dia:null,arranca:null,crush:null,artist:""};
}

/* ---------- utilidades ---------- */
function h(tag,attrs){
  var e=document.createElement(tag);
  attrs=attrs||{};
  for(var k in attrs){
    var v=attrs[k];
    if(k==="class")e.className=v;
    else if(k==="style"&&v&&typeof v==="object")Object.assign(e.style,v);
    else if(k.indexOf("on")===0)e.addEventListener(k.slice(2),v);
    else if(v===true)e.setAttribute(k,"");
    else if(v!==false&&v!=null)e.setAttribute(k,v);
  }
  var kids=Array.prototype.slice.call(arguments,2).flat(Infinity);
  kids.forEach(function(c){
    if(c==null||c===false)return;
    e.append(c.nodeType?c:document.createTextNode(String(c)));
  });
  return e;
}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return Math.abs(x)}
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim()}
function listES(a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" y "+a[a.length-1]}
function inter(x,y){return x.filter(function(v){return y.indexOf(v)>-1})}
var ROMAN=["I","II","III"];

/* ---------- gotas de sangre ---------- */
(function(){
  var NS="http://www.w3.org/2000/svg",r=mulberry(13),svg=document.createElementNS(NS,"svg");
  svg.setAttribute("viewBox","0 0 1200 100");svg.setAttribute("preserveAspectRatio","none");
  var band=document.createElementNS(NS,"rect");band.setAttribute("class","b");band.setAttribute("x","0");band.setAttribute("y","0");band.setAttribute("width","1200");band.setAttribute("height","12");svg.appendChild(band);
  for(var x=14;x<1200;x+=18+r()*50){
    var w=5+r()*7,len=14+r()*70,rect=document.createElementNS(NS,"rect");
    rect.setAttribute("class","b");rect.setAttribute("x",x);rect.setAttribute("y","6");rect.setAttribute("width",w);rect.setAttribute("height",len);rect.setAttribute("rx",w/2);svg.appendChild(rect);
    var c=document.createElementNS(NS,"circle");c.setAttribute("class","b");c.setAttribute("cx",x+w/2);c.setAttribute("cy",6+len);c.setAttribute("r",w*.9);svg.appendChild(c);
  }
  document.getElementById("drips").appendChild(svg);
})();
window.addEventListener("pointermove",function(e){
  var s=document.documentElement.style;s.setProperty("--mx",e.clientX+"px");s.setProperty("--my",e.clientY+"px");
},{passive:true});

/* ---------- sonido ---------- */
var sfx={ctx:null,on:true,started:false,master:null,
  start:function(){
    try{
      if(!this.ctx){
        var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
        var c=this.ctx=new AC();this.master=c.createGain();this.master.connect(c.destination);
        var self=this;
        [55,58.2,110.4].forEach(function(f,i){
          var o=c.createOscillator(),g=c.createGain();o.type=i===2?"triangle":"sine";o.frequency.value=f;g.gain.value=i===2?0.012:0.05;
          o.connect(g);g.connect(self.master);o.start();
        });
        setInterval(function(){self.heart()},1400);
      }
      if(this.ctx.state==="suspended")this.ctx.resume();
      this.started=true;this.apply();
    }catch(e){}
  },
  apply:function(){if(this.master)this.master.gain.value=this.on?0.55:0},
  heart:function(){
    if(!this.on||!this.ctx)return;
    var c=this.ctx,t=c.currentTime,m=this.master;
    [0,0.28].forEach(function(d,i){
      var o=c.createOscillator(),g=c.createGain();o.type="sine";
      o.frequency.setValueAtTime(i?48:62,t+d);o.frequency.exponentialRampToValueAtTime(30,t+d+0.18);
      g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(i?0.3:0.45,t+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.22);
      o.connect(g);g.connect(m);o.start(t+d);o.stop(t+d+0.25);
    });
  },
  stab:function(){
    if(!this.on||!this.ctx)return;
    var c=this.ctx,t=c.currentTime,n=Math.floor(c.sampleRate*0.6),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var s=c.createBufferSource();s.buffer=b;var f=c.createBiquadFilter();f.type="bandpass";f.frequency.setValueAtTime(3000,t);f.frequency.exponentialRampToValueAtTime(300,t+0.5);
    var g=c.createGain();g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.6);
    s.connect(f);f.connect(g);g.connect(this.master);s.start(t);
  },
  toggle:function(){this.on=!this.on;if(this.on)this.start();this.apply();paintSnd()}
};
var sndBtn=document.getElementById("snd");
function paintSnd(){sndBtn.hidden=!sfx.started;sndBtn.textContent="Sonido: "+(sfx.on?"sí":"no")}
sndBtn.addEventListener("click",function(){sfx.toggle()});
function flash(){
  var f=document.getElementById("flash");f.classList.remove("go");void f.offsetWidth;f.classList.add("go");
  document.body.classList.add("shake");setTimeout(function(){document.body.classList.remove("shake")},500);
  sfx.stab();
}

/* ---------- estado ---------- */
var S={
  view:"intro",step:0,busy:false,error:"",
  form:defaultForm(),
  db:null,user:null,uid:null,isAdmin:false,isOwner:false,canWrite:null,
  me:null,reveal:null,myMatch:null,responses:[],matches:{},
  subsP:false,subsA:false
};
var $app=document.getElementById("app");

/* ---------- compatibilidad (máximo 100) ---------- */
function pair(a,b){
  var ag=a.genres||[],bg=b.genres||[];
  var gs=inter(ag,bg),dice=(ag.length+bg.length)?2*gs.length/(ag.length+bg.length):0,pg=35*dice;
  var R=[];
  if(gs.length)R.push({w:pg+2,t:"Los dos veneran el mismo culto: "+listES(gs.slice(0,3))});
  var sm=0;
  SIT.forEach(function(s){
    if(a[s.k]&&a[s.k]===b[s.k]){sm++;R.push({w:25/6+1,t:s.why(a[s.k])})}
  });
  var psit=25*sm/6;
  var ap=a.apertura==null?50:a.apertura,bp=b.apertura==null?50:b.apertura,dAp=Math.abs(ap-bp),pap=10*(1-dAp/100);
  if(dAp<=20){
    R.push({w:pap*0.8,t:ap>=60&&bp>=60?"Los dos se atreven a escuchar lo que jamás habían escuchado":ap<=40&&bp<=40?"Los dos defienden su territorio musical con colmillos":"Los dos abren la puerta a lo nuevo, pero con cuidado"});
  }
  var ah=a.horas==null?1:a.horas,bh=b.horas==null?1:b.horas,ph=6*(1-Math.abs(ah-bh)/3);
  if(ah===bh)R.push({w:ph,t:"Los dos pasan "+HP[ah]+" al día bajo el hechizo de la música"});
  var pd=(a.donde!=null&&a.donde===b.donde)?4:0;
  if(pd)R.push({w:pd,t:"Los dos escuchan sobre todo "+DP[a.donde]});
  var ad=a.descubre||[],bd=b.descubre||[],ds=inter(ad,bd),du=new Set(ad.concat(bd)).size,pds=6*(du?ds.length/du:0);
  if(ds.length)R.push({w:pds,t:"Descubren música igual: "+listES(ds.slice(0,2).map(function(i){return DESCP[i]}))});
  var ar=a.recomienda==null?1:a.recomienda,br=b.recomienda==null?1:b.recomienda,prc=4*(1-Math.abs(ar-br)/2);
  if(ar===0&&br===0)R.push({w:prc,t:"Los dos quieren que su match les contagie música nueva"});
  else if(ar===1&&br===1)R.push({w:prc-1,t:"Los dos aceptan recomendaciones si llegan en el momento justo"});
  var same=norm(a.artist)&&norm(a.artist)===norm(b.artist),pa=same?10:0;
  if(same)R.push({w:pa+12,t:"Los dos tocarían a "+a.artist+" en su propio funeral"});
  var score=Math.min(100,pg+psit+pap+ph+pd+pds+prc+pa);
  R.sort(function(x,y){return y.w-x.w});
  var out=R.slice(0,3).map(function(r){return r.t});
  if(!out.length)out.push("Sus almas desafinan igual: la oscuridad los une");
  return {score:score,reasons:out};
}
function computeMatches(R){
  var out={};
  R.forEach(function(a){
    var tops=R.filter(function(b){return b.id!==a.id}).map(function(b){var p=pair(a,b);return {b:b,score:p.score,reasons:p.reasons}})
      .sort(function(x,y){return y.score-x.score}).slice(0,3);
    out[a.id]={name:a.name||"Alma anónima",creature:creatureOf(a).name,
      top:tops.map(function(t){return {name:t.b.name||"Alma anónima",score:Math.round(t.score),creature:creatureOf(t.b).name,reasons:t.reasons}})};
  });
  return out;
}

/* ---------- vistas ---------- */
function eyes(spots){
  return spots.map(function(p){return h("span",{class:"eyes",style:{left:p[0],top:p[1],animationDelay:p[2]+"s"}})});
}
function introView(){
  var wrap=h("section",{class:"stage enter"});
  wrap.append.apply(wrap,eyes([["-2%","18%",0.4],["88%","52%",2.1],["4%","80%",3.3]]));
  wrap.append(h("div",{class:"stack rel"},
    h("span",{class:"label"},"Una encuesta para almas con oído"),
    h("h1",{class:"title"},"Cripta Sonora"),
    h("p",{class:"lede"},"Confiesa tus pecados musicales. Entre todas las almas que cruzaron esta puerta, tres suenan como tú. Tu respuesta se sella en la oscuridad y el facilitador abrirá el libro."),
    h("div",{class:"row"},
      h("button",{class:"btn primary big",onclick:enter},S.me?"Volver a entrar":"Cruzar la puerta"),
      S.isAdmin?h("button",{class:"btn ghost",onclick:goFacil},"Soy el facilitador"):null),
    h("p",{class:"hint"},"Sube el volumen. Hay sonido. Son 11 puertas y toma unos 3 minutos. Tú solo verás a tus tres almas gemelas; las gráficas son para el facilitador.")
  ));
  return wrap;
}
function enter(){
  sfx.start();paintSnd();
  S.view=S.me?(S.reveal&&S.reveal.on&&S.myMatch?"results":"waiting"):"survey";
  render();
}
function valid(i){
  var f=S.form,id=STEPS[i].id;
  if(id==="name")return f.name.trim().length>0;
  if(id==="genres")return f.genres.length>=1;
  if(id==="habits")return f.horas!==null&&f.donde!==null;
  if(id==="discover")return f.descubre.length>=1&&f.recomienda!==null;
  if(id==="sit")return f[STEPS[i].sit.k]!==null;
  if(id==="artist")return f.artist.trim().length>0;
  return true;
}
function chip(label,on,fn){return h("button",{class:"chip",type:"button","aria-pressed":on?"true":"false",onclick:fn},label)}
function single(opts,cur,set){
  return h("div",{class:"chips"},opts.map(function(o,i){return chip(o,cur===i,function(){set(i);render()})}));
}
function multi(opts,cur,set){
  return h("div",{class:"chips"},opts.map(function(o,i){
    var on=cur.indexOf(i)>-1;
    return chip(o,on,function(){set(on?cur.filter(function(x){return x!==i}):cur.concat(i));render()});
  }));
}
function surveyView(){
  var f=S.form,step=S.step,TOTAL=STEPS.length,st=STEPS[step],nextBtn;
  var wrap=h("section",{class:"stage enter"});
  var prog=h("div",{class:"prog"});
  for(var i=0;i<TOTAL;i++)prog.append(h("i",{class:i<=step?"on":""}));
  var head=h("div",{class:"stack"},h("span",{class:"label"},"Puerta "+(step+1)+" de "+TOTAL),prog);
  var body;
  if(st.id==="name"){
    body=h("div",{class:"stack"},
      h("h2",{class:"q"},"La puerta exige un nombre antes de dejarte pasar. ¿Cuál es el tuyo?"),
      h("input",{class:"field",id:"f_name",type:"text",maxlength:"40",autocomplete:"off",placeholder:"Tu nombre, o el que usabas en vida",value:f.name,
        oninput:function(e){f.name=e.target.value;updateNext()}}),
      h("p",{class:"hint"},"Este nombre aparecerá cuando alguien sea tu alma gemela."));
  }else if(st.id==="genres"){
    body=h("div",{class:"stack"},
      h("h2",{class:"q"},"Tu alma tiene hambre. ¿De qué sonidos se alimenta?"),
      h("p",{class:"hint"},"Elige hasta 5, los que te levantan de la tumba. Llevas "+f.genres.length+" de 5."),
      h("div",{class:"chips"},GENRES.map(function(g){
        var on=f.genres.indexOf(g)>-1;
        return chip(g,on,function(){
          if(on)f.genres=f.genres.filter(function(x){return x!==g});
          else if(f.genres.length<5)f.genres=f.genres.concat(g);
          render();
        });
      })));
  }else if(st.id==="habits"){
    body=h("div",{class:"stack"},
      h("h2",{class:"q sm"},"¿Cuántas horas al día dejas que la música te posea?"),
      single(HORAS,f.horas,function(i){f.horas=i}),
      h("h2",{class:"q sm"},"¿En qué rincón te acecha la música?"),
      single(DONDE,f.donde,function(i){f.donde=i}));
  }else if(st.id==="discover"){
    body=h("div",{class:"stack"},
      h("h2",{class:"q sm"},"Algo desconocido susurra desde la oscuridad. ¿Cómo te llegan los sonidos nuevos?"),
      h("p",{class:"hint"},"Marca todos los caminos por los que te encuentran."),
      multi(DESC,f.descubre,function(v){f.descubre=v}),
      h("h2",{class:"q sm"},"Se abre una puerta que nunca habías cruzado y suena algo desconocido. ¿Entras?"),
      h("div",{},
        h("input",{type:"range",min:"0",max:"100",value:String(f.apertura),id:"s_apertura","aria-label":"Apertura a música nueva",oninput:function(e){f.apertura=+e.target.value}}),
        h("div",{class:"sends"},h("span",{},"Cierro con llave"),h("span",{},"Entro sin mirar atrás"))),
      h("h2",{class:"q sm"},"Tu alma gemela musical quiere pasarte un hechizo: una canción nueva. ¿Lo aceptas?"),
      single(RECO,f.recomienda,function(i){f.recomienda=i}));
  }else if(st.id==="sit"){
    var s=st.sit;
    body=h("div",{class:"stack"},
      h("h2",{class:"q"},s.q),
      h("div",{class:"chips"},GENRES.map(function(g){
        return chip(g,f[s.k]===g,function(){
          f[s.k]=g;render();
          setTimeout(function(){if(S.view==="survey"&&S.step===step&&S.form[s.k]===g&&step<TOTAL-1){S.step++;render()}},380);
        });
      })));
  }else{
    body=h("div",{class:"stack"},
      h("h2",{class:"q"},"Última confesión: tu fantasma quedó atado a una sola voz. ¿De qué artista o grupo es?"),
      h("input",{class:"field",id:"f_artist",type:"text",maxlength:"60",autocomplete:"off",placeholder:"Un artista o una banda",value:f.artist,
        oninput:function(e){f.artist=e.target.value;updateNext()}}),
      h("p",{class:"hint"},"Si dos almas nombran al mismo artista, la afinidad sube."));
  }
  var last=step===TOTAL-1;
  nextBtn=h("button",{class:"btn primary",type:"button",disabled:!valid(step)||S.busy,onclick:function(){
    if(!valid(step))return;
    if(last)submit();else{S.step++;render()}
  }},S.busy?"Sellando…":last?"Sellar mi destino":"Siguiente puerta");
  function updateNext(){nextBtn.disabled=!valid(step)||S.busy}
  var nav=h("div",{class:"row"},
    step>0?h("button",{class:"btn ghost",type:"button",onclick:function(){S.step--;render()}},"Volver"):null,
    h("span",{class:"sp"}),nextBtn);
  var notice=null;
  if(!S.db)notice=h("p",{class:"note"},"Esta encuesta guarda las respuestas en la nube y no está conectada en esta vista. Ábrela desde el enlace compartido.");
  else if(!S.uid)notice=h("p",{class:"note"},"Necesitas iniciar sesión en Claude para participar.");
  else if(S.canWrite===false)notice=h("p",{class:"note"},"Tu acceso es solo de lectura. Pídele al facilitador que te comparta la página como Contributor para poder responder.");
  var card=h("div",{class:"card stack"},head,body,S.error?h("p",{class:"note"},S.error):null,nav);
  wrap.append(h("div",{class:"stack rel"},notice,card));
  return wrap;
}
async function submit(){
  var f=S.form;
  if(!S.db||!S.uid||S.canWrite===false){S.error="No se pudo sellar: tu sesión no tiene permiso para responder.";render();return}
  S.busy=true;S.error="";render();
  var doc={name:f.name.trim().slice(0,40),genres:f.genres.slice(),horas:f.horas,donde:f.donde,descubre:f.descubre.slice(),apertura:f.apertura,recomienda:f.recomienda,
    road:f.road,fiesta:f.fiesta,prota:f.prota,dia:f.dia,arranca:f.arranca,crush:f.crush,artist:f.artist.trim().slice(0,60),ts:Date.now()};
  try{
    await S.db.doc("responses/"+S.uid).set(doc);
    S.me=doc;S.view="waiting";S.busy=false;render();flash();
  }catch(e){
    S.busy=false;S.error="La oscuridad rechazó tu respuesta ("+((e&&e.code)||"error")+"). Intenta de nuevo.";render();
  }
}
function creatureBlock(d){
  var c=creatureOf(d);
  return h("div",{class:"creature"},h("span",{class:"label"},"Tu criatura musical"),h("span",{class:"cname"},c.name),h("p",{class:"hint"},c.txt));
}
function waitingView(){
  var wrap=h("section",{class:"stage enter"});
  wrap.append.apply(wrap,eyes([["-3%","10%",0.2],["90%","30%",1.6],["2%","62%",2.8],["86%","78%",3.7]]));
  wrap.append(h("div",{class:"stack rel"},
    h("span",{class:"label"},"Sellado"),
    h("h2",{class:"title",style:{fontSize:"clamp(2.6rem,11vw,5rem)"}},"Tu alma está dentro"),
    h("p",{class:"lede"},(S.me.name||"Alma anónima")+", ya no hay vuelta atrás. Espera en la oscuridad mientras llegan las demás."),
    h("div",{class:"card"},creatureBlock(S.me)),
    h("p",{class:"hint"},"Cuando el facilitador abra el libro, esta pantalla se transformará sola."),
    h("div",{class:"row"},h("button",{class:"btn ghost",onclick:function(){
      var m=S.me,f=defaultForm();
      Object.keys(f).forEach(function(k){if(m[k]!=null)f[k]=m[k]});
      f.genres=(m.genres||[]).slice();f.descubre=(m.descubre||[]).slice();
      S.form=f;S.step=0;S.view="survey";render();
    }},"Cambiar mis respuestas"),
    S.isAdmin?h("button",{class:"btn ghost",onclick:goFacil},"Ir a la cripta del facilitador"):null)
  ));
  return wrap;
}
function matchCards(top,delayBase){
  return h("div",{class:"mgrid"},top.map(function(t,i){
    return h("article",{class:"m enter",style:{animationDelay:((delayBase||0)+i*0.35)+"s"}},
      h("div",{class:"top"},h("span",{class:"rank"},ROMAN[i]),h("span",{class:"mname"},t.name),h("span",{class:"pct"},t.score+"%")),
      h("span",{class:"label"},"Criatura: "+t.creature+" · afinidad"),
      h("ul",{class:"why"},(t.reasons||[]).map(function(r){return h("li",{},r)})));
  }));
}
function resultsView(){
  var m=S.myMatch,wrap=h("section",{class:"stage enter"});
  wrap.append(h("div",{class:"stack rel"},
    h("span",{class:"label"},"El libro se abrió"),
    h("h2",{class:"title",style:{fontSize:"clamp(2.6rem,11vw,5rem)"}},"Tus almas gemelas"),
    h("p",{class:"lede"},(m.name||"")+", estas tres almas suenan más parecido a ti. Busca sus ojos en la sala."),
    m.top&&m.top.length?matchCards(m.top,0.2):h("p",{class:"note"},"Todavía no hay suficientes almas para emparejarte. Pídele al facilitador que invoque de nuevo cuando lleguen más."),
    h("div",{class:"card"},h("div",{class:"creature"},h("span",{class:"label"},"Tu criatura"),h("span",{class:"cname"},m.creature||"")))
  ));
  return wrap;
}

/* ---------- facilitador ---------- */
function tally(R,fn){var c={};R.forEach(function(r){[].concat(fn(r)).forEach(function(k){if(k==null||k==="")return;c[k]=(c[k]||0)+1})});return c}
function sorted(c,label){
  return Object.keys(c).map(function(k){return {l:label?label(k):k,v:c[k]}}).sort(function(a,b){return b.v-a.v||String(a.l).localeCompare(String(b.l))});
}
function bars(items){
  var max=Math.max.apply(null,items.map(function(i){return i.v}).concat(1));
  return h("div",{class:"bars"},items.map(function(i){
    return h("div",{class:"bar"},h("span",{class:"bar-l"},i.l),h("span",{class:"bar-t"},h("span",{class:"bar-f",style:{width:(i.v/max*100)+"%"}})),h("span",{class:"bar-v"},String(i.v)));
  }));
}
function panel(title,child){return h("section",{class:"panel"},h("h3",{},title),child)}
function strip(R,s){
  var vals=R.map(function(r){return r[s.k]==null?50:r[s.k]}),mean=vals.length?vals.reduce(function(a,b){return a+b},0)/vals.length:50;
  var st=h("div",{class:"strip"});
  R.forEach(function(r){
    var v=r[s.k]==null?50:r[s.k],off=((hash(r.id)%5)-2)*10;
    st.append(h("span",{class:"dot",style:{left:v+"%",top:"calc(50% + "+off+"px)"}}));
  });
  st.append(h("span",{class:"mean",style:{left:mean+"%"}}));
  return h("div",{},st,h("div",{class:"sends"},h("span",{},s.l),h("span",{},s.r)));
}
function moments(R){
  return h("div",{class:"moments"},SIT.map(function(s){
    var top=sorted(tally(R,function(r){return r[s.k]})).slice(0,3);
    return h("div",{class:"mom"},h("span",{class:"label"},s.short),
      top.length?h("div",{class:"row",style:{gap:"8px"}},top.map(function(a){return h("span",{class:"tag"},a.l+" · "+a.v)})):h("span",{class:"empty"},"Sin respuestas"));
  }));
}
function facilView(){
  var wrap=h("section",{class:"stage wide enter"});
  if(!S.db){wrap.append(h("p",{class:"note"},"La cripta necesita la conexión a la nube. Ábrela desde el enlace compartido."));return wrap}
  if(!S.isAdmin){
    wrap.append(h("div",{class:"stack rel"},
      h("h1",{class:"title",style:{fontSize:"clamp(2.6rem,10vw,4.6rem)"}},"Puerta sellada"),
      h("p",{class:"lede"},"Solo el facilitador puede entrar a la cripta. Si eres quien dirige la sesión, abre la página con tu cuenta de editor."),
      h("div",{class:"row"},h("button",{class:"btn",onclick:function(){S.view="intro";render()}},"Ir a la encuesta"))));
    return wrap;
  }
  var R=S.responses,on=S.reveal&&S.reveal.on;
  var genreItems=sorted(tally(R,function(r){return r.genres||[]})).slice(0,12);
  var horasItems=HORAS.map(function(l,i){return {l:l,v:R.filter(function(r){return r.horas===i}).length}});
  var dondeItems=DONDE.map(function(l,i){return {l:l,v:R.filter(function(r){return r.donde===i}).length}});
  var descItems=sorted(tally(R,function(r){return r.descubre||[]}),function(k){return DESCS[+k]});
  var recoItems=RECO.map(function(l,i){return {l:l,v:R.filter(function(r){return r.recomienda===i}).length}});
  var creItems=sorted(tally(R,function(r){return creatureOf(r).name}));
  var artMap={};
  R.forEach(function(r){var k=norm(r.artist);if(!k)return;if(!artMap[k])artMap[k]={l:r.artist,v:0};artMap[k].v++});
  var artItems=Object.keys(artMap).map(function(k){return artMap[k]}).sort(function(a,b){return b.v-a.v||a.l.localeCompare(b.l)}).slice(0,8);
  var empty=h("p",{class:"empty"},"Aún no hay datos. Las almas aparecerán aquí en cuanto respondan.");
  var matchIds=Object.keys(S.matches);
  var head=h("div",{class:"stack rel"},
    h("span",{class:"label"},"Cripta del facilitador"),
    h("div",{class:"row"},h("span",{class:"cnt"},String(R.length)),h("h1",{class:"title",style:{fontSize:"clamp(2.2rem,8vw,4rem)"}},R.length===1?"alma sellada":"almas selladas")),
    S.error?h("p",{class:"note"},S.error):null,
    h("div",{class:"row"},
      h("button",{class:"btn primary big",disabled:R.length<2||S.busy,onclick:invoke},S.busy?"Invocando…":on?"Invocar de nuevo":"Invocar los matches"),
      on?h("button",{class:"btn",disabled:S.busy,onclick:seal},"Sellar el libro"):null,
      R.length<2?h("span",{class:"hint"},"Se necesitan al menos 2 almas."):null),
    on?h("p",{class:"hint"},"El libro está abierto: las personas ya ven a sus 3 almas gemelas en sus pantallas."):h("p",{class:"hint"},"Las personas ven la sala de espera hasta que invoques los matches."),
    S.isOwner?h("div",{class:"row"},
      h("button",{class:"btn ghost",disabled:S.busy,onclick:seedDemo},"Sembrar 10 almas de prueba"),
      h("button",{class:"btn ghost",disabled:S.busy,onclick:clearDemo},"Quitar almas de prueba")):null,
    h("div",{class:"row"},h("a",{class:"btn ghost",href:"/",style:{textDecoration:"none",display:"inline-block"}},"Ver la encuesta"))
  );
  var charts=h("div",{class:"charts rel"},
    panel("Géneros favoritos (top 12)",genreItems.length?bars(genreItems):empty),
    panel("Qué suena en cada momento",R.length?moments(R):empty),
    panel("Horas de música al día",R.length?bars(horasItems):empty),
    panel("Dónde escuchan más",R.length?bars(dondeItems):empty),
    panel("Cómo descubren música nueva",descItems.length?bars(descItems):empty),
    panel("Apertura a lo nuevo (cada punto es un alma, la línea blanca es el promedio)",R.length?strip(R,{k:"apertura",l:"Cierro con llave",r:"Entro sin mirar atrás"}):empty),
    panel("¿Quieren que su match les recomiende música?",R.length?bars(recoItems):empty),
    panel("Criaturas en la sala",creItems.length?bars(creItems):empty),
    panel("Artistas favoritos",artItems.length?bars(artItems):empty)
  );
  wrap.append(h("div",{class:"stack"},head,charts));
  if(on&&matchIds.length){
    var book=h("div",{class:"mgrid rel"},matchIds.map(function(id){
      var m=S.matches[id];
      return h("details",{class:"m"},h("summary",{},m.name+" · "+m.creature),
        m.top&&m.top.length?matchCards(m.top,0):h("p",{class:"empty"},"Sin pareja todavía."));
    }));
    wrap.append(h("div",{class:"stack",style:{marginTop:"46px"}},h("h2",{class:"q"},"El libro de los condenados"),h("p",{class:"hint"},"Toca un nombre para ver sus 3 almas gemelas y por qué son compatibles."),book));
  }
  return wrap;
}
function goFacil(){S.view="facil";subsAdmin();render()}
async function invoke(){
  S.busy=true;S.error="";render();
  var R=S.responses.slice(),out=computeMatches(R);
  try{
    for(var i=0;i<R.length;i++)await S.db.doc("matches/"+R[i].id).set(out[R[i].id]);
    await S.db.doc("state/reveal").set({on:true,at:Date.now(),count:R.length});
    flash();
  }catch(e){S.error="No se pudo abrir el libro ("+((e&&e.code)||"error")+")."}
  S.busy=false;render();
}
async function seal(){
  S.busy=true;S.error="";render();
  try{
    await S.db.doc("state/reveal").set({on:false,at:Date.now()});
    var ids=Object.keys(S.matches);
    for(var i=0;i<ids.length;i++)await S.db.doc("matches/"+ids[i]).delete();
  }catch(e){S.error="No se pudo sellar el libro ("+((e&&e.code)||"error")+")."}
  S.busy=false;render();
}
async function seedDemo(){
  S.busy=true;S.error="";render();
  var names=["Camila","Andrés","Valentina","Sebastián","Luisa","Mateo","Daniela","Julián","Sara","Felipe"];
  var artists=["Joe Arroyo","Shakira","BTS","Soda Stereo","Metallica","Bad Bunny","Daft Punk","Celia Cruz","Karol G","Binomio de Oro"];
  var r=mulberry(Date.now()%100000);
  var pick=function(){return GENRES[Math.floor(r()*GENRES.length)]};
  try{
    for(var i=0;i<names.length;i++){
      var gs=[];while(gs.length<3+Math.floor(r()*3)){var g=pick();if(gs.indexOf(g)<0)gs.push(g)}
      var ds=[];while(ds.length<1+Math.floor(r()*3)){var d=Math.floor(r()*DESC.length);if(ds.indexOf(d)<0)ds.push(d)}
      await S.db.doc("responses/demo_"+(i+1)).set({name:names[i],genres:gs,horas:Math.floor(r()*4),donde:Math.floor(r()*DONDE.length),descubre:ds,
        apertura:Math.floor(r()*101),recomienda:Math.floor(r()*3),road:pick(),fiesta:pick(),prota:pick(),dia:pick(),arranca:pick(),crush:pick(),
        artist:artists[Math.floor(r()*artists.length)],ts:Date.now(),demo:true});
    }
  }catch(e){S.error="No se pudieron sembrar las almas de prueba ("+((e&&e.code)||"error")+")."}
  S.busy=false;render();
}
async function clearDemo(){
  S.busy=true;S.error="";render();
  try{
    var ids=S.responses.filter(function(x){return x.demo}).map(function(x){return x.id});
    for(var i=0;i<ids.length;i++){await S.db.doc("responses/"+ids[i]).delete();if(S.matches[ids[i]])await S.db.doc("matches/"+ids[i]).delete()}
  }catch(e){S.error="No se pudieron quitar las almas de prueba ("+((e&&e.code)||"error")+")."}
  S.busy=false;render();
}

/* ---------- ciclo ---------- */
function render(){
  $app.replaceChildren();
  var v=S.view,node;
  if(v==="intro")node=introView();
  else if(v==="survey")node=surveyView();
  else if(v==="waiting")node=waitingView();
  else if(v==="results")node=resultsView();
  else node=(S.isAdmin?facilView():pinView());
  $app.append(node);
  paintSnd();
}
function sync(){
  if(S.view==="waiting"||S.view==="results"){
    var want=(S.reveal&&S.reveal.on&&S.myMatch)?"results":"waiting";
    if(want!==S.view){S.view=want;render();if(want==="results")flash();return}
    render();
  }else if(S.view==="facil"){render()}
}
function subsParticipant(){
  if(S.subsP||!S.db)return;S.subsP=true;
  S.db.doc("state/reveal").onSnapshot(function(s){S.reveal=s.exists?s.data():null;sync()},function(){});
  if(S.uid)S.db.doc("matches/"+S.uid).onSnapshot(function(s){S.myMatch=s.exists?s.data():null;sync()},function(){});
}
function subsAdmin(){
  if(S.subsA||!S.db||!S.isAdmin)return;S.subsA=true;
  S.db.collection("responses").onSnapshot(function(q){
    S.responses=q.docs.map(function(d){var x=d.data();x.id=d.id;return x});
    if(S.view==="facil")render();
  },function(){});
  S.db.collection("matches").onSnapshot(function(q){
    var m={};q.docs.forEach(function(d){m[d.id]=d.data()});S.matches=m;
    if(S.view==="facil")render();
  },function(){});
}
/* ---------- conexión con el servidor ---------- */
var MODE=document.body.getAttribute("data-mode")==="facil"?"facil":"survey";
function myId(){
  try{
    var u=localStorage.getItem("cs_uid");
    if(!u){u=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():("u"+Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem("cs_uid",u)}
    return u;
  }catch(e){
    if(!window.__csUid)window.__csUid="u"+Math.random().toString(36).slice(2)+Date.now().toString(36);
    return window.__csUid;
  }
}
var PIN=null;
try{PIN=sessionStorage.getItem("cs_pin")}catch(e){}
function hdrs(){var x={"content-type":"application/json","x-uid":myId()};if(PIN)x["x-pin"]=PIN;return x}
async function call(method,url,body){
  var r=await fetch(url,{method:method,headers:hdrs(),body:body?JSON.stringify(body):undefined});
  if(!r.ok){
    var e=new Error("http "+r.status);
    e.code=r.status===403?"forbidden":r.status===429?"resource_exhausted":r.status===507?"quota_exceeded":"unavailable";
    throw e;
  }
  return r.json();
}
function snapOf(id,data){
  return {id:id,exists:data!=null,data:function(){return data!=null?JSON.parse(JSON.stringify(data)):undefined}};
}
function watch(read,next,onErr){
  var stopped=false,last=null,busy=false;
  async function tick(){
    if(stopped||busy)return;busy=true;
    try{var v=await read();var k=JSON.stringify(v);if(!stopped&&k!==last){last=k;next(v)}}
    catch(e){if(onErr&&!stopped)onErr(e)}
    busy=false;
  }
  tick();
  var t=setInterval(tick,2500);
  return function(){stopped=true;clearInterval(t)};
}
var db={
  doc:function(path){
    var id=path.split("/").pop(),u="/api/doc?path="+encodeURIComponent(path);
    return {
      id:id,path:path,
      get:async function(){var r=await call("GET",u);return snapOf(id,r.data)},
      set:async function(d){await call("PUT",u,d)},
      delete:async function(){await call("DELETE",u)},
      onSnapshot:function(next,err){
        return watch(async function(){return (await call("GET",u)).data},function(v){next(snapOf(id,v))},err);
      }
    };
  },
  collection:function(path){
    var u="/api/col?path="+encodeURIComponent(path);
    return {onSnapshot:function(next,err){
      return watch(async function(){return (await call("GET",u)).docs},function(docs){
        next({docs:docs.map(function(d){return snapOf(d.id,d.data)})});
      },err);
    }};
  }
};
async function checkPin(p){
  try{
    var r=await fetch("/api/whoami",{headers:{"x-pin":p,"x-uid":myId()}});
    return r.ok&&(await r.json()).admin===true;
  }catch(e){return false}
}
function pinView(){
  var wrap=h("section",{class:"stage enter"});
  var inp=h("input",{class:"field",id:"f_pin",type:"password",inputmode:"numeric",autocomplete:"off",placeholder:"PIN del facilitador"});
  var msg=h("p",{class:"note",hidden:true},"Ese PIN no abre la puerta.");
  async function go(){
    var p=inp.value.trim();if(!p)return;
    if(await checkPin(p)){
      PIN=p;try{sessionStorage.setItem("cs_pin",p)}catch(e){}
      S.isAdmin=true;S.isOwner=true;subsParticipant();subsAdmin();render();
    }else{msg.hidden=false}
  }
  inp.addEventListener("keydown",function(e){if(e.key==="Enter")go()});
  wrap.append(h("div",{class:"stack rel"},
    h("span",{class:"label"},"Cripta del facilitador"),
    h("h1",{class:"title",style:{fontSize:"clamp(2.6rem,10vw,4.6rem)"}},"Puerta sellada"),
    h("p",{class:"lede"},"Di la contraseña para entrar. El PIN aparece en la consola del servidor cuando arranca."),
    inp,msg,
    h("div",{class:"row"},h("button",{class:"btn primary",type:"button",onclick:go},"Entrar"))));
  return wrap;
}
async function init(){
  S.db=db;S.uid=myId();S.canWrite=true;
  if(MODE==="facil"){
    S.view="facil";
    if(PIN&&await checkPin(PIN)){S.isAdmin=true;S.isOwner=true;subsParticipant();subsAdmin()}
    render();
    return;
  }
  render();
  try{
    var s=await db.doc("responses/"+S.uid).get();
    if(s.exists)S.me=s.data();
  }catch(e){}
  subsParticipant();
  render();
}
init();
})();
