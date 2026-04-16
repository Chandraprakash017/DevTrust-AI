import axios from "axios";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, CheckCircle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginForm = { ...form, email: form.email.toLowerCase() };
      const res = await api.post("/api/auth/login", loginForm);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;
      setTimeout(() => {
        if (role === "admin") navigate("/admin");
        else if (role === "freelancer") navigate("/freelancer");
        else navigate("/client");
        toast.success("Welcome back to DevTrust! 🚀");
      }, 500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Fetch user info from Google API using the access token
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        const { name, email, picture } = userInfo.data;
        
        const res = await api.post("/api/auth/google-login", {
          name,
          email,
          profile_picture: picture
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        const role = res.data.user.role;
        setTimeout(() => {
          if (role === "admin") navigate("/admin");
          else if (role === "freelancer") navigate("/freelancer");
          else navigate("/client");
          toast.success("Logged in with Google! 🚀");
        }, 500);
      } catch (err) {
        toast.error("Google login failed ❌");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google login was unsuccessful ❌"),
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0a0a0c]">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md p-8 m-4 bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex p-4 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/20"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            DevTrust <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Pro</span>
          </h2>
          <p className="text-gray-400 font-medium">Elevating your freelance journey.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Modern email address"
              className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Secure password"
              className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)]"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In Securely</span>
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-gray-500 text-sm">Empowering Industry Standards</span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <button 
          onClick={() => googleLogin()}
          type="button"
          disabled={isLoading}
          className="w-full mt-6 bg-white/[0.05] text-white py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-white/[0.1] transition-colors border border-white/5 active:scale-95"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
            className="w-5"
            alt="Google"
          />
          Direct Access with Google
        </button>

        <p className="text-center text-gray-400 mt-8 text-sm">
          New to the ecosystem?{" "}
          <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
            Initialize Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}