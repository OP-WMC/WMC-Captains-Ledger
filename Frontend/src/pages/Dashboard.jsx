
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

import { fetchAnnouncements } from '../api/announcementApi';
import { fetchAttendanceStats, fetchPaymentStats, fetchAttendanceStatsForUser, fetchPaymentStatsForUser, fetchUserPaymentStats } from '../api/statsApi';

const Dashboard = () => {
  // ...existing code...
  const [user, setUser] = useState(null);
  const [missions, setMissions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") return true;
    if (storedTheme === "light") return false;
    return true;
  });

  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [userPaymentStats, setUserPaymentStats] = useState(null);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  
  
    useEffect(() => {
      const canvas = document.getElementById('particles');
      if (!canvas) return; // avoid error if null
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      const particles = [];
  
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() *7 + 1;
          this.speedY = Math.random() * 5 + 0.5;
          this.alpha = Math.random() * 0.5 + 0.1;
        }
  
        update() {
          this.y += this.speedY;
          if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
          }
        }
  
        draw() {
          ctx.fillStyle = `rgba(0, 224, 255, ${this.alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
  
      function initParticles() {
        for (let i = 0; i < 100; i++) {
          particles.push(new Particle());
        }
      }
  
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.update();
          p.draw();
        });
        requestAnimationFrame(animate);
      }
  
      initParticles();
      animate();
  
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
    }, []);

    
  // ...existing code...

  // Fetch user, missions, users, announcements, stats
  
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [userRes, missionsRes, usersRes, announcementsRes, feedbackRes] = await Promise.all([
        axios.get("/auth/me", { withCredentials: true }),
        axios.get("/missions"),
        axios.get("/auth/users"),
        fetchAnnouncements(),
        axios.get("/feedback", { withCredentials: true })
      ]);

      setUser(userRes.data);
      setMissions(missionsRes.data);
      setUsers(usersRes.data);
      setAnnouncements(announcementsRes);
      setFeedbacks(feedbackRes.data);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
    } finally {
      setAnnouncementsLoading(false);
      setDashboardLoading(false); // hide the loader
    }
  };

  fetchDashboardData();
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

  // if (dashboardLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
  <>
    {/* ✅ Background Particles: always render */}
    <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>

    {/* ✅ Conditional Loader or Dashboard Content */}
    {dashboardLoading ? (
      <div className="flex items-center justify-center min-h-screen z-10 relative">
        <Loader />
      </div>
    ) : (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full  overflow-visible relative">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-blue-700  dark:text-white dark:text-shadow-glow   mb-1 sm:mb-2">
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
              <div className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full bg-blue-700 relative transition-all duration-300 ring-1 ring-violet-400/30 shadow-md
                ${darkMode ? "bg-blue-800 dark:bg-cyan-300 shadow-[0_0_15px_#a78bfa]" : ""}
              `}>
                <div
                  className={`w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300
                    ${darkMode ? "left-5 sm:left-6" : "left-0.5"}
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
        <div className="glass-card  flex flex-col h-full">
          <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4">
            {isAdmin ? '🗺️ All Missions' : '🗺️ Your Missions'}
          </h2>
          <div className="space-y-3">
  {(isAdmin ? missions : userMissions).length === 0 ? (
    <div className="flex justify-center items-center h-72 text-gray-500 dark:text-white py-6">
      No missions assigned yet
    </div>
  ) : (
    (isAdmin ? missions : userMissions).slice(0, 4).map((mission) => (
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
    ))
  )}
</div>

          <div className="mt-auto">
            <a href="/missions" className="text-blue-700 dark:text-white text-shadow-glow font-medium self-start">
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
    </div>
    
    )}
  </>
    );
}

export default Dashboard;