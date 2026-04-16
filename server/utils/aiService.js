const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini if API key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * MOCK AI RESPONSE GENERATOR
 * Used when GEMINI_API_KEY is not provided
 */
const mockResponse = (type, input) => {
  const responses = {
    resume: {
      summary: "Highly skilled professional with expertise in Web Development and React.",
      skills: ["React", "Node.js", "Express", "MySQL", "JavaScript", "CSS"],
      improvements: [
        "Add more details about your backend projects.",
        "Include links to your GitHub or Portfolio.",
        "Quantify your achievements (e.g., 'Improved performance by 20%')."
      ],
      career_paths: ["Full Stack Developer", "Frontend Engineer", "Backend Developer"]
    },
    recommendation: {
      score: 85,
      reason: "Your skills in React and Node.js perfectly match the requirements for this Full Stack Task."
    },
    proposal: `Dear Client,\n\nI am excited to apply for your project. With my experience in ${input || 'this field'}, I can deliver high-quality results within the deadline. I have worked on similar projects and I am confident in my ability to exceed your expectations.\n\nBest regards,\n[Developer]`,
    guidance: [
      "Focus on learning cloud deployment (AWS/Azure).",
      "Contribute to open-source projects to build credibility.",
      "Master TypeScript as it's highly requested in the industry."
    ],
    chatbot: "Hello! I am your DevTrust AI assistant. I can help you with platform queries, technical advice, or project management tips. What's on your mind?",
    interview: {
      question: "Can you explain the difference between virtual DOM and real DOM in React?",
      feedback: "Good start! Mention how the reconciliation process works for a more complete answer."
    },
    ats: {
      score: 75,
      summary: "Your resume is well-structured but lacks specific keywords related to Cloud Infrastructure.",
      keyword_matches: ["React", "Node.js", "MySQL"],
      missing_keywords: ["Docker", "Kubernetes", "AWS"]
    }
  };
  return responses[type] || "AI is currently offline.";
};

const aiService = {
  /**
   * Analyze Resume Text
   */
  analyzeResume: async (text) => {
    if (!genAI) return mockResponse("resume");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze the following resume text for an Applicant Tracking System (ATS). 
      Extract:
      1. A short summary.
      2. A list of skills.
      3. 3 improvement areas.
      4. 3 recommended career paths.
      5. An ATS Score (0-100).
      6. Keywords matched and Keywords missing (at least 3 each).
      Return as structured JSON.
      
      Text: ${text}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      console.error("AI Error:", err);
      // Try to extract JSON if it was returned within text
      try {
        const text = err.message || "";
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e) {}
      return mockResponse("resume");
    }
  },

  /**
   * Match Tasks
   */
  matchTask: async (userSkills, taskDescription) => {
    if (!genAI) return mockResponse("recommendation");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Based on these user skills: ${userSkills}, and this task description: ${taskDescription}, provide a match percentage (0-100) and a brief reason. Return as JSON.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      return mockResponse("recommendation");
    }
  },

  /**
   * Generate Proposal
   * Enhanced with better prompts and professional tone.
   */
  generateProposal: async (userProfile, taskDescription) => {
    if (!genAI) return mockResponse("proposal", userProfile?.skills);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
        You are an expert freelancer applying for a project. 
        Freelancer Skills: ${userProfile?.skills || "Web Development, UI/UX"}.
        Project Description: "${taskDescription}".
        
        Write a highly professional, persuasive, and concise project proposal. 
        - Start with a strong hook.
        - Briefly explain how the skills match the project.
        - Mention a commitment to quality and deadlines.
        - End with a professional call to action.
        - Format with clear paragraphs.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error("Proposal Generation Error:", err);
      return mockResponse("proposal");
    }
  },

  /**
   * AI Behavior Analysis for Fraud Detection
   */
  analyzeBehavior: async (activityLogs) => {
    if (!genAI) return { isSuspicious: false, reason: "Mock: Behavior looks normal." };

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze these user activity logs for suspicious patterns (e.g., rapid logins from multiple IPs, spamming, potential scamming). Return a JSON with "isSuspicious" (boolean) and "reason" (string). 
      Logs: ${JSON.stringify(activityLogs)}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      return { isSuspicious: false, reason: "AI Analysis Failed" };
    }
  },

  /**
   * Career Guidance
   */
  getCareerGuidance: async (userProfile) => {
    if (!genAI) return mockResponse("guidance");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Based on this user profile: ${JSON.stringify(userProfile)}, provide 3-5 specific pieces of career advice and learning paths for a beginner freelancer. Return as an array of strings.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      return mockResponse("guidance");
    }
  },

  /**
   * AI ChatBot - Query Resolution
   */
  chatWithAI: async (message, history = []) => {
    if (!genAI) return mockResponse("chatbot");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (err) {
      return "I'm having trouble processing that right now. Could you rephrase?";
    }
  },

  /**
   * AI Mock Interview
   */
  conductInterview: async (role, skills, lastAnswer = null) => {
    if (!genAI) return mockResponse("interview");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      let prompt = "";
      
      if (!lastAnswer) {
        prompt = `You are a technical interviewer for the role of ${role}. Candidate has skills in ${skills}. Start the interview with a challenging first question. Return as JSON with "question".`;
      } else {
        prompt = `For the role of ${role}, the candidate answered "${lastAnswer}". Provide brief feedback and then ask the next technical question. Return as JSON with "feedback" and "question".`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (err) {
      return mockResponse("interview");
    }
  }
};

module.exports = aiService;
