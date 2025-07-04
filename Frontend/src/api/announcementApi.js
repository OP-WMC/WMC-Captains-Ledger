import axios from "axios";

const API_URL = "https://jsonplaceholder.typicode.com/posts";

export const fetchAnnouncements = async () => {
  const res = await axios.get(`${API_URL}?_limit=5`);
  return res.data;
};

export const submitAnnouncement = async (announcement) => {
  const res = await axios.post(API_URL, announcement);
  return res.data;
};
