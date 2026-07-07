const axios = require("axios");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const scoutAgent = require("./agents/scout");
const guardianAgent = require("./agents/guardian");
const hunterAgent = require("./agents/hunter");

const app = express();
const PORT = process.env.PORT || 5000;
const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL || "";

const frontendPath = path.join(__dirname, "..", "frontend");
const logFile = path.join(__dirname, "data", "logs.json");
const dataDir = path.dirname(logFile);

app.use(cors());
app.use(express.json());
app.use(express.static(frontendPath));

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "[]");
}

function readLogs() {
  try {
    const logs = JSON.parse(fs.readFileSync(logFile, "utf8"));
    return Array.isArray(logs) ? logs : [];
  } catch (err) {
    return [];
  }
}

function logDecision(data) {
  const logs = readLogs();
  const entry = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  logs.push(entry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  return entry;
}

function normalizeOccupation(occupation = "") {
  const value = String(occupation).trim().toLowerCase();
  const aliases = {
    business: "trader",
    vendor: "market vendor",
    "market trader": "market vendor",
    "farm worker": "farmer",
    teacher: "formal employee",
  };

  return aliases[value] || value;
}

function validateLoanApplication(body) {
  const name = String(body.name || "").trim();
  const occupation = normalizeOccupation(body.occupation);
  const amount = Number(body.amount);
  const monthlyIncome = Number(body.monthlyIncome || 0);
  const repaymentMonths = Number(body.repaymentMonths || 6);

  if (!name) return { error: "Name is required." };
  if (!occupation) return { error: "Occupation is required." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Loan amount must be a positive number." };
  }
  if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
    return { error: "Monthly income must be zero or a positive number." };
  }
  if (!Number.isFinite(repaymentMonths) || repaymentMonths < 1) {
    return { error: "Repayment period must be at least one month." };
  }

  return {
    data: {
      name,
      occupation,
      amount,
      monthlyIncome,
      repaymentMonths,
    },
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ujima-ai-pride",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/scout", (req, res) => {
  const result = scoutAgent(req.body);
  res.json(result);
});

app.post("/api/loan", async (req, res) => {
  const validation = validateLoanApplication(req.body);

  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const application = validation.data;
  const result = guardianAgent(application);
  const payload = {
    timestamp: new Date().toISOString(),
    name: application.name,
    occupation: application.occupation,
    amount: application.amount,
    score: result?.score || 0,
    decision: result?.decision || "UNKNOWN",
    escalated: result?.decision === "REVIEW",
  };

  if (ZAPIER_WEBHOOK_URL) {
    try {
      await axios.post(ZAPIER_WEBHOOK_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });
    } catch (error) {
      console.warn("Zapier webhook failed:", error.message);
    }
  }

  const auditEntry = logDecision({
    input: application,
    result,
  });

  if (result.decision === "REVIEW") {
    return res.json({
      guardian: result,
      escalation: hunterAgent(application),
      audit: auditEntry,
    });
  }

  res.json({
    guardian: result,
    audit: auditEntry,
  });
});

app.get("/api/logs", (req, res) => {
  res.json(readLogs());
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Ujima AI PRIDE running on port ${PORT}`);
});
