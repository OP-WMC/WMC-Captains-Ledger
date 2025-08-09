import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Bell,
  CheckCircle
} from 'lucide-react';
import Chatbot from './Chatbot';
import Loader from '../components/Loader';
import axios from "../api/axios";

const Layout = ({ children }) => {
  const { user, setUser, logout, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const [loadingProfile, setLoadingProfile] = useState(true);

   useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me", { withCredentials: true });
        setUser(res.data); // Full user data
      } catch (err) {
        console.error("User fetch failed", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!user?.codename || !user?.profilePhoto) {
      fetchUser();
    } else {
      setLoadingProfile(false);
    }
  }, [user?.codename, user?.profilePhoto]);

  // Global dark mode logic
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') return true;
    if (storedTheme === 'light') return false;
    return true; // Default to dark
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Shield,
      path: '/dashboard',
      adminOnly: false
    },
    {
      name: 'Manage Avengers',
      icon: Users,
      path: '/admin-profiles',
      adminOnly: true
    },
    {
      name: 'Missions',
      icon: Users,
      path: '/missions',
      adminOnly: false
    },
    {
      name: 'Send Money',
      icon: DollarSign,
      path: '/send-money',
      adminOnly: false
    },
    {
      name: 'Attendance',
      icon: Calendar,
      path: '/attendance',
      adminOnly: false
    },
    {
      name: 'Stats',
      icon: BarChart3,
      path: '/stats',
      adminOnly: true
    },
    {
      name: 'Announcements',
      icon: MessageSquare,
      path: '/announcements',
      adminOnly: false
    },
    {
      name: 'Feedback',
      icon: MessageSquare,
      path: '/feedback',
      adminOnly: false
    },
    {
      name: 'Pending Approvals',
      icon: CheckCircle,
      path: '/pending-approvals',
      adminOnly: true
    }
  ];

  const filteredNavItems = navigationItems.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <div className="min-h-screen flex overflow-hidden relative">
      {/* <Loader /> */}
      {/* Mobile Hamburger Button (floating, only on mobile) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-2 left-2 z-50 lg:hidden bg-white dark:bg-black/80 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full p-2 flex items-center justify-center focus:outline-none transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-cyan-400" />
        </button>
      )}
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="flex min-h-screen  overflow-hidden">
<div
        className={`fixed top-0 left-0 h-screen w-64 md:w-56 sm:w-48 z-50
    bg-[#f8fafc] text-black 
    dark:bg-black/40 dark:backdrop-blur-md dark:text-white 
    transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full '}
          lg:translate-x-0
          flex flex-col overflow-hidden
        `}
>
          {/* Logo */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b text-blue-700 border-[#00e0ff] dark:border-avengers-silver/20">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 dark:bg-gradient-to-br rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-700 dark:text-white" />
              </div>
              <div>
              <h1 className="text-lg md:text-2xl font-orbitron font-bold dark:text-cyan-400 dark:text-shadow-glow">Captain's</h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-cyan-400 dark:text-shadow-glow">Ledger</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-avengers-blue/20 dark:hover:text-[#00e0ff]"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Navigation */}
        <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                className="sidebar-item group flex items-center gap-2 px-2 py-2 md:px-4 md:py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-avengers-blue/10 transition text-sm md:text-base"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          {/* User info */}
        <div className="p-2 md:p-4 border-t border-[#00e0ff] dark:border-avengers-silver/20">
        {loading || loadingProfile ? (
  <Loader />
) : user?.name && user?.codename ? (
          <Link to="/profile" className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition cursor-pointer">
            <img
    src={
      user?.profilePhoto
        ? user.profilePhoto
        : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "Unknown")
    }
    alt="Profile"
    className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow"
  />

              <div className="flex-1">
              <p className="text-xs md:text-sm font-semibold dark:text-white">{user.name || "Unnamed Avenger"}</p>
                <p className="text-xs dark:text-avengers-silver font-medium text-gray-700">{user.codename || "Codename missing"}</p>
              </div>
            </Link>
             ) : (
    <p className="text-gray-500 text-sm italic">User info unavailable</p>
  )}


            <button
              onClick={logout}
            className="w-full flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 md:py-3 dark:text-white hover:bg-avengers-red/20 hover:text-red-400 transition-all duration-200 rounded-lg font-semibold text-xs md:text-base"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
        </div>
      </div>

</div>

      {/* Main content */}
      <div className="ml-0 lg:ml-56 md:ml-56 sm:ml-4  flex-1 flex flex-col min-w-0">
        {/* Page content */}
        <main className="flex-1 p-4 sm:p-4 md:p-6 overflow-y-auto mt-2 sm:mt-0">
          {children}
        </main>
        <Chatbot />
      </div>
    </div>
  );
};

export default Layout; 