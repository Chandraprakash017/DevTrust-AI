import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");

  if (!token || !raw) {
    return <Navigate to="/login" replace />;
  }

  return children;
}