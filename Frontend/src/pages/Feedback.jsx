import React, { useState, useEffect } from "react";
import FeedbackCard from "../components/FeedbackCard";
import { fetchFeedback } from "../api/feedbackAPI";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await fetchFeedback();
        setFeedbacks(data);
      } catch (err) {
        setError("Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, []);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 font-orbitron text-center">Feedback</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <p>Loading feedbacks...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && feedbacks.length === 0 && (
          <p className="text-gray-500 col-span-2 text-center">No feedback found.</p>
        )}
        {!loading &&
          feedbacks.map((fb) => (
            <FeedbackCard
              key={fb._id || fb.id}
              name={fb.user?.name || fb.user?.codename || "Anonymous"}
              comment={fb.comment}
              rating={fb.rating}
            />
          ))}
      </div>
    </div>
  );
};

export default Feedback;
