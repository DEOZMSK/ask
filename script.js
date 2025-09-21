// 🔧 Вставь сюда свой URL из Google Apps Script (Deploy → Web App → /exec)
const SHEET_URL = "https://script.google.com/macros/s/ВАШ_ID/exec";

const intro = document.getElementById("screen-intro");
const survey = document.getElementById("screen-survey");
const thanks = document.getElementById("screen-thanks");

const qwrap = document.getElementById("qwrap");
const bar = document.getElementById("bar");
const stepLabel = document.getElementById("step");

const btnStart = document.getElementById("btn-start");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnSubmit = document.getElementById("btn-submit");

const QUESTIONS = [
  { id:"motivation", type:"single", text:"Что сейчас для тебя наиболее важно?", options:["💼 Карьера и работа","💖 Отношения и семья","💸 Деньги и финансы","🧘 Духовность и самопознание"] },
  { id:"fear_choice", type:"single", text:"Что сильнее всего мешает тебе решиться на перемены?", image:"https://i.imgur.com/0Qd5uJ2.png", options:["😱 Потеря стабильности","🙈 Ошибка в выборе","💸 Деньги уйдут впустую"] },
  { id:"nps", type:"nps", text:"Оцени от 0 до 10, насколько тебе в целом интересна астрология?" }
];

let currentStep=0;
let answers={};

btnStart.addEventListener("click",()=>{
  intro.classList.add("hidden");
  survey.classList.remove("hidden");
  currentStep=0;
  answers={};
  renderQuestion();
});

function renderQuestion(){
  const q=QUESTIONS[currentStep];
  stepLabel.textContent=`${currentStep+1} / ${QUESTIONS.length}`;
  bar.style.width=((currentStep+1)/QUESTIONS.length*100)+"%";
  let html=`<h2>${q.text}</h2>`;
  if(q.image) html+=`<img src="${q.image}" alt="" class="qimage">`;
  if(q.type==="single"||q.type==="multi"){
    html+=q.options.map(o=>`
      <button class="option-btn ${answers[q.id]===o?'active':''}" data-value="${o}" data-id="${q.id}">${o}</button>
    `).join("");
  }else if(q.type==="nps"){
    const val=answers[q.id]||5;
    html+=`<input type="range" min="0" max="10" step="1" value="${val}" class="range-input" id="range-${q.id}">`;
    html+=`<div>Твой выбор: <span id="range-val">${val}</span></div>`;
  }else if(q.type==="text"){
    html+=`<textarea name="${q.id}" rows="3">${answers[q.id]||""}</textarea>`;
  }
  qwrap.innerHTML=html;
  if(q.type==="single"||q.type==="multi"){
    document.querySelectorAll(".option-btn").forEach(btn=>{
      btn.addEventListener("click",()=>{
        document.querySelectorAll(".option-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        answers[q.id]=btn.dataset.value;
      });
    });
  }else if(q.type==="nps"){
    const range=document.getElementById(`range-${q.id}`);
    const out=document.getElementById("range-val");
    range.addEventListener("input",()=>{
      out.textContent=range.value;
      answers[q.id]=range.value;
    });
  }else if(q.type==="text"){
    const ta=document.querySelector("textarea");
    ta.addEventListener("input",()=>{answers[q.id]=ta.value;});
  }
  btnPrev.classList.toggle("hidden",currentStep===0);
  btnNext.classList.toggle("hidden",currentStep===QUESTIONS.length-1);
  btnSubmit.classList.toggle("hidden",currentStep!==QUESTIONS.length-1);
}

btnPrev.addEventListener("click",()=>{currentStep--;renderQuestion();});
btnNext.addEventListener("click",()=>{currentStep++;renderQuestion();});
btnSubmit.addEventListener("click",()=>{submitSurvey();});

async function submitSurvey(){
  const params=new URLSearchParams();
  for(const[k,v]of Object.entries(answers)){params.append(k,v);}
  try{
    await fetch(SHEET_URL,{method:"POST",body:params});
    survey.classList.add("hidden");
    thanks.classList.remove("hidden");
  }catch(err){alert("Ошибка: "+err);}
}