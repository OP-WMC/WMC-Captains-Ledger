import axios from "./axios";

const API_URL = "http://localhost:5000/api/announcements";

export const fetchAnnouncements = async () => {
  const res = await axios.get(API_URL, { withCredentials: true });
  return res.data;
};

export const submitAnnouncement = async (announcement) => {
  const res = await axios.post(API_URL, announcement, { withCredentials: true });
  return res.data;
};
