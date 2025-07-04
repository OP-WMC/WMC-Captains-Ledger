import axios from "axios";

const API_URL = "https://jsonplaceholder.typicode.com/comments";

export const fetchFeedback = async () => {
  const res = await axios.get(`${API_URL}?_limit=5`);
  return res.data;
};

export const submitFeedback = async (feedback) => {
  const res = await axios.post(API_URL, feedback);
  return res.data;
};
