
document.addEventListener("DOMContentLoaded",async()=>{
 const data=await(await fetch("assets/data/worlds.json")).json(),worlds=data.worlds,map=document.getElementById("worldMap"),roadmap=document.getElementById("moduleRoadmap"),state=LWM.getState();
 const moduleIds=["world-1-module-1","world-1-module-2","world-1-module-3","world-1-module-4","world-1-module-5"];
 const completed=moduleIds.map(id=>state.completedModules.includes(id));
 const world1Complete=completed.every(Boolean);
 const nextIndex=completed.findIndex(v=>!v);
 const nextModule=Math.max(0,nextIndex===-1?4:nextIndex);
 const nextPath=worlds[0].modules[nextModule].path||"worlds/world-1/module-3/";
 const nextTitle=worlds[0].modules[nextModule].title;
 document.querySelectorAll("[data-continue-link]").forEach(a=>{a.href=nextPath;a.textContent=`Continue: ${nextTitle} →`});
 document.querySelectorAll("[data-current-module-title]").forEach(x=>x.textContent=nextTitle);
 map.innerHTML=worlds.map((w,i)=>`<div class="map-stop ${w.status==='open'?'open':'locked'} ${world1Complete&&i===0?'complete':''}"><div class="map-connector ${i===worlds.length-1?'last':''}"></div><div class="map-node"><span class="map-icon">${world1Complete&&i===0?'✓':w.icon}</span><span class="map-lock">${w.status==='locked'?'🔒':''}</span></div><article class="map-card"><div class="kicker">${w.status==='open'?(world1Complete?'World complete':`${completed.filter(Boolean).length} of 5 modules complete`):'Future destination'}</div><h3>${w.shortTitle}</h3><p>${w.description}</p>${w.status==='open'?`<a class="btn primary small" href="${nextPath}">Continue World 1 →</a>`:'<span class="locked-label">Locked until earlier worlds are ready</span>'}</article></div>`).join("");
 roadmap.innerHTML=worlds[0].modules.map((m,i)=>{let status=completed[i]?'complete':i===nextModule?'open':'locked';return `<article class="module-step ${status}"><div class="module-step-number">${status==='complete'?'✓':m.number}</div><div><span>${status==='complete'?'Completed':status==='open'?'Open now':'Locked'}</span><h3>${m.title}</h3><p>${m.subtitle}</p></div>${status==='open'||status==='complete'?`<a class="btn ${status==='complete'?'ghost':'primary'} small" href="${m.path}">${status==='complete'?'Review':'Begin'} →</a>`:'<b>🔒</b>'}</article>`}).join("");
 LWM.buildGlossary("assets/data/glossary.json");LWM.buildBadges("assets/data/badges.json");
});
