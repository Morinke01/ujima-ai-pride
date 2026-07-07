const API_BASE =
  window.location.protocol === "file:"
    ? "https://ujima-ai-backend.onrender.com"
    : window.location.origin;

async function loadData() {
  try {
    const res = await fetch(`${API_BASE}/api/logs`);
    const data = await res.json();
    const safeData = Array.isArray(data) ? data.filter((d) => d.input && d.result) : [];

    document.getElementById("total").innerText = safeData.length;

    const approved = safeData.filter((d) => d.result.decision === "APPROVED").length;
    const rejected = safeData.filter((d) => d.result.decision === "REJECTED").length;
    const escalations = safeData.filter((d) => d.result.decision === "REVIEW").length;
    const approvalRate = safeData.length
      ? ((approved / safeData.length) * 100).toFixed(1)
      : "0.0";

    document.getElementById("approval").innerText = `${approvalRate}%`;
    document.getElementById("esc").innerText = escalations;

    const market = safeData.filter((d) => d.input.occupation === "market vendor");
    const formal = safeData.filter((d) => d.input.occupation === "formal employee");
    const marketApproved = market.filter((d) => d.result.decision === "APPROVED").length;
    const formalApproved = formal.filter((d) => d.result.decision === "APPROVED").length;
    const mvRate = market.length ? (marketApproved / market.length) * 100 : 0;
    const feRate = formal.length ? (formalApproved / formal.length) * 100 : 0;
    const biasGap = Math.abs(feRate - mvRate);

    document.getElementById("bias").innerText = `${biasGap.toFixed(1)}%`;
    document.getElementById("biasAlert").style.display =
      biasGap > 20 ? "block" : "none";

    new Chart(document.getElementById("approvalChart"), {
      type: "bar",
      data: {
        labels: ["Approved", "Rejected", "Review"],
        datasets: [
          {
            label: "Applications",
            data: [approved, rejected, escalations],
            backgroundColor: ["#22c55e", "#ef4444", "#f59e0b"],
          },
        ],
      },
    });

    new Chart(document.getElementById("occupationChart"), {
      type: "bar",
      data: {
        labels: ["Market Vendor", "Formal Employee"],
        datasets: [
          {
            label: "Approval Rate %",
            data: [mvRate.toFixed(1), feRate.toFixed(1)],
            backgroundColor: ["#f59e0b", "#3b82f6"],
          },
        ],
      },
    });
  } catch (error) {
    document.getElementById("biasAlert").innerText =
      "Dashboard data could not be loaded. Check that the backend is running.";
    document.getElementById("biasAlert").style.display = "block";
  }
}

loadData();
