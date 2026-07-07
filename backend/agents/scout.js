function scoutAgent(input) {
  const name = String(input.name || "member").trim();
  const occupation = String(input.occupation || "").trim().toLowerCase();
  const message = String(input.message || "").trim().toLowerCase();
  const responses = [];

  if (message.includes("no money")) {
    responses.push(
      `Pole ${name}. Before the next harvest, try small daily savings of KES 20-50 and avoid taking new loans during school fee season.`
    );
  }

  if (occupation === "market vendor" || occupation === "trader") {
    responses.push(
      "Tip: Your income can change daily, so micro-savings usually work better than waiting for one large lump sum."
    );
  }

  if (!responses.length) {
    responses.push(
      "Start with a realistic repayment plan, keep simple income records, and borrow only what your cash flow can support."
    );
  }

  return {
    type: "SCOUT_MESSAGE",
    response: responses.join(" "),
  };
}

module.exports = scoutAgent;
