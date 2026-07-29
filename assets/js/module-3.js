
document.addEventListener("DOMContentLoaded",()=>{
 const history=[
  {year:"1929",drop:89,recovery:"about 25 years",months:300,why:"The Great Depression brought bank failures, unemployment, and a very long return to the old peak."},
  {year:"1973–74",drop:48,recovery:"about 7½ years",months:90,why:"Inflation, recession, and an oil shock weighed on markets."},
  {year:"1987",drop:34,recovery:"about 2 years",months:22,why:"The crash was sudden, but the broader economy did not experience another Great Depression."},
  {year:"2000–02",drop:49,recovery:"about 7 years",months:84,why:"The dot-com bubble deflated and many technology expectations proved unrealistic."},
  {year:"2007–09",drop:57,recovery:"about 5½ years",months:66,why:"A housing and financial crisis damaged businesses, jobs, and confidence."},
  {year:"2020",drop:34,recovery:"about 5 months",months:5,why:"The pandemic drop was extremely fast, and the recovery was also unusually fast."},
  {year:"2022",drop:25,recovery:"about 2 years",months:24,why:"Inflation and rapidly rising interest rates changed what investors were willing to pay."}
 ];
 const host=document.getElementById("historyLab");let done=0;
 host.innerHTML=history.map((x,i)=>`<article class="history-card"><div><span>${x.year}</span><strong>−${x.drop}%</strong></div><p>How long until the broad market returned to its prior high?</p><div class="history-predict"><button data-i="${i}" data-p="fast">Under 1 year</button><button data-i="${i}" data-p="medium">1–5 years</button><button data-i="${i}" data-p="long">More than 5 years</button></div><div class="history-reveal" id="reveal-${i}">Predict first.</div></article>`).join("");
 host.querySelectorAll("button").forEach(b=>b.onclick=()=>{
  const i=+b.dataset.i,x=history[i],card=b.closest(".history-card");
  if(card.dataset.done)return;
  card.dataset.done="1";card.querySelectorAll("button").forEach(x=>x.disabled=true);b.classList.add("selected");
  document.getElementById(`reveal-${i}`).innerHTML=`<strong>${x.recovery}</strong><span>${x.why}</span>`;
  done++;LWM.addXP(4,"History prediction");
  if(done===history.length){document.getElementById("historySummary").innerHTML="<strong>The pattern:</strong> The size of a drop did not tell you how long recovery would take. 1929 and 2020 make opposite mistakes impossible to ignore.";LWM.unlockBadge("cycle-reader")}
 });
 const slider=document.getElementById("dropSlider");
 function recovery(){
  const d=+slider.value,remain=100-d,gain=d/remain*100;
  document.getElementById("dropValue").textContent=`−${d}%`;document.getElementById("afterDrop").textContent=`$${remain}`;document.getElementById("gainNeeded").textContent=`+${gain.toFixed(gain>=100?0:1)}%`;
  document.getElementById("recoveryExplain").textContent=`A ${d}% decline leaves $${remain}. Returning from $${remain} to $100 requires a ${gain.toFixed(gain>=100?0:1)}% gain.`;
  if(d>=50)LWM.unlockBadge("recovery-mathematician")
 } slider.oninput=recovery;recovery();
 const people=[
  {name:"Ava",goal:"Retirement more than 40 years away",answer:"The decline is uncomfortable, but her deadline is far away. She can review diversification and keep following the plan rather than treating today as the deadline."},
  {name:"Jordan",goal:"Home purchase in 12 years",answer:"Twelve years offers time, but the portfolio should gradually become safer as the purchase date gets closer."},
  {name:"Ben",goal:"Car purchase in 7 months",answer:"This is a real timing problem. Money needed in seven months should not depend on stocks recovering on schedule."}
 ];
 const h=document.getElementById("horizonCards");h.innerHTML=people.map((p,i)=>`<button data-i="${i}"><b>${p.name}</b><span>${p.goal}</span></button>`).join("");
 h.querySelectorAll("button").forEach(b=>b.onclick=()=>{h.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");document.getElementById("horizonResult").innerHTML=people[+b.dataset.i].answer});
 document.querySelectorAll("#timingChoices button").forEach(b=>b.onclick=()=>{document.querySelectorAll("#timingChoices button").forEach(x=>x.classList.remove("correct","wrong"));const ok=b.dataset.answer==="yes";b.classList.add(ok?"correct":"wrong");document.getElementById("timingResult").innerHTML=ok?"Correct. The deadline—not the scariness of the chart—creates the urgent problem.":"Look for the person who needs the money before a normal recovery has time to happen.";if(ok)LWM.unlockBadge("horizon-judge")});
 ["recoveryAnswer","historyAnswer","dateAnswer"].forEach(id=>document.getElementById(id).value=LWM.getNote("m3-"+id));
 document.getElementById("saveExplain3").onclick=()=>{["recoveryAnswer","historyAnswer","dateAnswer"].forEach(id=>LWM.setNote("m3-"+id,document.getElementById(id).value));LWM.addNotebook({type:"What I learned",text:document.getElementById("dateAnswer").value,module:"World 1 · Module 3"});LWM.toast("Explanations saved")};
 document.getElementById("saveInterview").onclick=()=>{const text=document.getElementById("interviewNote").value;if(LWM.addNotebook({type:"My real-world example",text,module:"World 1 · Module 3"}))LWM.toast("Interview insight saved")};
 const quiz=[
  {q:"A broad market falls 25%. What does that tell you?",a:1,o:["It will recover within one year.","It meets the common size threshold for a bear market, but not the recovery date.","Every company in the market fell exactly 25%."]},
  {q:"A $100 investment falls to $50. What gain returns it to $100?",a:2,o:["50%","75%","100%"]},
  {q:"Who faces the most immediate market risk?",a:0,o:["Someone needing the money in six months.","Someone investing for retirement in 40 years.","Someone adding monthly for a goal 20 years away."]},
  {q:"What is the strongest lesson from comparing 1929 and 2020?",a:2,o:["Deep drops always recover slowly.","Modern markets always recover quickly.","The size of a decline does not reliably predict recovery time."]}
 ];
 const qh=document.getElementById("quizHost3");qh.innerHTML=quiz.map((x,i)=>`<fieldset class="quiz-question"><legend>${i+1}. ${x.q}</legend>${x.o.map((o,j)=>`<label><input type="radio" name="q3-${i}" value="${j}"> ${o}</label>`).join("")}</fieldset>`).join("");
 document.getElementById("checkQuiz3").onclick=()=>{let score=0;quiz.forEach((x,i)=>{const v=document.querySelector(`input[name="q3-${i}"]:checked`);if(v&&+v.value===x.a)score++});document.getElementById("quizFeedback3").textContent=`${score} of ${quiz.length} correct. ${score===quiz.length?"You are ready to complete the module.":"Review the reasoning and try again."}`;document.getElementById("completeModule3").disabled=score!==quiz.length};
 document.getElementById("completeModule3").onclick=()=>{LWM.completeModule("world-1-module-3",150);document.getElementById("completeBanner3").classList.add("show")};
 document.getElementById("parentUnlock").onclick=()=>{if(document.getElementById("parentPin").value==="0222"){document.getElementById("parentGate").hidden=true;document.getElementById("parentContent").hidden=false}else LWM.toast("That code did not match")};
 LWM.buildGlossary("../../../assets/data/glossary.json");LWM.buildBadges("../../../assets/data/badges.json");
});
