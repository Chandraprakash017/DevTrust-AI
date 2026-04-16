import { NavLink, useNavigate } from "react-router-dom";

const FREELANCER_LINKS = [
  { to: "/freelancer", label: "🏠 Dashboard" },
  { to: "/tasks",      label: "📋 Tasks" },
  { to: "/chat",       label: "💬 Chat" },
  { to: "/mock-interview", label: "🧠 AI Mock Interview" },
  { to: "/ats-score",  label: "🎯 ATS Resume Score" },
  { to: "/career-guidance", label: "🚀 Career Navigator" },
  { to: "/subscription", label: "💎 Pro Membership" },
  { to: "/verify",     label: "📄 Verification" },
  { to: "/payments",   label: "💰 Payments" },
];

const CLIENT_LINKS = [
  { to: "/client",   label: "🏠 Dashboard" },
  { to: "/tasks",    label: "📋 Browse Tasks" },
  { to: "/chat",     label: "💬 Chat" },
  { to: "/payment",  label: "💳 Make Payment" },
  { to: "/payments", label: "💰 Payment History" },
];

const ADMIN_LINKS = [
  { to: "/admin",     label: "👑 Overview" },
  { to: "/tasks",     label: "📋 Manage Tasks" },
  { to: "/trainings", label: "🎓 Manage Trainings" },
  { to: "/verify",    label: "🔍 Verifications" },
  { to: "/chat",      label: "💬 Chat" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  const role = user?.role || "freelancer";

  const links =
    role === "admin"
      ? ADMIN_LINKS
      : role === "client"
      ? CLIENT_LINKS
      : FREELANCER_LINKS;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
      isActive
        ? "bg-purple-600 text-white shadow-md"
        : "text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b dark:border-gray-700">
        <h2 className="text-2xl font-extrabold text-purple-600">DevTrust</h2>
        <p className="text-xs text-gray-400 mt-1 capitalize">
          {role} Portal
        </p>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 flex items-center gap-3 border-b dark:border-gray-700">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              {user.plan === 'pro' && (
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black tracking-tighter shadow-lg shadow-purple-500/20">PRO</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/admin" || link.to === "/freelancer" || link.to === "/client"}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-xl transition font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
}