function scoutAgent(input) {
  const { name, occupation, message } = input;

  let response = "";

  // 🌾 Kenyan context-aware financial coaching
  if (message.includes("no money")) {
    response =
      `Pole ${name}. Before next harvest, try small daily savings (KES 20–50). ` +
      `Avoid loan dependency during school fee season.`;
  }

  if (occupation === "market vendor") {
    response +=
      " Tip: Your income peaks daily — micro-savings work better than lump loans.";
  }

  return {
    type: "SCOUT_MESSAGE",
    response,
  };
}

module.exports = scoutAgent;