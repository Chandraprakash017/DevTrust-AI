import { useEffect, useState } from "react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Sparkles, Brain, Zap, X, Send, Award, Target } from "lucide-react";

const DIFF_STYLE = {
  easy:   "bg-green-100  text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard:   "bg-red-100    text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Tasks() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: "", difficulty: "easy" });
  const [showForm, setShowForm] = useState(false);
  
  // AI Proposal State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proposal, setProposal] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    api.get("/api/tasks")
      .then((r) => {
        setTasks(r.data);
        if (!isAdmin) fetchRecommendations(r.data);
      })
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  };

  const fetchRecommendations = async (allTasks) => {
    try {
      const res = await api.post("/api/ai/recommend-tasks", {
        userId: user.id,
        userSkills: user.skills ? JSON.parse(user.skills) : ["React", "Node.js"] // Fallback for demo
      });
      setRecommendations(res.data);
    } catch (err) {
      console.error("Rec Error:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleGenerateProposal = async (task) => {
    setSelectedTask(task);
    setShowProposalModal(true);
    setGenerating(true);
    try {
      const res = await api.post("/api/ai/generate-proposal", {
        userProfile: { skills: user.skills },
        taskDescription: task.description
      });
      setProposal(res.data.proposal);
    } catch (err) {
      toast.error("Failed to generate AI proposal");
    } finally {
      setGenerating(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title) return toast.error("Title is required");
    try {
      await api.post("/api/tasks", newTask);
      toast.success("✅ Task added!");
      setNewTask({ title: "", description: "", reward: "", difficulty: "easy" });
      setShowForm(false);
      fetchTasks();
    } catch {
      toast.error("Failed to add task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.difficulty === filter;
    return matchSearch && matchFilter;
  });

  const inputClass = "w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm mb-4 focus:outline-none focus:border-blue-500 transition-all font-medium";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="🎯 Mission Hub" />

        <div className="p-8 space-y-8 max-w-7xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 dark:bg-blue-600 text-white p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black italic tracking-tight">
                {isAdmin ? "📋 Control Center" : "🚀 Opportunity Feed"}
              </h1>
              <p className="text-blue-100/70 mt-2 font-medium">
                {isAdmin ? "Architect new challenges for the community." : "Leverage AI to find the perfect project for your growth."}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)}
                className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all text-sm shadow-xl">
                {showForm ? "✕ ABORT" : "+ CREATE TASK"}
              </button>
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          </motion.div>

          {/* AI RECOMMENDATIONS */}
          {!isAdmin && recommendations.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Brain className="text-purple-500" /> RECOMMENDED FOR YOU
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
                {recommendations.map((t) => (
                  <motion.div
                    key={t.id}
                    whileHover={{ scale: 1.02 }}
                    className="min-w-[300px] bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border-l-8 border-l-purple-500 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Sparkles size={10} /> {t.matchScore}% MATCH
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">#AI-PICK</span>
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-white text-lg mb-2">{t.title}</h3>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-emerald-500 font-black text-xl">₹{t.reward}</span>
                       <button 
                         onClick={() => handleGenerateProposal(t)}
                         className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition"
                       >
                         <Zap size={18} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Search + Filter */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                placeholder="🔍 Scan for specific technologies or projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <Target size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              {["all", "easy", "medium", "hard"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    filter === f ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between group hover:shadow-2xl hover:border-blue-500/30 transition-all"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs ring-1 ring-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {t.title?.[0]?.toUpperCase()}
                      </div>
                      <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest ${DIFF_STYLE[t.difficulty] || "bg-gray-100 text-gray-600"}`}>
                        {t.difficulty}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-white text-xl mb-3 leading-tight">{t.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 font-medium leading-relaxed">
                      {t.description || "Project specifications are currently confidential. Please apply for full documentation."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-700/50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Settlement</p>
                      <span className="text-emerald-500 font-black text-2xl tracking-tighter">₹{t.reward}</span>
                    </div>
                    {isAdmin ? (
                      <button onClick={() => deleteTask(t.id)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                         <X size={20} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGenerateProposal(t)}
                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                      >
                        PROPOSE
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* AI PROPOSAL MODAL */}
      <AnimatePresence>
        {showProposalModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 w-full max-w-2xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
                    <Brain />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">AI Proposal Draft</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Targeting: {selectedTask?.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowProposalModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all">
                   <X size={24} className="text-slate-400" />
                </button>
              </div>

              {generating ? (
                <div className="py-20 text-center space-y-6">
                   <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                   <p className="text-slate-500 font-black italic animate-pulse">Syncing skills with project requirements...</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-700 mb-8 max-h-[400px] overflow-y-auto">
                    <textarea 
                      value={proposal} 
                      onChange={(e) => setProposal(e.target.value)}
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-sm h-64 resize-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        toast.success("AI Proposal Sent to Client!");
                        setShowProposalModal(false);
                      }}
                      className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                      <Send size={24} /> TRANSMIT PROPOSAL
                    </button>
                    <button 
                      onClick={() => handleGenerateProposal(selectedTask)}
                      className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-8 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center"
                    >
                       RE-EXTRACT
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}