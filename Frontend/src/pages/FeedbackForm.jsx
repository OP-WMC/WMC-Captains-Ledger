import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../api/axios";

const FeedbackForm = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post("/feedback/submit", {
        transactionId,
        rating,
        comment
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("✅ Feedback submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Feedback error:", err);
      setMessage("❌ Feedback already submitted or error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h2 className="text-2xl mb-4 font-orbitron">📝 Transaction Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <div>
          <label>Rating (1 to 5):</label>
          <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} className="w-full p-2 text-black" required />
        </div>
        <div>
          <label>Comment:</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-2 text-black" />
        </div>
        <button type="submit" className="avengers-button w-full">Submit Feedback</button>
      </form>
      {message && <p className="mt-4 text-sm text-avengers-silver">{message}</p>}
    </div>
  );
};

export default FeedbackForm;
