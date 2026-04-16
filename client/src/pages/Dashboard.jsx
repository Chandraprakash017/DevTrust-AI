import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition duration-300">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1">
        <Navbar />

        {/* CONTENT */}
        <div className="p-6">

          {/* 🔥 STATS CARDS */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800 backdrop-blur shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-gray-500 text-sm">Total Trainings</h3>
              <p className="text-3xl font-bold mt-2">10</p>
              <span className="text-green-500 text-sm">+2 this week</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800 backdrop-blur shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-gray-500 text-sm">Completed Tasks</h3>
              <p className="text-3xl font-bold mt-2">5</p>
              <span className="text-blue-500 text-sm">+1 today</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/70 dark:bg-gray-800 backdrop-blur shadow-lg hover:scale-105 transition"
            >
              <h3 className="text-gray-500 text-sm">Earnings</h3>
              <p className="text-3xl font-bold mt-2">₹1200</p>
              <span className="text-purple-500 text-sm">+₹300 this week</span>
            </motion.div>

          </div>

          {/* 🔥 MAIN GRID */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* 📊 RECENT ACTIVITY */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span>Completed UI Design Task</span>
                  <span className="text-green-500">₹200</span>
                </li>
                <li className="flex justify-between">
                  <span>Joined React Training</span>
                  <span className="text-blue-500">New</span>
                </li>
                <li className="flex justify-between">
                  <span>Document Verified</span>
                  <span className="text-purple-500">✔</span>
                </li>
              </ul>
            </motion.div>

            {/* 📈 QUICK ACTIONS */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

              <div className="grid grid-cols-2 gap-4">

                <button className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition">
                  + New Task
                </button>

                <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition">
                  View Chat
                </button>

                <button className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition">
                  Upload Docs
                </button>

                <button className="bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-800 transition">
                  Earnings
                </button>

              </div>
            </motion.div>

          </div>

          {/* 🔥 BOTTOM SECTION */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg"
          >
            <h2 className="text-xl font-bold">Upgrade Your Skills 🚀</h2>
            <p className="text-sm mt-2">
              Join premium training to unlock higher earning opportunities.
            </p>

            <button className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold">
              Explore Trainings
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}