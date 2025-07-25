import axios from "./axios"; // your axios instance with withCredentials: true

export const fetchFeedback = async () => {
  const res = await axios.get("/feedback", { withCredentials: true }); // Added withCredentials for consistency
  return res.data;
};

// NEW: Function to delete feedback by ID
export const deleteFeedback = async (id) => {
  const res = await axios.delete(`/feedback/${id}`, { withCredentials: true });
  return res.data;
};