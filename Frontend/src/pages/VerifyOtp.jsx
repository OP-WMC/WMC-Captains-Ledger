import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Go register again.");
      return;
    }

    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }

    try {
      await axios.post(
        "/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );
      toast.success("✅ Email verified successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Verify OTP error:", err);
      toast.error(err?.response?.data?.error || "❌ Verification failed");
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email not found. Go register again.");
      return;
    }

    if (cooldown > 0 || isResending) return;

    try {
      setIsResending(true);
      await axios.post(
        "/auth/resend-otp",
        { email },
        { withCredentials: true }
      );
      toast.success("📨 OTP resent to your email");
      setCooldown(30);
    } catch (err) {
      console.error("Resend OTP error:", err);
      toast.error(err?.response?.data?.error || "❌ Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-xl font-bold text-blue-600">🔐 Verify Your Email</h1>
      <p className="text-sm text-gray-600 mb-4">
        Enter the 6-digit OTP sent to your email
      </p>

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          placeholder="Enter OTP"
          className="border p-2 rounded-md text-center w-40"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Verify OTP
        </button>
      </form>

      <button
        onClick={handleResendOtp}
        disabled={cooldown > 0 || isResending}
        className={`text-blue-500 hover:underline mt-4 text-sm flex items-center gap-2 ${
          cooldown > 0 || isResending ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isResending ? (
          <>
<Loader className="w-4 h-4 animate-spin" />
            Sending OTP...
          </>
        ) : cooldown > 0 ? (
          `Resend OTP in ${cooldown}s`
        ) : (
          "Resend OTP"
        )}
      </button>
    </div>
  );
};

export default VerifyOtp;
