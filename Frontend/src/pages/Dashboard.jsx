import { useEffect, useState } from 'react';
import axios from '../api/axios'; // Use your Axios instance
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

import { mockMissions, mockStats, mockAnnouncements } from '../services/mockData';

const Dashboard = () => {
  const [user, setUser] = useState(null); // ← only user state needed now

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => setUser(res.data))
      .catch(err => console.error("❌ Error fetching user:", err));
  }, []);

  const isAdmin = user?.role === 'admin';
  const userMissions = mockMissions.filter(mission =>
    mission.assignedMembers.includes(user?.name)
  );
  
  const recentAnnouncements = mockAnnouncements.slice(0, 3);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ongoing': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'ongoing': return 'status-ongoing';
      case 'failed': return 'status-failed';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
              Welcome back, {user?.codename}
            </h1>
            <p className="text-avengers-silver">
              {isAdmin ? 'Command Center Dashboard' : 'Agent Dashboard'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-avengers-silver text-sm flex items-center justify-end gap-1">
              💰 Wallet Balance:
            </p>
            <p className="text-2xl font-bold font-orbitron text-avengers-gold">
              ₹{user?.balance?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-avengers-silver text-sm">Total Missions</p>
              <p className="text-2xl font-orbitron font-bold text-white">
                {mockStats.missions.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-avengers-blue to-avengers-light-blue rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-avengers-silver text-sm">Active Agents</p>
              <p className="text-2xl font-orbitron font-bold text-white">
                {mockStats.attendance ? Object.keys(mockStats.attendance).length : 4}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-avengers-silver text-sm">Total Payments</p>
              <p className="text-2xl font-orbitron font-bold text-white">
                ₹{mockStats.payments.total.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-avengers-gold to-yellow-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-avengers-silver text-sm">Attendance Rate</p>
              <p className="text-2xl font-orbitron font-bold text-white">
                {mockStats.attendance ? Math.round(Object.values(mockStats.attendance).reduce((a, b) => a + b, 0) / Object.values(mockStats.attendance).length) : 90}%
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missions Section */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            {isAdmin ? 'All Missions' : 'Your Missions'}
          </h2>
          <div className="space-y-3">
            {(isAdmin ? mockMissions : userMissions).slice(0, 4).map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-3 bg-avengers-gray/30 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-white">{mission.title}</h3>
                  <p className="text-sm text-avengers-silver">{mission.location}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.status)}`}>
                  {getStatusIcon(mission.status)}
                  <span className="ml-1 capitalize">{mission.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/missions" className="text-avengers-light-blue hover:text-avengers-blue font-medium">
              View all missions →
            </a>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            Recent Announcements
          </h2>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div 
                key={announcement.id} 
                className={`p-3 rounded-lg ${announcement.important ? 'important-announcement' : 'bg-avengers-gray/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{announcement.title}</h3>
                    <p className="text-sm text-avengers-silver mt-1">{announcement.content}</p>
                    <p className="text-xs text-avengers-silver/70 mt-2">
                      By {announcement.author} • {announcement.date}
                    </p>
                  </div>
                  {announcement.important && (
                    <AlertTriangle className="w-5 h-5 text-avengers-red flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a href="/announcements" className="text-avengers-light-blue hover:text-avengers-blue font-medium">
              View all announcements →
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

export default Dashboard; 