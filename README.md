# Captain's Ledger - Avengers Command Center

A full-stack web application prototype for managing an Avengers command center led by Sam Wilson (Captain America) from The Falcon and the Winter Soldier. This is a modern, immersive dashboard for mission control, attendance tracking, payments, and team communication.

## 🦅 Features

### Authentication & User Management
- **Login/Register System** - Secure authentication with role-based access
- **User Roles** - Admin (Captain America) and regular agents
- **Profile Management** - User profiles with codenames and avatars

### Dashboard & Navigation
- **Responsive Design** - Modern glass-morphism UI with dark theme
- **Sidebar Navigation** - Intuitive navigation with role-based menu items
- **Real-time Stats** - Live mission, attendance, and payment statistics

### Mission Management
- **Mission Assignment** - Admins can assign missions to agents
- **Status Tracking** - Track mission progress (ongoing, completed, failed, martyred)
- **Team Coordination** - View assigned team members and mission details

### Financial System
- **Money Transfers** - Send money between Avengers (up to ₹10,000)
- **Transaction History** - Complete transaction logs and status tracking
- **Payment OTP** - Secure email OTP verification for transactions
- **Salary Management** - Admin can send salaries to agents

### Attendance System
- **Code Generation** - Admin generates 6-digit attendance codes (valid for 1 minute)
- **Attendance Marking** - Agents enter codes to mark attendance
- **Attendance History** - Track attendance patterns and statistics

### Communication
- **Announcements** - Post important updates and notifications
- **Feedback System** - Agents can submit feedback and suggestions
- **Important Alerts** - Visual emphasis for critical announcements

### Analytics & Reporting
- **Statistics Dashboard** - Charts and graphs for attendance, missions, and payments
- **Performance Metrics** - Individual and team performance tracking
- **Data Visualization** - Interactive charts using Recharts

## 🎨 Design & Theme

### Color Palette
- **Avengers Blue** - Primary brand color (#1e3a8a)
- **Avengers Red** - Accent color for alerts (#dc2626)
- **Silver** - Text and UI elements (#cbd5e1)
- **Dark** - Background and cards (#0f172a)
- **Gold** - Financial highlights (#f59e0b)

### Typography
- **Orbitron** - Futuristic font for headings and buttons
- **Rajdhani** - Clean, modern font for body text

### UI Elements
- **Glass-morphism Effects** - Translucent cards with backdrop blur
- **Gradient Buttons** - Modern gradient buttons with hover effects
- **Responsive Layout** - Mobile-first design approach
- **Smooth Animations** - Subtle transitions and hover effects

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icon library

### State Management
- **React Context** - Global state management for authentication
- **Local Storage** - Persistent user sessions
- **Mock Data** - Simulated backend data for prototyping

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd captains-ledger
   ```
**NOW FIRST GO TO BACKEND FOLDER **
```bash
   cd Backend
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
**Set up environment variables**

Create a .env file in the backend directory.

Add the necessary configuration, for example:

PORT=5000
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=

3. **Start development server**
   ```bash
   npm run dev
   ```
**NOW IN NEW TERMINAL OPEN 
```bash
cd Frontend
```
 **Install dependencies**
   ```bash
   npm install
   ```
**Start development server**
   ```bash
   npm run dev
   ```
4. **Open in browser**
   Navigate to `http://localhost:5173`
   
## 📱 Pages & Routes

### Public Routes
- `/login` - Authentication page
- `/register` - User registration

### Protected Routes
- `/dashboard` - Main dashboard (role-based content)
- `/missions` - Mission management
- `/send-money` - Money transfer system
- `/attendance` - Attendance tracking
- `/stats` - Analytics and charts
- `/announcements` - Communication center
- `/feedback` - Feedback submission

## 🎯 Key Features Implementation

### Role-Based Access Control
- Different dashboards for admin and regular users
- Conditional rendering based on user roles
- Protected routes with authentication checks

### Mock Data System
- Comprehensive mock data for all features
- Realistic Avengers-themed content
- Simulated API responses

### Responsive Design
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Touch-friendly interface elements

## 🔮 Future Enhancements

### Backend Integration
- **MongoDB** - Database for user and mission data
- **Node.js/Express** - RESTful API backend
- **JWT Authentication** - Secure token-based auth
- **Real-time Updates** - WebSocket integration

### Advanced Features
- **Email Notifications** - Automated email system
- **File Upload** - Mission documents and images
- **Calendar Integration** - Mission scheduling
- **Push Notifications** - Real-time alerts
- **Advanced Analytics** - Machine learning insights

### Security Enhancements
- **Two-Factor Authentication** - Enhanced security
- **Role Permissions** - Granular access control
- **Audit Logs** - Activity tracking
- **Data Encryption** - End-to-end encryption

## 🤝 Contributing

This is a prototype project showcasing modern React development practices. Feel free to fork and extend the functionality!

## 📄 License

This project is created for educational and demonstration purposes.

---

**"I can do this all day."** - Captain America

Built with ❤️ for the Avengers Initiative
