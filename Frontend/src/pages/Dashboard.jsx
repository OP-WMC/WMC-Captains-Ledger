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

  // Fetch user and missions
  useEffect(() => {
    axios.get("/auth/me", { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(err => console.error("❌ Error fetching user:", err));

    axios.get("/missions")
      .then(res => setMissions(res.data))
      .catch(err => console.error("❌ Error fetching missions:", err));
  }, []);

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

  const recentAnnouncements = mockAnnouncements.slice(0, 3);
    // const getStatusIcon = (status) => {
  //   switch (status) {
  //     case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
  //     case 'ongoing': return <Clock className="w-5 h-5 text-yellow-400" />;
  //     case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
  //     default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
  //   }
  // };

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
              <p className="text-gray-700 dark:text-cyan-300 text-sm flex items-center justify-end gap-1  font-semibold">
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
        <h3 className="text-2xl text-blue-700  dark:text-white font-semibold">24</h3>
      </div>
      <div className="glass-card text-center">
        <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">🛡️ Active Agents</p>
        <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">9</h3>
      </div>
      <div className="glass-card text-center">
        <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">💳 Total Payments</p>
        <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">₹1,75,000</h3>
      </div>
      <div className="glass-card text-center">
        <p className="text-gray-700 font-bold dark:text-cyan-300 mb-1">📊 Attendance Rate</p>
        <h3 className="text-2xl text-blue-700 dark:text-white font-semibold">88%</h3>
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
                key={announcement.id} 
                className="flex items-center justify-between p-4  dark:bg-avengers-gray/30 rounded-lg">
              
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1  p-4 bg-blue-100 dark:bg-cyan-950/40 rounded-lg transition-transform hover:scale-105">
                    <h3 className="text-gray-700 dark:text-white text-lg font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-gray-700 dark:text-cyan-300 mt-2">{announcement.content}</p>
                    <p className="text-xs text-gray-700 dark:text-cyan-300 mt-3">
                      By {announcement.author} • {announcement.date}
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