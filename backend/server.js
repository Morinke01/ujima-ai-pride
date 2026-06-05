const axios = require("axios");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const scoutAgent = require("./agents/scout");
const guardianAgent = require("./agents/guardian");
const hunterAgent = require("./agents/hunter");

const app = express();

const ZAPIER_WEBHOOK_URL =
  "https://hooks.zapier.com/hooks/catch/27815560/4bk9e35/";

app.use(cors());
app.use(express.json());

const logFile = path.join(__dirname, "data", "logs.json");

/**
 * 🧾 Audit Logging
 */
function logDecision(data) {
  let logs = [];

  try {
    logs = JSON.parse(fs.readFileSync(logFile));
  } catch (err) {
    logs = [];
  }

  logs.push({
    ...data,
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

/**
 * 🟢 SCOUT AGENT
 */
app.post("/api/scout", (req, res) => {
  console.log("SCOUT ROUTE HIT");
  console.log("Scout Request:", req.body);

  const result = scoutAgent(req.body);

  console.log("Scout Result:", result);

  res.json(result);
});

/**
 * 🟡 GUARDIAN AGENT
 */
app.post("/api/loan", async (req, res) => {
  console.log("====================================");
  console.log("API LOAN ROUTE HIT");
  console.log("Request Body:", req.body);

  const result = guardianAgent(req.body);

  console.log("Guardian Result:", result);

  /**
   * 🔥 FIX 1: FORCE CLEAN PAYLOAD (CRITICAL FOR ZAPIER + SHEETS)
   */
  const payload = {
    timestamp: new Date().toISOString(),
    name: req.body.name || "UNKNOWN",
    occupation: req.body.occupation || "UNKNOWN",
    amount: Number(req.body.amount || 0),
    score: result?.score || 0,
    decision: result?.decision || "UNKNOWN",
    escalated: result?.decision === "REVIEW",
  };

  console.log("FINAL ZAPIER PAYLOAD:", payload);

  // Zapier Integration
  try {
    console.log("Sending data to Zapier...");
    console.log("Webhook URL:", ZAPIER_WEBHOOK_URL);

    const zapResponse = await axios.post(ZAPIER_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Zapier Success!");
    console.log("Status:", zapResponse.status);
    console.log("Response:", zapResponse.data);
  } catch (error) {
    console.log("❌ Zapier Failed!");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    } else {
      console.log("Error Message:", error.message);
    }
  }

  /**
   * 🧾 Local Audit Trail (TRACK compliance)
   */
  logDecision({
    input: req.body,
    result,
  });

  console.log("Decision logged locally.");

  /**
   * 🔴 Escalation Logic
   */
  if (result.decision === "REVIEW") {
    const hunter = hunterAgent(req.body);

    console.log("Escalating to Hunter Agent...");
    console.log(hunter);

    return res.json({
      guardian: result,
      escalation: hunter,
    });
  }

  console.log("Returning Guardian Decision");
  console.log("====================================");

  res.json({
    guardian: result,
  });
});

/**
 * 📊 Logs API
 */
app.get("/api/logs", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(logFile));
  res.json(logs);
});

app.listen(5000, () => {
  console.log("🦁 Ujima AI PRIDE running on http://localhost:5000");
});