// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-white/70 dark:bg-black/80">
      <Loader />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}


export default ProtectedRoute;
