import { useEffect, useState } from "react";
import api from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { Download, TrendingUp, Award, Zap, Star, ShieldCheck, FileText, Brain, Sparkles } from "lucide-react";
import jsPDF from "jspdf";

export default function FreelancerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [earnings, setEarnings] = useState([]);
  const [total, setTotal] = useState(0);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState(500);
  const [paySource, setPaySource] = useState("Freelance Task");
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const fetchEarnings = () => {
    if (!user.id) return;
    api.get(`/api/earnings/${user.id}`).then((res) => {
      setEarnings(res.data);
      setTotal(res.data.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0));
    }).catch(() => {});
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // jsPDF Invoice Generation
  const handleDownloadInvoice = (earning) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Purple
    doc.text("DEVTRUST AI", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Official Project Invoice & Payment Receipt", 105, 28, { align: "center" });
    
    // Divider
    doc.setDrawColor(230);
    doc.line(20, 35, 190, 35);
    
    // Billing Details
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text("BILL TO:", 20, 50);
    doc.setFont("helvetica", "bold");
    doc.text(user.name, 20, 56);
    doc.setFont("helvetica", "normal");
    doc.text(user.email, 20, 62);
    
    doc.text("INVOICE #:", 140, 50);
    doc.text(`DT-${earning.id}-${Date.now().toString().slice(-4)}`, 140, 56);
    doc.text("DATE:", 140, 62);
    doc.text(new Date(earning.created_at).toLocaleDateString(), 140, 68);
    
    // Table Header
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 80, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 87);
    doc.text("Amount (INR)", 160, 87, { align: "right" });
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.text(earning.source, 25, 100);
    doc.text(`INR ${earning.amount}`, 160, 100, { align: "right" });
    
    doc.line(20, 110, 190, 110);
    
    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL PAID:", 120, 125);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`INR ${earning.amount}`, 160, 125, { align: "right" });
    
    // Footer
    doc.setTextColor(150);
    doc.setFontSize(10);
    doc.text("Thank you for using DevTrust AI for your professional journey.", 105, 150, { align: "center" });
    
    doc.save(`Invoice_${earning.source.replace(/\s+/g, '_')}.pdf`);
  };

  // Mock Payment Flow
  const handleMockPayment = async () => {
    setPaying(true);
    try {
      await api.post("/api/payment/create-order", { amount: payAmount });
      await new Promise((r) => setTimeout(r, 1500));
      await api.post("/api/payment/verify", {
        user_id: user.id,
        amount: payAmount,
        source: paySource,
      });
      setPaySuccess(true);
      fetchEarnings();
    } catch {
      alert("Payment failed ❌");
    } finally {
      setPaying(false);
    }
  };

  const closeModal = () => {
    setShowPayModal(false);
    setPaySuccess(false);
    setPaying(false);
  };

  const progress = Math.min((total / 5000) * 100, 100);

  const earningsData = earnings.map((e, i) => ({
    name: new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: parseFloat(e.amount),
  }));

  const skillData = [
    { subject: 'UI/UX', A: 80, fullMark: 100 },
    { subject: 'React', A: 95, fullMark: 100 },
    { subject: 'Backend', A: 70, fullMark: 100 },
    { subject: 'Communication', A: 85, fullMark: 100 },
    { subject: 'Testing', A: 60, fullMark: 100 },
    { subject: 'DevOps', A: 40, fullMark: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        <Sidebar />

        <div className="flex-1">
          <Navbar title="🚀 Advanced Analytics Dashboard" />

          <div className="p-8 space-y-8 max-w-7xl mx-auto">

            {/* AI PERFORMANCE BANNER */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 dark:bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl"
            >
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-400/20">AI Optimized</span>
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight italic flex items-center gap-4">
                    Welcome back, {user.name}
                    {user.plan === 'pro' && (
                      <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-2xl text-xs font-black tracking-widest border border-white/20 shadow-xl">PRO MEMBER</span>
                    )}
                  </h1>
                  <p className="text-blue-100/70 mt-2 text-lg max-w-lg leading-relaxed font-medium">
                    Your performance is up <span className="text-green-400 font-bold">+12.5%</span> this week. {user.plan !== 'pro' ? "Upgrade to Pro to unlock AI Mock Interviews and ATS scoring." : "Our AI suggests focusing on TypeScript to unlock higher-paying projects."}
                  </p>
                </div>
                <div className="flex gap-4">
                  {user.plan !== 'pro' ? (
                    <button onClick={() => navigate("/subscription")} className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-2xl flex items-center gap-2">
                      <Zap size={20} /> GET PRO ACCESS
                    </button>
                  ) : (
                    <button onClick={() => navigate("/career-guidance")} className="bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl flex items-center gap-2">
                       <TrendingUp size={20} /> Career Navigator
                    </button>
                  )}
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
            </motion.div>

            {/* KEY METRICS */}
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", value: `₹${total}`, icon: <TrendingUp />, color: "bg-emerald-500", trend: "+8.2%" },
                { label: "Task Success", value: "98%", icon: <ShieldCheck />, color: "bg-blue-500", trend: "+2.1%" },
                { label: "Reputation Score", value: user.reputation_score || "5.00", icon: <Award />, color: "bg-amber-500", trend: "Verified" },
                { label: "Active Jobs", value: "03", icon: <Zap />, color: "bg-indigo-500", trend: "On Track" },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${m.color} p-3 rounded-2xl text-white shadow-lg`}>
                      {m.icon}
                    </div>
                    <span className={`text-[10px] font-bold ${m.trend === 'Verified' ? 'text-blue-500 bg-blue-50' : 'text-green-500 bg-green-50'} dark:bg-slate-900/40 px-2 py-1 rounded-lg`}>{m.trend}</span>
                  </div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{m.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">{m.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* REVENUE ANALYTICS */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <TrendingUp className="text-blue-500" /> Revenue Flow
                  </h2>
                  <div className="flex gap-2">
                    <button className="text-[10px] bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg font-bold">1W</button>
                    <button className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">1M</button>
                  </div>
                </div>
                {earnings.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No revenue data available yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: '#F8FAFC' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAmt)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* SKILLS RADAR */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3">
                  <Star className="text-yellow-500" /> AI Skill Assessment
                </h2>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* GENAI SUITE */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-500" /> GenAI Suite
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => navigate("/mock-interview")} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-2xl font-bold hover:scale-[1.02] transition-all">
                    <span className="flex items-center gap-3"><Brain size={20} /> AI Mock Interview</span>
                    {user.plan !== 'pro' && <ShieldCheck size={16} className="text-orange-500" />}
                  </button>
                  <button onClick={() => navigate("/ats-score")} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 rounded-2xl font-bold hover:scale-[1.02] transition-all">
                    <span className="flex items-center gap-3"><Award size={20} /> ATS Resume Score</span>
                    {user.plan !== 'pro' && <ShieldCheck size={16} className="text-orange-500" />}
                  </button>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6">Operations</h2>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => navigate("/tasks")}     className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-bold hover:scale-[1.02] transition-all"><Zap size={20} /> Browse Projects</button>
                  <button onClick={() => navigate("/chat")}      className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl font-bold hover:scale-[1.02] transition-all"><FileText size={20} /> Active Collaborations</button>
                  <button onClick={() => setShowPayModal(true)}  className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold hover:scale-[1.02] transition-all"><TrendingUp size={20} /> Payout Request</button>
                </div>
              </div>

              {/* RECENT SETTLEMENTS */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-slate-800 dark:text-white">Recent Settlements</h2>
                  <span className="text-xs font-bold text-blue-500 cursor-pointer">View All Transactions</span>
                </div>
                <div className="space-y-4">
                  {earnings.length === 0 ? (
                    <p className="text-slate-400 py-8 text-center font-bold">No payments processed yet.</p>
                  ) : (
                    earnings.slice(0, 4).map((e) => (
                      <div key={e.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 dark:border-slate-700">
                             <ShieldCheck size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{e.source}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(e.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="text-emerald-600 font-black tracking-tight">+₹{e.amount}</span>
                           <button 
                             onClick={() => handleDownloadInvoice(e)}
                             className="p-3 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all"
                             title="Generate Invoice PDF"
                           >
                              <Download size={18} />
                           </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-200 dark:border-slate-700"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {!paySuccess ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                      <Zap size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">Receive Payment</h2>
                    <p className="text-slate-500 text-sm font-medium">Verify completion to instantly withdraw funds.</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Settlement Amount (₹)</label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="w-full p-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/40 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-black text-xl"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Project Reference</label>
                      <input
                        type="text"
                        value={paySource}
                        onChange={(e) => setPaySource(e.target.value)}
                        className="w-full p-4 border-2 border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/40 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleMockPayment}
                      disabled={paying}
                      className="w-full bg-blue-600 text-white p-5 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                    >
                      {paying ? "Encrypting Transaction..." : `Release ₹${payAmount} Funds`}
                    </button>
                    <button onClick={closeModal} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">Cancel Request</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                    <ShieldCheck size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-emerald-600 mb-2">Funds Released!</h2>
                  <p className="text-slate-500 font-medium mb-8">₹{payAmount} has been added to your vault for "{paySource}"</p>
                  <button onClick={closeModal} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">Go to Vault</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}