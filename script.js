// 🔧 Вставь сюда свой URL из Google Apps Script (Deploy → Web App → /exec)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";

// Экраны и элементы
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

// Вопросы (заготовка, вставь все 17!)
const QUESTIONS = [
  {
    id: "motivation",
    text: "Что сейчас для тебя наиболее важно?",
    options: ["💼 Карьера и работа","💖 Отношения и семья","💸 Деньги и финансы","🧘 Духовность и самопознание"]
  },
  {
    id: "fear_choice",
    text: "Что сильнее всего мешает тебе решиться на перемены?",
    options: ["😱 Потеря стабильности","🙈 Ошибка в выборе","💸 Деньги уйдут впустую"]
  },
  // ... добавь остальные вопросы сюда
];

let currentStep = 0;
let answers = {};

// Старт
btnStart.addEventListener("click", () => {
  intro.classList.add("hidden");
  survey.classList.remove("hidden");
  currentStep = 0;
  answers = {};
  renderQuestion();
});

// Рендер вопроса
function renderQuestion() {
  const q = QUESTIONS[currentStep];
  stepLabel.textContent = `${currentStep+1} / ${QUESTIONS.length}`;
  bar.style.width = ((currentStep+1)/QUESTIONS.length*100)+"%";

  qwrap.innerHTML = `<h2>${q.text}</h2>` +
    q.options.map(o => `
      <label><input type="radio" name="${q.id}" value="${o}" ${answers[q.id]===o?'checked':''}> ${o}</label><br>
    `).join("");

  btnPrev.classList.toggle("hidden", currentStep===0);
  btnNext.classList.toggle("hidden", currentStep===QUESTIONS.length-1);
  btnSubmit.classList.toggle("hidden", currentStep!==QUESTIONS.length-1);
}

// Навигация
btnPrev.addEventListener("click", () => { saveAnswer(); currentStep--; renderQuestion(); });
btnNext.addEventListener("click", () => { saveAnswer(); currentStep++; renderQuestion(); });
btnSubmit.addEventListener("click", () => { saveAnswer(); submitSurvey(); });

// Сохранение ответа текущего шага
function saveAnswer() {
  const q = QUESTIONS[currentStep];
  const selected = document.querySelector(`input[name="${q.id}"]:checked`);
  if (selected) answers[q.id] = selected.value;
}

// Отправка в Google Sheets
async function submitSurvey() {
  const params = new URLSearchParams();
  for (const [k,v] of Object.entries(answers)) {
    params.append(k,v);
  }

  try {
    await fetch(SHEET_URL, { method:"POST", body:params });
    survey.classList.add("hidden");
    thanks.classList.remove("hidden");
  } catch(err) {
    alert("Ошибка отправки: " + err);
  }
}
