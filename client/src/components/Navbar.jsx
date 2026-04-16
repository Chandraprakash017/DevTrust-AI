import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { User, LogOut, Settings, Bell, Sun, Moon, ChevronDown } from "lucide-react";

export default function Navbar({ title }) {
  const [noti, setNoti] = useState([]);
  const [showNoti, setShowNoti] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    if (!user) return;
    axios
      .get(`http://localhost:5000/api/notifications/${user.id}`)
      .then((res) => setNoti(res.data))
      .catch(() => {});
  }, []);

  const toggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
      {/* Title */}
      <h1 className="font-bold text-lg text-gray-800 dark:text-white">
        {title || "Dashboard"}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-4">

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDark}
          className="text-lg hover:scale-110 transition"
          title="Toggle dark mode"
        >
          {dark ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative text-lg hover:scale-110 transition"
            onClick={() => setShowNoti(!showNoti)}
          >
            🔔
            {noti.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {noti.length}
              </span>
            )}
          </button>

          {showNoti && (
            <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-xl w-72 z-50 max-h-64 overflow-y-auto">
              <div className="p-3 border-b dark:border-gray-700 font-semibold text-sm">
                Notifications
              </div>
              {noti.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No notifications</p>
              ) : (
                noti.map((n) => (
                  <div key={n.id} className="p-3 text-sm border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {n.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white overflow-hidden shadow-sm">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">
                  {user.name?.split(" ")[0]}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-2xl rounded-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                
                <Link 
                  to="/profile" 
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User size={16} className="text-purple-500" />
                  My Profile
                </Link>
                
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings size={16} className="text-blue-500" />
                  Account Settings
                </button>

                <div className="border-t dark:border-gray-700 mt-1">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout Securely
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}