async function loadData() {
  const res = await fetch("https://ujima-ai-backend.onrender.com/api/logs");
  const data = await res.json();

  // -------------------------
  // BASIC METRICS
  // -------------------------
  document.getElementById("total").innerText = data.length;

  const approved = data.filter(d => d.result.decision === "APPROVED").length;
  const rejected = data.filter(d => d.result.decision === "REJECTED").length;

  const approvalRate = data.length ? (approved / data.length * 100).toFixed(1) : 0;

  document.getElementById("approval").innerText = approvalRate + "%";

  // Escalations (REVIEW cases)
  const escalations = data.filter(d => d.result.decision === "REVIEW").length;
  document.getElementById("esc").innerText = escalations;

  // -------------------------
  // OCCUPATION SEGMENTATION
  // -------------------------
  const market = data.filter(d => d.input.occupation === "market vendor");
  const formal = data.filter(d => d.input.occupation === "formal employee");

  const marketApproved = market.filter(d => d.result.decision === "APPROVED").length;
  const formalApproved = formal.filter(d => d.result.decision === "APPROVED").length;

  const mvRate = market.length ? (marketApproved / market.length * 100) : 0;
  const feRate = formal.length ? (formalApproved / formal.length * 100) : 0;

  const biasGap = Math.abs(feRate - mvRate).toFixed(1);

  document.getElementById("bias").innerText = biasGap + "%";

  // -------------------------
  // BIAS ALERT
  // -------------------------
  if (biasGap > 20) {
    document.getElementById("biasAlert").style.display = "block";
  }

  // -------------------------
  // APPROVAL CHART
  // -------------------------
  new Chart(document.getElementById("approvalChart"), {
    type: "bar",
    data: {
      labels: ["Approved", "Rejected"],
      datasets: [{
        label: "Applications",
        data: [approved, rejected],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    }
  });

  // -------------------------
  // OCCUPATION FAIRNESS CHART
  // -------------------------
  new Chart(document.getElementById("occupationChart"), {
    type: "bar",
    data: {
      labels: ["Market Vendor", "Formal Employee"],
      datasets: [{
        label: "Approval Rate %",
        data: [mvRate.toFixed(1), feRate.toFixed(1)],
        backgroundColor: ["#f59e0b", "#3b82f6"]
      }]
    }
  });
}

loadData();