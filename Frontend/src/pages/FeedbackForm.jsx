import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const FeedbackForm = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/feedback/submit",
        {
          transactionId,
          rating,
          comment
        }
      );
      setMessage("✅ Feedback submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Feedback error:", err);
      if (err?.response?.status === 403) {
        setMessage("❌ You can only submit feedback for transactions you are involved in.");
      } else if (err?.response?.status === 400) {
        setMessage("❌ Feedback already submitted for this transaction.");
      } else {
        setMessage("❌ Error occurred while submitting feedback.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-white text-blue-700 dark:text-blue-700 font-bold">
      <h2 className="text-2xl mb-2 font-orbitron">📝 Transaction Feedback</h2>
      <p className="text-base text-blue-700 dark:text-blue-700 mb-2 font-rajdhani font-medium">We value your experience! Please rate and share your thoughts below.</p>
      <p className="text-sm text-blue-700 dark:text-blue-700 mb-4">
        Both sender and receiver can submit feedback for this transaction.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 w-80 glass-card bg-white/80 dark:bg-avengers-gray/80 border border-avengers-blue dark:border-avengers-silver/30 shadow-xl animate-fadeInUp">
        <div>
          <label className="block mb-2 text-blue-700 dark:text-avengers-silver font-semibold">Rating:</label>
          <div className="flex items-center space-x-2 justify-center">
            {[1,2,3,4,5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setRating(star)}
                onMouseLeave={() => setRating(rating)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill={star <= rating ? '#f59e0b' : '#cbd5e1'}
                  className={`w-8 h-8 transition-colors duration-150 ${star <= rating ? 'text-yellow-400' : 'text-avengers-silver'} hover:scale-110`}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2 text-blue-700 dark:text-avengers-silver font-semibold">Comment:</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="input-field w-full min-h-[80px] resize-none bg-blue-100 dark:bg-avengers-gray text-blue-700 dark:text-avengers-silver font-semibold placeholder-avengers-silver/70" placeholder="Share your feedback..." />
        </div>
        <button type="submit" className="avengers-button w-full">Submit Feedback</button>
      </form>
      {message && <p className="mt-4 text-sm text-white dark:text-avengers-silver">{message}</p>}
    </div>
  );
};

export default FeedbackForm;
