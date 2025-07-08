import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import SendMoney from './pages/SendMoney';
import Attendance from './pages/Attendance';
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from './context/AuthContext'; // ✅ correct path
import TransactionSuccess from './pages/TransactionSuccess';
import TransactionCancel from './pages/TransactionCancel';
import Landing from "./components/Landing";
import Stats from './pages/Stats';
import Feedback from './pages/Feedback';
import Announcements from './pages/Announcements';
import FeedbackForm from './pages/FeedbackForm';


// Placeholder components for other pages
// const Stats = () => (
//   <div className="glass-card">
//     <h1 className="text-2xl font-orbitron font-bold text-white mb-4">Statistics</h1>
//     <p className="text-avengers-silver">Statistics and charts page coming soon...</p>
//   </div>
// );

// const Announcements = () => (
//   <div className="glass-card">
//     <h1 className="text-2xl font-orbitron font-bold text-white mb-4">Announcements</h1>
//     <p className="text-avengers-silver">Announcements page coming soon...</p>
//   </div>
// );

// const Feedback = () => (
//   <div className="glass-card">
//     <h1 className="text-2xl font-orbitron font-bold text-white mb-4">Feedback</h1>
//     <p className="text-avengers-silver">Feedback form page coming soon...</p>
//   </div>
// );

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } /> */}
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/missions" element={
              <ProtectedRoute>
                <Layout>
                  <Missions />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/send-money" element={
              <ProtectedRoute>
                <Layout>
                  <SendMoney />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/stats" element={
              <ProtectedRoute>
                <Layout>
                  <Stats />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/announcements" element={
              <ProtectedRoute>
                <Layout>
                  <Announcements />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Layout>
                  <Feedback />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/feedback/:transactionId" element={<FeedbackForm />} />
            
            <Route path="/transaction-success" element={<TransactionSuccess />} />

<Route path="/transaction-cancel" element={<TransactionCancel />} />


            {/* Redirect to dashboard for any unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
