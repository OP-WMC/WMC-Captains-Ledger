import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockAttendance, generateAttendanceCode } from '../services/mockData';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Key, 
  Users,
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';

const Attendance = () => {
  const { user, isAdmin } = useAuth();
  const [attendanceCode, setAttendanceCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendance);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (codeExpiry) {
      const timer = setTimeout(() => {
        setCodeExpiry(null);
        setAttendanceCode('');
      }, 60000); // 1 minute

      return () => clearTimeout(timer);
    }
  }, [codeExpiry]);

  const generateCode = () => {
    const code = generateAttendanceCode();
    setAttendanceCode(code);
    setCodeExpiry(new Date(Date.now() + 60000));
    setMessage('Attendance code generated successfully!');
  };

  const markAttendance = async () => {
    if (!userCode || userCode !== attendanceCode) {
      setMessage('Invalid attendance code!');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRecord = {
      id: attendanceRecords.length + 1,
      userId: user?.id,
      name: user?.name,
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      checkIn: new Date().toLocaleTimeString(),
      checkOut: null
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);
    setUserCode('');
    setMessage('Attendance marked successfully!');
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(attendanceCode);
    setMessage('Code copied to clipboard!');
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
          Attendance Management
        </h1>
        <p className="text-avengers-silver">
          {isAdmin ? 'Generate attendance codes and monitor team presence' : 'Mark your daily attendance'}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Code Generation */}
        {isAdmin && (
          <div className="glass-card">
            <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
              Generate Attendance Code
            </h2>
            
            <div className="space-y-4">
              {attendanceCode ? (
                <div className="p-6 bg-avengers-gray/30 rounded-lg text-center">
                  <div className="mb-4">
                    <Key className="w-12 h-12 text-avengers-blue mx-auto mb-2" />
                    <p className="text-avengers-silver text-sm mb-2">Current Attendance Code</p>
                    <p className="text-4xl font-orbitron font-bold text-white tracking-widest">
                      {attendanceCode}
                    </p>
                  </div>
                  
                  {codeExpiry && (
                    <div className="mb-4">
                      <p className="text-avengers-silver text-sm">Expires in:</p>
                      <p className="text-lg font-orbitron text-avengers-gold">
                        {Math.ceil((codeExpiry - new Date()) / 1000)}s
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={copyCode}
                      className="avengers-button-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Code</span>
                    </button>
                    <button
                      onClick={generateCode}
                      className="avengers-button flex-1 flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>New Code</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="w-16 h-16 text-avengers-silver mx-auto mb-4" />
                  <p className="text-avengers-silver mb-4">No active attendance code</p>
                  <button
                    onClick={generateCode}
                    className="avengers-button flex items-center justify-center space-x-2"
                  >
                    <Key className="w-5 h-5" />
                    <span>Generate Code</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* User Attendance Marking */}
        {!isAdmin && (
          <div className="glass-card">
            <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
              Mark Attendance
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-avengers-silver mb-2">
                  Enter Attendance Code
                </label>
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="input-field w-full text-center text-2xl font-orbitron tracking-widest"
                  placeholder="123456"
                  maxLength="6"
                />
                <p className="text-xs text-avengers-silver mt-1">
                  Enter the 6-digit code provided by your team leader
                </p>
              </div>

              <button
                onClick={markAttendance}
                disabled={loading || userCode.length !== 6}
                className="avengers-button w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark Attendance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            {isAdmin ? 'Today\'s Attendance' : 'Your Attendance History'}
          </h2>
          
          <div className="space-y-3">
            {(isAdmin ? attendanceRecords : attendanceRecords.filter(r => r.userId === user?.id))
              .slice(0, 10)
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-avengers-gray/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="text-sm font-medium text-white">{record.name}</p>
                      <p className="text-xs text-avengers-silver">{record.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium capitalize ${
                      record.status === 'present' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {record.status}
                    </p>
                    <p className="text-xs text-avengers-silver">
                      {formatTime(record.checkIn)} - {formatTime(record.checkOut)}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {attendanceRecords.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-avengers-silver mx-auto mb-3" />
              <p className="text-avengers-silver">No attendance records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="glass-card">
        <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
          Attendance Statistics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-avengers-gray/30 rounded-lg">
            <Users className="w-8 h-8 text-avengers-blue mx-auto mb-2" />
            <p className="text-2xl font-orbitron font-bold text-white">
              {attendanceRecords.filter(r => r.status === 'present').length}
            </p>
            <p className="text-sm text-avengers-silver">Present Today</p>
          </div>
          
          <div className="text-center p-4 bg-avengers-gray/30 rounded-lg">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-orbitron font-bold text-white">
              {attendanceRecords.filter(r => r.status === 'absent').length}
            </p>
            <p className="text-sm text-avengers-silver">Absent Today</p>
          </div>
          
          <div className="text-center p-4 bg-avengers-gray/30 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-orbitron font-bold text-white">
              {attendanceRecords.length > 0 
                ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
                : 0}%
            </p>
            <p className="text-sm text-avengers-silver">Attendance Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance; 