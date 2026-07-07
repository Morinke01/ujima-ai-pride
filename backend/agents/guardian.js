function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function guardianAgent({ name, occupation, amount, monthlyIncome = 0, repaymentMonths = 6 }) {
  const normalizedOccupation = String(occupation || "").trim().toLowerCase();
  const requestedAmount = Number(amount);
  const income = Number(monthlyIncome || 0);
  const months = Number(repaymentMonths || 6);
  const estimatedMonthlyPayment = requestedAmount / months;
  const factors = [];
  let score = 45;

  const occupationWeights = {
    "market vendor": 30,
    trader: 25,
    farmer: 25,
    "formal employee": 10,
    student: 5,
  };

  const occupationScore = occupationWeights[normalizedOccupation] || 0;
  score += occupationScore;
  factors.push({
    label: "Livelihood context",
    impact: occupationScore,
    detail:
      occupationScore > 0
        ? `${normalizedOccupation} income pattern is recognized in the informal economy model.`
        : "Occupation is not yet strongly represented in the model.",
  });

  const currentMonth = new Date().getMonth();
  const harvestMonths = [2, 3, 8, 9];

  if (harvestMonths.includes(currentMonth)) {
    score += 10;
    factors.push({
      label: "Harvest timing",
      impact: 10,
      detail: "Current month is treated as a harvest-supportive repayment period.",
    });
  } else {
    score -= 5;
    factors.push({
      label: "Harvest timing",
      impact: -5,
      detail: "Current month is outside the simulated harvest-supportive window.",
    });
  }

  if (requestedAmount > 100000) {
    score -= 25;
    factors.push({
      label: "Loan size",
      impact: -25,
      detail: "The requested amount is high and needs stronger repayment evidence.",
    });
  } else if (requestedAmount > 50000) {
    score -= 15;
    factors.push({
      label: "Loan size",
      impact: -15,
      detail: "The requested amount is moderate-high for the current scoring model.",
    });
  } else {
    score += 5;
    factors.push({
      label: "Loan size",
      impact: 5,
      detail: "The requested amount is within the lower-risk band.",
    });
  }

  if (income > 0) {
    const repaymentRatio = estimatedMonthlyPayment / income;

    if (repaymentRatio <= 0.3) {
      score += 15;
      factors.push({
        label: "Repayment capacity",
        impact: 15,
        detail: "Estimated monthly repayment is within a healthy share of income.",
      });
    } else if (repaymentRatio <= 0.5) {
      score += 5;
      factors.push({
        label: "Repayment capacity",
        impact: 5,
        detail: "Estimated monthly repayment is manageable but should be monitored.",
      });
    } else {
      score -= 20;
      factors.push({
        label: "Repayment capacity",
        impact: -20,
        detail: "Estimated monthly repayment is high compared with declared income.",
      });
    }
  } else {
    factors.push({
      label: "Repayment capacity",
      impact: 0,
      detail: "No income estimate was provided, so capacity could not be fully assessed.",
    });
  }

  score = clampScore(score);

  let decision = "REVIEW";
  if (score >= 75) decision = "APPROVED";
  else if (score < 60) decision = "REJECTED";

  const recommendations = {
    APPROVED:
      "Proceed with final identity, SACCO membership, and disbursement checks.",
    REVIEW:
      "Officer should confirm income records, repayment plan, and any seasonal cash-flow risks.",
    REJECTED:
      "Applicant should reduce the requested amount, extend repayment period, or provide stronger income evidence.",
  };

  return {
    name,
    occupation: normalizedOccupation,
    amount: requestedAmount,
    monthlyIncome: income,
    repaymentMonths: months,
    estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment),
    score,
    decision,
    explanation:
      "Score includes livelihood context, harvest timing, loan size, and repayment-capacity checks for a Kenya SACCO context.",
    factors,
    recommendation: recommendations[decision],
  };
}

module.exports = guardianAgent;
