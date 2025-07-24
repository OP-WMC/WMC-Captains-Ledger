import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const email = searchParams.get("email");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/auth/reset-password/${token}?email=${email}`, {
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful");
       // ✅ Redirect to login after 1.5s
       setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error(err?.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !email) {
      toast.error("Invalid reset link");
      navigate("/forgot-password");
    }
  }, [token, email, navigate]);

  

  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-50 dark:bg-black px-4">
      <form
        onSubmit={handleResetPassword}
        className="glass-card p-6 max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">🔒 Reset Password</h2>
        <input
          type="password"
          required
          placeholder="Enter new password"
          className="w-full p-2 rounded border"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
