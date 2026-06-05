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

// ----------------------------
// 📁 FILE SETUP (SAFE FOR RENDER)
// ----------------------------
const logFile = path.join(__dirname, "data", "logs.json");

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"));
}

// Ensure logs file exists
if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "[]");
}

// ----------------------------
// 🧾 AUDIT LOGGING SYSTEM
// ----------------------------
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

// ----------------------------
// 🟢 SCOUT AGENT
// ----------------------------
app.post("/api/scout", (req, res) => {
  console.log("SCOUT ROUTE HIT");
  console.log("Scout Request:", req.body);

  const result = scoutAgent(req.body);

  console.log("Scout Result:", result);

  res.json(result);
});

// ----------------------------
// 🟡 GUARDIAN AGENT + ZAPIER
// ----------------------------
app.post("/api/loan", async (req, res) => {
  console.log("====================================");
  console.log("API LOAN ROUTE HIT");
  console.log("Request Body:", req.body);

  const result = guardianAgent(req.body);

  console.log("Guardian Result:", result);

  // ----------------------------
  // 📦 CLEAN PAYLOAD FOR ZAPIER
  // ----------------------------
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

  // ----------------------------
  // 🔗 SEND TO ZAPIER
  // ----------------------------
  try {
    console.log("Sending data to Zapier...");

    const zapResponse = await axios.post(ZAPIER_WEBHOOK_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Zapier Success!");
    console.log("Status:", zapResponse.status);
  } catch (error) {
    console.log("❌ Zapier Failed!");

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else {
      console.log("Error:", error.message);
    }
  }

  // ----------------------------
  // 🧾 LOCAL AUDIT TRAIL
  // ----------------------------
  logDecision({
    input: req.body,
    result,
  });

  console.log("Decision logged locally.");

  // ----------------------------
  // 🔴 ESCALATION LOGIC
  // ----------------------------
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

// ----------------------------
// 📊 LOGS ENDPOINT
// ----------------------------
app.get("/api/logs", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(logFile));
  res.json(logs);
});

// ----------------------------
// 🚀 RENDER SAFE SERVER START
// ----------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🦁 Ujima AI PRIDE running on port ${PORT}`);
});