import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, MessageSquare, Award, RefreshCcw, Send, Play, CheckCircle } from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function MockInterview() {
  const [step, setStep] = useState(0); // 0: Start, 1: Interview, 2: Feedback
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Frontend Developer");
  const [skills, setSkills] = useState("React, JavaScript, CSS");
  const [interviewData, setInterviewData] = useState({ question: "", feedback: "" });
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPro = user.plan === "pro";

  const startInterview = async () => {
    if (!isPro) {
      toast.error("Pro subscription required for AI Mock Interviews!");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/ai/mock-interview", { role, skills });
      setInterviewData(res.data);
      setStep(1);
    } catch (err) {
      toast.error("Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/ai/mock-interview", { 
        role, 
        skills, 
        lastAnswer: answer 
      });
      setHistory([...history, { q: interviewData.question, a: answer, f: res.data.feedback }]);
      setInterviewData(res.data);
      setAnswer("");
      if (history.length >= 4) setStep(2); // End after 5 questions
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
        <div className="text-center p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 max-w-lg">
          <Award className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Pro Feature Only</h2>
          <p className="text-gray-400 mb-8">AI Mock Interviews are exclusive to DevTrust Pro members. Upgrade your account to practice with real-world technical scenarios.</p>
          <a href="/subscription" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold">Upgrade Now</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto mt-12">
        
        {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <h1 className="text-4xl font-bold mb-6">AI Mock Interview</h1>
            <p className="text-gray-400 mb-8 text-lg">Practice your technical interview skills with our intelligent interviewer. Get real-time feedback and improve your performance.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Desired Role</label>
                <input 
                  value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-medium">Key Skills (comma separated)</label>
                <input 
                  value={skills} onChange={e => setSkills(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <button 
                onClick={startInterview} disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? "Initializing..." : <>Start Practice <Play size={18} /></>}
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-400 font-bold">Question {history.length + 1} of 5</span>
              <span className="text-gray-500 text-sm italic">AI Interviewer is listening...</span>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 min-h-[150px] shadow-lg">
              <p className="text-xl leading-relaxed">{interviewData.question}</p>
            </div>

            {interviewData.feedback && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex gap-3">
                <Brain className="text-blue-400 shrink-0" />
                <p className="text-sm text-blue-200">AI Feedback: {interviewData.feedback}</p>
              </motion.div>
            )}

            <div className="relative">
              <textarea 
                value={answer} onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] outline-none focus:border-purple-500 transition-all resize-none"
              />
              <button 
                onClick={submitAnswer} disabled={loading || !answer.trim()}
                className="absolute bottom-4 right-4 bg-purple-600 p-3 rounded-xl disabled:opacity-50"
              >
                {loading ? <RefreshCcw className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-12">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold">Interview Complete!</h2>
              <p className="text-gray-400">Review your performance and use the feedback to improve.</p>
            </div>

            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <p className="text-purple-400 font-bold mb-2">Q: {item.q}</p>
                  <p className="text-gray-300 mb-4 italic">A: {item.a}</p>
                  <div className="bg-white/5 p-4 rounded-xl text-sm text-blue-300">
                    <span className="font-bold">AI Insight:</span> {item.f}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(0)} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-colors">Start New Interview</button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
