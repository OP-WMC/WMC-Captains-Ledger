import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import ChartContainer from '../components/ChartContainer';
import { 
  fetchAttendanceStats, 
  fetchAttendanceTrends, 
  fetchPaymentStats, 
  fetchPaymentTrends 
} from '../api/statsApi';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  AlertCircle,
  Target,
  Award,
  Activity
} from 'lucide-react';
import Loader from '../components/Loader';

const Stats = () => {
  const { isAdmin } = useAuth();
  const [view, setView] = useState('attendance'); // 'attendance' or 'payment'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Attendance data
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  
  // Payment data
  const [paymentStats, setPaymentStats] = useState(null);
  const [paymentTrends, setPaymentTrends] = useState([]);

  
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (isAdmin) {
          // Load both attendance and payment data
          const [attStats, attTrends, payStats, payTrends] = await Promise.all([
            fetchAttendanceStats(),
            fetchAttendanceTrends(30),
            fetchPaymentStats(),
            fetchPaymentTrends(30)
          ]);
          
          setAttendanceStats(attStats);
          setAttendanceTrends(attTrends);
          setPaymentStats(payStats);
          setPaymentTrends(payTrends);
        }
      } catch (err) {
        setError('Failed to load statistics data.');
        console.error('Stats loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  // Prepare attendance chart data
  const attendanceChartData = attendanceStats?.userStats?.slice(0, 10).map(user => ({
    name: user.name,
    attendance: user.attendancePercentage,
    attended: user.attendedDays,
    total: user.totalDays
  })) || [];

  // Prepare attendance trends data
  const attendanceTrendsData = attendanceTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    percentage: trend.attendancePercentage,
    attended: trend.attendedCount,
    total: trend.totalUsers
  }));

  // Prepare payment chart data
  const paymentChartData = paymentStats?.userPaymentStats?.slice(0, 10).map(user => ({
    name: user.name,
    sent: user.totalSent,
    received: user.totalReceived,
    net: user.netAmount
  })) || [];

  // Prepare payment trends data
  const paymentTrendsData = paymentTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: trend.totalAmount,
    count: trend.transactionCount,
    average: trend.averageAmount
  }));

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-blue-300  p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="dark:text-gray-400">Only administrators can view detailed statistics.</p>
        </div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen   p-3 sm:p-6 w-full max-w-full overflow-visible">
      <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>
      <div className="max-w-6xl mx-auto">

        {/* 🌐 Loader while data is fetching */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      ) : (
        <>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold font-orbitron bg-blue-700 dark:text-white  bg-clip-text text-transparent mb-2 sm:mb-4 mt-10 sm:mt-0">
            Analytics Dashboard
          </h1>
          <p className="text-white dark:text-gray-400 text-base sm:text-lg">
            Comprehensive insights into team performance and financial metrics
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800/50 p-1 sm:p-2 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setView('attendance')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  view === 'attendance'
                    ? 'bg-blue-600 dark:bg-blue-900 border border-blue-700/30  text-white shadow-lg'
                    : 'text-white dark:bg-[rgba(255,255,255,0.05)] bg-blue-400 dark:text-gray-300 hover:text-white hover:bg-blue-400 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => setView('payment')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  view === 'payment'
                    ? 'bg-blue-500 dark:bg-blue-900 border border-blue-700/30  text-white shadow-lg'
                    : 'text-white dark:bg-[rgba(255,255,255,0.05)] bg-blue-400 dark:text-gray-300 hover:text-white hover:bg-blue-400 dark:hover:bg-gray-700'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Payments</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 sm:p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {view === 'attendance' ? (
          /* Attendance View */
          <div className="space-y-6 sm:space-y-8">
            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 glass-card">
              <StatsCard
                title="Total Days"
                value={attendanceStats?.totalDays || 0}
                subtitle="Days with attendance sessions"
                icon={Calendar}
                color="blue"
              />
              <StatsCard
                title="Team Members"
                value={attendanceStats?.totalUsers || 0}
                subtitle="Active team members"
                icon={Users}
                color="green"
              />
              <StatsCard
                title="Avg Attendance"
                value={`${attendanceStats?.userStats?.length > 0 ? 
                  Math.round(attendanceStats.userStats.reduce((sum, user) => sum + user.attendancePercentage, 0) / attendanceStats.userStats.length) : 0}%`}
                subtitle="Average team attendance (by days)"
                icon={Target}
                color="yellow"
              />
            </div>

            {/* Attendance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 glass-card ">
              <ChartContainer
                title="Individual Attendance Rates"
                data={attendanceChartData}
                dataKey="attendance"
                xAxisKey="name"
                height={400}
              />
              <ChartContainer
                title="Attendance Trends (Last 30 Days)"
                data={attendanceTrendsData}
                dataKey="percentage"
                xAxisKey="date"
                height={400}
                labelFormat="date"
              />
            </div>

            {/* Top Performers */}
            <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm glass-card">
              <h2 className="text-xl font-semibold text-blue-600  dark:text-white mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-yellow-400" />
                Top Attendance Performers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(attendanceStats?.userStats?.sort((a, b) => b.netAmount - a.netAmount) || [])
                  .slice(0, window.innerWidth < 640 ? 3 : 6)
                  .map((user, index) => (
                  <div key={user.userId} className="bg-white dark:bg-gray-600/30 p-4 rounded-lg border border-blue-300 dark:border-gray-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-600 font-bold dark:text-white">{user.name}</span>
                      <span className="text-blue-700 dark:text-white font-bold">{user.attendancePercentage}%</span>
                    </div>
                    <div className="font-medium text-blue-600 dark:text-gray-200">
                      {user.attendedDays} of {user.totalDays} days
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Payment View */
          <div className="space-y-6 sm:space-y-8">
            {/* Payment Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 glass-card">
              <StatsCard
                title="Total Transactions"
                value={paymentStats?.totalTransactions || 0}
                subtitle="All time transactions"
                icon={Activity}
                color="blue"
              />
              <StatsCard
                title="Total Amount"
                value={`₹${paymentStats?.totalAmount?.toLocaleString() || 0}`}
                subtitle="Total transaction value"
                icon={DollarSign}
                color="green"
              />
              <StatsCard
                title="Average Transaction"
                value={`₹${paymentStats?.averageAmount?.toLocaleString() || 0}`}
                subtitle="Per transaction average"
                icon={TrendingUp}
                color="yellow"
              />
            </div>

            {/* Payment Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 glass-card">
              <ChartContainer
                title="Individual Payment Activity"
                data={paymentChartData}
                dataKey="sent"
                xAxisKey="name"
                height={400}
              />
              <ChartContainer
                title="Payment Trends (Last 30 Days)"
                data={paymentTrendsData}
                dataKey="amount"
                xAxisKey="date"
                height={400}
                labelFormat="date"
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm glass-card">
              <h2 className="text-xl font-semibold text-blue-600 dark:text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-yellow-400" />
                Payment Summary by User
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(paymentStats?.userPaymentStats?.sort((a, b) => b.netAmount - a.netAmount) || [])
                  .slice(0, window.innerWidth < 640 ? 3 : 6)
                  .map((user) => (
                  <div key={user.userId} className="bg-white dark:bg-gray-600/30 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-blue-600 dark:text-white font-semibold mb-2">{user.name}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-500 font-medium dark:text-gray-200">Sent:</span>
                        <span className="text-red-400 font-semibold">₹{user.totalSent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-500 font-medium dark:text-gray-200">Received:</span>
                        <span className="text-green-400 font-semibold">₹{user.totalReceived.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-1">
                        <span className="text-blue-600 dark:text-white font-semibold">Net:</span>
                        <span className={`font-bold ${user.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ₹{user.netAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
         </>
      )}
      </div>
    </div>
  );
};

export default Stats;