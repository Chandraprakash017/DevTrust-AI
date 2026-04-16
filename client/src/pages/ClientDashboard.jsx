import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [newTask, setNewTask] = useState({ title: "", description: "", reward: "", difficulty: "easy" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/tasks").then((r) => setTasks(r.data)).catch(() => {});
    if (user.id) {
      axios.get(`http://localhost:5000/api/payment/history/${user.id}`).then((r) => {
        setPayments(r.data);
        setTotal(r.data.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0));
      }).catch(() => {});
    }
  }, []);

  const postTask = async () => {
    if (!newTask.title) return;
    await axios.post("http://localhost:5000/api/tasks", newTask);
    const r = await axios.get("http://localhost:5000/api/tasks");
    setTasks(r.data);
    setNewTask({ title: "", description: "", reward: "", difficulty: "easy" });
    setShowForm(false);
  };

  const inputClass = "w-full p-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  const diffColor = { easy: "green", medium: "yellow", hard: "red" };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="🏢 Client Dashboard" />

        <div className="p-6 space-y-6">

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-6 rounded-2xl shadow-lg"
          >
            <h1 className="text-2xl font-bold">Welcome, {user.name} 👋</h1>
            <p className="text-sm mt-1 opacity-90">Post tasks, manage freelancers, and track your spending.</p>
          </motion.div>

          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Total Tasks Posted", value: tasks.length, icon: "📋", color: "from-purple-500 to-purple-700" },
              { label: "Total Spent",         value: `₹${total}`, icon: "💰", color: "from-green-500 to-green-700" },
              { label: "Payment Records",     value: payments.length, icon: "🧾", color: "from-blue-500 to-blue-700" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${s.color} text-white p-5 rounded-2xl shadow-lg`}
              >
                <p className="text-2xl">{s.icon}</p>
                <p className="text-xs opacity-80 mt-1">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition text-sm font-medium">
              📋 Post Task
            </button>
            <button onClick={() => navigate("/chat")} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition text-sm font-medium">
              💬 Chat
            </button>
            <button onClick={() => navigate("/payment")} className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition text-sm font-medium">
              💳 Make Payment
            </button>
            <button onClick={() => navigate("/payments")} className="bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-800 transition text-sm font-medium">
              💰 History
            </button>
          </div>

          {/* POST TASK FORM */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow"
            >
              <h2 className="font-bold mb-3 text-lg">📋 Post a New Task</h2>
              <input placeholder="Task Title *" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className={inputClass} />
              <textarea placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className={inputClass + " resize-none"} rows={3} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Reward ₹" type="number" value={newTask.reward} onChange={(e) => setNewTask({ ...newTask, reward: e.target.value })} className={inputClass} />
                <select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className={inputClass}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button onClick={postTask} className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition text-sm">Post Task</button>
            </motion.div>
          )}

          {/* AVAILABLE TASKS */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h2 className="font-bold text-lg mb-4">📋 Available Tasks</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-400 text-sm">No tasks posted yet. Post the first one!</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                    <div>
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full bg-${diffColor[t.difficulty] || "gray"}-100 text-${diffColor[t.difficulty] || "gray"}-700`}>
                        {t.difficulty}
                      </span>
                      <span className="text-green-500 font-semibold text-sm">₹{t.reward}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PAYMENT HISTORY */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <h2 className="font-bold text-lg mb-4">💰 Recent Payments</h2>
            {payments.length === 0 ? (
              <p className="text-gray-400 text-sm">No payments yet</p>
            ) : (
              payments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex justify-between border-b dark:border-gray-700 py-2 text-sm">
                  <span>{p.source}</span>
                  <span className="text-green-500 font-semibold">₹{p.amount}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}