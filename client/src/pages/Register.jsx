import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UserPlus, User, Mail, Lock, Briefcase } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "freelancer" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registerForm = { ...form, email: form.email.toLowerCase() };
      await axios.post("http://localhost:5000/api/auth/register", registerForm);
      toast.success("Account created successfully! Welcome aboard 🚀");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0a0a0c]">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg p-10 m-4 bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex p-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/20"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-gray-400">Join the world's most trusted freelance ecosystem.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              name="name"
              autoComplete="name"
              placeholder="Full Name" 
              className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600"
              value={form.name}
              onChange={(e)=>setForm({...form, name: e.target.value})} 
              required
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Email address" 
              className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600"
              value={form.email}
              onChange={(e)=>setForm({...form, email: e.target.value})} 
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="password" 
              name="password"
              autoComplete="new-password"
              placeholder="Secure password"
              className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600"
              value={form.password}
              onChange={(e)=>setForm({...form, password: e.target.value})} 
              required
            />
          </div>

          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <select 
              className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all appearance-none cursor-pointer"
              onChange={(e)=>setForm({...form, role: e.target.value})}
            >
              <option value="freelancer" className="bg-[#1a1a1c]">I am a Freelancer</option>
              <option value="client" className="bg-[#1a1a1c]">I am a Client</option>
            </select>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Initialize Secure Account"
            )}
          </motion.button>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Already a member?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}