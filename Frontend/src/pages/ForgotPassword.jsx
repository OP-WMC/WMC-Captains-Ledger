import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
const navigate = useNavigate();

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/forgot-password", { email });

      toast.success(res.data.message || "Reset email sent");
      setEmailSent(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error(err?.response?.data?.error || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Redirect after 5 seconds if email sent
  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000);

      return () => clearTimeout(timer); // Cleanup
    }
  }, [emailSent, navigate]);
  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-50 dark:bg-black px-4">
     {emailSent ? (
  <div className="text-center text-green-500">
    ✅ Password reset link has been sent to <strong>{email}</strong>. <br />
    Please check your inbox and follow the instructions.
  </div>
) : (
      <form
        onSubmit={handleSendResetLink}
        className="glass-card p-6 max-w-md w-full space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">🔑 Forgot Password</h2>
        <p className="text-sm text-gray-500 text-center">
          Enter your email to receive a reset link
        </p>
        <input
          type="email"
          required
          placeholder="Enter registered email"
          className="w-full p-2 rounded border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      )}
    </div>
  );
};

export default ForgotPassword;
