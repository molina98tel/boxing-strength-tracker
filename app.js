const plans={
A:{title:"Día A",pill:"A · Fuerza + potencia",desc:"Fuerza de piernas, tracción, empuje y core. Mantén 2 repeticiones en recámara.",exercises:[
["Salto vertical","3","3","Potencia","45–60 s"],["Flexión explosiva","3","3–5","Potencia","45–60 s"],["Sentadilla","3","4–6","RIR 2","90–120 s"],["Dominadas","3","5–8","RIR 2","90 s"],["Press banca","3","5–6","RIR 2","90–120 s"],["Bulgarian split squat","2","6–8/lado","RIR 2","60–90 s"],["Dead bug + side plank","2","8/lado + 20–30 s/lado","Core","30–45 s"]],
B:{title:"Día B",pill:"B · Cadena posterior + potencia",desc:"Potencia de cadera, cadena posterior, estabilidad y tracción.",exercises:[
["Salto horizontal","3","3","Potencia","60 s"],["Kettlebell swing","3","6–8","Potencia","60 s"],["Peso muerto rumano","3","5–6","RIR 2","90–120 s"],["Press militar","3","5–6","RIR 2","90 s"],["Dominadas","3","5–8","RIR 2","90 s"],["Reverse lunge","2","6/lado","RIR 2","60–90 s"],["Suitcase carry","2","20–30 m/lado","Core","45–60 s"]],
C:{title:"Día C",pill:"C · Potencia + fuerza relativa",desc:"Potencia, fuerza relativa, unilateral y cadena posterior sin buscar fatiga.",exercises:[
["Jump squat","3","4","Potencia","45–60 s"],["Flexión explosiva","3","3–5","Potencia","45–60 s"],["Front squat","3","4–6","RIR 2","90–120 s"],["Press cerrado","3","5–6","RIR 2","90 s"],["Dominadas supinas","3","5–8","RIR 2","90 s"],["Hip thrust","2","6–8","RIR 2","60–90 s"],["Plancha / shoulder taps","2","8/lado","Core","30–45 s"]]}
};
let day="A",timerId=null,remaining=90,deferredPrompt=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const stateKey="boxingStrengthSessionsV1";
function getHistory(){try{return JSON.parse(localStorage.getItem(stateKey)||"[]")}catch{return[]}}
function saveHistory(a){localStorage.setItem(stateKey,JSON.stringify(a))}
function bestFor(name){const all=getHistory().flatMap(x=>x.exercises||[]).filter(x=>x.name===name);let best=null;for(const e of all){for(const s of e.sets||[]){const w=Number(s.weight),r=Number(s.reps);if(w>0&&r>0&&(!best||w>best.weight||(w===best.weight&&r>best.reps)))best={weight:w,reps:r}}}return best}
function render(){
  const p=plans[day];$("#dayPill").textContent=p.pill;$("#dayTitle").textContent=p.title;$("#dayDescription").textContent=p.desc;
  const list=$("#exerciseList");list.innerHTML="";
  p.exercises.forEach((e,idx)=>{
    const [name,series,reps,focus,rest]=e,best=bestFor(name),card=document.createElement("article");card.className="card";
    card.innerHTML='<div class="exercise-head"><div><div class="exercise-name">'+name+'</div><div class="exercise-meta">'+series+' series · '+reps+' · '+focus+' · descanso '+rest+'</div></div>'+(best?'<span class="best">Mejor: '+best.weight+' kg × '+best.reps+'</span>':'')+'</div><div class="sets"></div><div class="exercise-actions"><button class="link-btn add-set" type="button">+ Añadir serie</button></div>';
    const sets=card.querySelector(".sets");
    for(let i=0;i<Number(series);i++) addSet(sets,i,rest);
    card.querySelector(".add-set").onclick=()=>addSet(sets,sets.children.length,rest);
    list.appendChild(card);
  });
  updateCount();
}
function addSet(container,i,rest){
  const row=document.createElement("div");row.className="set-row";
  row.innerHTML='<div class="set-no">'+(i+1)+'</div><div><label>kg</label><input class="weight" type="number" min="0" step="0.5" inputmode="decimal"></div><div><label>reps</label><input class="reps" type="number" min="0" step="1" inputmode="numeric"></div><div><label>RIR</label><select class="rir"><option>3</option><option selected>2</option><option>1</option><option>0</option></select></div><button class="check" type="button" aria-label="Completar serie">✓</button>';
  row.querySelector(".check").onclick=()=>{const b=row.querySelector(".check");b.classList.toggle("done");b.setAttribute("aria-pressed",b.classList.contains("done"));updateCount();if(b.classList.contains("done"))startTimer(parseRest(rest))};
  container.appendChild(row);
}
function parseRest(rest){const m=rest.match(/(\d+)\s*[–-]\s*(\d+)/);if(m)return Math.round((Number(m[1])+Number(m[2]))/2);const n=rest.match(/\d+/);return n?Number(n[0]):60}
function updateCount(){const total=$$(".check").length,done=$$(".check.done").length;$("#completedCount").textContent=done+"/"+total}
function collect(){
 const exercises=[]; $$("#exerciseList .card").forEach(card=>{const name=card.querySelector(".exercise-name").textContent;const sets=[...card.querySelectorAll(".set-row")].map(r=>({weight:Math.max(0,Number(r.querySelector(".weight").value)||0),reps:Math.max(0,Number(r.querySelector(".reps").value)||0),rir:Number(r.querySelector(".rir").value),done:r.querySelector(".check").classList.contains("done")}));exercises.push({name,sets})});return exercises;
}
function startTimer(seconds){remaining=seconds;$("#timer").classList.remove("hidden");renderTimer();clearInterval(timerId);timerId=setInterval(()=>{remaining--;renderTimer();if(remaining<=0){clearInterval(timerId);navigator.vibrate?.([150,100,150]);}},1000)}
function renderTimer(){$("#timerValue").textContent=String(Math.max(0,Math.floor(remaining/60))).padStart(2,"0")+":"+String(Math.max(0,remaining%60)).padStart(2,"0")}
$("#timerSkip").onclick=()=>{$("#timer").classList.add("hidden");clearInterval(timerId)}
$("#timerPlus").onclick=()=>{remaining+=15;renderTimer()}
$$(".tab").forEach(b=>b.onclick=()=>{if(b.dataset.view==="history"){showHistory();return}day=b.dataset.day;$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#historyView").classList.add("hidden");$("#workoutView").classList.remove("hidden");render()})
function showHistory(){$$(".tab").forEach(x=>x.classList.remove("active"));$("#historyView").classList.remove("hidden");$("#workoutView").classList.add("hidden");renderHistory()}
function renderHistory(){const h=getHistory(),box=$("#historyList");box.innerHTML=h.length?h.slice().reverse().map(x=>'<div class="history-item"><strong>'+x.day+'</strong><div class="history-meta">'+new Date(x.date).toLocaleString("es-ES")+' · RPE '+(x.rpe||"—")+' · Boxeo '+(x.boxingFeel||"—")+'</div>'+(x.notes?'<div class="history-notes">'+escapeHtml(x.notes)+'</div>':"")+'</div>').join(""):'<div class="card muted">Todavía no hay sesiones guardadas.</div>'}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("#saveSession").onclick=()=>{const exercises=collect(),done=exercises.flatMap(x=>x.sets).filter(s=>s.done).length;if(!done){showAlert("Completa al menos una serie antes de guardar.");return}const h=getHistory();h.push({id:Date.now(),date:new Date().toISOString(),day,exercises,rpe:$("#sessionRpe").value,boxingFeel:$("#boxingFeel").value,notes:$("#notes").value.trim()});saveHistory(h);showAlert("Sesión guardada en este dispositivo.");$("#notes").value="";render()}
function showAlert(msg){const a=$("#alertBox");a.textContent=msg;a.classList.remove("hidden");setTimeout(()=>a.classList.add("hidden"),2500)}
$("#clearHistory").onclick=()=>{if(confirm("¿Borrar todo el historial guardado en este dispositivo?")){localStorage.removeItem(stateKey);renderHistory()}}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null;$("#installBtn").classList.add("hidden")};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();