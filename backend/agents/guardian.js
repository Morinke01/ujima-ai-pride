function guardianAgent({ name, occupation, amount }) {
  let score = 50;

  // 🌍 AFRICAN INFORMAL ECONOMY MODEL (IMPORTANT)
  const occupationWeights = {
    "market vendor": 30,
    farmer: 25,
    "formal employee": 10,
    student: 5,
  };

  score += occupationWeights[occupation] || 0;

  // 🌾 harvest-cycle awareness simulation
  const currentMonth = new Date().getMonth();

  // assume harvest months = March, April, Sept, Oct
  const harvestMonths = [2, 3, 8, 9];

  if (harvestMonths.includes(currentMonth)) {
    score += 10;
  } else {
    score -= 5;
  }

  // 💰 risk rules
  if (amount > 50000) score -= 15;
  if (amount > 100000) score -= 25;

  let decision = "REVIEW";
  if (score >= 75) decision = "APPROVED";
  else if (score < 60) decision = "REJECTED";

  return {
    name,
    occupation,
    score,
    decision,
    explanation:
      "Score includes harvest-cycle adjustment + informal economy weighting (Kenya SACCO model).",
  };
}

module.exports = guardianAgent;