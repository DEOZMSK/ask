const form = document.getElementById("survey-form");
const thanks = document.getElementById("thanks");

// Вставь сюда свой URL из Google Apps Script
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzvFbbFe5H9SwhD_1F_r5JIoAgSFPaQFwiqjsPTgmaHjrMmug83i2inqQ8CKpqcJDsz4g/exec";

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  try{
    let res = await fetch(SHEET_URL, {
      method:"POST",
      body: JSON.stringify(data),
      headers:{"Content-Type":"application/json"}
    });
    let json = await res.json();
    console.log("Ответ сервера:", json);
    form.classList.add("hidden");
    thanks.classList.remove("hidden");
  }catch(err){
    alert("Ошибка отправки: "+err);
  }
});
