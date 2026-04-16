import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Chat from "./pages/Chat";
import Verification from "./pages/Verification";
import PaymentHistory from "./pages/PaymentHistory";
import Tasks from "./pages/Tasks";
import Trainings from "./pages/Trainings";
import Payment from "./pages/Payment";
import CareerGuidance from "./pages/CareerGuidance";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import MockInterview from "./pages/MockInterview";
import ATSScore from "./pages/ATSScore";
import ProtectedRoute from "./components/ProtectedRoute";
import AIChatBot from "./components/AIChatBot";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected – Role Dashboards */}
          <Route path="/admin"      element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/freelancer" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />
          <Route path="/client"     element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />

          {/* Protected – Shared */}
          <Route path="/chat"      element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/verify"    element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/payments"  element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/trainings" element={<ProtectedRoute><Trainings /></ProtectedRoute>} />
          <Route path="/payment"   element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/career-guidance" element={<ProtectedRoute><CareerGuidance /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
          <Route path="/ats-score" element={<ProtectedRoute><ATSScore /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AIChatBot />
      </BrowserRouter>
    </div>
  );
}

export default App;