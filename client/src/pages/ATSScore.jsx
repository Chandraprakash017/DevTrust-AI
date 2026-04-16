import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Gauge } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ATSScore() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPro = user.plan === "pro";

  const handleUpload = async (e) => {
    if (!isPro) {
      toast.error("Detailed ATS Scoring is a Pro feature!");
      return;
    }
    
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("resume", uploadedFile);
    formData.append("userId", user.id);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data.analysis);
      toast.success("Analysis Complete! 🎯");
    } catch (err) {
      toast.error("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto mt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">AI Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">ATS Score</span></h1>
          <p className="text-gray-400 text-lg">See how recruiters and AI algorithms view your profile. Optimize for success.</p>
        </div>

        {!result ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="text-purple-400 w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Upload your Resume</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Upload your PDF resume to get a detailed ATS compatibility score and improvement tips.</p>
            
            <input 
              type="file" id="resume-upload" className="hidden" 
              accept=".pdf" onChange={handleUpload}
            />
            <label 
              htmlFor="resume-upload"
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all inline-block"
            >
              {loading ? "Analyzing..." : "Select PDF File"}
            </label>
            {!isPro && (
              <p className="mt-4 text-sm text-yellow-500/80 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Pro membership required for full analysis
              </p>
            )}
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Score Section */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-1 bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle 
                    cx="80" cy="80" r="70" fill="transparent" stroke={result.score > 70 ? "#10b981" : result.score > 40 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * result.score) / 100}
                    strokeLinecap="round" className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{result.score}%</span>
                  <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">ATS Score</span>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-2">
                {result.score > 70 ? "Ready to Apply!" : result.score > 40 ? "Needs Improvement" : "Significant Work Needed"}
              </h4>
              <p className="text-sm text-gray-400 italic">"{result.summary}"</p>
              <button onClick={() => setResult(null)} className="mt-8 text-sm text-purple-400 underline font-medium">Re-upload another file</button>
            </motion.div>

            {/* Analysis Section */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Keywords */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h4 className="flex items-center gap-2 text-xl font-bold mb-6"><Search size={22} className="text-blue-400" /> Keyword Analysis</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> MATCHED KEYWORDS</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_matches.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-green-500/10 text-green-300 border border-green-500/20 rounded-full text-xs font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><XCircle size={16} /> MISSING KEYWORDS</p>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 border border-red-500/20 rounded-full text-xs font-medium">{kw}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Improvements */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h4 className="flex items-center gap-2 text-xl font-bold mb-6"><AlertCircle size={22} className="text-purple-400" /> Improvement Areas</h4>
                <ul className="space-y-4">
                  {result.improvements.map((imp, i) => (
                    <li key={i} className="flex gap-3 text-gray-300 text-sm italic">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </motion.div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
