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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-blue-700 dark:text-white dark:text-shadow-glow mb-2">
              Welcome back, {user?.codename}
            </h1>
            <p className="text-slate-600 dark:text-cyan-100">
              {isAdmin ? 'Command Center Dashboard' : 'Agent Dashboard'}
            </p>
          </div>

          {/* 🌗 Dark Mode Toggle */}
          <div className="flex items-center gap-6">
            <label className="flex items-center cursor-pointer space-x-2 group">
              <span className="text-sm text-cyan-300">☀️</span>
              <input
                type="checkbox"
                id="theme-toggle"
                className="sr-only peer"
                checked={darkMode}
                onChange={toggleTheme}
              />
              <div className={`w-12 h-6 rounded-full bg-blue-700 relative transition-all duration-300 ring-1 ring-violet-400/30 shadow-md
                ${darkMode ? "bg-blue-800 dark:bg-cyan-300 shadow-[0_0_15px_#a78bfa]" : ""}
              `}>
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300
                    ${darkMode ? "left-6" : "left-0.5"}
                  `}
                ></div>
              </div>
              <span className="text-sm text-cyan-300">🌙</span>
            </label>

            {/* Wallet */}
            <div className="text-right">
              <p className="text-gray-700 dark:text-cyan-300 text-m flex items-center justify-end gap-1  font-semibold">
                💰 Wallet Balance:
              </p>
              <p className="text-3xl font-orbitron font-bold text-blue-700 dark:text-yellow-400 dark:text-shadow-glow">
                ₹{user?.balance?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>



      {/* Stats Cards */}
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
      <div className="glass-card text-center ">
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
        <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">📊 Avg Attendance Rate</p>
        <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">{attendanceRate}</h3>
      </div>
    </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Missions Section */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">
            {isAdmin ? '🗺️ All Missions' : '🗺️ Your Missions'}
          </h2>
<div className="space-y-3">
  {(isAdmin ? missions : userMissions).slice(0, 4).map((mission) => (
    <div key={mission._id} className="flex items-center justify-between p-4 dark:bg-avengers-gray/30 rounded-lg">
      <div className="flex-1 p-4 bg-blue-100 dark:bg-cyan-950/40 rounded-lg transition-transform hover:scale-105">
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
                  <div className="flex-1  p-4 bg-blue-100 dark:bg-cyan-950/40 rounded-lg transition-transform hover:scale-105">
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
  <div className="glass-card mt-6">
    <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">Recent Feedback</h2>
    <ul className="space-y-3">
      {feedbacks.slice(0, 3).map((fb) => {
        const stars = Array.from({ length: fb.rating }, (_, i) => (
          <span key={i}>⭐</span>
        ));

        return (
          <li key={fb._id || fb.id} className="flex-1 p-4 bg-blue-100 dark:bg-cyan-950/40 rounded-lg transition-transform hover:scale-105">
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
        <h2 className="text-xl font-orbitron font-semibold  text-blue-700 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
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
    </div>
  );
};
// };

export default Dashboard; 