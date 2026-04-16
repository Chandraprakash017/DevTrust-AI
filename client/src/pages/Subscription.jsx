import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, Rocket } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PricingCard = ({ title, price, features, isPro, onUpgrade, isLoading }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`relative p-8 rounded-3xl border ${
      isPro 
        ? "bg-gradient-to-b from-purple-500/10 to-blue-500/10 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]" 
        : "bg-white/5 border-white/10"
    } backdrop-blur-xl flex flex-col h-full`}
  >
    {isPro && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
        <Sparkles size={12} /> RECOMMENDED
      </div>
    )}

    <div className="mb-8">
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-white">₹{price}</span>
        <span className="text-gray-400">/month</span>
      </div>
    </div>

    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-center gap-3 text-gray-300">
          <div className={`p-1 rounded-full ${isPro ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-400"}`}>
            <Check size={14} />
          </div>
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>

    <button
      onClick={onUpgrade}
      disabled={isLoading || (!isPro && true)}
      className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
        isPro 
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40" 
          : "bg-white/10 text-gray-400 cursor-not-allowed"
      }`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <span>{isPro ? "Upgrade to Pro" : "Current Plan"}</span>
          {isPro && <Zap size={18} />}
        </>
      )}
    </button>
  </motion.div>
);

export default function Subscription() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Mock payment and subscription
      const res = await axios.post("http://localhost:5000/api/payment/subscribe", {
        user_id: user.id,
        amount: 499,
        plan: "pro"
      });

      if (res.data.success) {
        toast.success("Welcome to DevTrust Pro! 🚀");
        // Update local storage user object
        const updatedUser = { ...user, plan: "pro" };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        setTimeout(() => {
          navigate("/freelancer");
        }, 1500);
      }
    } catch (err) {
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] py-20 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-semibold mb-4"
          >
            PRICING PLANS
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold text-white mb-6 tracking-tight"
          >
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Level Up</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Choose the best plan for your career. Unlock powerful AI features, premium tasks, and instant credibility.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Free Tier"
            price="0"
            features={[
              "Access to basic tasks",
              "Public profile",
              "Standard community access",
              "Basic AI task matching",
              "Limited career guidance"
            ]}
            isPro={false}
          />
          <PricingCard
            title="Pro Developer"
            price="499"
            features={[
              "All Free Tier features",
              "AI Powered Mock Interviews",
              "Detailed ATS Resume Scoring",
              "Global AI Assistant (ChatBot)",
              "Priority application matching",
              "Exclusive high-reward tasks",
              "Verified Pro Badge"
            ]}
            isPro={true}
            onUpgrade={handleUpgrade}
            isLoading={isLoading}
          />
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all"
        >
          <div className="flex items-center gap-2 text-white font-medium">
            <Shield size={20} className="text-purple-400" /> Secure Payments
          </div>
          <div className="flex items-center gap-2 text-white font-medium">
            <Rocket size={20} className="text-blue-400" /> Instant Access
          </div>
        </motion.div>
      </div>
    </div>
  );
}
