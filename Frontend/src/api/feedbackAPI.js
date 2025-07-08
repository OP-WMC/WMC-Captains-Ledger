import axios from "./axios";

export const fetchFeedback = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get("/feedback", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
