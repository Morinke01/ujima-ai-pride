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

    const groups = [
      groupStats("Market Vendor", safeData, "market vendor"),
      groupStats("Farmer", safeData, "farmer"),
      groupStats("Trader", safeData, "trader"),
      groupStats("Formal Employee", safeData, "formal employee"),
    ];
    const activeGroups = groups.filter((group) => group.count > 0);
    const approvalRates = activeGroups.map((group) => group.approvalRate);
    const averageScores = activeGroups.map((group) => group.averageScore);
    const approvalGap = gap(approvalRates);
    const scoreGap = gap(averageScores);

    document.getElementById("auditedCount").innerText = safeData.length;
    document.getElementById("approvalGap").innerText = `${approvalGap.toFixed(1)}%`;
    document.getElementById("scoreGap").innerText = scoreGap.toFixed(1);
    document.getElementById("summaryNote").innerText =
      activeGroups.length > 1
        ? `Comparing ${activeGroups.length} applicant groups with recorded decisions.`
        : "More applicant groups are needed for a stronger fairness comparison.";
    document.getElementById("biasAlert").style.display = approvalGap > 20 ? "block" : "none";

    if (approvalChartInstance) approvalChartInstance.destroy();
    if (scoreChartInstance) scoreChartInstance.destroy();

    approvalChartInstance = new Chart(document.getElementById("approvalChart"), {
      type: "bar",
      data: {
        labels: activeGroups.map((group) => group.label),
        datasets: [
          {
            label: "Approval Rate (%)",
            data: activeGroups.map((group) => group.approvalRate.toFixed(2)),
            backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6"],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });

    scoreChartInstance = new Chart(document.getElementById("scoreChart"), {
      type: "bar",
      data: {
        labels: activeGroups.map((group) => group.label),
        datasets: [
          {
            label: "Average Score",
            data: activeGroups.map((group) => group.averageScore.toFixed(2)),
            backgroundColor: ["#14b8a6", "#ef4444", "#6366f1", "#f97316"],
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
  } catch (error) {
    showEmpty("Dashboard data could not be loaded. Check that the backend is running.");
  }
}

function groupStats(label, data, occupation) {
  const entries = data.filter((d) => d.input.occupation === occupation);
  const approved = entries.filter((d) => d.result.decision === "APPROVED").length;

  return {
    label,
    count: entries.length,
    approvalRate: entries.length ? (approved / entries.length) * 100 : 0,
    averageScore: average(entries.map((d) => Number(d.result.score || 0))),
  };
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function gap(values) {
  if (values.length < 2) return 0;
  return Math.max(...values) - Math.min(...values);
}

function showEmpty(message = "No audit data available yet.") {
  document.getElementById("summaryNote").innerText = message;
  document.getElementById("auditedCount").innerText = "0";
  document.getElementById("approvalGap").innerText = "0%";
  document.getElementById("scoreGap").innerText = "0";
}

loadData();
