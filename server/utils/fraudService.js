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

    // 1. aasan rule wale check
    if (activityType === "message") {
      // jaldi message aane par check (spam)
      // (ideal tarike se 1 minute ke message count db me dekhne chahiye)
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

    // 2. ai se check (agar hai to)
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

    // 3. gadbad lage to alert log karo
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
