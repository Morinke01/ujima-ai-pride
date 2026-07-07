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

function getDecisionView(result) {
  const guardian = result.guardian || {};
  const decision = guardian.decision || "REVIEW";
  const score = guardian.score ?? "N/A";
  const applicantName = guardian.name || "Applicant";
  const amount = guardian.amount ? `KES ${guardian.amount.toLocaleString()}` : "the requested amount";
  const views = {
    APPROVED: {
      label: "Approved",
      className: "decision-approved",
      title: `Good news, ${applicantName}. Your loan has been approved.`,
      nextStep: "A SACCO officer can now proceed with final disbursement checks.",
    },
    REVIEW: {
      label: "Needs Review",
      className: "decision-review",
      title: `${applicantName}, your application is ready for officer review.`,
      nextStep:
        result.escalation?.message ||
        "A SACCO officer should verify repayment details before a final decision.",
    },
    REJECTED: {
      label: "Not Approved",
      className: "decision-rejected",
      title: `${applicantName}, this application was not approved today.`,
      nextStep:
        "Review the loan amount, repayment plan, and income records before applying again.",
    },
  };

  return {
    ...views[decision],
    decision,
    score,
    amount,
    explanation: guardian.explanation || "The decision was made using the Guardian Agent scoring rules.",
  };
}

function renderDecision(result) {
  const view = getDecisionView(result);

  return `
    <div class="decision-card ${view.className}">
      <div class="decision-header">
        <span class="decision-label">${view.label}</span>
        <span class="decision-score">Score: ${view.score}</span>
      </div>
      <h3>${view.title}</h3>
      <p class="decision-meta">Requested amount: ${view.amount}</p>
      <p>${view.explanation}</p>
      <div class="decision-next">
        <strong>Next step</strong>
        <p>${view.nextStep}</p>
      </div>
    </div>
  `;
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

    resultEl.innerHTML = renderDecision(result);
  } catch (error) {
    resultEl.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  } finally {
    button.disabled = false;
    button.textContent = "Submit Application";
  }
}
