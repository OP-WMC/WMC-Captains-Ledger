import React, { useState, useEffect } from "react";
import FeedbackCard from "../components/FeedbackCard";
import { fetchFeedback, submitFeedback } from "../api/feedbackAPI";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [formData, setFormData] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await fetchFeedback();
        setFeedbacks(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load feedback.");
        setLoading(false);
      }
    };
    loadFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newFeedback = await submitFeedback({
        name: formData.name,
        body: formData.message,
      });
      setFeedbacks([newFeedback, ...feedbacks]);
      setFormData({ name: "", message: "" });
    } catch (err) {
      setError("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 font-orbitron text-center">Feedback</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl mb-10 max-w-xl mx-auto"
      >
        <div className="mb-4">
          <label className="block text-sm mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Message</label>
          <textarea
            value={formData.message}
            required
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-500 px-4 py-2 rounded font-semibold hover:bg-green-600"
        >
          {submitting ? "Sending..." : "Submit Feedback"}
        </button>
      </form>

      {/* Feedback List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <p>Loading feedbacks...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          feedbacks.map((fb) => (
            <FeedbackCard key={fb.id} name={fb.name} body={fb.body} />
          ))}
      </div>
    </div>
  );
};

export default Feedback;