// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import axios from '../api/axios';
// import { Calendar as LucideCalendar, CheckCircle, Key, Users, Copy, RefreshCw, X, Eye, UserCheck, UserX } from 'lucide-react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css'; 
// import Loader from '../components/Loader';
// const Attendance = () => {
//   const { isAdmin } = useAuth();

//   const [attendanceCode, setAttendanceCode] = useState('');
//   const [codeExpiry, setCodeExpiry] = useState(null);
//   const [userCode, setUserCode] = useState('');
//   const [hasMarkedToday, setHasMarkedToday] = useState(false);
//   const [markedDates, setMarkedDates] = useState([]);
//   const [loadingTodayStatus, setLoadingTodayStatus] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [currentActiveCode, setCurrentActiveCode] = useState(null);
//   const [showCodePopup, setShowCodePopup] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [monthStats, setMonthStats] = useState(null);
//   const [monthView, setMonthView] = useState(new Date());

//   // New state for date attendance modal
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showDateModal, setShowDateModal] = useState(false);
//   const [dateAttendanceData, setDateAttendanceData] = useState(null);
//   const [loadingDateData, setLoadingDateData] = useState(false);
//   const [attendanceView, setAttendanceView] = useState('present'); // 'present' or 'absent'
//   // const [calendarValue, setCalendarValue] = useState(new Date());

    
//     useEffect(() => {
//       const canvas = document.getElementById('particles');
//       if (!canvas) return; // avoid error if null
//       const ctx = canvas.getContext('2d');
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
  
//       const particles = [];
  
//       class Particle {
//         constructor() {
//           this.x = Math.random() * canvas.width;
//           this.y = Math.random() * canvas.height;
//           this.size = Math.random() *7 + 1;
//           this.speedY = Math.random() * 5 + 0.5;
//           this.alpha = Math.random() * 0.5 + 0.1;
//         }
  
//         update() {
//           this.y += this.speedY;
//           if (this.y > canvas.height) {
//             this.y = 0;
//             this.x = Math.random() * canvas.width;
//           }
//         }
  
//         draw() {
//           ctx.fillStyle = `rgba(0, 224, 255, ${this.alpha})`;
//           ctx.beginPath();
//           ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//           ctx.fill();
//         }
//       }
  
//       function initParticles() {
//         for (let i = 0; i < 100; i++) {
//           particles.push(new Particle());
//         }
//       }
  
//       function animate() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         particles.forEach(p => {
//           p.update();
//           p.draw();
//         });
//         requestAnimationFrame(animate);
//       }
  
//       initParticles();
//       animate();
  
//       window.addEventListener('resize', () => {
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight;
//       });
//     }, []);

  
//   useEffect(() => {
//     setInitialLoading(true);
//   }, []);
//   useEffect(() => {
//     if (codeExpiry) {
//       const timer = setTimeout(() => {
//         setCodeExpiry(null);
//         setAttendanceCode('');
//       }, 60000);
//       return () => clearTimeout(timer);
//     }
//   }, [codeExpiry]);

//   // Check for active attendance code (for users)
//   useEffect(() => {
//     const checkActiveCode = async () => {
//       if (!isAdmin) {
//         try {
//           const res = await axios.get("/attendance/current-code");
//           if (res.data.code && !hasMarkedToday) {
//             setCurrentActiveCode(res.data);
//             setShowCodePopup(true);
//           } else {
//             setCurrentActiveCode(null);
//             setShowCodePopup(false);
//           }
//         } catch (err) {
//           console.error("Failed to check active code:", err);
//         }
//       }
//     };

//     checkActiveCode();
//     // Check every 10 seconds for new codes
//     const interval = setInterval(checkActiveCode, 10000);
//     return () => clearInterval(interval);
//   }, [isAdmin, hasMarkedToday]);

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await axios.get("/attendance/marked-today");
//         setHasMarkedToday(res.data.marked);
//       } catch (err) {
//         console.error("Failed to fetch marked-today status:", err);
//       } finally {
//         setInitialLoading(false);
//         setLoadingTodayStatus(false);
//       }
//     };
//     if (!isAdmin) fetchStatus();
//   }, [isAdmin]);

//   useEffect(() => {
//   const fetchMarkedDates = async () => {
//     try {
//       const res = await axios.get("/attendance/dates");
//       setMarkedDates(res.data); 
//     } catch (err) {
//       console.error("Error fetching marked dates", err);
//     } finally {
//       setInitialLoading(false); // <-- Set to false after fetch
//     }
//   };

//   if (!isAdmin) {
//     fetchMarkedDates();
//   } else {
//     setInitialLoading(false); // <-- For admin, no need to wait
//   }
// }, [isAdmin]);

// useEffect(() => {
//   console.log("Marked Dates: ", markedDates);
// }, [markedDates]);

//   const generateCode = async () => {
//     try {
//       const res = await axios.post("/attendance/start", {});
//       setAttendanceCode(res.data.code);
//       setCodeExpiry(new Date(res.data.expiresAt));
//       setMessage("✅ Attendance code generated!");
//     } catch (err) {
//       setMessage("❌ Failed to generate code");
//       console.error(err);
//     }
//   };
//   useEffect(() => {
//   const fetchMonthlyStats = async () => {
//     try {
//       const y = monthView.getFullYear();
//       const m = monthView.getMonth() + 1;
//       const res = await axios.get(`/attendance/monthly/${y}/${m}`);
//       setMonthStats(res.data);
//     } catch (err) {
//       console.error("Failed to fetch monthly stats", err);
//     }
//   };

//   if (!isAdmin) fetchMonthlyStats();
// }, [monthView, isAdmin]);


//   const markAttendance = async () => {
//     try {
//       if (!userCode) {
//         setMessage("❌ Please enter attendance code");
//         return;
//       }

//       setLoading(true);
//       const res = await axios.post("/attendance/mark", { code: userCode });

//       setMessage(res.data.msg || "✅ Attendance marked!");
//       setUserCode('');
//       setLoading(false);
      
//       // Update attendance status after marking
//       setHasMarkedToday(true);
//       setShowCodePopup(false);
      
//       // Refresh marked dates
//       const datesRes = await axios.get("/attendance/dates");
//       setMarkedDates(datesRes.data);
//     } catch (err) {
//       setLoading(false);
//       setMessage(err.response?.data?.msg || "❌ Failed to mark attendance");
//     }
//   };

//   const copyCode = () => {
//     navigator.clipboard.writeText(attendanceCode);
//     setMessage('📋 Code copied to clipboard!');
//   };

//   const copyActiveCode = () => {
//     if (currentActiveCode) {
//       navigator.clipboard.writeText(currentActiveCode.code);
//       setMessage('📋 Active code copied to clipboard!');
//     }
//   };

//   const markAttendanceWithActiveCode = async () => {
//     if (currentActiveCode) {
//       setUserCode(currentActiveCode.code);
//       await markAttendance();
//       // setShowCodePopup(false); // This is now handled in markAttendance function
//     }
//   };

//   // Function to handle calendar date click (admin only)
//   const handleDateClick = async (date) => {
//     if (!isAdmin) return;
    
//     const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
//     setSelectedDate(dateString);
//     setShowDateModal(true);
//     setLoadingDateData(true);
//     setAttendanceView('present'); // Reset to present view
    
//     try {
//       const res = await axios.get(`/attendance/date/${dateString}`);
//       setDateAttendanceData(res.data);
//     } catch (err) {
//       console.error("Failed to fetch attendance data:", err);
//       setMessage("❌ Failed to fetch attendance data for this date");
//     } finally {
//       setLoadingDateData(false);
//     }
//   };
//   const changeMonth = (offset) => {
//   const newDate = new Date(monthView);
//   newDate.setMonth(newDate.getMonth() + offset);
//   setMonthView(newDate);
// };

//   return (<>
//      <canvas
//       id="particles"
//       className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
//     ></canvas>

//  {/* 🔄 Loader for non-admin while checking today status */}
//     {!isAdmin && loadingTodayStatus && (
//       <div className="flex items-center justify-center min-h-screen z-10 relative">
//         <Loader />
//       </div>
//     )}


//     {/* 🔄 Loader for admin while generating code or data */}
//     {isAdmin && (loading || loadingDateData) && (
//       <div className="flex items-center justify-center min-h-screen z-10 relative">
//         <Loader />
//       </div>
//     )}

//     {initialLoading  ? (
//       <div className="min-h-screen flex items-center justify-center z-10 relative">
//         <Loader />
//       </div>
//     ) : (
//     <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
     
      
//       {/* HEADER */}
//       <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-white dark:text-shadow-glow flex items-center gap-2 mt-10 sm:mt-0">
//         <LucideCalendar /> Attendance System
//       </h2>

//       {message && <div className="text-xs sm:text-sm text-gray-700 dark:text-white font-medium">{message}</div>}

//       {/* ATTENDANCE CODE POPUP */}
//       {showCodePopup && currentActiveCode && !isAdmin && (
//         <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-blue-200 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-md w-full mx-2 sm:mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-700  dark:text-white">🎯 Active Attendance Code</h3>
//               <button 
//                 onClick={() => setShowCodePopup(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <div className="text-center space-y-4">
//               <div className=" bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
//                 <div className="text-2xl font-mono font-bold text-white dark:text-white">
//                   {currentActiveCode.code}
//                 </div>
//                 <div className="text-sm text-white dark:text-gray-400 mt-2">
//                   Expires at: {new Date(currentActiveCode.expiresAt).toLocaleTimeString()}
//                 </div>
//               </div>
              
//               <div className="flex gap-3">
//                 <button
//                   onClick={copyActiveCode}
//                   className="flex-1 bg-blue-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
//                 >
//                   <Copy className="w-4 h-4" /> Copy Code
//                 </button>
//                 <button
//                   onClick={markAttendanceWithActiveCode}
//                   disabled={loading}
//                   className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
//                 >
//                   {loading ? 'Marking...' : 'Mark Attendance'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* DATE ATTENDANCE MODAL */}
//       {showDateModal && selectedDate && isAdmin && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-blue-300 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-4xl w-full mx-2 sm:mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-white dark:text-white flex items-center gap-2">
//                 <Eye className="w-5 h-5" /> Attendance for {new Date(selectedDate).toLocaleDateString()}
//               </h3>
//               <button 
//                 onClick={() => setShowDateModal(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             {loadingDateData ? (
//               <div className="text-center py-8">
//                 <div className="text-avengers-silver">Loading attendance data...</div>
//               </div>
//             ) : dateAttendanceData ? (
//               <div className="space-y-4">
//                 {/* Summary Stats */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div className="bg-gray-800 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-white">{dateAttendanceData.totalUsers}</div>
//                     <div className="text-sm text-avengers-silver">Total Users</div>
//                   </div>
//                   <div className="bg-green-400/50 p-4 rounded-lg text-center border border-green-700/30">
//                     <div className="text-2xl font-bold text-white ">{dateAttendanceData.presentCount}</div>
//                     <div className="text-sm text-avengers-silver ">Present</div>
//                   </div>
//                   <div className="bg-red-500 dark:bg-red-600/20 p-4 rounded-lg text-center border border-red-500/30">
//                     <div className="text-2xl font-bold text-white  ">{dateAttendanceData.absentCount}</div>
//                     <div className="text-sm dark:text-avengers-silver ">Absent</div>
//                   </div>
//                 </div>

//                 {/* View Toggle */}
//                 <div className="flex gap-2 mb-4">
//                   <button
//                     onClick={() => setAttendanceView('present')}
//                     className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
//                       attendanceView === 'present' 
//                         ? 'bg-green-400/50 text-white' 
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     <UserCheck className="w-4 h-4" /> Present ({dateAttendanceData.presentCount})
//                   </button>
//                   <button
//                     onClick={() => setAttendanceView('absent')}
//                     className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
//                       attendanceView === 'absent' 
//                         ? 'bg-red-600 text-white' 
//                         : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                     }`}
//                   >
//                     <UserX className="w-4 h-4" /> Absent ({dateAttendanceData.absentCount})
//                   </button>
//                 </div>

//                 {/* User List */}
//                 <div className="bg-gray-800 rounded-lg p-4">
//                   <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
//                     {attendanceView === 'present' ? (
//                       <>
//                         <UserCheck className="w-4 h-4 text-green-400" />
//                         Present Users
//                       </>
//                     ) : (
//                       <>
//                         <UserX className="w-4 h-4 text-red-400" />
//                         Absent Users
//                       </>
//                     )}
//                   </h4>
                  
//                   {attendanceView === 'present' ? (
//                     dateAttendanceData.present.length > 0 ? (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {dateAttendanceData.present.map((user, index) => (
//                           <div key={user._id || index} className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
//                             <div className="font-medium text-white">{user.codename || user.name}</div>
//                             <div className="text-sm text-green-400">{user.email}</div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-4 text-white dark:text-gray-400">
//                         No users were present on this date
//                       </div>
//                     )
//                   ) : (
//                     dateAttendanceData.absent.length > 0 ? (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {dateAttendanceData.absent.map((user, index) => (
//                           <div key={user._id || index} className="bg-red-600/20 p-3 rounded-lg border border-red-500/30">
//                             <div className="font-medium text-white">{user.codename || user.name}</div>
//                             <div className="text-sm text-red-400">{user.email}</div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="text-center py-4 text-white dark:text-gray-400">
//                         All users were present on this date
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center py-8 text-white dark:text-gray-400">
//                 No attendance data available for this date
//               </div>
//             )}
//           </div>
//         </div>
//       )}

// {/* MAIN ACTIONS + CALENDAR in tighter single box */}
// <div className="bg-blue-300 glass-card dark:border-gray-700 p-3 sm:p-6 rounded-xl shadow-lg">
//   <div className="flex flex-col md:flex-row items-start gap-4 ">
    
//     {/* LEFT: Attendance Control */}
//     <div className=" space-y-3 sm:space-y-4">
//       {isAdmin ? (
//         <>
//           <div className="flex items-center gap-4 flex-wrap">
//             <button
//               onClick={generateCode}
//               className=" bg-blue-400 hover:bg-blue-500 dark:bg-blue-900/20 dark:text-white text-white px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700/30"
//             >
//               <RefreshCw className="inline w-4 h-4 mr-1" /> Start Attendance
//             </button>

//             {attendanceCode && (
//               <div className="flex items-center gap-2 text-lg font-mono">
//                 <Key className="w-5 h-5 text-green-800 dark:text-green-400" />
//                 <span>{attendanceCode}</span>
//                 <button onClick={copyCode}>
//                   <Copy className="w-4 h-4 text-white dark:text-white hover:text-white" />
//                 </button>
//               </div>
//             )}
//           </div>

//           {codeExpiry && (
//             <div className="text-m text-white dark:text-white">
//               Code expires at: {new Date(codeExpiry).toLocaleTimeString()}
//             </div>
//           )}
//         </>
//       ) : (
//         !loadingTodayStatus && (
//           <>
//             {hasMarkedToday ? (
//               <div className="text-blue-600 dark:text-green-400 font-semibold text-lg flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5" /> Attendance already marked for today ✅
//               </div>
//             ) : (
//               <>
//                 <label className="block text-m text-blue-600 font-bold dark:text-avengers-silver ">
//                   Enter Attendance Code
//                 </label>
//                 <input
//                   type="text"
//                   value={userCode}
//                   onChange={(e) => setUserCode(e.target.value)}
//                   maxLength={6}
//                   className="px-3 py-2 rounded-lg  bg-blue-200 font-semibold dark:bg-gray-800 text-blue-500 dark:text-white focus:outline-none w-40"
//                 />
//                 <button
//                   onClick={markAttendance}
//                   disabled={loading}
//                   className=" bg-blue-500 hover:bg-green-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700"
//                 >
//                   {loading ? 'Marking...' : 'Mark Attendance'}
//                 </button>
//               </>
//             )}
//           </>
//         )
//       )}
//     </div>

//    <div className="flex flex-col md:flex-row items-start gap-6 flex-wrap">
//   {/* LEFT: Attendance Control */}
//   <div className="flex-1 space-y-3 sm:space-y-4">
//     {/* ... your existing mark attendance code remains unchanged ... */}
//   </div>

//   {/* RIGHT: Calendar + Monthly Stats */}
//   <div className="flex flex-col w-full md:w-[28rem] gap-4">
//     <Calendar
//       tileClassName={({ date, view }) => {
//         if (view === "month") {
//           const localDate = date.toLocaleDateString("en-CA");
//           return markedDates?.includes(localDate) ? "present-day" : null;
//         }
//       }}
//       onClickDay={handleDateClick}
//       className={isAdmin ? "cursor-pointer" : ""}
//       value={monthView}
//       onActiveStartDateChange={({ activeStartDate }) => setMonthView(activeStartDate)}
//     />

//     {/* Only for non-admins */}
//     {!isAdmin && monthStats && (
//       <div className="bg-blue-100 dark:bg-gray-800 p-4 rounded-xl shadow border dark:border-gray-600">
//         <div className="flex justify-between items-center mb-3">
//           <button
//             onClick={() => changeMonth(-1)}
//             className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-blue-900 dark:text-white"
//           >
//             ◀ Prev
//           </button>
//           <div className="text-md font-bold text-blue-800 dark:text-blue-300">
//             {monthView.toLocaleString("default", { month: "long", year: "numeric" })}
//           </div>
//           <button
//             onClick={() => changeMonth(1)}
//             className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-blue-900 dark:text-white"
//           >
//             Next ▶
//           </button>
//         </div>

//         <div className="text-sm text-gray-800 dark:text-gray-300 mb-2">
//           Attendance this month:{" "}
//           <span className="font-bold text-blue-600 dark:text-green-400">
//             {monthStats.percentage}%
//           </span>
//         </div>

//         <div className="grid grid-cols-2 gap-2 max-h-[10rem] overflow-y-auto pr-1">
//           {monthStats.dayWise.map((d, i) => {
//             const dayLabel = new Date(d.date).toLocaleDateString(undefined, {
//               weekday: "short",
//               day: "numeric",
//             });

//             const commonClasses = "px-3 py-1 rounded text-sm font-medium flex justify-between items-center";

//             let statusClass = "";
//             let statusText = "";

//             if (d.status === "present") {
//               statusClass = "bg-green-300/40 dark:bg-green-600/20 text-green-900 dark:text-green-300";
//               statusText = "PRESENT";
//             } else if (d.status === "absent") {
//               statusClass = "bg-red-300/40 dark:bg-red-600/20 text-red-900 dark:text-red-300";
//               statusText = "ABSENT";
//             } else {
//               // not_taken
//               statusClass = "bg-gray-300/50 dark:bg-gray-600/30 text-gray-700 dark:text-gray-200";
//               statusText = "NOT TAKEN";
//             }

//             return (
//               <div key={i} className={`${commonClasses} ${statusClass}`}>
//                 {dayLabel}
//                 <span className="uppercase">{statusText}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     )}
//   </div>
// </div>


//   </div>
// </div>
//     </div>
//     )}
//     </>
//   );
// };

// export default Attendance;
// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import axios from '../api/axios';
// import { Calendar as LucideCalendar, CheckCircle, Key, Users, Copy, RefreshCw, X, Eye, UserCheck, UserX } from 'lucide-react';
// import Calendar from 'react-calendar';
// import 'react-calendar/dist/Calendar.css';
// import Loader from '../components/Loader';

// const Attendance = () => {
//   const { isAdmin } = useAuth();

//   const [attendanceCode, setAttendanceCode] = useState('');
//   const [codeExpiry, setCodeExpiry] = useState(null);
//   const [userCode, setUserCode] = useState('');
//   const [hasMarkedToday, setHasMarkedToday] = useState(false);
//   const [markedDates, setMarkedDates] = useState([]);
//   const [loadingTodayStatus, setLoadingTodayStatus] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [currentActiveCode, setCurrentActiveCode] = useState(null);
//   const [showCodePopup, setShowCodePopup] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [monthStats, setMonthStats] = useState(null);
//   const [monthView, setMonthView] = useState(new Date());

//   // New state for date attendance modal
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showDateModal, setShowDateModal] = useState(false);
//   const [dateAttendanceData, setDateAttendanceData] = useState(null);
//   const [loadingDateData, setLoadingDateData] = useState(false);
//   const [attendanceView, setAttendanceView] = useState('present'); // 'present' or 'absent'

//   useEffect(() => {
//     const canvas = document.getElementById('particles');
//     if (!canvas) return; // avoid error if null
//     const ctx = canvas.getContext('2d');
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const particles = [];

//     class Particle {
//       constructor() {
//         this.x = Math.random() * canvas.width;
//         this.y = Math.random() * canvas.height;
//         this.size = Math.random() * 7 + 1;
//         this.speedY = Math.random() * 5 + 0.5;
//         this.alpha = Math.random() * 0.5 + 0.1;
//       }

//       update() {
//         this.y += this.speedY;
//         if (this.y > canvas.height) {
//           this.y = 0;
//           this.x = Math.random() * canvas.width;
//         }
//       }

//       draw() {
//         ctx.fillStyle = `rgba(0, 224, 255, ${this.alpha})`;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.fill();
//       }
//     }

//     function initParticles() {
//       for (let i = 0; i < 100; i++) {
//         particles.push(new Particle());
//       }
//     }

//     function animate() {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       particles.forEach(p => {
//         p.update();
//         p.draw();
//       });
//       requestAnimationFrame(animate);
//     }

//     initParticles();
//     animate();

//     window.addEventListener('resize', () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     });
//   }, []);

//   useEffect(() => {
//     setInitialLoading(true);
//   }, []);

//   useEffect(() => {
//     if (codeExpiry) {
//       const timer = setTimeout(() => {
//         setCodeExpiry(null);
//         setAttendanceCode('');
//       }, 60000);
//       return () => clearTimeout(timer);
//     }
//   }, [codeExpiry]);

//   // Check for active attendance code (for users)
//   useEffect(() => {
//     const checkActiveCode = async () => {
//       if (!isAdmin) {
//         try {
//           const res = await axios.get("/attendance/current-code");
//           if (res.data.code && !hasMarkedToday) {
//             setCurrentActiveCode(res.data);
//             setShowCodePopup(true);
//           } else {
//             setCurrentActiveCode(null);
//             setShowCodePopup(false);
//           }
//         } catch (err) {
//           console.error("Failed to check active code:", err);
//         }
//       }
//     };

//     checkActiveCode();
//     // Check every 10 seconds for new codes
//     const interval = setInterval(checkActiveCode, 10000);
//     return () => clearInterval(interval);
//   }, [isAdmin, hasMarkedToday]);

//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const res = await axios.get("/attendance/marked-today");
//         setHasMarkedToday(res.data.marked);
//       } catch (err) {
//         console.error("Failed to fetch marked-today status:", err);
//       } finally {
//         setInitialLoading(false);
//         setLoadingTodayStatus(false);
//       }
//     };
//     if (!isAdmin) fetchStatus();
//   }, [isAdmin]);

//   useEffect(() => {
//     const fetchMarkedDates = async () => {
//       try {
//         const res = await axios.get("/attendance/dates");
//         setMarkedDates(res.data);
//       } catch (err) {
//         console.error("Error fetching marked dates", err);
//       } finally {
//         setInitialLoading(false); // <-- Set to false after fetch
//       }
//     };

//     if (!isAdmin) {
//       fetchMarkedDates();
//     } else {
//       setInitialLoading(false); // For admin, no need to wait, but ensures initialLoading is false
//     }
//   }, [isAdmin]);


//   const generateCode = async () => {
//     try {
//       const res = await axios.post("/attendance/start", {});
//       setAttendanceCode(res.data.code);
//       setCodeExpiry(new Date(res.data.expiresAt));
//       setMessage("✅ Attendance code generated!");
//     } catch (err) {
//       setMessage("❌ Failed to generate code");
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const fetchMonthlyStats = async () => {
//       try {
//         const y = monthView.getFullYear();
//         const m = monthView.getMonth() + 1;
//         const res = await axios.get(`/attendance/monthly/${y}/${m}`);
//         setMonthStats(res.data);
//       } catch (err) {
//         console.error("Failed to fetch monthly stats", err);
//       }
//     };

//     if (!isAdmin) fetchMonthlyStats();
//   }, [monthView, isAdmin]);


//   const markAttendance = async () => {
//     try {
//       if (!userCode) {
//         setMessage("❌ Please enter attendance code");
//         return;
//       }

//       setLoading(true);
//       const res = await axios.post("/attendance/mark", { code: userCode });

//       setMessage(res.data.msg || "✅ Attendance marked!");
//       setUserCode('');
//       setLoading(false);

//       // Update attendance status after marking
//       setHasMarkedToday(true);
//       setShowCodePopup(false);

//       // Refresh marked dates
//       const datesRes = await axios.get("/attendance/dates");
//       setMarkedDates(datesRes.data);
//     } catch (err) {
//       setLoading(false);
//       setMessage(err.response?.data?.msg || "❌ Failed to mark attendance");
//     }
//   };

//   const copyCode = () => {
//     navigator.clipboard.writeText(attendanceCode);
//     setMessage('📋 Code copied to clipboard!');
//   };

//   const copyActiveCode = () => {
//     if (currentActiveCode) {
//       navigator.clipboard.writeText(currentActiveCode.code);
//       setMessage('📋 Active code copied to clipboard!');
//     }
//   };

//   const markAttendanceWithActiveCode = async () => {
//     if (currentActiveCode) {
//       setUserCode(currentActiveCode.code);
//       await markAttendance();
//       // setShowCodePopup(false); // This is now handled in markAttendance function
//     }
//   };

//   // Function to handle calendar date click (admin only)
//   const handleDateClick = async (date) => {
//     if (!isAdmin) return; // Only admin can click dates to view details

//     const dateString = date.toLocaleDateString("en-CA"); // YYYY-MM-DD format
//     setSelectedDate(dateString);
//     setShowDateModal(true);
//     setLoadingDateData(true);
//     setAttendanceView('present'); // Reset to present view

//     try {
//       const res = await axios.get(`/attendance/date/${dateString}`);
//       setDateAttendanceData(res.data);
//     } catch (err) {
//       console.error("Failed to fetch attendance data:", err);
//       setMessage("❌ Failed to fetch attendance data for this date");
//     } finally {
//       setLoadingDateData(false);
//     }
//   };

//   const changeMonth = (offset) => {
//     const newDate = new Date(monthView);
//     newDate.setMonth(newDate.getMonth() + offset);
//     setMonthView(newDate);
//   };

//   return (
//     <>
//       <canvas
//         id="particles"
//         className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
//       ></canvas>

//       {/* 🔄 Loader for non-admin while checking today status */}
//       {!isAdmin && loadingTodayStatus && (
//         <div className="flex items-center justify-center min-h-screen z-10 relative">
//           <Loader />
//         </div>
//       )}

//       {/* 🔄 Loader for admin while generating code or data */}
//       {isAdmin && (loading || loadingDateData) && (
//         <div className="flex items-center justify-center min-h-screen z-10 relative">
//           <Loader />
//         </div>
//       )}

//       {initialLoading ? (
//         <div className="min-h-screen flex items-center justify-center z-10 relative">
//           <Loader />
//         </div>
//       ) : (
//         <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
//           {/* HEADER */}
//           <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-white dark:text-shadow-glow flex items-center gap-2 mt-10 sm:mt-0">
//             <LucideCalendar /> Attendance System
//           </h2>

//           {message && <div className="text-xs sm:text-sm text-gray-700 dark:text-white font-medium">{message}</div>}

//           {/* ATTENDANCE CODE POPUP */}
//           {showCodePopup && currentActiveCode && !isAdmin && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-blue-200 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-md w-full mx-2 sm:mx-4">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-bold text-gray-700  dark:text-white">🎯 Active Attendance Code</h3>
//                   <button
//                     onClick={() => setShowCodePopup(false)}
//                     className="text-gray-400 hover:text-white"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>

//                 <div className="text-center space-y-4">
//                   <div className=" bg-gray-700 dark:bg-gray-800 p-4 rounded-lg">
//                     <div className="text-2xl font-mono font-bold text-white dark:text-white">
//                       {currentActiveCode.code}
//                     </div>
//                     <div className="text-sm text-white dark:text-gray-400 mt-2">
//                       Expires at: {new Date(currentActiveCode.expiresAt).toLocaleTimeString()}
//                     </div>
//                   </div>

//                   <div className="flex gap-3">
//                     <button
//                       onClick={copyActiveCode}
//                       className="flex-1 bg-blue-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
//                     >
//                       <Copy className="w-4 h-4" /> Copy Code
//                     </button>
//                     <button
//                       onClick={markAttendanceWithActiveCode}
//                       disabled={loading}
//                       className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
//                     >
//                       {loading ? 'Marking...' : 'Mark Attendance'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* DATE ATTENDANCE MODAL */}
//           {showDateModal && selectedDate && isAdmin && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//               <div className="bg-blue-300 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-4xl w-full mx-2 sm:mx-4 max-h-[80vh] overflow-y-auto">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-xl font-bold text-white dark:text-white flex items-center gap-2">
//                     <Eye className="w-5 h-5" /> Attendance for {new Date(selectedDate).toLocaleDateString()}
//                   </h3>
//                   <button
//                     onClick={() => setShowDateModal(false)}
//                     className="text-gray-400 hover:text-white"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>

//                 {loadingDateData ? (
//                   <div className="text-center py-8">
//                     <div className="text-avengers-silver">Loading attendance data...</div>
//                   </div>
//                 ) : dateAttendanceData ? (
//                   <div className="space-y-4">
//                     {/* Summary Stats */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                       <div className="bg-gray-800 p-4 rounded-lg text-center">
//                         <div className="text-2xl font-bold text-white">{dateAttendanceData.totalUsers}</div>
//                         <div className="text-sm text-avengers-silver">Total Users</div>
//                       </div>
//                       <div className="bg-green-400/50 p-4 rounded-lg text-center border border-green-700/30">
//                         <div className="text-2xl font-bold text-white ">{dateAttendanceData.presentCount}</div>
//                         <div className="text-sm text-avengers-silver ">Present</div>
//                       </div>
//                       <div className="bg-red-500 dark:bg-red-600/20 p-4 rounded-lg text-center border border-red-500/30">
//                         <div className="text-2xl font-bold text-white  ">{dateAttendanceData.absentCount}</div>
//                         <div className="text-sm dark:text-avengers-silver ">Absent</div>
//                       </div>
//                     </div>

//                     {/* View Toggle */}
//                     <div className="flex gap-2 mb-4">
//                       <button
//                         onClick={() => setAttendanceView('present')}
//                         className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
//                           attendanceView === 'present'
//                             ? 'bg-green-400/50 text-white'
//                             : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                         }`}
//                       >
//                         <UserCheck className="w-4 h-4" /> Present ({dateAttendanceData.presentCount})
//                       </button>
//                       <button
//                         onClick={() => setAttendanceView('absent')}
//                         className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
//                           attendanceView === 'absent'
//                             ? 'bg-red-600 text-white'
//                             : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
//                         }`}
//                       >
//                         <UserX className="w-4 h-4" /> Absent ({dateAttendanceData.absentCount})
//                       </button>
//                     </div>

//                     {/* User List */}
//                     <div className="bg-gray-800 rounded-lg p-4">
//                       <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
//                         {attendanceView === 'present' ? (
//                           <>
//                             <UserCheck className="w-4 h-4 text-green-400" />
//                             Present Users
//                           </>
//                         ) : (
//                           <>
//                             <UserX className="w-4 h-4 text-red-400" />
//                             Absent Users
//                           </>
//                         )}
//                       </h4>

//                       {attendanceView === 'present' ? (
//                         dateAttendanceData.present.length > 0 ? (
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {dateAttendanceData.present.map((user, index) => (
//                               <div key={user._id || index} className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
//                                 <div className="font-medium text-white">{user.codename || user.name}</div>
//                                 <div className="text-sm text-green-400">{user.email}</div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="text-center py-4 text-white dark:text-gray-400">
//                             No users were present on this date
//                           </div>
//                         )
//                       ) : (
//                         dateAttendanceData.absent.length > 0 ? (
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {dateAttendanceData.absent.map((user, index) => (
//                               <div key={user._id || index} className="bg-red-600/20 p-3 rounded-lg border border-red-500/30">
//                                 <div className="font-medium text-white">{user.codename || user.name}</div>
//                                 <div className="text-sm text-red-400">{user.email}</div>
//                               </div>
//                             ))}
//                           </div>
//                         ) : (
//                           <div className="text-center py-4 text-white dark:text-gray-400">
//                             All users were present on this date
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 text-white dark:text-gray-400">
//                     No attendance data available for this date
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* MAIN ACTIONS + CALENDAR in tighter single box */}
//           <div className="bg-blue-300 glass-card dark:border-gray-700 p-3 sm:p-6 rounded-xl shadow-lg">
//             <div className="flex flex-col md:flex-row items-start gap-4 ">

//               {/* LEFT: Attendance Control (Admin or User) */}
//               <div className="w-full md:w-auto flex-shrink-0 space-y-3 sm:space-y-4">
//                 {isAdmin ? (
//                   <>
//                     <div className="flex items-center gap-4 flex-wrap">
//                       <button
//                         onClick={generateCode}
//                         className=" bg-blue-400 hover:bg-blue-500 dark:bg-blue-900/20 dark:text-white text-white px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700/30"
//                       >
//                         <RefreshCw className="inline w-4 h-4 mr-1" /> Start Attendance
//                       </button>

//                       {attendanceCode && (
//                         <div className="flex items-center gap-2 text-lg font-mono">
//                           <Key className="w-5 h-5 text-green-800 dark:text-green-400" />
//                           <span>{attendanceCode}</span>
//                           <button onClick={copyCode}>
//                             <Copy className="w-4 h-4 text-white dark:text-white hover:text-white" />
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     {codeExpiry && (
//                       <div className="text-m text-white dark:text-white">
//                         Code expires at: {new Date(codeExpiry).toLocaleTimeString()}
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   !loadingTodayStatus && (
//                     <>
//                       {hasMarkedToday ? (
//                         <div className="text-blue-600 dark:text-green-400 font-semibold text-lg flex items-center gap-2">
//                           <CheckCircle className="w-5 h-5" /> Attendance already marked for today ✅
//                         </div>
//                       ) : (
//                         <>
//                           <label className="block text-m text-blue-600 font-bold dark:text-avengers-silver ">
//                             Enter Attendance Code
//                           </label>
//                           <input
//                             type="text"
//                             value={userCode}
//                             onChange={(e) => setUserCode(e.target.value)}
//                             maxLength={6}
//                             className="px-3 py-2 rounded-lg  bg-blue-200 font-semibold dark:bg-gray-800 text-blue-500 dark:text-white focus:outline-none w-40"
//                           />
//                           <button
//                             onClick={markAttendance}
//                             disabled={loading}
//                             className=" bg-blue-500 hover:bg-green-400 dark:bg-blue-500 dark:text-white text-black px-4 py-2 rounded-xl font-semibold dark:hover:bg-blue-700"
//                           >
//                             {loading ? 'Marking...' : 'Mark Attendance'}
//                           </button>
//                         </>
//                       )}
//                     </>
//                   )
//                 )}
//               </div>

//               {/* Calendar Section (Visible to both Admin and User) */}
//               <div className="w-full md:w-auto md:flex-1"> {/* Calendar occupies its own space, flexible */}
//                 <Calendar
//                   tileClassName={({ date, view }) => {
//                     if (view === "month") {
//                       const localDate = date.toLocaleDateString("en-CA");
//                       return markedDates?.includes(localDate) ? "present-day" : null;
//                     }
//                   }}
//                   onClickDay={handleDateClick}
//                   className={isAdmin ? "cursor-pointer" : ""}
//                   value={monthView}
//                   onActiveStartDateChange={({ activeStartDate }) => setMonthView(activeStartDate)}
//                 />
//               </div>

//               {/* Monthly Stats Section (Only for non-admins) */}
//               {!isAdmin && monthStats && (
//                 <div className="w-full md:w-auto md:flex-1 bg-blue-100 dark:bg-gray-800 p-4 rounded-xl shadow border dark:border-gray-600">
//                   <div className="flex justify-between items-center mb-3">
//                     <button
//                       onClick={() => changeMonth(-1)}
//                       className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-blue-900 dark:text-white"
//                     >
//                       ◀ Prev
//                     </button>
//                     <div className="text-md font-bold text-blue-800 dark:text-blue-300">
//                       {monthView.toLocaleString("default", { month: "long", year: "numeric" })}
//                     </div>
//                     <button
//                       onClick={() => changeMonth(1)}
//                       className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-blue-900 dark:text-white"
//                     >
//                       Next ▶
//                     </button>
//                   </div>

//                   <div className="text-sm text-gray-800 dark:text-gray-300 mb-2">
//                     Attendance this month:{" "}
//                     <span className="font-bold text-blue-600 dark:text-green-400">
//                       {monthStats.percentage}%
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-2 gap-x-2 gap-y-2 max-h-[10rem] overflow-y-auto pr-1">
//                     {monthStats.dayWise.map((d, i) => {
//                       const dayLabel = new Date(d.date).toLocaleDateString(undefined, {
//                         weekday: "short",
//                         day: "numeric",
//                       });

//                       const commonClasses = "px-3 py-1 rounded text-sm font-medium flex justify-between items-center";

//                       let statusClass = "";
//                       let statusText = "";

//                       if (d.status === "present") {
//                         statusClass = "bg-green-300/40 dark:bg-green-600/20 text-green-900 dark:text-green-300";
//                         statusText = "PRESENT";
//                       } else if (d.status === "absent") {
//                         statusClass = "bg-red-300/40 dark:bg-red-600/20 text-red-900 dark:text-red-300";
//                         statusText = "ABSENT";
//                       } else {
//                         // not_taken
//                         statusClass = "bg-gray-300/50 dark:bg-gray-600/30 text-gray-700 dark:text-gray-200";
//                         statusText = "NOT TAKEN";
//                       }

//                       return (
//                         <div key={i} className={`${commonClasses} ${statusClass}`}>
//                           {dayLabel}
//                           <span className="uppercase">{statusText}</span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Attendance;
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Calendar as LucideCalendar, CheckCircle, Key, Users, Copy, RefreshCw, X, Eye, UserCheck, UserX } from 'lucide-react'; // attendance calendar icon it is
import Calendar from 'react-calendar'; //montly stats calendar for attendance real-one
import 'react-calendar/dist/Calendar.css';
import Loader from '../components/Loader';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [monthStats, setMonthStats] = useState(null);
  const [monthView, setMonthView] = useState(new Date());

  // New state for date attendance modal
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateAttendanceData, setDateAttendanceData] = useState(null);
  const [loadingDateData, setLoadingDateData] = useState(false);
  const [attendanceView, setAttendanceView] = useState('present'); // 'present' or 'absent'

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
        this.size = Math.random() * 7 + 1;
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
    setInitialLoading(true);
  }, []);

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
        setLoadingTodayStatus(false); // Only this loader relevant here
        // initialLoading will be handled by fetchMarkedDates or directly for admin
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
      } finally {
        setInitialLoading(false); // <-- Set to false after fetch for both admin & user
      }
    };

    fetchMarkedDates(); // Fetch marked dates for both admin (for tileClassName) and user
  }, []); // Run only once on component mount

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

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const y = monthView.getFullYear();
        const m = monthView.getMonth() + 1;
        const res = await axios.get(`/attendance/monthly/${y}/${m}`);
        setMonthStats(res.data);
      } catch (err) {
        console.error("Failed to fetch monthly stats", err);
      }
    };

    if (!isAdmin) fetchMonthlyStats();
  }, [monthView, isAdmin]);


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
    if (!isAdmin) return; // Only admin can click dates to view details

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

  const changeMonth = (offset) => {
    const newDate = new Date(monthView);
    newDate.setMonth(newDate.getMonth() + offset);
    setMonthView(newDate);
  };

  return (
    <>
      <canvas
        id="particles"
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      ></canvas>

      {/* 🔄 Loader for non-admin while checking today status */}
      {!isAdmin && loadingTodayStatus && (
        <div className="flex items-center justify-center min-h-screen z-10 relative">
          <Loader />
        </div>
      )}

      {/* 🔄 Loader for admin while generating code or data */}
      {isAdmin && (loading || loadingDateData) && (
        <div className="flex items-center justify-center min-h-screen z-10 relative">
          <Loader />
        </div>
      )}

      {initialLoading ? (
        <div className="min-h-screen flex items-center justify-center z-10 relative">
          <Loader />
        </div>
      ) : (
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
          {/* HEADER */}
          <h2 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-white dark:text-shadow-glow flex items-center gap-2 mt-10 sm:mt-0">
            <LucideCalendar /> Attendance System
          </h2>

          {message && <div className="text-xs sm:text-sm text-gray-700 dark:text-white font-medium">{message}</div>}

          {/* ATTENDANCE CODE POPUP */}
          {showCodePopup && currentActiveCode && !isAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-blue-200 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-md w-full mx-2 sm:mx-4">
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

          {/* DATE ATTENDANCE MODAL (Admin Only) */}
          {showDateModal && selectedDate && isAdmin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-blue-300 dark:bg-avengers-dark p-4 sm:p-6 rounded-xl shadow-lg border border-blue-400 dark:border-gray-700 max-w-4xl w-full mx-2 sm:mx-4 max-h-[80vh] overflow-y-auto">
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

          {/* MAIN ACTIONS + CALENDAR & MONTHLY STATS */}
          <div className="bg-blue-300 glass-card dark:border-gray-700 p-3 sm:p-6 rounded-xl shadow-lg max-w-full overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-4 ">

              {/* LEFT: Attendance Control (Admin or User) */}
              <div className="w-full md:w-auto flex-shrink-0 space-y-3 sm:space-y-4">
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
                      <div className="text-m text-black dark:text-white">
                        Code expires at: {new Date(codeExpiry).toLocaleTimeString()}
                      </div>
                    )}
                  </>
                ) : (
                  !loadingTodayStatus && (
                    <>
                      {hasMarkedToday ? (
                        <div className="text-blue-600 dark:text-green-400 font-semibold text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Attendance already marked for today ✅
                        </div>
                      ) : (
                        <>
                          <label className="block text-m text-blue-600 font-bold dark:text-avengers-silver ">
                            Enter Attendance Code
                          </label>
                          <input
                            type="text"
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            maxLength={6}
                            className="px-3 py-2 rounded-lg  bg-blue-200 font-semibold dark:bg-gray-800 text-blue-500 dark:text-white focus:outline-none w-40"
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

              {/* Combined Calendar and Monthly Stats Section (Flexible Layout) */}
              <div className="flex flex-col lg:flex-row gap-6  flex-grow px-2 sm:px-4 justify-center items-center lg:items-start w-full max-w-full">
                {/* Calendar Section (Always Visible) */}
                <div className="w-full max-w-[100%] sm:max-w-[90vw] lg:max-w-[450px] overflow-hidden">
                  <Calendar 
                    tileClassName={({ date, view }) => {
                      if (view === "month") {
                        const localDate = date.toLocaleDateString("en-CA");
                        return markedDates?.includes(localDate) ? "present-day" : null;
                      }
                    }}
                    onClickDay={handleDateClick}
                   className={`${isAdmin ? "cursor-pointer" : ""} responsive-calendar w-full `}
                    value={monthView}
                    onActiveStartDateChange={({ activeStartDate }) => setMonthView(activeStartDate)}
                  />
                </div>

                {/* Monthly Stats Section (Only for non-admins) */}
                {!isAdmin && monthStats && (
                  <div className="w-full max-w-[100%] sm:max-w-[90vw] lg:max-w-[450px] dark:bg-gray-800 p-4 rounded-xl shadow border dark:border-gray-600" style={{ backgroundColor: 'rgba(96, 165, 250, 1)' }}>
                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-white dark:text-white"
                      >
                        ◀ Prev
                      </button>
                      <div className="text-md font-bold text-white dark:text-blue-300">
                        {monthView.toLocaleString("default", { month: "long", year: "numeric" })}
                      </div>
                      <button
                        onClick={() => changeMonth(1)}
                        className="text-sm px-2 py-1 bg-blue-200 dark:bg-gray-700 rounded hover:bg-blue-300 dark:hover:bg-gray-600 text-white dark:text-white"
                      >
                        Next ▶
                      </button>
                    </div>

                    <div className="text-sm text-white dark:text-gray-300 mb-2">
                      Attendance this month:{" "}
                      <span className="font-bold text-blue-600 dark:text-green-400">
                        {monthStats.percentage}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 max-h-[10rem] overflow-y-auto pr-1">
                      {monthStats.dayWise.map((d, i) => {
                        const dayLabel = new Date(d.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                        });

                        const commonClasses =
  "px-3 py-1 rounded text-sm font-medium flex items-center justify-between min-w-0 overflow-hidden whitespace-nowrap";


                        let statusClass = "";
                        let statusText = "";

                        // Define today's date for comparison
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Normalize to start of day
                        const dayDate = new Date(d.date);
                        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day

                        // Logic for status text and class:
                        // 1. If date is in the future relative to today
                        if (dayDate > today) {
                          statusClass = "bg-gray-300/50 dark:bg-gray-600/30 text-white dark:text-gray-200";
                          statusText = "NOT TAKEN";
                        }
                        // 2. Otherwise, use the status provided by the backend (present/absent)
                        //    or default to "NOT TAKEN" if status is missing/unknown for past/today's date
                        else if (d.status === "present") {
                          statusClass = "bg-green-300/40 dark:bg-green-600/20 text-white dark:text-green-300";
                          statusText = "PRESENT";
                        } else if (d.status === "absent") {
                          statusClass = "bg-red-300/40 dark:bg-red-600/20 text-white dark:text-red-300";
                          statusText = "ABSENT";
                        } else {
                          // This 'else' block catches any other status (e.g., 'not_taken' from backend for past day, or undefined)
                          statusClass = "bg-gray-300/50 dark:bg-gray-600/30 text-gray-700 dark:text-gray-200";
                          statusText = "NOT TAKEN";
                        }

                        return (
                          <div key={i} className={`${commonClasses} ${statusClass}`}>
                            <span className="truncate">{dayLabel}</span>
                            <span className="uppercase truncate ml-2">{statusText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Attendance;
