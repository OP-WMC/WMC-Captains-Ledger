import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const fetchAttendanceStats = async () => {
  const res = await axios.get(`${API_BASE}/attendance/stats`, { withCredentials: true });
  return res.data;
};

export const fetchAttendanceTrends = async (days = 30) => {
  const res = await axios.get(`${API_BASE}/attendance/trends?days=${days}`, { withCredentials: true });
  return res.data;
};

export const fetchPaymentStats = async () => {
  const res = await axios.get(`${API_BASE}/transactions/stats`, { withCredentials: true });
  return res.data;
};

export const fetchPaymentTrends = async (days = 30) => {
  const res = await axios.get(`${API_BASE}/transactions/trends?days=${days}`, { withCredentials: true });
  return res.data;
}; 