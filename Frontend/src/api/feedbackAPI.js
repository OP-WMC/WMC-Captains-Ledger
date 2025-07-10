import axios from "./axios"; // your axios instance with withCredentials: true

export const fetchFeedback = async () => {
  const res = await axios.get("/feedback"); // No headers needed
  return res.data;
};
