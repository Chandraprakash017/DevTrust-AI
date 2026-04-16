import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    name: "Basic",
    price: 499,
    color: "from-gray-600 to-gray-800",
    features: ["5 Task Submissions", "Basic Support", "1 Training Access", "Standard Profile"],
  },
  {
    name: "Pro",
    price: 999,
    popular: true,
    color: "from-purple-600 to-blue-600",
    features: ["Unlimited Tasks", "Priority Support", "All Trainings", "Verified Badge", "Earnings Analytics"],
  },
  {
    name: "Enterprise",
    price: 2499,
    color: "from-yellow-500 to-orange-600",
    features: ["Everything in Pro", "Dedicated Manager", "Custom Training Plan", "Invoice & Billing", "API Access"],
  },
];

export default function Payment() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const pay = async () => {
    if (!cardNum || !cardName || !expiry || !cvv) return toast.error("Please fill all card details");
    if (cardNum.replace(/\s/g, "").length < 12) return toast.error("Invalid card number");

    setProcessing(true);
    try {
      // Create mock order
      await axios.post("http://localhost:5000/api/payment/create-order", { amount: selected.price });

      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 2000));

      // Save earning / payment record
      await axios.post("http://localhost:5000/api/payment/verify", {
        user_id: user.id,
        amount: selected.price,
        source: `${selected.name} Plan Subscription`,
      });

      setSuccess(true);
    } catch {
      toast.error("Payment failed ❌ Please try again");
    } finally {
      setProcessing(false);
    }
  };

  const formatCard = (val) => {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  };

  const inputClass = "w-full p-3 rounded-xl border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1">
        <Navbar title="💳 Payment" />

        <div className="p-6 max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Choose Your Plan
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Unlock premium features and accelerate your freelance career</p>
          </motion.div>

          {/* Plans */}
          {!selected && (
            <div className="grid md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 transition hover:scale-105 ${
                    plan.popular ? "border-purple-500" : "border-transparent dark:border-gray-700"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 text-center text-xs font-bold py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      ⭐ MOST POPULAR
                    </div>
                  )}
                  <div className={`bg-gradient-to-br ${plan.color} text-white p-6 ${plan.popular ? "pt-10" : ""}`}>
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <p className="text-3xl font-extrabold mt-2">₹{plan.price}</p>
                    <p className="text-xs opacity-80">one-time</p>
                  </div>
                  <div className="p-5 space-y-2">
                    {plan.features.map((f) => (
                      <p key={f} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                        <span className="text-green-500">✓</span> {f}
                      </p>
                    ))}
                    <button
                      onClick={() => setSelected(plan)}
                      className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-white text-sm transition bg-gradient-to-r ${plan.color} hover:opacity-90`}
                    >
                      Get {plan.name}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Payment Form */}
          <AnimatePresence>
            {selected && !success && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
              >
                <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                  ← Back to plans
                </button>

                <h2 className="text-xl font-bold mb-1">💳 Card Payment</h2>
                <p className="text-sm text-gray-400 mb-5">
                  Paying <span className="font-semibold text-purple-600">₹{selected.price}</span> for {selected.name} Plan
                </p>

                {/* Mock Card UI */}
                <div className={`bg-gradient-to-br ${selected.color} text-white rounded-2xl p-5 mb-6 shadow-xl`}>
                  <p className="text-xs opacity-70 mb-3">CARD NUMBER</p>
                  <p className="font-mono tracking-widest text-lg">{cardNum || "•••• •••• •••• ••••"}</p>
                  <div className="flex justify-between mt-4 text-xs opacity-70">
                    <span>{cardName || "CARDHOLDER NAME"}</span>
                    <span>{expiry || "MM/YY"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    placeholder="Card Number"
                    value={cardNum}
                    onChange={(e) => setCardNum(formatCard(e.target.value))}
                    className={inputClass}
                    maxLength={19}
                  />
                  <input
                    placeholder="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className={inputClass}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2);
                        setExpiry(v);
                      }}
                      className={inputClass}
                    />
                    <input
                      placeholder="CVV"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  onClick={pay}
                  disabled={processing}
                  className="w-full mt-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3.5 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  {processing ? "Processing..." : `Pay ₹${selected.price}`}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3">🔒 Simulated secure payment · No real charges</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10"
              >
                <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, 15, -15, 0] }} transition={{ delay: 0.2 }} className="text-6xl mb-4">
                  🎉
                </motion.div>
                <h2 className="text-2xl font-bold text-green-500">Payment Successful!</h2>
                <p className="text-gray-400 mt-2">₹{selected?.price} paid for <strong>{selected?.name}</strong> Plan</p>
                <p className="text-sm text-gray-400 mt-1">Your earnings record has been updated.</p>
                <div className="flex gap-3 mt-6 justify-center">
                  <button onClick={() => navigate("/payments")} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm font-medium">
                    View History
                  </button>
                  <button onClick={() => { setSelected(null); setSuccess(false); setCardNum(""); setCardName(""); setExpiry(""); setCvv(""); }}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium">
                    Pay Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
