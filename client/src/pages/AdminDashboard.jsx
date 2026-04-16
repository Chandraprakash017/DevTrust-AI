import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFreelancers: 0,
    totalClients: 0,
    pendingVerifications: 0,
    totalEarnings: 0,
  });
  const [verifications, setVerifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: "", difficulty: "easy" });
  const [newTraining, setNewTraining] = useState({ title: "", description: "", level: "beginner" });

  useEffect(() => {
    axios.get("http://localhost:5000/api/users/stats").then((r) => setStats(r.data)).catch(() => {});
    axios.get("http://localhost:5000/api/tasks").then((r) => setTasks(r.data)).catch(() => {});
    axios.get("http://localhost:5000/api/trainings").then((r) => setTrainings(r.data)).catch(() => {});
    // Fetch all verifications via a custom query approach
    fetchVerifications();
  }, []);

  const fetchVerifications = () => {
    // Get all users to check verifications
    axios.get("http://localhost:5000/api/users").then(() => {}).catch(() => {});
  };

  const addTask = async () => {
    if (!newTask.title) return;
    await axios.post("http://localhost:5000/api/tasks", newTask);
    const r = await axios.get("http://localhost:5000/api/tasks");
    setTasks(r.data);
    setNewTask({ title: "", description: "", reward: "", difficulty: "easy" });
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:5000/api/tasks/${id}`);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addTraining = async () => {
    if (!newTraining.title) return;
    await axios.post("http://localhost:5000/api/trainings", newTraining);
    const r = await axios.get("http://localhost:5000/api/trainings");
    setTrainings(r.data);
    setNewTraining({ title: "", description: "", level: "beginner" });
  };

  const deleteTraining = async (id) => {
    await axios.delete(`http://localhost:5000/api/trainings/${id}`);
    setTrainings(trainings.filter((t) => t.id !== id));
  };

  const statCards = [
    { label: "Total Users",          value: stats.totalUsers,           color: "from-purple-500 to-purple-700" },
    { label: "Freelancers",           value: stats.totalFreelancers,     color: "from-blue-500 to-blue-700" },
    { label: "Clients",               value: stats.totalClients,         color: "from-green-500 to-green-700" },
    { label: "Pending Verifications", value: stats.pendingVerifications, color: "from-red-500 to-red-700" },
    { label: "Total Earnings",        value: `₹${stats.totalEarnings}`,  color: "from-yellow-500 to-yellow-700" },
  ];

  const inputClass = "w-full p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="👑 Admin Panel" />

        <div className="p-6 space-y-8">

          {/* STATS */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${s.color} text-white p-5 rounded-2xl shadow-lg`}
              >
                <p className="text-xs opacity-80">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* TASKS MANAGEMENT */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">📋 Manage Tasks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <input placeholder="Title *" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className={inputClass} />
              <input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className={inputClass} />
              <input placeholder="Reward ₹" type="number" value={newTask.reward} onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })} className={inputClass} />
              <select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={inputClass}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button onClick={addTask} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition mb-4">+ Add Task</button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tasks.length === 0 && <p className="text-gray-400 text-sm">No tasks yet</p>}
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-gray-400">₹{t.reward} · {t.difficulty}</p>
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="text-red-500 hover:text-red-700 text-xs">✕ Delete</button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TRAININGS MANAGEMENT */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">🎓 Manage Trainings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <input placeholder="Title *" value={newTraining.title} onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })} className={inputClass} />
              <input placeholder="Description" value={newTraining.description} onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })} className={inputClass} />
              <select value={newTraining.level} onChange={(e) => setNewTraining({ ...newTraining, level: e.target.value })} className={inputClass}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <button onClick={addTraining} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition mb-4">+ Add Training</button>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trainings.length === 0 && <p className="text-gray-400 text-sm">No trainings yet</p>}
              {trainings.map((t) => (
                <div key={t.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{t.level}</p>
                  </div>
                  <button onClick={() => deleteTraining(t.id)} className="text-red-500 hover:text-red-700 text-xs">✕ Delete</button>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}