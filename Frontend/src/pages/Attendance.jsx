import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Calendar as LucideCalendar, CheckCircle, Key, Users, Copy, RefreshCw, X, Eye, UserCheck, UserX } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

const Attendance = () => {
  const { isAdmin } = useAuth();

  const [attendanceCode, setAttendanceCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  const [markedDates, setMarkedDates] = useState([]);
  const [loadingTodayStatus, setLoadingTodayStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentActiveCode, setCurrentActiveCode] = useState(null);
  const [showCodePopup, setShowCodePopup] = useState(false);
  
  // New state for date attendance modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateAttendanceData, setDateAttendanceData] = useState(null);
  const [loadingDateData, setLoadingDateData] = useState(false);
  const [attendanceView, setAttendanceView] = useState('present'); // 'present' or 'absent'
  // const [calendarValue, setCalendarValue] = useState(new Date());

  useEffect(() => {
    if (codeExpiry) {
      const timer = setTimeout(() => {
        setCodeExpiry(null);
        setAttendanceCode('');
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [codeExpiry]);

  // Check for active attendance code (for users)
  useEffect(() => {
    const checkActiveCode = async () => {
      if (!isAdmin) {
        try {
          const res = await axios.get("/attendance/current-code");
          if (res.data.code && !hasMarkedToday) {
            setCurrentActiveCode(res.data);
            setShowCodePopup(true);
          } else {
            setCurrentActiveCode(null);
            setShowCodePopup(false);
          }
        } catch (err) {
          console.error("Failed to check active code:", err);
        }
      }
    };

    checkActiveCode();
    // Check every 10 seconds for new codes
    const interval = setInterval(checkActiveCode, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, hasMarkedToday]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("/attendance/marked-today");
        setHasMarkedToday(res.data.marked);
      } catch (err) {
        console.error("Failed to fetch marked-today status:", err);
      } finally {
        setLoadingTodayStatus(false);
      }
    };
    if (!isAdmin) fetchStatus();
  }, [isAdmin]);

  useEffect(() => {
  const fetchMarkedDates = async () => {
    try {
      const res = await axios.get("/attendance/dates");
      setMarkedDates(res.data); 
    } catch (err) {
      console.error("Error fetching marked dates", err);
    }
  };

  if (!isAdmin) {
    fetchMarkedDates();
  }
}, [isAdmin]);

useEffect(() => {
  console.log("Marked Dates: ", markedDates);
}, [markedDates]);

  const generateCode = async () => {
    try {
      const res = await axios.post("/attendance/start", {});
      setAttendanceCode(res.data.code);
      setCodeExpiry(new Date(res.data.expiresAt));
      setMessage("✅ Attendance code generated!");
    } catch (err) {
      setMessage("❌ Failed to generate code");
      console.error(err);
    }
  };

  const markAttendance = async () => {
    try {
      if (!userCode) {
        setMessage("❌ Please enter attendance code");
        return;
      }

      setLoading(true);
      const res = await axios.post("/attendance/mark", { code: userCode });

      setMessage(res.data.msg || "✅ Attendance marked!");
      setUserCode('');
      setLoading(false);
      
      // Update attendance status after marking
      setHasMarkedToday(true);
      setShowCodePopup(false);
      
      // Refresh marked dates
      const datesRes = await axios.get("/attendance/dates");
      setMarkedDates(datesRes.data);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.msg || "❌ Failed to mark attendance");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(attendanceCode);
    setMessage('📋 Code copied to clipboard!');
  };

  const copyActiveCode = () => {
    if (currentActiveCode) {
      navigator.clipboard.writeText(currentActiveCode.code);
      setMessage('📋 Active code copied to clipboard!');
    }
  };

  const markAttendanceWithActiveCode = async () => {
    if (currentActiveCode) {
      setUserCode(currentActiveCode.code);
      await markAttendance();
      // setShowCodePopup(false); // This is now handled in markAttendance function
    }
  };

  // Function to handle calendar date click (admin only)
  const handleDateClick = async (date) => {
    if (!isAdmin) return;
    
    const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
    setSelectedDate(dateString);
    setShowDateModal(true);
    setLoadingDateData(true);
    setAttendanceView('present'); // Reset to present view
    
    try {
      const res = await axios.get(`/attendance/date/${dateString}`);
      setDateAttendanceData(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance data:", err);
      setMessage("❌ Failed to fetch attendance data for this date");
    } finally {
      setLoadingDateData(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-blue-700 dark:text-white dark:text-shadow-glow flex items-center gap-2">
        <LucideCalendar /> Attendance System
      </h2>

      {message && <div className="text-sm text-gray-700 dark:text-white font-medium">{message}</div>}

      {/* ATTENDANCE CODE POPUP */}
      {showCodePopup && currentActiveCode && !isAdmin && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-blue-200 dark:bg-avengers-dark p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-700  dark:text-white">🎯 Active Attendance Code</h3>
              <button 
                onClick={() => setShowCodePopup(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <div className=" bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
                <div className="text-2xl font-mono font-bold text-white dark:text-white">
                  {currentActiveCode.code}
                </div>
                <div className="text-sm text-white dark:text-gray-400 mt-2">
                  Expires at: {new Date(currentActiveCode.expiresAt).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={copyActiveCode}
                  className="flex-1 bg-blue-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Code
                </button>
                <button
                  onClick={markAttendanceWithActiveCode}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATE ATTENDANCE MODAL */}
      {showDateModal && selectedDate && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-blue-300 dark:bg-avengers-dark p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5" /> Attendance for {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <button 
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {loadingDateData ? (
              <div className="text-center py-8">
                <div className="text-avengers-silver">Loading attendance data...</div>
              </div>
            ) : dateAttendanceData ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{dateAttendanceData.totalUsers}</div>
                    <div className="text-sm text-avengers-silver">Total Users</div>
                  </div>
                  <div className="bg-green-400/50 p-4 rounded-lg text-center border border-green-700/30">
                    <div className="text-2xl font-bold text-white ">{dateAttendanceData.presentCount}</div>
                    <div className="text-sm text-avengers-silver ">Present</div>
                  </div>
                  <div className="bg-red-500 dark:bg-red-600/20 p-4 rounded-lg text-center border border-red-500/30">
                    <div className="text-2xl font-bold text-white  ">{dateAttendanceData.absentCount}</div>
                    <div className="text-sm dark:text-avengers-silver ">Absent</div>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setAttendanceView('present')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                      attendanceView === 'present' 
                        ? 'bg-green-400/50 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" /> Present ({dateAttendanceData.presentCount})
                  </button>
                  <button
                    onClick={() => setAttendanceView('absent')}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                      attendanceView === 'absent' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <UserX className="w-4 h-4" /> Absent ({dateAttendanceData.absentCount})
                  </button>
                </div>

                {/* User List */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {attendanceView === 'present' ? (
                      <>
                        <UserCheck className="w-4 h-4 text-green-400" />
                        Present Users
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 text-red-400" />
                        Absent Users
                      </>
                    )}
                  </h4>
                  
                  {attendanceView === 'present' ? (
                    dateAttendanceData.present.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dateAttendanceData.present.map((user, index) => (
                          <div key={user._id || index} className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
                            <div className="font-medium text-white">{user.codename || user.name}</div>
                            <div className="text-sm text-green-400">{user.email}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-white dark:text-gray-400">
                        No users were present on this date
                      </div>
                    )
                  ) : (
                    dateAttendanceData.absent.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dateAttendanceData.absent.map((user, index) => (
                          <div key={user._id || index} className="bg-red-600/20 p-3 rounded-lg border border-red-500/30">
                            <div className="font-medium text-white">{user.codename || user.name}</div>
                            <div className="text-sm text-red-400">{user.email}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-white dark:text-gray-400">
                        All users were present on this date
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white dark:text-gray-400">
                No attendance data available for this date
              </div>
            )}
          </div>
        </div>
      )}

{/* MAIN ACTIONS + CALENDAR in tighter single box */}
<div className="bg-blue-300  glass-card dark:border-gray-700 p-6 rounded-xl shadow-lg">
  <div className="flex flex-col md:flex-row items-start gap-6">
    
    {/* LEFT: Attendance Control */}
    <div className="space-y-4">
      {isAdmin ? (
        <>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={generateCode}
              className=" bg-blue-400 hover:bg-blue-500 dark:bg-blue-900/20 dark:text-white text-white px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700/30"
            >
              <RefreshCw className="inline w-4 h-4 mr-1" /> Start Attendance
            </button>

            {attendanceCode && (
              <div className="flex items-center gap-2 text-lg font-mono">
                <Key className="w-5 h-5 text-green-800 dark:text-green-400" />
                <span>{attendanceCode}</span>
                <button onClick={copyCode}>
                  <Copy className="w-4 h-4 text-white dark:text-white hover:text-white" />
                </button>
              </div>
            )}
          </div>

          {codeExpiry && (
            <div className="text-m text-white dark:text-white">
              Code expires at: {new Date(codeExpiry).toLocaleTimeString()}
            </div>
          )}
        </>
      ) : (
        !loadingTodayStatus && (
          <>
            {hasMarkedToday ? (
              <div className="text-white dark:text-green-400 font-semibold text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Attendance already marked for today ✅
              </div>
            ) : (
              <>
                <label className="block text-m text-white font-bold dark:text-avengers-silver ">
                  Enter Attendance Code
                </label>
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  maxLength={6}
                  className="px-3 py-2 rounded-lg  bg-white font-semibold dark:bg-gray-800 text-blue-500 dark:text-white focus:outline-none w-40"
                />
                <button
                  onClick={markAttendance}
                  disabled={loading}
                  className=" bg-blue-500 hover:bg-green-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700"
                >
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              </>
            )}
          </>
        )
      )}
    </div>

    {/* RIGHT: Calendar - now closer */}
    <div className="w-fit md:w-72">
      <Calendar
        tileClassName={({ date, view }) => {
          if (view === "month") {
            const localDate = date.toLocaleDateString("en-CA"); // gives YYYY-MM-DD
            return markedDates?.includes(localDate) ? "present-day" : null;
          }
        }}
        onClickDay={handleDateClick}
        className={isAdmin ? "cursor-pointer" : ""}
      />
    </div>
  </div>
</div>



      {/* STATS */}
      {/* <div>
        <h3 className="text-xl font-semibold text-avengers-silver flex items-center gap-2">
          <Users /> Attendance Stats
        </h3>
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
      </div> */}
       
    
    </div>
  );
};

export default Attendance;
