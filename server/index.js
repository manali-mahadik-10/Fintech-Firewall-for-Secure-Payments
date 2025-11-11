import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP + Socket.IO servers
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

// 🧠 Initialize SQLite database
let db;
const initDB = async () => {
  db = await open({
    filename: "./fraud.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS frauds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      time TEXT,
      account TEXT,
      amount REAL,
      reason TEXT
    )
  `);
  console.log("📘 Database initialized successfully ✅");
};

// Initialize DB immediately
initDB();

// ✅ Real-time Transaction API (fraud analysis + emit)
app.post("/api/pay", async (req, res) => {
  const data = req.body;
  console.log("💳 Incoming Transaction:", data);

  try {
    const blacklistedIPs = ["203.0.113.10", "198.51.100.5", "192.0.2.50"];
    const blockedBINs = ["411111", "424242", "555555"];

    let riskScore = 0;
    const risks = [];

    // 🔹 Risk evaluation
    if (blacklistedIPs.includes(data.ip)) {
      riskScore += 50;
      risks.push("Blacklisted IP detected");
    }

    if (blockedBINs.includes(data.cardNumber.slice(0, 6))) {
      riskScore += 60;
      risks.push("Blocked card BIN");
    }

    if (/(\b(SELECT|UPDATE|DELETE|INSERT|DROP|UNION|OR|AND)\b)/i.test(data.description)) {
      riskScore += 80;
      risks.push("SQL Injection detected");
    }

    if (parseFloat(data.amount) > 50000) {
      riskScore += 30;
      risks.push("High-value transaction");
    }

    // 🔹 Final decision
    let decision = "allow";
    if (riskScore >= 100) decision = "block";
    else if (riskScore >= 30) decision = "review";

    const analysis = {
      decision,
      riskScore,
      risks,
      timestamp: new Date().toISOString(),
      accountNumber: data.accountNumber,
      amount: data.amount,
      reason: risks.join(", "),
    };

    console.log("🧠 Transaction Analysis:", analysis);

    // 🔹 Emit real-time event to dashboard
    io.emit("transaction", analysis);

    // 🔹 If blocked, save to DB
    if (decision === "block") {
      await db.run(
        "INSERT INTO frauds (time, account, amount, reason) VALUES (?, ?, ?, ?)",
        [new Date().toLocaleString(), data.accountNumber, data.amount, analysis.reason]
      );
      console.log("⚠️ Fraudulent transaction saved to DB.");
    }

    // 🔹 Respond to frontend
    res.json(analysis);
  } catch (err) {
    console.error("❌ Server Error in /api/pay:", err);
    res.status(500).json({ decision: "error", risks: ["Server unavailable"] });
  }
});

// ✅ Root endpoint (for testing)
app.get("/", (req, res) => {
  res.send("🔥 FinTech Firewall API is running...");
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Firewall backend running at http://localhost:${PORT}`);
});
