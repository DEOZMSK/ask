// 🔧 Вставь сюда свой URL из Google Apps Script (Deploy → Web App → /exec)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";

// Экраны
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

// === Все 17 вопросов ===
const QUESTIONS = [
  { id: "motivation", type: "single", text: "Что сейчас для тебя наиболее важно?", options: ["💼 Карьера и работа","💖 Отношения и семья","💸 Деньги и финансы","🧘 Духовность и самопознание"] },
  { id: "fear_choice", type: "single", text: "Что сильнее всего мешает тебе решиться на перемены?", options: ["😱 Потеря стабильности","🙈 Ошибка в выборе","💸 Деньги уйдут впустую"] },
  { id: "balance", type: "single", text: "Что для тебя сейчас важнее всего?", options: ["⚖️ Баланс между работой и отдыхом","👨‍👩‍👧 Время с семьёй","🚀 Самореализация","🌱 Спокойствие и гармония"] },
  { id: "format_pref", type: "single", text: "В каком формате тебе было бы удобнее получать консультацию?", options: ["💬 Чат в Telegram","📹 Видеозвонок","📞 Голосовой звонок","📝 Запись с разбором"] },
  { id: "trust", type: "multi", text: "Что помогло бы тебе больше доверять астрологу?", options: ["📊 Реальные примеры и кейсы","⭐ Отзывы других клиентов","🎓 Подтверждённые знания и опыт","💬 Личная рекомендация"] },
  { id: "nps", type: "nps", text: "Оцени от 0 до 10, насколько тебе в целом интересна астрология?" },
  { id: "improve", type: "multi", text: "Что стоит улучшить в подаче материала?", options: ["🖼 Больше картинок и наглядности","📹 Видео-формат","📝 Чёткая структура","⚡ Краткость и конкретика"] },
  { id: "price", type: "single", text: "Какая цена консультации кажется справедливой?", options: ["💸 До 1000₽","💰 1000–3000₽","💎 3000–5000₽","👑 Выше 5000₽"] },
  { id: "result_goal", type: "text", text: "Что для тебя будет самым ценным результатом консультации?" },
  { id: "recommend", type: "nps", text: "Насколько вероятно, что ты порекомендуешь консультацию другу или знакомому? (0–10)" },
  { id: "likes", type: "text", text: "Что тебе больше всего нравится в консультациях?" },
  { id: "dislikes", type: "text", text: "Что может раздражать или отталкивать в консультации?" },
  { id: "prefer_time", type: "single", text: "Когда тебе было бы удобнее всего общаться?", options: ["🌅 Утро","🌞 День","🌆 Вечер","🌙 Ночь"] },
  { id: "prefer_length", type: "single", text: "Какая длительность консультации для тебя оптимальна?", options: ["⏱ 30 минут","🕐 1 час","🕑 2 часа"] },
  { id: "extra_topics", type: "multi", text: "Какие темы тебе наиболее интересны?", options: ["💼 Карьера","💖 Отношения","💸 Финансы","🌱 Личное развитие","🧘 Духовность"] },
  { id: "contact_pref", type: "single", text: "Как тебе удобнее всего оставлять контакты?", options: ["📱 Telegram","📧 Email","📞 Телефон"] },
  { id: "final_comment", type: "text", text: "Можешь написать здесь всё, что считаешь важным или полезным для меня 🙏" }
];

let currentStep = 0;
let answers = {};

// --- Запуск ---
btnStart.addEventListener("click", () => {
  intro.classList.add("hidden");
  survey.classList.remove("hidden");
  currentStep = 0;
  answers = {};
  renderQuestion();
});

// --- Рендер вопроса ---
function renderQuestion() {
  const q = QUESTIONS[currentStep];
  stepLabel.textContent = `${currentStep+1} / ${QUESTIONS.length}`;
  bar.style.width = ((currentStep+1)/QUESTIONS.length*100)+"%";

  if (q.type === "single" || q.type === "multi") {
    qwrap.innerHTML = `<h2>${q.text}</h2>` + 
      q.options.map(o=>`
        <label>
          <input type="${q.type==="multi"?"checkbox":"radio"}" 
                 name="${q.id}" value="${o}"
                 ${answers[q.id] && answers[q.id].includes(o)?'checked':''}>
          ${o}
        </label><br>`).join("");
  } else if (q.type === "nps") {
    qwrap.innerHTML = `<h2>${q.text}</h2>
      <input type="number" name="${q.id}" min="0" max="10" value="${answers[q.id]||""}">`;
  } else if (q.type === "text") {
    qwrap.innerHTML = `<h2>${q.text}</h2>
      <textarea name="${q.id}" rows="3">${answers[q.id]||""}</textarea>`;
  }

  btnPrev.classList.toggle("hidden", currentStep===0);
  btnNext.classList.toggle("hidden", currentStep===QUESTIONS.length-1);
  btnSubmit.classList.toggle("hidden", currentStep!==QUESTIONS.length-1);
}

// --- Навигация ---
btnPrev.addEventListener("click", ()=>{ saveAnswer(); currentStep--; renderQuestion(); });
btnNext.addEventListener("click", ()=>{ saveAnswer(); currentStep++; renderQuestion(); });
btnSubmit.addEventListener("click", ()=>{ saveAnswer(); submitSurvey(); });

// --- Сохранение ответа ---
function saveAnswer() {
  const q = QUESTIONS[currentStep];
  if (q.type==="single") {
    const selected = document.querySelector(`input[name="${q.id}"]:checked`);
    if (selected) answers[q.id] = selected.value;
  } else if (q.type==="multi") {
    const selected = Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`)).map(x=>x.value);
    answers[q.id] = selected;
  } else if (q.type==="nps") {
    const val = document.querySelector(`input[name="${q.id}"]`).value;
    answers[q.id] = val;
  } else if (q.type==="text") {
    const val = document.querySelector(`textarea[name="${q.id}"]`).value;
    answers[q.id] = val;
  }
}

// --- Отправка ---
async function submitSurvey() {
  const params = new URLSearchParams();
  for (const [k,v] of Object.entries(answers)) {
    params.append(k, Array.isArray(v) ? v.join(", ") : v);
  }
  try {
    await fetch(SHEET_URL, { method:"POST", body:params });
    survey.classList.add("hidden");
    thanks.classList.remove("hidden");
  } catch(err) {
    alert("Ошибка отправки: " + err);
  }
}
