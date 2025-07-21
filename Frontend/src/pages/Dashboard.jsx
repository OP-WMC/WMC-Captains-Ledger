import { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
  Shield,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import Modal from 'react-modal';
import Loader from '../components/Loader';

import { mockAnnouncements } from '../services/mockData';
import { fetchAnnouncements } from '../api/announcementApi';
import { fetchAttendanceStats, fetchPaymentStats, fetchAttendanceStatsForUser, fetchPaymentStatsForUser, fetchUserPaymentStats } from '../api/statsApi';

const Dashboard = () => {
  // On first load of dashboard, ensure dark mode is ON
    // document.documentElement.classList.add("dark");
  const [user, setUser] = useState(null);
  const [missions, setMissions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
  const storedTheme = localStorage.getItem("theme");

  // If user has a stored preference, respect it.
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;

  // 🆕 If no preference stored, default to dark
  return true;
});

  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [userPaymentStats, setUserPaymentStats] = useState(null);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [pendingMission, setPendingMission] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declineFile, setDeclineFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  // Fetch user, missions, users, announcements, stats
  useEffect(() => {
    axios.get("/auth/me", { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(err => console.error("❌ Error fetching user:", err));

    axios.get("/missions")
      .then(res => setMissions(res.data))
      .catch(err => console.error("❌ Error fetching missions:", err));

    // Fetch all users for Active Agents
    axios.get("/auth/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error("❌ Error fetching users:", err));

    // Fetch announcements (real)
    fetchAnnouncements()
      .then(data => {
        setAnnouncements(data);
        setAnnouncementsLoading(false);
      })
      .catch(err => {
        console.error("❌ Error fetching announcements:", err);
        setAnnouncementsLoading(false);
      });
  }, []);

  // Fetch stats (admin vs user)
  useEffect(() => {
    if (user === null) return;
    if (user?.role === 'admin') {
      fetchPaymentStats()
        .then(res => setPaymentStats(res))
        .catch(err => console.error("❌ Error fetching payment stats:", err));
      fetchAttendanceStats()
        .then(res => setAttendanceStats(res))
        .catch(err => console.error("❌ Error fetching attendance stats:", err));
    } else {
      fetchPaymentStatsForUser()
        .then(res => setPaymentStats(res))
        .catch(err => console.error("❌ Error fetching payment stats (user):", err));
      fetchAttendanceStatsForUser()
        .then(res => setAttendanceStats(res))
        .catch(err => console.error("❌ Error fetching attendance stats (user):", err));
      fetchUserPaymentStats()
        .then(res => setUserPaymentStats(res))
        .catch(err => console.error("❌ Error fetching user payment stats:", err));
    }
  }, [user]);

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get("/feedback", { withCredentials: true });
        setFeedbacks(res.data);
      } catch (err) {
        console.error("❌ Error fetching feedbacks:", err);
      }
    };
    fetchFeedbacks();
  }, []);

  // Theme logic
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  const isAdmin = user?.role === 'admin';
  const userMissions = missions.filter(
    (m) =>
      Array.isArray(m.assignedMembers) &&
      user?.name &&
      m.assignedMembers.some((member) => {
        const memberName = typeof member === 'string' ? member : (member?.name || '');
        return memberName && memberName.trim().toLowerCase() === user.name.trim().toLowerCase();
      })
  );

  // Announcements logic
  let recentAnnouncements = [];
  if (!announcementsLoading && announcements && announcements.length > 0) {
    recentAnnouncements = announcements.slice(0, 3);
  } else {
    recentAnnouncements = mockAnnouncements.slice(0, 3);
  }

  // Stats logic
  const totalMissions = missions.length;
  const activeAgents = users.length;
  let totalPayments = '...';
  if (user && user.role === 'admin') {
    totalPayments = paymentStats?.totalAmount !== undefined ? `₹${paymentStats.totalAmount.toLocaleString()}` : '...';
  } else if (userPaymentStats) {
    const sent = userPaymentStats.totalSent || 0;
    const received = userPaymentStats.totalReceived || 0;
    totalPayments = `₹${(sent + received).toLocaleString()}`;
  }
  let attendanceRate = '...';
  if (attendanceStats && user) {
    if (user.role === 'admin') {
      // Show average attendance percentage for admin
      if (attendanceStats.userStats && attendanceStats.userStats.length > 0) {
        const avg = Math.round(
          attendanceStats.userStats.reduce((sum, u) => sum + (u.attendancePercentage || 0), 0) / attendanceStats.userStats.length
        );
        attendanceRate = `${avg}%`;
      } else {
        attendanceRate = '0%';
      }
    } else {
      attendanceRate = attendanceStats.attendancePercentage !== undefined ? `${attendanceStats.attendancePercentage}%` : '0%';
    }
  }

  // Check for pending mission assignments for this user
  useEffect(() => {
    if (!isAdmin && user && userMissions.length > 0) {
      const now = new Date();
      const pending = userMissions.find(m => {
        const member = m.assignedMembers.find(mem => mem.name === user.name);
        // Only show if still pending and mission endDate is in the future
        return member && member.status === 'pending' && new Date(m.endDate) > now;
      });
      if (pending) {
        setPendingMission(pending);
        setShowMissionModal(true);
      } else {
        setPendingMission(null);
        setShowMissionModal(false);
      }
    }
  }, [user, userMissions, isAdmin]);

  const handleAcceptMission = async () => {
    if (!pendingMission) return;
    setSubmitting(true);
    try {
      await axios.post(`/missions/${pendingMission._id}/accept`, {}, { withCredentials: true });
      setShowMissionModal(false);
      setPendingMission(null);
      window.location.reload();
    } catch (err) {
      alert('Failed to accept mission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeclineMission = async (e) => {
    e.preventDefault();
    if (!pendingMission) return;
    setSubmitting(true);
    try {
      let fileUrl = '';
      if (declineFile) {
        // Upload file to server (implement endpoint as needed)
        const formData = new FormData();
        formData.append('file', declineFile);
        const uploadRes = await axios.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
        fileUrl = uploadRes.data.url;
      }
      await axios.post(`/missions/${pendingMission._id}/decline`, {
        declineReason,
        declineFile: fileUrl
      }, { withCredentials: true });
      setShowMissionModal(false);
      setPendingMission(null);
      window.location.reload();
    } catch (err) {
      alert('Failed to decline mission.');
    } finally {
      setSubmitting(false);
    }
  };

  // When modal opens, reset decline form state
  useEffect(() => {
    if (!showMissionModal) {
      setShowDeclineForm(false);
      setDeclineReason('');
      setDeclineFile(null);
    }
  }, [showMissionModal]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full  overflow-visible">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-blue-700 dark:text-white dark:text-shadow-glow mb-1 sm:mb-2">
              Welcome back, {user?.codename}
            </h1>
            <p className="text-slate-600 dark:text-cyan-100 text-sm sm:text-base">
              {isAdmin ? 'Command Center Dashboard' : 'Agent Dashboard'}
            </p>
          </div>
          {/* Dark Mode Toggle and Wallet */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
            <label className="flex items-center cursor-pointer space-x-2 group">
              <span className="text-xs sm:text-sm text-cyan-300">☀️</span>
              <input
                type="checkbox"
                id="theme-toggle"
                className="sr-only peer"
                checked={darkMode}
                onChange={toggleTheme}
              />
              <div className={`w-8 sm:w-12 h-5 sm:h-6 rounded-full bg-blue-700 relative transition-all duration-300 ring-1 ring-violet-400/30 shadow-md
                ${darkMode ? "bg-blue-800 dark:bg-cyan-300 shadow-[0_0_15px_#a78bfa]" : ""}
              `}>
                <div
                  className={`w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300
                    ${darkMode ? "left-6 sm:left-6" : "left-0.5"}
                  `}
                ></div>
              </div>
              <span className="text-xs sm:text-sm text-cyan-300">🌙</span>
            </label>
            <div className="text-right w-full sm:w-auto">
              <p className="text-gray-700 dark:text-cyan-300 text-xs sm:text-m flex items-center justify-end gap-1 font-semibold">
                💰 Wallet Balance:
              </p>
              <p className="text-2xl sm:text-3xl font-orbitron font-bold text-blue-700 dark:text-yellow-400 dark:text-shadow-glow">
                ₹{user?.balance?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ">
        <div className="glass-card transform-gpu will-change-transform hover:scale-[1.02] transition-transform duration-300 text-center ">
          <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">🗺️ Total Missions</p>
          <h3 className="text-2xl text-blue-700  dark:text-white font-semibold">{totalMissions}</h3>
        </div>
        <div className="glass-card text-center">
          <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">🛡️ Active Agents</p>
          <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">{activeAgents}</h3>
        </div>
        <div className="glass-card text-center">
          <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">💳 Total Payments</p>
          <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">{totalPayments}</h3>
        </div>
        <div className="glass-card text-center">
          <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">📊 {isAdmin ? 'Avg Attendance Rate' : 'Attendance Rate'}</p>
          <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">{attendanceRate}</h3>
        </div>
        
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Missions Section */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">
            {isAdmin ? '🗺️ All Missions' : '🗺️ Your Missions'}
          </h2>
          <div className="space-y-3">
            {(isAdmin ? missions : userMissions).slice(0, 4).map((mission) => (
              <div key={mission._id} className="flex items-center justify-between p-4 dark:bg-avengers-gray/30 rounded-lg">
                <div className="flex-1 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-transform hover:scale-105">
                  <h3 className="text-gray-700 font-semibold dark:text-white  text-lg">{mission.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-cyan-300">{mission.location}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  {/* {getStatusIcon(mission.status)} */}
                  {/* <span className="capitalize">{mission.status}</span> */}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <a href="/missions" className="text-blue-700 dark:text-white text-shadow-glow font-medium">
              View all missions →
            </a>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">
            Recent Announcements
          </h2>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div 
                key={announcement._id || announcement.id} 
                className="flex items-center justify-between p-4  dark:bg-avengers-gray/30 rounded-lg">
              
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1  p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-transform hover:scale-105">
                    <h3 className="text-gray-700 dark:text-white text-lg font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-cyan-300 mt-2">{announcement.body || announcement.content}</p>
                    <p className="text-xs text-gray-700 dark:text-cyan-300 mt-3">
                      By {announcement.author || 'Admin'} • {announcement.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/announcements" className="text-blue-700 dark:text-white text-shadow-glow font-medium">
              View all announcements →
            </a>
          </div>
        </div>
      </div>
      {/* New feedback... */}
      {/* Feedback Section */}
      {isAdmin && (
        <div className="glass-card mt-4 sm:mt-6 overflow-hidden">
          <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">Recent Feedback</h2>
          <ul className="space-y-3">
            {feedbacks.slice(0, 3).map((fb) => {
              const stars = Array.from({ length: fb.rating }, (_, i) => (
                <span key={i}>⭐</span>
              ));

              return (
                <li key={fb._id || fb.id} className="flex-1 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg transition-transform transform-gpu will-change-transform hover:scale-[1.02]">
                  <p className="text-gray-700 dark:text-white font-semibold text-lg">
                    From: {fb.user?.name || fb.user?.codename || "Anonymous"} • {stars}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-cyan-300">{fb.comment}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-3">
            <a href="/feedback" className="text-blue-700 dark:text-white text-shadow-glow font-medium">
              View all feedback →
            </a>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="glass-card">
        <h2 className="text-lg sm:text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-2 sm:mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
          <a 
            href="/send-money" 
            className="p-4 bg-gradient-to-r from-avengers-blue to-avengers-light-blue rounded-lg text-white text-center hover:from-avengers-light-blue hover:to-avengers-blue transition-all duration-300"
          >
            <DollarSign className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Send Money</span>
          </a>
          <a 
            href="/attendance" 
            className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center hover:from-green-600 hover:to-green-500 transition-all duration-300"
          >
            <Calendar className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Mark Attendance</span>
          </a>
          <a 
            href="/feedback" 
            className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-center hover:from-purple-600 hover:to-purple-500 transition-all duration-300"
          >
            <Users className="w-8 h-8 mx-auto mb-2" />
            <span className="font-medium">Submit Feedback</span>
          </a>
        </div>
      </div>

      {/* Mission Assignment Modal */}
      <Modal
        isOpen={showMissionModal}
        onRequestClose={() => setShowMissionModal(false)}
        className="bg-blue-100 dark:bg-gray-900 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto mt-12 sm:mt-24 relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
        ariaHideApp={false}
      >
        {pendingMission && (
          <div>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-6 text-center">New Mission Assigned</h2>
            <div className="mb-4">
              <div className="font-semibold text-lg text-blue-700 dark:text-white">{pendingMission.title}</div>
              <div className="text-gray-700 dark:text-cyan-200">{pendingMission.description}</div>
              <div className="text-gray-700 dark:text-cyan-200">📍 {pendingMission.location}</div>
              <div className="text-gray-700 dark:text-cyan-200">📆 {pendingMission.startDate} - {pendingMission.endDate}</div>
            </div>
            {!showDeclineForm ? (
              <div className="flex gap-4 mt-6">
                <button
                  className="avengers-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleAcceptMission}
                  disabled={submitting}
                >
                  Accept
                </button>
                <button
                  className="avengers-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setShowDeclineForm(true)}
                  disabled={submitting}
                >
                  Decline
                </button>
              </div>
            ) : (
              <form className="mt-6" onSubmit={handleDeclineMission}>
                <label className="block text-gray-700 dark:text-cyan-200 font-semibold mb-2">Reason for Absence</label>
                <textarea
                  className="w-full p-2 rounded border border-gray-400 dark:bg-gray-800 dark:text-white"
                  value={declineReason}
                  onChange={e => setDeclineReason(e.target.value)}
                  required
                />
                <label className="block mt-4 text-gray-700 dark:text-cyan-200 font-semibold mb-2">Attach Medical Certificate (optional)</label>
                <input
                  type="file"
                  className="w-full"
                  onChange={e => setDeclineFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="avengers-button-secondary border-2 border-blue-500 text-gray-700 dark:border-blue-500 dark:text-avengers-silver hover:bg-gray-100 dark:hover:bg-blue-900/10 font-semibold"
                    onClick={() => setShowDeclineForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="avengers-button bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    disabled={submitting}
                  >
                    Submit Reason
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Dashboard; 