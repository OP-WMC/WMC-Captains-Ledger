import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {  Calendar, Clock, CheckCircle, XCircle, Key, Users, AlertTriangle, Copy, RefreshCw } from 'lucide-react';
// import Calendar from 'react-calendar';

const Attendance = () => {
  const { user, isAdmin, token } = useAuth(); // ✅ fixed — get token here
  const [attendanceCode, setAttendanceCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
const [loadingTodayStatus, setLoadingTodayStatus] = useState(true);

  // Handle code expiry timeout
  useEffect(() => {
    if (codeExpiry) {
      const timer = setTimeout(() => {
        setCodeExpiry(null);
        setAttendanceCode('');
      }, 60000); // 1 minute

      return () => clearTimeout(timer);
    }
  }, [codeExpiry]);

   // ✅ NEW: Check if user has marked today
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("/attendance/marked-today", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasMarkedToday(res.data.marked);
      } catch (err) {
        console.error("Failed to fetch marked-today status:", err);
      } finally {
        setLoadingTodayStatus(false);
      }
    };

    if (!isAdmin) fetchStatus(); // only for users
  }, [isAdmin, token]);

  // ADMIN: Start attendance session
  const generateCode = async () => {
    try {
      console.log("Token in generateCode:", token);
      const res = await axios.post("/attendance/start", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAttendanceCode(res.data.code);
      setCodeExpiry(new Date(res.data.expiresAt));
      setMessage("✅ Attendance code generated!");
    } catch (err) {
      setMessage("❌ Failed to generate code");
      console.error(err);
    }
  };

  // USER: Mark attendance
  const markAttendance = async () => {
    try {
      if (!userCode) {
        setMessage("❌ Please enter attendance code");
        return;
      }

      setLoading(true);
      const res = await axios.post("/attendance/mark", {
        code: userCode
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage(res.data.msg || "✅ Attendance marked!");
      setUserCode('');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.msg || "❌ Failed to mark attendance");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(attendanceCode);
    setMessage('📋 Code copied to clipboard!');
  };



  return (
  <div className="p-6 space-y-6">
    <h2 className="text-2xl font-bold text-avengers-gold flex items-center gap-2">
      <Calendar /> Attendance System
    </h2>

    {message && (
      <div className="text-sm text-yellow-400 font-medium">{message}</div>
    )}

    {isAdmin && (
      <div className="space-y-4 bg-avengers-dark p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={generateCode}
            className="bg-avengers-gold text-black px-4 py-2 rounded-xl font-semibold hover:bg-yellow-400"
          >
            <RefreshCw className="inline w-4 h-4 mr-1" /> Start Attendance
          </button>

          {attendanceCode && (
            <div className="flex items-center gap-2 text-lg font-mono">
              <Key className="w-5 h-5 text-green-400" />
              <span>{attendanceCode}</span>
              <button onClick={copyCode}><Copy className="w-4 h-4 text-gray-400 hover:text-white" /></button>
            </div>
          )}
        </div>

        {codeExpiry && (
          <div className="text-sm text-gray-400">
            Code expires at: {new Date(codeExpiry).toLocaleTimeString()}
          </div>
        )}
      </div>
    )}

    {!isAdmin && !loadingTodayStatus && (
  <div className="bg-avengers-dark p-4 rounded-xl space-y-4">
    {hasMarkedToday ? (
      <div className="text-green-400 font-semibold text-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5" /> Attendance already marked for today ✅
      </div>
    ) : (
      <>
        <label className="block text-sm text-avengers-silver font-medium">
          Enter Attendance Code
        </label>
        <input
          type="text"
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          maxLength={6}
          className="px-3 py-2 rounded-lg bg-gray-800 text-white focus:outline-none w-40"
        />
        <button
          onClick={markAttendance}
          disabled={loading}
          className="bg-avengers-gold text-black px-4 py-2 rounded-xl font-semibold hover:bg-yellow-400"
        >
          {loading ? 'Marking...' : 'Mark Attendance'}
        </button>
      </>
    )}
  </div>
)}




    <div className="mt-6">
      <h3 className="text-xl font-semibold text-avengers-silver flex items-center gap-2">
        <Users /> Attendance Stats
      </h3>

      {/* Static or example bar graph using Recharts */}
      <div className="w-full h-72 bg-gray-900 mt-4 p-4 rounded-xl">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            { name: 'Steve', attendance: 80 },
            { name: 'Tony', attendance: 65 },
            { name: 'Sam', attendance: 92 },
            { name: 'Natasha', attendance: 75 },
            { name: 'Bruce', attendance: 50 },
          ]}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="attendance" fill="#facc15" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
  )};

export default Attendance;