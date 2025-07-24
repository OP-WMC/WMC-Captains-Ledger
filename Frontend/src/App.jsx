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
import PendingApprovals from './pages/PendingApprovals';
import Footer from './components/Footer';
import Profile from './pages/Profile';
import AdminProfiles from './pages/AdminProfiles';
import VerifyOtp from "./pages/VerifyOtp";
import { Toaster } from "react-hot-toast";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
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
                  <Dashboard  />
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/missions" element={
              <ProtectedRoute>
                <Layout>
                  <Missions />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/send-money" element={
              <ProtectedRoute>
                <Layout>
                  <SendMoney />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/stats" element={
              <ProtectedRoute>
                <Layout>
                  <Stats />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/announcements" element={
              <ProtectedRoute>
                <Layout>
                  <Announcements />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute>
                <Layout>
                  <Feedback />
                  
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            <Route path="/feedback/:transactionId" element={
              <ProtectedRoute>
                <FeedbackForm />
              </ProtectedRoute>
            } />
            
            <Route path="/pending-approvals" element={
              <ProtectedRoute>
                <Layout>
                  <PendingApprovals />
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/transaction-success" element={<TransactionSuccess />} />

            <Route path="/transaction-cancel" element={<TransactionCancel />} />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />

            <Route path="/admin-profiles" element={
              <ProtectedRoute>
                <Layout>
                  <AdminProfiles />
                </Layout>
                <Footer />
              </ProtectedRoute>
            } />

            {/* Redirect to dashboard for any unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
