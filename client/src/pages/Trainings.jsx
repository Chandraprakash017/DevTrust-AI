import { useEffect, useState } from "react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const LEVEL_STYLE = {
  beginner:     "bg-green-100  text-green-700",
  intermediate: "bg-blue-100   text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
};

const LEVEL_ICON = {
  beginner:     "🌱",
  intermediate: "🚀",
  advanced:     "⚡",
};

export default function Trainings() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [newT, setNewT] = useState({ title: "", description: "", level: "beginner" });
  const [showForm, setShowForm] = useState(false);
  const [enrolled, setEnrolled] = useState([]);

  const fetchTrainings = () => {
    setLoading(true);
    api.get("/api/trainings")
      .then((r) => setTrainings(r.data))
      .catch(() => toast.error("Failed to load trainings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTrainings(); }, []);

  const addTraining = async () => {
    if (!newT.title) return toast.error("Title is required");
    try {
      await api.post("/api/trainings", newT);
      toast.success("✅ Training added!");
      setNewT({ title: "", description: "", level: "beginner" });
      setShowForm(false);
      fetchTrainings();
    } catch { toast.error("Failed to add training"); }
  };

  const deleteTraining = async (id) => {
    try {
      await api.delete(`/api/trainings/${id}`);
      setTrainings((prev) => prev.filter((t) => t.id !== id));
      toast.success("Training deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const enrollToggle = (id) => {
    if (enrolled.includes(id)) {
      setEnrolled(enrolled.filter((e) => e !== id));
      toast("Unenrolled", { icon: "👋" });
    } else {
      setEnrolled([...enrolled, id]);
      toast.success("Enrolled! 🎓");
    }
  };

  const filtered = trainings.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.level === filter;
    return matchSearch && matchFilter;
  });

  const inputClass = "w-full p-2.5 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="🎓 Trainings" />

        <div className="p-6 space-y-6">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-2xl shadow flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">
                {isAdmin ? "🎓 Manage Trainings" : "🎓 Browse Trainings"}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {isAdmin ? "Add and manage training programs" : "Level up your skills with our curated trainings"}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)}
                className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition text-sm">
                {showForm ? "✕ Cancel" : "+ Add Training"}
              </button>
            )}
          </motion.div>

          {/* Stats (for non-admin) */}
          {!isAdmin && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Available",  value: trainings.length,  color: "from-blue-400 to-blue-600"   },
                { label: "Enrolled",   value: enrolled.length,   color: "from-purple-400 to-purple-600" },
                { label: "Completed",  value: 0,                 color: "from-green-400 to-green-600"  },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white p-4 rounded-2xl shadow text-center`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add Training Form */}
          {isAdmin && showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
              <h2 className="font-bold mb-3">New Training</h2>
              <input placeholder="Title *" value={newT.title} onChange={(e) => setNewT({ ...newT, title: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={newT.description} onChange={(e) => setNewT({ ...newT, description: e.target.value })} className={inputClass + " resize-none"} rows={3} />
              <select value={newT.level} onChange={(e) => setNewT({ ...newT, level: e.target.value })} className={inputClass}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button onClick={addTraining} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium">
                ✅ Add Training
              </button>
            </motion.div>
          )}

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              placeholder="🔍 Search trainings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <div className="flex gap-2">
              {["all", "beginner", "intermediate", "advanced"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition capitalize ${
                    filter === f ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Trainings Grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading trainings...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🎓</p>
              <p>{trainings.length === 0 ? "No trainings yet. Admin can add some!" : "No trainings match your search."}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{LEVEL_ICON[t.level] || "📘"}</span>
                      <h3 className="font-bold text-base">{t.title}</h3>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${LEVEL_STYLE[t.level] || "bg-gray-100 text-gray-600"}`}>
                      {t.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {t.description || "No description provided"}
                  </p>
                  {isAdmin ? (
                    <button onClick={() => deleteTraining(t.id)} className="text-xs text-red-500 hover:text-red-700 transition">✕ Delete</button>
                  ) : (
                    <button
                      onClick={() => enrollToggle(t.id)}
                      className={`w-full py-2 rounded-xl text-sm font-medium transition ${
                        enrolled.includes(t.id)
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {enrolled.includes(t.id) ? "✅ Enrolled" : "Enroll Now"}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}