const form = document.getElementById("survey-form");
const thanks = document.getElementById("thanks");

// Вставь сюда свой URL из Google Apps Script (обязательно /exec)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";
const intro = document.getElementById("screen-intro");
const survey = document.getElementById("screen-survey");
const btnStart = document.getElementById("btn-start");

btnStart.addEventListener("click", () => {
  intro.classList.add("hidden");     // спрятать экран «intro»
  survey.classList.remove("hidden"); // показать экран с опросом
  startSurvey();                     // функция, которая рендерит первый вопрос
});

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const params = new URLSearchParams();
  for (const [k,v] of Object.entries(data)) {
    params.append(k,v);
  }

  try {
    await fetch(SHEET_URL, {method:"POST", body:params});
    form.classList.add("hidden");
    thanks.classList.remove("hidden");
  } catch(err) {
    alert("Ошибка отправки: "+err);
  }
});
