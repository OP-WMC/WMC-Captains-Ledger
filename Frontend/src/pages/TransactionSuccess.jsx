import { useEffect, useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

const TransactionSuccess = () => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [latestTransactionId, setLatestTransactionId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch user's most recent transaction on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("/transactions/my-transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.length > 0) {
          // Assuming sorted newest first
          const latest = res.data[0];
          setLatestTransactionId(latest._id);
        }
      } catch (err) {
        console.error("❌ Failed to fetch transactions:", err);
      }
    };

    fetchTransactions();
  }, [token]);

  const handleSendFeedbackMail = async () => {
    try {
      setSending(true);
      setMessage("");

      const feedbackLink = `http://localhost:5173/feedback/${latestTransactionId}`;

      await axios.post(
        "/transactions/send-feedback-mail",
        {
          to: user.email,
          subject: "Captain's Ledger: Your Feedback is Requested",
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>🦸‍♂️ Mission Complete!</h2>
              <p>Dear Agent ${user.codename || user.name},</p>
              <p>Thanks for your recent transaction. Help us improve!</p>
              <a href="${feedbackLink}" target="_blank" style="
                display: inline-block;
                padding: 10px 20px;
                background-color: #4f46e5;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;">
                Leave Feedback
              </a>
              <p>We appreciate your input!</p>
              <p>~ Captain's Ledger Team</p>
            </div>
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("📩 Feedback mail sent successfully!");
    } catch (err) {
      console.error("Mail error:", err);
      setMessage("❌ Failed to send mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white space-y-6 text-center px-4">
      <CheckCircle className="w-24 h-24 text-green-400" />
      <h1 className="text-3xl font-orbitron font-bold">Payment Successful</h1>
      <p className="text-avengers-silver">Your mission funds have been deployed.</p>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Link to="/send-money" className="avengers-button">
          Back to Send Money
        </Link>

        <button
          onClick={handleSendFeedbackMail}
          disabled={sending || !latestTransactionId}
          className="avengers-button bg-purple-500 hover:bg-purple-600"
        >
          {sending ? "Sending Mail..." : (
            <>
              <Mail className="w-5 h-5 mr-2" />
              Send Feedback Mail Again
            </>
          )}
        </button>
      </div>

      {message && (
        <p className="text-sm mt-3 text-avengers-silver">{message}</p>
      )}
    </div>
  );
};

export default TransactionSuccess;
