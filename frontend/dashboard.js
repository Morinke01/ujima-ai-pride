async function loadData() {
  const res = await fetch("http://localhost:5000/api/logs");
  const data = await res.json();

  document.getElementById("total").innerText = data.length;

  const approved = data.filter(d => d.result.decision === "APPROVED").length;

  document.getElementById("approval").innerText =
    ((approved / data.length) * 100).toFixed(1) + "%";

  const vendors = data.filter(d =>
    d.input.occupation === "market vendor"
  ).length;

  document.getElementById("bias").innerText =
    `Market vendor cases: ${vendors}`;

  document.getElementById("harvest").innerText =
    "Harvest-aware scoring active (March–April, Sept–Oct)";
}

loadData();