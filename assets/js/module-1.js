document.addEventListener("DOMContentLoaded",async()=>{
 const $=id=>document.getElementById(id);
 const money=n=>n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
 LWM.buildGlossary("../../../assets/data/glossary.json");
 LWM.buildBadges("../../../assets/data/badges.json");

 const companies=[
  ["Apple","Technology","Devices and services"],["Nike","Apparel","Shoes and clothing"],
  ["Disney","Entertainment","Stories, parks, streaming"],["Target","Retail","Everyday goods"],
  ["Visa","Payments","Payment network"],["Toyota","Vehicles","Cars and mobility"],
  ["McDonald’s","Restaurants","Food and franchises"],["Netflix","Streaming","Subscriptions and content"]
 ];
 let selected=LWM.getInteraction("companies",[]);
 function drawCompanies(){
  $("companyGrid").innerHTML=companies.map((c,i)=>`<button class="company ${selected.includes(i)?"selected":""}" data-i="${i}"><strong>${c[0]}</strong><small>${c[1]} · ${c[2]}</small></button>`).join("");
  const types=new Set(selected.map(i=>companies[i][1]));
  $("companyFeedback").innerHTML=selected.length<5
   ?`<strong>Build your set:</strong> Choose ${5-selected.length} more. Try to include different kinds of businesses.`
   :`<strong>Your owner view:</strong> You chose five companies across ${types.size} business types. Different businesses earn money in different ways.`;
 }
 drawCompanies();
 $("companyGrid").onclick=e=>{
  const b=e.target.closest("[data-i]");if(!b)return;
  const i=+b.dataset.i;
  if(selected.includes(i))selected=selected.filter(x=>x!==i);
  else if(selected.length<5)selected.push(i);
  else return LWM.toast("Choose only five");
  LWM.setInteraction("companies",selected);drawCompanies();
 };

 document.querySelectorAll("[data-quick-note]").forEach(b=>b.onclick=()=>{
  LWM.openModal("notebookModal");
  const type=document.querySelector("[data-notebook-type]");
  if(type)type.value=b.dataset.quickNote;
 });

 const scenarios={
  "School starts":{
   chain:["Target may sell more school supplies.","Nike may sell more shoes and clothing.","Netflix may see little direct benefit."],
   lesson:"The same event can affect businesses differently because customers buy different things from them."
  },
  "Fuel prices rise":{
   chain:["Efficient vehicles may become more attractive.","Transportation costs may rise for retailers.","A payment network may feel little direct effect at first."],
   lesson:"An event can affect both customer demand and a company’s costs."
  },
  "Families cut spending":{
   chain:["Essentials may hold up better than optional purchases.","Lower-cost entertainment may seem more attractive.","Premium products may face more pressure."],
   lesson:"You must ask what customers can delay, replace, or stop buying."
  }
 };
 let scenario=LWM.getInteraction("scenario",null),prediction=LWM.getInteraction("scenarioPrediction",null);
 $("scenarioButtons").innerHTML=Object.keys(scenarios).map(x=>`<button class="chip ${scenario===x?"active":""}">${x}</button>`).join("");
 $("scenarioButtons").onclick=e=>{
  const b=e.target.closest("button");if(!b)return;
  scenario=b.textContent;prediction=null;
  [...$("scenarioButtons").children].forEach(x=>x.classList.toggle("active",x===b));
  [...$("predictionButtons").children].forEach(x=>x.classList.remove("active"));
  $("revealScenario").disabled=true;
  $("scenarioResult").textContent="Now predict whether the event mostly helps, mostly hurts, or depends.";
  LWM.setInteraction("scenario",scenario);
 };
 $("predictionButtons").onclick=e=>{
  const b=e.target.closest("button");if(!b||!scenario)return LWM.toast("Choose an event first");
  prediction=b.textContent;
  [...$("predictionButtons").children].forEach(x=>x.classList.toggle("active",x===b));
  $("revealScenario").disabled=false;
  LWM.setInteraction("scenarioPrediction",prediction);
 };
 $("revealScenario").onclick=()=>{
  if(!scenario||!prediction)return;
  const s=scenarios[scenario];
  $("scenarioResult").innerHTML=`<strong>Your prediction: ${prediction}</strong><h4>${scenario}</h4><ul>${s.chain.map(x=>`<li>${x}</li>`).join("")}</ul><p><b>Owner lesson:</b> ${s.lesson}</p>`;
 };
 if(scenario&&prediction){$("revealScenario").disabled=false}

 const age=$("age"),monthly=$("monthly"),end=$("end"),rate=$("rate");
 function calc(){
  const a=+age.value,m=+monthly.value,e=+end.value,r=+rate.value/100/12,n=Math.max(0,(e-a)*12);
  const future=r?m*((Math.pow(1+r,n)-1)/r):m*n,contrib=m*n;
  $("ageV").textContent=a;$("monthlyV").textContent=money(m);$("endV").textContent=e;$("rateV").textContent=(+rate.value).toFixed(1)+"%";
  $("contrib").textContent=money(contrib);$("growth").textContent=money(Math.max(0,future-contrib));$("future").textContent=money(future);
 }
 [age,monthly,end,rate].forEach(x=>x.oninput=calc);calc();

 const funds={
  VTI:{name:"Vanguard Total Stock Market ETF",job:"Broad U.S. foundation",inside:"Thousands of U.S. companies of many sizes",er:.03,why:"It gives one fund a very broad job."},
  SCHG:{name:"Schwab U.S. Large-Cap Growth ETF",job:"Large-growth tilt",inside:"Large U.S. growth companies",er:.04,why:"It deliberately adds more weight to this part of the market."},
  AVUV:{name:"Avantis U.S. Small Cap Value ETF",job:"Small-value tilt",inside:"Smaller U.S. companies selected with value and profitability measures",er:.25,why:"It adds a different company size and style."},
  VXUS:{name:"Vanguard Total International Stock ETF",job:"International ownership",inside:"Companies outside the United States",er:.05,why:"It reduces dependence on one country."}
 };
 const keys=Object.keys(funds);
 $("fundTabs").innerHTML=keys.map((k,i)=>`<button class="chip ${i?"":"active"}" data-k="${k}">${k}</button>`).join("");
 function showFund(k){
  const f=funds[k],c1=(f.er/100*1000).toFixed(2),c10=(f.er/100*10000).toFixed(2);
  $("fundPanel").innerHTML=`<h3>${k} · ${f.name}</h3><div class="fund-facts"><div><span>Job</span><b>${f.job}</b></div><div><span>What is inside</span><b>${f.inside}</b></div><div><span>Expense ratio</span><b>${f.er.toFixed(2)}% yearly</b></div><div><span>Approximate cost</span><b>$${c1}/$1,000 · $${c10}/$10,000</b></div></div><p>${f.why}</p>`;
 }
 showFund("VTI");
 $("fundTabs").onclick=e=>{const b=e.target.closest("[data-k]");if(!b)return;[...$("fundTabs").children].forEach(x=>x.classList.remove("active"));b.classList.add("active");showFund(b.dataset.k)};
 [$("fundA"),$("fundB")].forEach(s=>s.innerHTML=keys.map(k=>`<option>${k}</option>`).join(""));
 $("fundB").value="SCHG";
 const overlaps={"SCHG|VTI":78,"AVUV|VTI":24,"VTI|VXUS":1,"AVUV|SCHG":4,"AVUV|VXUS":1,"SCHG|VXUS":1};
 function overlap(){const a=$("fundA").value,b=$("fundB").value,key=[a,b].sort().join("|"),v=a===b?100:(overlaps[key]??8);$("overlapFill").style.width=v+"%";$("overlapText").textContent=a===b?"These are the same fund.":`${v}% is a simplified teaching estimate. Different fund names do not guarantee different holdings.`}
 [$("fundA"),$("fundB")].forEach(x=>x.onchange=overlap);overlap();

 let marketChoice=LWM.getInteraction("marketChoice",null);
 const marketExplanations={
  sell:{title:"Panic sell",now:"You lock in the $20 decline and leave with $80.",later:"If the market later recovers 15%, your sold money does not participate unless you reinvest.",value:80,badge:false},
  hold:{title:"Hold",now:"You keep the same number of ETF shares. The screen value is lower, but you have not sold.",later:"If the market later rises 15%, $80 becomes about $92. You are still below $100, showing that recovery can take more than one step.",value:92,badge:true},
  buy:{title:"Buy $20 more",now:"You add money while prices are lower, so you own more shares. Your total invested becomes $120.",later:"If the combined $100 value later rises 15%, it becomes about $115. This can help a long-term plan, but only when the money is truly available and the investment reason still fits.",value:115,badge:true}
 };
 function showMarket(choice){
  marketChoice=choice;LWM.setInteraction("marketChoice",choice);
  [...$("marketChoices").children].forEach(x=>x.classList.toggle("active",x.dataset.choice===choice));
  const m=marketExplanations[choice];
  $("marketResult").innerHTML=`<strong>${m.title}</strong><p>${m.now}</p><p><b>Key judgment:</b> A market drop is not an automatic command. The goal, time horizon, diversification, and investment facts matter.</p>`;
  $("runNextYear").disabled=false;
  if(m.badge)LWM.unlockBadge("steady-investor");
 }
 $("marketChoices").onclick=e=>{const b=e.target.closest("[data-choice]");if(b)showMarket(b.dataset.choice)};
 $("runNextYear").onclick=()=>{if(!marketChoice)return;const m=marketExplanations[marketChoice];$("simFuture").innerHTML=`<div class="future-card"><span>One possible next year</span><strong>${money(m.value)}</strong><p>${m.later}</p><small>This is a teaching scenario, not a forecast.</small></div>`};
 if(marketChoice)showMarket(marketChoice);

 $("judgmentOptions").onclick=e=>{
  const b=e.target.closest("button");if(!b)return;
  [...$("judgmentOptions").children].forEach(x=>x.classList.remove("selected","correct","incorrect"));
  b.classList.add("selected",b.dataset.correct==="true"?"correct":"incorrect");
  $("judgmentResult").innerHTML=b.dataset.correct==="true"
   ?"<strong>Strong reasoning.</strong><p>You used the investment, the goal, the timing, and changed facts instead of reacting to one number.</p>"
   :"<strong>Try again.</strong><p>This answer treats every drop as identical. Look for the response that asks what is owned, when the money is needed, and whether the original reason changed.</p>";
 };

 ["teachBack","mistakeAnswer","judgmentAnswer","fundResearch"].forEach(id=>$(id).value=LWM.getNote(id));
 $("saveExplain").onclick=()=>{
  const vals=["teachBack","mistakeAnswer","judgmentAnswer"].map(id=>$(id).value.trim());
  if(vals.some(v=>v.length<25))return LWM.toast("Add a fuller explanation to each box");
  ["teachBack","mistakeAnswer","judgmentAnswer"].forEach((id,i)=>LWM.setNote(id,vals[i]));
  LWM.completeStage("explain");LWM.toast("Explanations saved");
 };
 $("saveResearch").onclick=()=>{
  const v=$("fundResearch").value.trim();
  if(v.length<55)return LWM.toast("Include the ticker, job, holdings, expense ratio, and cost");
  LWM.setNote("fundResearch",v);LWM.completeStage("realworld");LWM.toast("Research saved");
 };

 const questions=[
  {id:"q1",q:"What do you own when you buy one company’s stock?",options:[["a","A guaranteed return"],["b","A small ownership share of that company"],["c","Every company in the market"]],answer:"b"},
  {id:"q2",q:"What does a 0.03% expense ratio describe?",options:[["a","The fund’s guaranteed return"],["b","The amount the stock price must rise"],["c","The fund’s approximate annual operating cost"]],answer:"c"},
  {id:"q3",q:"Why does a long time horizon matter?",options:[["a","It gives market declines more time to recover before the money is needed"],["b","It removes every risk"],["c","It means prices cannot fall"]],answer:"a"},
  {id:"q4",q:"What is the strongest response to a 20% market drop?",options:[["a","Always sell immediately"],["b","Review what you own, your goal, your time horizon, and whether the facts changed"],["c","Assume the market will recover tomorrow"]],answer:"b"}
 ];
 $("quizHost").innerHTML=questions.map((q,i)=>`<fieldset class="quiz-question"><legend>${i+1}. ${q.q}</legend>${q.options.map(o=>`<label><input type="radio" name="${q.id}" value="${o[0]}"> ${o[1]}</label>`).join("")}</fieldset>`).join("");
 $("checkQuiz").onclick=()=>{
  let score=0;
  questions.forEach(q=>{const picked=document.querySelector(`input[name=${q.id}]:checked`);if(picked?.value===q.answer)score++});
  $("quizFeedback").textContent=`You answered ${score} of ${questions.length} correctly. ${score===questions.length?"You are ready to complete the module.":"Review the explanations, then try again."}`;
  $("completeModule").disabled=score<questions.length;
  LWM.setInteraction("quizScore",score);
  if(score===questions.length)LWM.completeStage("finish");
 };
 if(LWM.getInteraction("quizScore",0)===questions.length)$("completeModule").disabled=false;
 $("completeModule").onclick=()=>{LWM.completeModule("world-1-module-1");$("completeBanner").classList.add("show")};
 if(LWM.getState().completedModules.includes("world-1-module-1"))$("completeBanner").classList.add("show");

 $("parentUnlock").onclick=()=>{if($("parentPin").value==="0222"){$("parentGate").hidden=true;$("parentContent").hidden=false}else LWM.toast("Incorrect parent code")};
});
