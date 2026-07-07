const RENDER_API_BASE = "https://ujima-ai-backend.onrender.com";
const API_BASE =
  window.location.protocol === "file:" || window.location.hostname.includes("vercel.app")
    ? RENDER_API_BASE
    : window.location.origin;

async function readJsonResponse(res) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch (error) {
    return {
      error: text || "Server returned an unreadable response.",
    };
  }
}

async function submitLoan() {
  const resultEl = document.getElementById("result");
  const button = document.getElementById("submitButton");
  const data = {
    name: document.getElementById("name").value,
    occupation: document.getElementById("occupation").value,
    amount: Number(document.getElementById("amount").value),
  };

  resultEl.textContent = "";
  button.disabled = true;
  button.textContent = "Checking application...";

  try {
    const res = await fetch(`${API_BASE}/api/loan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await readJsonResponse(res);

    if (!res.ok) {
      throw new Error(result.error || "Application could not be submitted.");
    }

    resultEl.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
  } catch (error) {
    resultEl.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  } finally {
    button.disabled = false;
    button.textContent = "Submit Application";
  }
}
