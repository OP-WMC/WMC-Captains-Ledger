// Mock data for Captain's Ledger

export const mockMissions = [
  {
    id: 1,
    title: 'Liberate Madripoor',
    description: 'Infiltration mission to free the city from Flag Smashers control',
    status: 'completed',
    assignedMembers: ['Sam Wilson', 'Bucky Barnes', 'Sharon Carter'],
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    priority: 'high',
    location: 'Madripoor'
  },
  {
    id: 2,
    title: 'Recover Super Soldier Serum',
    description: 'Secure remaining vials of the serum from black market dealers',
    status: 'ongoing',
    assignedMembers: ['Bucky Barnes', 'John Walker'],
    startDate: '2024-03-25',
    endDate: null,
    priority: 'critical',
    location: 'New York'
  },
  {
    id: 3,
    title: 'Protect GRC Vote',
    description: 'Ensure the Global Repatriation Council vote proceeds without interference',
    status: 'ongoing',
    assignedMembers: ['Sam Wilson', 'Sharon Carter'],
    startDate: '2024-03-28',
    endDate: null,
    priority: 'high',
    location: 'Geneva'
  },
  {
    id: 4,
    title: 'Neutralize Flag Smashers',
    description: 'Apprehend remaining Flag Smashers members',
    status: 'failed',
    assignedMembers: ['John Walker', 'Bucky Barnes'],
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    priority: 'medium',
    location: 'Riga'
  }
];

export const mockTransactions = [
  {
    id: 1,
    from: 'Sam Wilson',
    to: 'Bucky Barnes',
    amount: 5000,
    date: '2024-03-25',
    status: 'completed',
    type: 'transfer'
  },
  {
    id: 2,
    from: 'Sharon Carter',
    to: 'John Walker',
    amount: 3000,
    date: '2024-03-24',
    status: 'completed',
    type: 'transfer'
  },
  {
    id: 3,
    from: 'System',
    to: 'Sam Wilson',
    amount: 15000,
    date: '2024-03-20',
    status: 'completed',
    type: 'salary'
  },
  {
    id: 4,
    from: 'Bucky Barnes',
    to: 'Sharon Carter',
    amount: 2000,
    date: '2024-03-23',
    status: 'pending',
    type: 'transfer'
  }
];

export const mockAttendance = [
  {
    id: 1,
    userId: 1,
    name: 'Sam Wilson',
    date: '2024-03-25',
    status: 'present',
    checkIn: '09:00',
    checkOut: '17:00'
  },
  {
    id: 2,
    userId: 2,
    name: 'Bucky Barnes',
    date: '2024-03-25',
    status: 'present',
    checkIn: '08:45',
    checkOut: '16:30'
  },
  {
    id: 3,
    userId: 3,
    name: 'Sharon Carter',
    date: '2024-03-25',
    status: 'absent',
    checkIn: null,
    checkOut: null
  },
  {
    id: 4,
    userId: 4,
    name: 'John Walker',
    date: '2024-03-25',
    status: 'present',
    checkIn: '09:15',
    checkOut: '17:30'
  }
];

export const mockAnnouncements = [
  {
    id: 1,
    title: 'New Mission Assignment',
    content: 'All available agents report to briefing room for new mission details.',
    author: 'Sam Wilson',
    date: '2024-03-25',
    important: true,
    category: 'mission'
  },
  {
    id: 2,
    title: 'Training Schedule Update',
    content: 'Combat training sessions moved to 2 PM daily. All agents must attend.',
    author: 'Sam Wilson',
    date: '2024-03-24',
    important: false,
    category: 'training'
  },
  {
    id: 3,
    title: 'Equipment Maintenance',
    content: 'All gear must be checked and maintained before next mission deployment.',
    author: 'Sharon Carter',
    date: '2024-03-23',
    important: false,
    category: 'equipment'
  }
];

export const mockFeedback = [
  {
    id: 1,
    userId: 2,
    userName: 'Bucky Barnes',
    subject: 'Mission Coordination',
    message: 'Need better communication protocols during high-stress situations.',
    date: '2024-03-24',
    status: 'pending'
  },
  {
    id: 2,
    userId: 3,
    userName: 'Sharon Carter',
    subject: 'Equipment Request',
    message: 'Requesting additional surveillance gear for upcoming missions.',
    date: '2024-03-23',
    status: 'reviewed'
  },
  {
    id: 3,
    userId: 4,
    userName: 'John Walker',
    subject: 'Training Feedback',
    message: 'Combat training sessions are very effective. Suggest more advanced scenarios.',
    date: '2024-03-22',
    status: 'resolved'
  }
];

export const mockStats = {
  attendance: {
    'Sam Wilson': 95,
    'Bucky Barnes': 88,
    'Sharon Carter': 92,
    'John Walker': 85
  },
  missions: {
    completed: 12,
    ongoing: 3,
    failed: 2,
    total: 17
  },
  payments: {
    total: 150000,
    pending: 5000,
    completed: 145000
  }
};

export const generateAttendanceCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const mockUsers = [
  {
    id: 1,
    name: 'Sam Wilson',
    email: 'captain@avengers.com',
    role: 'admin',
    avatar: '🦅',
    codename: 'Captain America',
    balance: 50000,
    attendancePercentage: 95
  },
  {
    id: 2,
    name: 'Bucky Barnes',
    email: 'bucky@avengers.com',
    role: 'user',
    avatar: '🤖',
    codename: 'Winter Soldier',
    balance: 35000,
    attendancePercentage: 88
  },
  {
    id: 3,
    name: 'Sharon Carter',
    email: 'sharon@avengers.com',
    role: 'user',
    avatar: '🕊️',
    codename: 'Agent 13',
    balance: 42000,
    attendancePercentage: 92
  },
  {
    id: 4,
    name: 'John Walker',
    email: 'walker@avengers.com',
    role: 'user',
    avatar: '⚡',
    codename: 'US Agent',
    balance: 28000,
    attendancePercentage: 85
  }
]; 