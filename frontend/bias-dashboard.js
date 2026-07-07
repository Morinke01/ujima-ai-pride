const RENDER_API_BASE = "https://ujima-ai-backend.onrender.com";
const API_BASE =
  window.location.protocol === "file:" || window.location.hostname.includes("vercel.app")
    ? RENDER_API_BASE
    : window.location.origin;

let approvalChartInstance = null;
let scoreChartInstance = null;

async function loadData() {
  try {
    const res = await fetch(`${API_BASE}/api/logs`);
    const data = await res.json();
    const safeData = Array.isArray(data) ? data.filter((d) => d.input && d.result) : [];

    if (!safeData.length) {
      showEmpty();
      return;
    }

    const marketVendors = safeData.filter(
      (d) => d.input.occupation === "market vendor"
    );
    const formalEmployees = safeData.filter(
      (d) => d.input.occupation === "formal employee"
    );

    const mvApproved = marketVendors.filter(
      (d) => d.result.decision === "APPROVED"
    ).length;
    const feApproved = formalEmployees.filter(
      (d) => d.result.decision === "APPROVED"
    ).length;
    const mvRate = marketVendors.length ? (mvApproved / marketVendors.length) * 100 : 0;
    const feRate = formalEmployees.length ? (feApproved / formalEmployees.length) * 100 : 0;
    const mvScore = average(marketVendors.map((d) => d.result.score || 0));
    const feScore = average(formalEmployees.map((d) => d.result.score || 0));
    const gap = Math.abs(feRate - mvRate);

    document.getElementById("summary").innerText =
      `Approval gap: ${gap.toFixed(1)}%. Applications audited: ${safeData.length}.`;
    document.getElementById("biasAlert").style.display = gap > 20 ? "block" : "none";

    if (approvalChartInstance) approvalChartInstance.destroy();
    if (scoreChartInstance) scoreChartInstance.destroy();

    approvalChartInstance = new Chart(document.getElementById("approvalChart"), {
      type: "bar",
      data: {
        labels: ["Market Vendor", "Formal Employee"],
        datasets: [
          {
            label: "Approval Rate (%)",
            data: [mvRate.toFixed(2), feRate.toFixed(2)],
            backgroundColor: ["#22c55e", "#3b82f6"],
          },
        ],
      },
    });

    scoreChartInstance = new Chart(document.getElementById("scoreChart"), {
      type: "bar",
      data: {
        labels: ["Market Vendor", "Formal Employee"],
        datasets: [
          {
            label: "Average Score",
            data: [mvScore.toFixed(2), feScore.toFixed(2)],
            backgroundColor: ["#f59e0b", "#ef4444"],
          },
        ],
      },
    });
  } catch (error) {
    showEmpty("Dashboard data could not be loaded. Check that the backend is running.");
  }
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function showEmpty(message = "No audit data available yet.") {
  document.getElementById("summary").innerText = message;
}

loadData();
