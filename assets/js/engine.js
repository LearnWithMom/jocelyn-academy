const LWM=(()=>{
 const KEY="learnWithMomStateV8";
 const stages=["brief","learn","explore","practice","explain","realworld","finish"];
 const defaults={sound:false,completedStages:[],moduleStages:{},completedModules:[],unlockedBadges:[],notes:{},notebook:[],interactions:{},xp:0,lastVisited:null};
 let state=load();

 function load(){
  try{
   const current=JSON.parse(localStorage.getItem(KEY)||"{}");
   if(Object.keys(current).length)return {...defaults,...current,notebook:current.notebook||[]};
   for(const oldKey of ["learnWithMomStateV7","learnWithMomStateV6","learnWithMomStateV5","learnWithMomStateV3"]){
    const old=JSON.parse(localStorage.getItem(oldKey)||"{}");
    if(Object.keys(old).length)return {...defaults,...old,notebook:old.notebook||[],xp:old.xp||0};
   }
  }catch{}
  return {...defaults};
 }
 function save(){state.lastVisited=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));updateProgress();updateXP()}
 function getState(){return typeof structuredClone==="function"?structuredClone(state):JSON.parse(JSON.stringify(state))}
 function toast(msg){const t=document.querySelector(".toast")||document.body.appendChild(Object.assign(document.createElement("div"),{className:"toast"}));t.textContent=msg;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2600)}
 function tone(freq=620,d=.08){if(!state.sound)return;try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;g.gain.value=.03;o.connect(g);g.connect(c.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);o.stop(c.currentTime+d)}catch{}}
 function toggleSound(){state.sound=!state.sound;save();syncSound();tone();toast(state.sound?"Sound on":"Sound off")}
 function syncSound(){document.querySelectorAll("[data-sound]").forEach(b=>b.textContent=state.sound?"🔊":"🔇")}
 function addXP(points,reason="Progress saved"){state.xp=Math.max(0,(state.xp||0)+points);save();if(points>0)toast(`+${points} XP · ${reason}`)}
 function updateXP(){document.querySelectorAll("[data-xp]").forEach(x=>x.textContent=state.xp||0)}
 function unlockBadge(id){if(id&&!state.unlockedBadges.includes(id)){state.unlockedBadges.push(id);state.xp=(state.xp||0)+25;save();tone(880,.16);toast("Achievement unlocked · +25 XP");badgeBurst()}}
 const badgeMap={learn:"owner-brain",explore:"scenario-strategist",practice:"fund-detective",explain:"great-teacher",realworld:"real-world-researcher"};
 function completeStage(id){const list=stageList();if(!list.includes(id)){list.push(id);if(currentModule()==="world-1-module-1"&&!state.completedStages.includes(id))state.completedStages.push(id);state.xp=(state.xp||0)+15;save();if(currentModule()==="world-1-module-1")unlockBadge(badgeMap[id]);toast("Stage complete · +15 XP")}syncStageUI()}
 function completeModule(id,points=100){
  const badgeByModule={"world-1-module-1":"module-complete","world-1-module-2":"market-detective","world-1-module-3":"market-historian"};
  if(!state.completedModules.includes(id)){state.completedModules.push(id);state.xp=(state.xp||0)+points}
  const list=stageList();stages.forEach(s=>{if(!list.includes(s))list.push(s);if(id==="world-1-module-1"&&!state.completedStages.includes(s))state.completedStages.push(s)});
  save();unlockBadge(badgeByModule[id]);celebrate();syncStageUI()
 }
 function setNote(k,v){state.notes[k]=v;save()}
 function getNote(k){return state.notes[k]||""}
 function addNotebook(entry){const clean={id:Date.now(),type:entry.type||"What I learned",text:(entry.text||"").trim(),module:entry.module||"World 1 · Module 1",date:new Date().toISOString()};if(clean.text.length<3)return false;state.notebook.unshift(clean);state.xp=(state.xp||0)+10;save();unlockBadge("notebook-thinker");return true}
 function getNotebook(){return [...(state.notebook||[])]}
 function deleteNotebook(id){state.notebook=(state.notebook||[]).filter(x=>x.id!==id);save()}
 function setInteraction(k,v){state.interactions[k]=v;save()}
 function getInteraction(k,f=null){return state.interactions[k]??f}
 function currentModule(){return document.body.dataset.module||"world-1-module-1"}
 function stageList(){state.moduleStages=state.moduleStages||{};if(!state.moduleStages[currentModule()])state.moduleStages[currentModule()]=currentModule()==="world-1-module-1"?[...(state.completedStages||[])]:[];return state.moduleStages[currentModule()]}
 function progress(){const list=stageList();return Math.round(stages.filter(s=>list.includes(s)).length/stages.length*100)}
 function updateProgress(){const p=progress();document.querySelectorAll("[data-global-progress]").forEach(x=>x.style.width=p+"%");document.querySelectorAll("[data-progress-text]").forEach(x=>x.textContent=p+"%")}
 function syncStageUI(){document.querySelectorAll("[data-complete-stage]").forEach(b=>{if(stageList().includes(b.dataset.completeStage)){b.textContent="Completed ✓";b.classList.add("done")}});document.querySelectorAll("[data-stage-link]").forEach(a=>a.classList.toggle("done",stageList().includes(a.dataset.stageLink)));updateProgress();updateXP()}
 async function data(path){const r=await fetch(path);if(!r.ok)throw Error("Could not load "+path);return r.json()}
 function openModal(id){document.getElementById(id)?.classList.add("open");if(id==="notebookModal")renderNotebook()}
 function closeModal(id){document.getElementById(id)?.classList.remove("open")}
 async function buildGlossary(path){const items=await data(path),host=document.querySelector("[data-glossary-list]"),input=document.querySelector("[data-glossary-search]");if(!host)return;const draw=(q="")=>{q=q.toLowerCase();host.innerHTML=items.filter(x=>(x.term+" "+x.definition).toLowerCase().includes(q)).map(x=>`<article class="glossary-item"><h4>${x.term}</h4><p>${x.definition}</p><div class="example">${x.example}</div></article>`).join("")||"<p>No matching terms yet.</p>"};input?.addEventListener("input",()=>draw(input.value));draw()}
 async function buildBadges(path){const items=await data(path),host=document.querySelector("[data-badge-list]");if(!host)return;host.innerHTML=items.map(x=>`<article class="badge-card ${state.unlockedBadges.includes(x.id)?"unlocked":""}"><div class="badge-icon">${x.icon}</div><h4>${x.title}</h4><p>${x.description}</p>${state.unlockedBadges.includes(x.id)?'<span class="earned">Earned</span>':'<span>Locked</span>'}</article>`).join("")}
 async function buildSearch(worldPath,glossPath,prefix=""){const w=(await data(worldPath)).worlds,g=await data(glossPath),host=document.querySelector("[data-search-results]"),input=document.querySelector("[data-search-input]");if(!host)return;const items=[...w.map(x=>({t:`World ${x.number}: ${x.title}`,d:x.description,h:x.status==="open"?prefix+"worlds/world-1/module-1/":"#"})),...g.map(x=>({t:x.term,d:x.definition,h:"#"}))];const draw=(q="")=>{q=q.toLowerCase();host.innerHTML=items.filter(x=>(x.t+" "+x.d).toLowerCase().includes(q)).slice(0,12).map(x=>`<a class="search-result" href="${x.h}"><strong>${x.t}</strong><small>${x.d}</small></a>`).join("")||"<p>No results yet.</p>"};input?.addEventListener("input",()=>draw(input.value));draw()}
 function escapeHTML(v){return v.replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
 function renderNotebook(q="",type=""){const host=document.querySelector("[data-notebook-list]");if(!host)return;const rows=(state.notebook||[]).filter(x=>(!type||x.type===type)&&(x.type+" "+x.text+" "+x.module).toLowerCase().includes(q.toLowerCase()));host.innerHTML=rows.length?rows.map(x=>`<article class="notebook-entry"><div><span class="entry-type">${x.type}</span><small>${x.module} · ${new Date(x.date).toLocaleDateString("en-US")}</small></div><p>${escapeHTML(x.text)}</p><button class="text-button" data-delete-note="${x.id}">Delete</button></article>`).join(""):'<div class="empty-notebook"><div>📓</div><h3>Your notebook is ready.</h3><p>Save what you learned, what surprised you, and questions you still have.</p></div>';host.querySelectorAll("[data-delete-note]").forEach(b=>b.onclick=()=>{deleteNotebook(+b.dataset.deleteNote);renderNotebook(q,type)})}
 function celebrate(){for(let i=0;i<44;i++){const e=document.createElement("span");e.className="confetti";e.textContent=["✦","●","◆","★","🏆"][i%5];e.style.left=Math.random()*100+"vw";e.style.animationDelay=Math.random()*.8+"s";e.style.fontSize=(12+Math.random()*16)+"px";document.body.appendChild(e);setTimeout(()=>e.remove(),3600)}}
 function badgeBurst(){const e=document.createElement("div");e.className="badge-burst";e.innerHTML="<span>✨</span><strong>New achievement!</strong>";document.body.appendChild(e);setTimeout(()=>e.classList.add("show"),20);setTimeout(()=>{e.classList.remove("show");setTimeout(()=>e.remove(),300)},1800)}
 function certificate(opts={}){
  const title=opts.title||"Certificate of Completion",student=opts.student||"Jocelyn",description=opts.description||"completed a Jocelyn Academy module.",accent=opts.accent||"#6f4bf2";
  const w=window.open("","_blank","width=950,height=720");
  w.document.write(`<html><head><title>${title}</title><style>body{font-family:Georgia,serif;display:grid;place-items:center;min-height:100vh;margin:0;color:#101631;background:#f7f8fc}.c{width:760px;max-width:88%;padding:58px;border:10px double ${accent};text-align:center;background:#fff}.ey{letter-spacing:.18em;text-transform:uppercase}h1{font-size:46px}.name{color:${accent};font-size:34px}@media print{button{display:none}}</style></head><body><div class=c><div class=ey>Learn With Mom · Jocelyn Academy</div><h1>${title}</h1><p>This certifies that</p><div class=name>${student}</div><p>${description}</p><p><b>${new Date().toLocaleDateString("en-US")}</b></p><button onclick=print()>Print Certificate</button></div></body></html>`);
  w.document.close()
 }
 function init(){
  document.querySelector("[data-mobile-menu]")?.addEventListener("click",()=>document.querySelector(".nav-links")?.classList.toggle("open"));
  document.querySelectorAll("[data-open-modal]").forEach(b=>b.onclick=()=>openModal(b.dataset.openModal));
  document.querySelectorAll("[data-close-modal]").forEach(b=>b.onclick=()=>closeModal(b.dataset.closeModal));
  document.querySelectorAll(".modal-backdrop").forEach(m=>m.onclick=e=>{if(e.target===m)m.classList.remove("open")});
  document.querySelectorAll("[data-sound]").forEach(b=>b.onclick=toggleSound);
  document.querySelectorAll("[data-complete-stage]").forEach(b=>b.onclick=()=>completeStage(b.dataset.completeStage));
  document.querySelector("[data-reset]")?.addEventListener("click",()=>{if(confirm("Reset academy progress saved in this browser?")){localStorage.removeItem(KEY);location.reload()}});
  const nbSearch=document.querySelector("[data-notebook-search]"),nbFilter=document.querySelector("[data-notebook-filter]");const refreshNotebook=()=>renderNotebook(nbSearch?.value||"",nbFilter?.value||"");nbSearch?.addEventListener("input",refreshNotebook);nbFilter?.addEventListener("change",refreshNotebook);document.querySelectorAll("[data-notebook-starter]").forEach(b=>b.onclick=()=>{const t=document.querySelector("[data-notebook-text]");t.value=b.dataset.notebookStarter;t.focus()});document.querySelector("[data-notebook-export]")?.addEventListener("click",()=>{const text=(state.notebook||[]).map(x=>`${new Date(x.date).toLocaleDateString("en-US")} | ${x.module} | ${x.type}\n${x.text}`).join("\n\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text||"Jocelyn Notebook is empty."],{type:"text/plain"}));a.download="Jocelyn-Notebook.txt";a.click();URL.revokeObjectURL(a.href)});
  const nbSave=document.querySelector("[data-notebook-save]");nbSave?.addEventListener("click",()=>{const type=document.querySelector("[data-notebook-type]")?.value,text=document.querySelector("[data-notebook-text]")?.value;if(addNotebook({type,text})){document.querySelector("[data-notebook-text]").value="";renderNotebook();toast("Saved to your notebook · +10 XP")}else toast("Write a little something first")});
  syncSound();syncStageUI();renderNotebook();if(!state.unlockedBadges.includes("first-step"))unlockBadge("first-step")
 }
 return{init,getState,toast,unlockBadge,completeStage,completeModule,setNote,getNote,addNotebook,getNotebook,setInteraction,getInteraction,progress,updateProgress,buildGlossary,buildBadges,buildSearch,openModal,closeModal,certificate,celebrate,addXP};
})();
document.addEventListener("DOMContentLoaded",LWM.init);
