const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require("../config/db");
require("dotenv").config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const fraudService = {
  /**
   * Analyze user behavior for potential fraud
   * @param {number} userId 
   * @param {string} activityType ('login', 'message', 'payment')
   * @param {object} metadata 
   */
  detectSuspiciousActivity: async (userId, activityType, metadata) => {
    let severity = "low";
    let isSuspicious = false;
    let reason = "";

    // 1. SIMPLE RULE-BASED CHECKS
    if (activityType === "message") {
      // Check for rapid messaging (spam)
      // (This would ideally query the DB for message count in the last minute)
      if (metadata.count > 20) {
        isSuspicious = true;
        severity = "medium";
        reason = "Rapid messaging detected (Spam likelihood).";
      }
    }

    if (activityType === "payment") {
      if (metadata.amount > 10000) {
        isSuspicious = true;
        severity = "high";
        reason = "High-value transaction requires manual verification.";
      }
    }

    // 2. AI-POWERED ANALYSIS (If available)
    if (genAI && activityType === "message") {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Analyze this message for potential fraud or scam behavior (phishing, external payment requests, suspicious links). Return "suspicious" or "safe" followed by a reason. 
        Message: "${metadata.message}"`;
        
        const result = await model.generateContent(prompt);
        const responseData = result.response.text().toLowerCase();
        
        if (responseData.includes("suspicious")) {
          isSuspicious = true;
          severity = "medium";
          reason = `AI Flag: ${responseData}`;
        }
      } catch (err) {
        console.error("AI Fraud Check Error:", err);
      }
    }

    // 3. LOG ALERT IF SUSPICIOUS
    if (isSuspicious) {
      db.query(
        "INSERT INTO fraud_alerts (user_id, type, severity, description, status) VALUES (?, ?, ?, ?, 'pending')",
        [userId, activityType, severity, reason]
      );
    }

    return { isSuspicious, severity, reason };
  }
};

module.exports = fraudService;
