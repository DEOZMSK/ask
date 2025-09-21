/* © mr.Kcopoc 2025 — чистый JS. 
   ✔ Один вопрос на экран, прогресс-бар, чёрно-золотой стиль.
   ✔ Отправка в Google Sheets через Apps Script БЕЗ CORS-проблем (URL-encoded).
   🔧 ВСТАВЬ URL веб‑приложения сюда: */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";

/* Структура опроса (редактируй тексты свободно). id — это имя колонки в таблице. */
const SURVEY = [
  { id:"motivation", type:"single", text:"Что сейчас для тебя наиболее важно?",
    options:["💼 Карьера и работа","💖 Отношения и семья","💸 Деньги и финансы","🧘 Духовность и самопознание"] },
  { id:"fear_choice", type:"single", text:"Что сильнее всего мешает тебе решиться на перемены?",
    image:"https://i.imgur.com/0Qd5uJ2.png",
    options:["😱 Потеря стабильности","🙈 Ошибка в выборе","💸 Деньги уйдут впустую"] },
  { id:"balance", type:"single", text:"Что для тебя сейчас важнее всего?",
    image:"https://i.imgur.com/hMuU3sH.png",
    options:["⚖️ Баланс между работой и отдыхом","👨‍👩‍👧 Время с семьёй","🚀 Самореализация","🌱 Спокойствие и гармония"] },
  { id:"format_pref", type:"single", text:"В каком формате тебе было бы удобнее получать консультацию?",
    options:["💬 Чат в Telegram","📹 Видеозвонок","📞 Голосовой звонок","📝 Запись с разбором"] },
  { id:"trust", type:"multi", text:"Что помогло бы тебе больше доверять астрологу?",
    image:"https://i.imgur.com/oCMvumz.png",
    options:["📊 Реальные примеры и кейсы","⭐ Отзывы других клиентов","🎓 Подтверждённые знания и опыт","💬 Личная рекомендация"] },
  { id:"nps", type:"nps", text:"Оцени от 0 до 10, насколько тебе в целом интересна астрология?" },
  { id:"improve", type:"multi", text:"Что стоит улучшить в подаче материала?",
    options:["🖼 Больше картинок и наглядности","📹 Видео-формат","📝 Чёткая структура","⚡ Краткость и конкретика"] },
  { id:"price", type:"single", text:"Какая цена консультации кажется справедливой?",
    image:"https://i.imgur.com/dxra9Ow.png",
    options:["💸 До 1000₽","💰 1000–3000₽","💎 3000–5000₽","👑 Выше 5000₽"] },
  { id:"result_goal", type:"text", text:"Что для тебя будет самым ценным результатом консультации?",
    image:"https://i.imgur.com/12E9sLE.png" },
  { id:"recommend", type:"nps", text:"Насколько вероятно, что ты порекомендуешь консультацию другу или знакомому? (0–10)" },
  { id:"likes", type:"text", text:"Что тебе больше всего нравится в консультациях?" },
  { id:"dislikes", type:"text", text:"Что может раздражать или отталкивать в консультации?" },
  { id:"prefer_time", type:"single", text:"Когда тебе было бы удобнее всего общаться?",
    options:["🌅 Утро","🌞 День","🌆 Вечер","🌙 Ночь"] },
  { id:"prefer_length", type:"single", text:"Какая длительность консультации для тебя оптимальна?",
    options:["⏱ 30 минут","🕐 1 час","🕑 2 часа"] },
  { id:"extra_topics", type:"multi", text:"Какие темы тебе наиболее интересны?",
    options:["💼 Карьера","💖 Отношения","💸 Финансы","🌱 Личное развитие","🧘 Духовность"] },
  { id:"contact_pref", type:"single", text:"Как тебе удобнее всего оставлять контакты?",
    options:["📱 Telegram","📧 Email","📞 Телефон"] },
  { id:"final_comment", type:"text", text:"Можешь написать здесь всё, что считаешь важным или полезным для меня 🙏" },
];

const app = {
  intro: document.getElementById('screen-intro'),
  survey: document.getElementById('screen-survey'),
  thanks: document.getElementById('screen-thanks'),
  btnStart: document.getElementById('btn-start'),
  btnPrev: document.getElementById('btn-prev'),
  btnNext: document.getElementById('btn-next'),
  btnSubmit: document.getElementById('btn-submit'),
  qwrap: document.getElementById('qwrap'),
  bar: document.getElementById('bar'),
  step: document.getElementById('step'),
};

let state = { i:0, answers:{} };

function show(el){ el.classList.remove('hidden') }
function hide(el){ el.classList.add('hidden') }
function updateProgress(){
  const pct = Math.round((state.i)/SURVEY.length*100);
  app.bar.style.width = pct+'%';
  app.step.textContent = (state.i+1)+" / "+SURVEY.length;
}

function start(){
  state = {i:0, answers:{}};
  hide(app.intro); show(app.survey);
  render();
}

function render(){
  const q = SURVEY[state.i];
  app.qwrap.innerHTML = "";

  const title = document.createElement('h2');
  title.className = "q-title";
  title.textContent = q.text;
  app.qwrap.appendChild(title);

  if(q.image){
    const img = document.createElement('img');
    img.src = q.image; img.alt=""; img.className="q-image";
    app.qwrap.appendChild(img);
  }

  if(q.type === "single"){
    const box = document.createElement('div'); box.className="options";
    q.options.forEach((opt,idx)=>{
      const id = q.id+"-"+idx;
      const wrap = document.createElement('label'); wrap.className="opt";
      const input = document.createElement('input'); input.type="radio"; input.name=q.id; input.id=id; input.value=opt;
      if(state.answers[q.id]===opt) input.checked = true;
      const span = document.createElement('span'); span.textContent = opt;
      wrap.appendChild(input); wrap.appendChild(span); box.appendChild(wrap);
    });
    app.qwrap.appendChild(box);
  }

  if(q.type === "multi"){
    const box = document.createElement('div'); box.className="options";
    const saved = new Set(state.answers[q.id]||[]);
    q.options.forEach((opt,idx)=>{
      const id = q.id+"-"+idx;
      const wrap = document.createElement('label'); wrap.className="opt";
      const input = document.createElement('input'); input.type="checkbox"; input.name=q.id; input.id=id; input.value=opt;
      if(saved.has(opt)) input.checked = true;
      const span = document.createElement('span'); span.textContent = opt;
      wrap.appendChild(input); wrap.appendChild(span); box.appendChild(wrap);
    });
    app.qwrap.appendChild(box);
  }

  if(q.type === "text"){
    const ta = document.createElement('textarea'); ta.name=q.id; ta.rows=4; ta.placeholder="Напиши здесь...";
    ta.value = state.answers[q.id] || "";
    app.qwrap.appendChild(ta);
  }

  if(q.type === "nps"){
    const wrap = document.createElement('div'); wrap.className="range";
    const out = document.createElement('strong'); out.textContent = state.answers[q.id] ?? "—";
    const r = document.createElement('input'); r.type="range"; r.min=0; r.max=10; r.step=1;
    r.value = state.answers[q.id] ?? 5;
    r.addEventListener('input',()=>{ out.textContent=r.value });
    const hint0 = document.createElement('span'); hint0.textContent="0";
    const hint10 = document.createElement('span'); hint10.textContent="10";
    wrap.append(hint0, r, hint10, out);
    app.qwrap.appendChild(wrap);
  }

  // nav buttons
  app.btnPrev.disabled = state.i===0;
  app.btnNext.classList.toggle('hidden', state.i===SURVEY.length-1);
  app.btnSubmit.classList.toggle('hidden', state.i!==SURVEY.length-1);

  updateProgress();
}

function collectCurrent(){
  const q = SURVEY[state.i];
  if(q.type==="single"){
    const sel = app.qwrap.querySelector('input[type="radio"]:checked');
    if(sel) state.answers[q.id] = sel.value;
  }
  if(q.type==="multi"){
    const vals = [...app.qwrap.querySelectorAll('input[type="checkbox"]:checked')].map(i=>i.value);
    state.answers[q.id] = vals;
  }
  if(q.type==="text"){
    const ta = app.qwrap.querySelector('textarea'); state.answers[q.id] = ta.value.trim();
  }
  if(q.type==="nps"){
    const r = app.qwrap.querySelector('input[type="range"]'); state.answers[q.id] = r.value;
  }
}

async function submit(){
  collectCurrent();

  // Сбор безопасным способом для CORS: URLSearchParams (application/x-www-form-urlencoded — “simple request”)
  const params = new URLSearchParams();
  params.append("timestamp", new Date().toISOString());
  for(const q of SURVEY){
    const v = state.answers[q.id];
    if(Array.isArray(v)) params.append(q.id, v.join(", "));
    else params.append(q.id, v ?? "");
  }

  try{
    await fetch(SHEET_URL, { method:"POST", body: params });
    hide(app.survey); show(app.thanks);
  }catch(err){
    alert("Ошибка отправки: "+err);
  }
}

// events
app.btnStart.addEventListener('click', start);
app.btnPrev.addEventListener('click', ()=>{ collectCurrent(); state.i=Math.max(0,state.i-1); render(); });
app.btnNext.addEventListener('click', ()=>{ collectCurrent(); state.i=Math.min(SURVEY.length-1,state.i+1); render(); });
app.btnSubmit.addEventListener('click', submit);
