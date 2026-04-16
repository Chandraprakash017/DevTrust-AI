import { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, Mail, Phone, Book, Save, ArrowLeft, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone_number: user.phone_number || "",
    bio: user.bio || "",
    profile_picture: user.profile_picture || "",
    skills: user.skills || ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.id) {
        navigate("/login");
        return;
    }
    // Fetch fresh data from API
    api.get(`/api/users/profile/${user.id}`)
      .then(res => {
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone_number: res.data.phone_number || "",
          bio: res.data.bio || "",
          profile_picture: res.data.profile_picture || "",
          skills: res.data.skills || ""
        });
        setIsFetching(false);
      })
      .catch(err => {
        toast.error("Failed to load profile data");
        setIsFetching(false);
      });
  }, [user.id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.put(`/api/users/profile/${user.id}`, formData);
      
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success("Profile updated successfully! ✨");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white pb-12">
      <Navbar title="My Account" />
      
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Header/Cover Area */}
          <div className="h-32 bg-gradient-to-r from-purple-600/30 to-blue-600/30 relative">
             <button 
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-md"
             >
                <ArrowLeft size={20} />
             </button>
          </div>

          <div className="px-8 pb-8 relative">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-8 group w-32">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-500 to-blue-500 p-1 shadow-2xl">
                    <div className="w-full h-full rounded-[1.4rem] bg-[#121214] overflow-hidden relative">
                        {formData.profile_picture ? (
                            <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-full h-full p-6 text-gray-500" />
                        )}
                        <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight">{formData.name}</h1>
                   <p className="text-gray-400 font-medium">Manage your professional identity</p>
                </div>
                <div className="flex gap-3">
                   <span className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-semibold capitalize">
                      {user.role}
                   </span>
                   <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold">
                      Trust Score: {user.reputation_score || "0.0"}
                   </span>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Email Address (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-black/20 border border-white/5 p-4 pl-12 rounded-2xl text-gray-600 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Professional Bio</label>
                  <div className="relative group">
                    <Book className="absolute left-4 top-4 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all min-h-[120px] resize-none"
                      placeholder="Tell us about your expertise and background..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400 ml-1">Skills (Comma separated)</label>
                  <div className="relative group">
                    <Save className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 p-4 pl-12 rounded-2xl text-white outline-none transition-all"
                      placeholder="React, Node.js, Design..."
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-3 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
