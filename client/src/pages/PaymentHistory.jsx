import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function PaymentHistory() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user.id) return;
    axios
      .get(`http://localhost:5000/api/payment/history/${user.id}`)
      .then((res) => {
        setData(res.data);
        setTotal(res.data.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="💰 Payment History" />

        <div className="p-6 max-w-2xl mx-auto space-y-6">

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-green-700 text-white p-5 rounded-2xl shadow">
              <p className="text-xs opacity-80">Total Earned / Paid</p>
              <p className="text-3xl font-bold mt-1">₹{total}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-5 rounded-2xl shadow">
              <p className="text-xs opacity-80">Transactions</p>
              <p className="text-3xl font-bold mt-1">{data.length}</p>
            </motion.div>
          </div>

          {/* Transaction List */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
            <div className="p-5 border-b dark:border-gray-700 font-bold text-lg">📋 Transactions</div>

            {loading ? (
              <p className="p-6 text-center text-gray-400">Loading...</p>
            ) : data.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">💸</p>
                <p>No payment records yet</p>
              </div>
            ) : (
              data.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 font-bold text-lg">
                      ₹
                    </div>
                    <div>
                      <p className="font-medium text-sm">{e.source}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(e.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-500 font-bold">+₹{e.amount}</span>
                </motion.div>
              ))
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}