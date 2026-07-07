function guardianAgent({ name, occupation, amount }) {
  const normalizedOccupation = String(occupation || "").trim().toLowerCase();
  const requestedAmount = Number(amount);
  let score = 50;

  const occupationWeights = {
    "market vendor": 30,
    trader: 25,
    farmer: 25,
    "formal employee": 10,
    student: 5,
  };

  score += occupationWeights[normalizedOccupation] || 0;

  const currentMonth = new Date().getMonth();
  const harvestMonths = [2, 3, 8, 9];

  if (harvestMonths.includes(currentMonth)) {
    score += 10;
  } else {
    score -= 5;
  }

  if (requestedAmount > 50000) score -= 15;
  if (requestedAmount > 100000) score -= 25;

  let decision = "REVIEW";
  if (score >= 75) decision = "APPROVED";
  else if (score < 60) decision = "REJECTED";

  return {
    name,
    occupation: normalizedOccupation,
    amount: requestedAmount,
    score,
    decision,
    explanation:
      "Score includes harvest-cycle adjustment and informal economy weighting for a Kenya SACCO context.",
  };
}

module.exports = guardianAgent;
