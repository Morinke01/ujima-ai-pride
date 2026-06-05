function hunterAgent(applicant) {
  return {
    type: "HUNTER_BRIEFING",
    message:
      `Assign officer review for ${applicant.name}. ` +
      `Occupation: ${applicant.occupation}. ` +
      `Loan request: KES ${applicant.amount}. ` +
      `Requires human validation under PRIDE rules.`,
  };
}

module.exports = hunterAgent;