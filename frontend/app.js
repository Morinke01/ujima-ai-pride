async function submitLoan() {
  const data = {
    name: document.getElementById("name").value,
    occupation: document.getElementById("occupation").value,
    amount: Number(document.getElementById("amount").value)
  };

  const res = await fetch("http://localhost:5000/api/loan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  document.getElementById("result").innerText =
    JSON.stringify(result, null, 2);
}