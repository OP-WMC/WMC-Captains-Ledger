import { useState } from 'react';
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

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Shield,
      path: '/dashboard',
      adminOnly: false
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
      adminOnly: false
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
    <div className="min-h-screen  flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
<div
  className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 
    bg-[#f8fafc] text-black 
    dark:bg-black/40 dark:backdrop-blur-md dark:text-white 
    transform transition-transform duration-300 ease-in-out 
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
>


        <div className="flex flex-col h-full ">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b text-blue-700 border-gray-700 dark:border-avengers-silver/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 dark:bg-gradient-to-br rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-700 dark:text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-orbitron font-bold dark:text-cyan-400 dark:text-shadow-glow">Captain's</h1>
                <p className="text-sm text-gray-500 dark:text-cyan-400 dark:text-shadow-glow">Ledger</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-700 font-semibold
  hover:bg-blue-50 hover:text-blue-600 
  dark:hover:bg-avengers-blue/20 dark:hover:text-[#00e0ff]"

            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="sidebar-item group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-700 dark:border-avengers-silver/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-2xl">
                {user?.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold  dark:text-white">{user?.name}</p>
                <p className="text-xs dark:text-avengers-silver font-medium text-gray-700">{user?.codename}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 dark:text-white hover:bg-avengers-red/20 hover:text-red-400 transition-all duration-200 rounded-lg font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        {/* <header className="bg-avengers-gray/50 backdrop-blur-md border-b border-avengers-silver/20">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-avengers-blue/20"
            >
              <Menu className="w-6 h-6 text-avengers-silver" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-avengers-silver">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">3 new notifications</span>
                </div>
                <div className="w-px h-6 bg-avengers-silver/20" />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-avengers-silver">Balance:</span>
                  <span className="text-lg font-orbitron font-bold text-avengers-gold">
                    ₹{user?.balance?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header> */}

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 