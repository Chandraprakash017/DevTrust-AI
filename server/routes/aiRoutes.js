const express = require("express");
const router = express.Router();
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
const aiService = require("../utils/aiService");
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/resumes";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

/**
 * ─── ANALYZE RESUME ───────────────────────────────────────
 * Uploads a resume, extracts text, and returns an AI analysis.
 */
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    let extractedText = "";

    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext === ".pdf") {
      try {
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        extractedText = await parser.getText();
      } catch (err) {
        console.warn("⚠️ PDF Parsing failed, falling back to mock description.");
        extractedText = "React developer with experience in Express, Node.js, and MySQL.";
      }
    } else if (ext === ".txt") {
      extractedText = dataBuffer.toString("utf-8");
    } else {
      extractedText = "Web developer profile with React, Node.js, JavaScript, and database management experience.";
    }

    const analysis = await aiService.analyzeResume(extractedText);

    // resume url aur analysis user profile mein save karo
    const skillsJson = JSON.stringify(analysis.skills);
    db.query(
      "UPDATE users SET resume_url = ?, skills = ? WHERE id = ?",
      [filePath, skillsJson, userId],
      (err) => {
        if (err) console.error("DB Error:", err);
      }
    );

    res.json({
      message: "Resume analyzed successfully!",
      analysis,
      resumeUrl: filePath,
    });
  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ message: "Failed to analyze resume", error: err.message });
  }
});

/**
 * ─── RECOMMEND TASKS ──────────────────────────────────────
 * Based on user skills, returns matching tasks.
 */
router.post("/recommend-tasks", async (req, res) => {
  try {
    const { userId, userSkills } = req.body;

    db.query("SELECT * FROM tasks", async (err, tasks) => {
      if (err) return res.status(500).send(err);

      // abhi bas filter kar rahe hai, ai se achha ban sakta hai
      const recommendations = tasks.map(task => {
        const matchingSkills = userSkills?.filter(s => task.description.toLowerCase().includes(s.toLowerCase()));
        return {
          ...task,
          matchScore: matchingSkills?.length > 0 ? 70 + (matchingSkills.length * 5) : 30,
        };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

      res.json(recommendations);
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

/**
 * ─── GENERATE PROPOSAL ────────────────────────────────────
 */
router.post("/generate-proposal", async (req, res) => {
  try {
    const { userProfile, taskDescription } = req.body;
    const proposal = await aiService.generateProposal(userProfile, taskDescription);
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate proposal" });
  }
});

/**
 * ─── CAREER GUIDANCE ──────────────────────────────────────
 */
router.post("/career-guidance", async (req, res) => {
  try {
    const { userId } = req.body;
    db.query("SELECT * FROM users WHERE id = ?", [userId], async (err, users) => {
      if (err || !users.length) return res.status(404).json({ message: "User not found" });
      const guidance = await aiService.getCareerGuidance(users[0]);
      res.json({ guidance });
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to get career guidance" });
  }
});

/**
 * ─── AI CHATBOT (QUERIES) ──────────────────────────────────
 */
router.post("/chatbot", async (req, res) => {
  try {
    const { message, history } = req.body;
    const response = await aiService.chatWithAI(message, history);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: "Chatbot Error" });
  }
});

/**
 * ─── AI MOCK INTERVIEW ─────────────────────────────────────
 */
router.post("/mock-interview", async (req, res) => {
  try {
    const { role, skills, lastAnswer } = req.body;
    const interviewData = await aiService.conductInterview(role, skills, lastAnswer);
    res.json(interviewData);
  } catch (err) {
    res.status(500).json({ message: "Interview system failure" });
  }
});

module.exports = router;
