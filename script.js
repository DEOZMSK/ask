const form = document.getElementById("survey-form");
const thanks = document.getElementById("thanks");

// Вставь сюда свой URL из Google Apps Script (обязательно /exec)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";

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
