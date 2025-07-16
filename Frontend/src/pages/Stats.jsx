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
  Loader2,
  AlertCircle,
  Target,
  Award,
  Activity
} from 'lucide-react';

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
    attended: user.attendedSessions,
    total: user.totalSessions
  })) || [];

  // Prepare attendance trends data
  const attendanceTrendsData = attendanceTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    percentage: trend.attendancePercentage,
    attended: trend.attendedSessions,
    total: trend.totalSessions
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
      <div className="min-h-screen bg-blue-300 dark:bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
          <p className="dark:text-gray-400">Only administrators can view detailed statistics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-black dark:text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-300 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold font-orbitron bg-blue-700  dark:bg-gradient-to-r dark:from-yellow-400 dark:via-orange-500 dark:to-red-500 bg-clip-text text-transparent mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-white dark:text-gray-400 text-lg">
            Comprehensive insights into team performance and financial metrics
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-500 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('attendance')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  view === 'attendance'
                    ? 'bg-blue-500 dark:bg-yellow-500 text-white shadow-lg'
                    : 'text-white dark:text-gray-300 hover:text-white hover:bg-blue-400 dark:hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </button>
              <button
                onClick={() => setView('payment')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  view === 'payment'
                    ? 'bg-blue-500 dark:bg-yellow-500 text-white shadow-lg'
                    : 'text-white dark:text-gray-300 hover:text-white hover:bg-blue-400 dark:hover:bg-gray-700'
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
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {view === 'attendance' ? (
          /* Attendance View */
          <div className="space-y-8 ">
            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6  glass-card ">
              <StatsCard
                title="Total Sessions"
                value={attendanceStats?.totalSessions || 0}
                subtitle="Attendance sessions created"
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
                subtitle="Average team attendance"
                icon={Target}
                color="yellow"
              />
            </div>

            {/* Attendance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card">
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
              />
            </div>

            {/* Top Performers */}
            <div className="bg-gray-500 dark:bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-yellow-400" />
                Top Attendance Performers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceStats?.userStats?.slice(0, 6).map((user, index) => (
                  <div key={user.userId} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{user.name}</span>
                      <span className="text-yellow-400 font-bold">{user.attendancePercentage}%</span>
                    </div>
                    <div className="text-sm text-white dark:text-gray-400">
                      {user.attendedSessions} of {user.totalSessions} sessions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Payment View */
          <div className="space-y-8">
            {/* Payment Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 glass-card">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 glass-card">
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
              />
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-500 dark:bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-yellow-400" />
                Payment Summary by User
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentStats?.userPaymentStats?.slice(0, 6).map((user) => (
                  <div key={user.userId} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/30">
                    <div className="text-white font-semibold mb-2">{user.name}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white dark:text-gray-400">Sent:</span>
                        <span className="text-red-400">₹{user.totalSent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white dark:text-gray-400">Received:</span>
                        <span className="text-green-400">₹{user.totalReceived.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-600 pt-1">
                        <span className="text-white dark:text-gray-300 font-semibold">Net:</span>
                        <span className={`font-semibold ${user.netAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
      </div>
    </div>
  );
};

export default Stats;