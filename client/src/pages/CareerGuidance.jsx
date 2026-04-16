import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, TrendingUp, Briefcase, Award, 
  CheckCircle, AlertCircle, Sparkles, BookOpen 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CareerGuidance = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [guidance, setGuidance] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", user.id);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/analyze-resume", formData);
      setAnalysis(res.data.analysis);
      
      // Also fetch guidance after resume is analyzed
      const guidRes = await axios.post("http://localhost:5000/api/ai/career-guidance", { userId: user.id });
      setGuidance(guidRes.data.guidance);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-500" /> AI Career Navigator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
            Upload your resume and let our AI chart your professional journey.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="text-blue-500" /> Resume Analysis
              </h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                      <FileText size={32} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {file ? file.name : "Select PDF or Word Document"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin" />
                  ) : (
                    "Analyze My Portfolio"
                  )}
                </button>
              </div>
            </div>

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20"
              >
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp /> Growth Summary
                </h3>
                <p className="text-blue-50 text-sm leading-relaxed">
                  {analysis.summary}
                </p>
              </motion.div>
            )}
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center h-full"
                >
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Explore Your Potential</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    Upload your resume to see skill recommendations, improvement paths, and career guidance.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Skills Cloud */}
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                      <Award className="text-yellow-500" /> Identified Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {analysis.skills.map((skill, idx) => (
                        <span key={idx} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg font-semibold border border-green-200 dark:border-green-800 flex items-center gap-2">
                          <CheckCircle size={16} /> {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Improvements & Career Paths */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <AlertCircle className="text-red-500" /> Suggested Improvements
                      </h3>
                      <ul className="space-y-4">
                        {analysis.improvements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-4 text-slate-600 dark:text-slate-400">
                            <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Briefcase className="text-purple-500" /> Career Paths
                      </h3>
                      <ul className="space-y-4">
                        {analysis.career_paths.map((path, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-slate-600 dark:text-slate-400 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                            <CheckCircle className="text-purple-500" size={20} />
                            <span className="font-medium">{path}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Detailed Guidance */}
                  {guidance.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Sparkles className="text-yellow-500" /> Smart Guidance
                      </h3>
                      <div className="space-y-4">
                        {guidance.map((tip, idx) => (
                          <div key={idx} className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 rounded-r-lg">
                            <p className="text-slate-700 dark:text-slate-300 italic">"{tip}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGuidance;
