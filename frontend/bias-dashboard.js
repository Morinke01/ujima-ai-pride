let approvalChartInstance = null;
let scoreChartInstance = null;

async function loadData() {
  try {
    const res = await fetch("http://localhost:5000/api/logs");
    const data = await res.json();

    console.log("RAW DATA:", data);

    if (!Array.isArray(data) || data.length === 0) {
      showEmpty();
      return;
    }

    // ----------------------------
    // 🧹 SAFE DATA CLEANING
    // ----------------------------
    const safeData = data.filter(d => d?.input && d?.result);

    // ----------------------------
    // GROUPING
    // ----------------------------
    const marketVendors = safeData.filter(
      d => d.input?.occupation === "market vendor"
    );

    const formalEmployees = safeData.filter(
      d => d.input?.occupation === "formal employee"
    );

    // ----------------------------
    // APPROVAL METRICS
    // ----------------------------
    const mvApproved = marketVendors.filter(
      d => d.result?.decision === "APPROVED"
    ).length;

    const feApproved = formalEmployees.filter(
      d => d.result?.decision === "APPROVED"
    ).length;

    const mvRate = marketVendors.length
      ? (mvApproved / marketVendors.length) * 100
      : 0;

    const feRate = formalEmployees.length
      ? (feApproved / formalEmployees.length) * 100
      : 0;

    // ----------------------------
    // SCORE METRICS
    // ----------------------------
    const mvScore = avg(marketVendors.map(d => d.result?.score || 0));
    const feScore = avg(formalEmployees.map(d => d.result?.score || 0));

    // ----------------------------
    // BIAS DETECTION (TRACK)
    // ----------------------------
    const gap = Math.abs(feRate - mvRate);

    if (gap > 20) {
      document.getElementById("biasAlert").style.display = "block";
    }

    // ----------------------------
    // DESTROY OLD CHARTS (IMPORTANT FIX)
    // ----------------------------
    if (approvalChartInstance) approvalChartInstance.destroy();
    if (scoreChartInstance) scoreChartInstance.destroy();

    // ----------------------------
    // CHART 1: APPROVAL RATES
    // ----------------------------
    const ctx1 = document.getElementById("approvalChart");

    approvalChartInstance = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: ["Market Vendor", "Formal Employee"],
        datasets: [{
          label: "Approval Rate (%)",
          data: [mvRate.toFixed(2), feRate.toFixed(2)],
          backgroundColor: ["#22c55e", "#3b82f6"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });

    // ----------------------------
    // CHART 2: AVERAGE SCORES
    // ----------------------------
    const ctx2 = document.getElementById("scoreChart");

    scoreChartInstance = new Chart(ctx2, {
      type: "bar",
      data: {
        labels: ["Market Vendor", "Formal Employee"],
        datasets: [{
          label: "Average Score",
          data: [mvScore.toFixed(2), feScore.toFixed(2)],
          backgroundColor: ["#f59e0b", "#ef4444"]
        }]
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    showEmpty();
  }
}

// ----------------------------
// 📊 SAFE AVERAGE FUNCTION
// ----------------------------
function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ----------------------------
// ⚠️ EMPTY STATE HANDLER
// ----------------------------
function showEmpty() {
  document.getElementById("total").innerText = "0";
  document.getElementById("approval").innerText = "0%";
  document.getElementById("bias").innerText = "No data available yet";
  document.getElementById("harvest").innerText = "Waiting for applications...";
}

// Run dashboard
loadData();