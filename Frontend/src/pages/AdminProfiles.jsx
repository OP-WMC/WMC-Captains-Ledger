import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import Modal from 'react-modal';
import axios from '../api/axios';
import Loader from '../components/Loader';

const PROFILES_PER_PAGE = 8;

const AdminProfiles = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminStart, setAdminStart] = useState('');
  const [adminEnd, setAdminEnd] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(null);

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
          this.size = Math.random() *7 + 1;
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
    if (!isAdmin) return;
    const fetchProfiles = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/users', {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setProfiles(data);
        } else {
          setError(data.error || 'Failed to fetch profiles.');
        }
      } catch (err) {
        setError('Error fetching profiles.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [isAdmin]);

  // Filtering logic
  const filteredProfiles = profiles.filter(profile => {
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' && profile.role === 'admin') ||
      (roleFilter === 'user' && profile.role === 'user');
    const matchesSearch =
      profile.name.toLowerCase().includes(search.toLowerCase()) ||
      (profile.codename && profile.codename.toLowerCase().includes(search.toLowerCase()));
    return matchesRole && matchesSearch;
  });
  const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE);
  const paginatedProfiles = filteredProfiles.slice((page - 1) * PROFILES_PER_PAGE, page * PROFILES_PER_PAGE);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openAdminModal = (profile) => {
    setSelectedUser(profile);
    setAdminStart('');
    setAdminEnd('');
    setModalMsg('');
    setShowAdminModal(true);
  };
  const closeAdminModal = () => {
    setShowAdminModal(false);
    setSelectedUser(null);
    setAdminStart('');
    setAdminEnd('');
    setModalMsg('');
  };
  const handleAssignAdmin = async () => {
    if (!adminStart || !adminEnd) {
      setModalMsg('Please select both start and end date/time.');
      return;
    }
    setAssigning(true);
    setModalMsg('');
    try {
      const res = await axios.post('/auth/make-temp-admin', {
        userId: selectedUser._id,
        adminStart,
        adminEnd,
      });
      setModalMsg('Temporary admin assigned successfully!');
      setTimeout(() => {
        closeAdminModal();
        setProfiles((prev) => prev.map(p => p._id === selectedUser._id ? res.data.user : p));
      }, 1200);
    } catch (err) {
      setModalMsg(err.response?.data?.error || 'Failed to assign temporary admin.');
    } finally {
      setAssigning(false);
    }
  };

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
    </div>
  );
  if (!isAdmin) return <div>Access denied. Admins only.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br  dark:bg-[#0f172a] p-6">
      <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-white  drop-shadow-lg">All User Profiles</h2>
      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 w-full md:w-1/2 order-1 md:order-none">
          <input
            type="text"
            placeholder="Search by name or codename..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border-blue-200 dark:border-cyan-300 bg-blue-50 dark:bg-[rgba(255,255,255,0.05)] text-blue-700 dark:text-white px-3 py-2 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto order-2 md:order-none justify-end">
          <label className="font-semibold text-blue-700 dark:text-white ">Role:</label>
          {/* Custom dropdown for mobile */}
          <div className="block sm:hidden w-full max-w-[120px]">
            <button
              type="button"
              onClick={() => setMobileDropdownOpen('role')}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-700 font-semibold border dark:border-black focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
            >
              {roleFilter === 'all' && 'All'}
              {roleFilter === 'admin' && 'Admin'}
              {roleFilter === 'user' && 'User'}
              <span className="ml-2">▼</span>
            </button>
            {mobileDropdownOpen === 'role' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                  <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Filter by Role</h3>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${roleFilter === 'all' ? 'font-bold' : ''}`} onClick={() => { setRoleFilter('all'); setPage(1); setMobileDropdownOpen(null); }}>All</button></li>
                    <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${roleFilter === 'admin' ? 'font-bold' : ''}`} onClick={() => { setRoleFilter('admin'); setPage(1); setMobileDropdownOpen(null); }}>Admin</button></li>
                    <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${roleFilter === 'user' ? 'font-bold' : ''}`} onClick={() => { setRoleFilter('user'); setPage(1); setMobileDropdownOpen(null); }}>User</button></li>
                  </ul>
                  <button type="button" className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs" onClick={() => setMobileDropdownOpen(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
          {/* Native select for desktop/tablet */}
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="hidden sm:block rounded-lg border-blue-200 dark:border-black bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-white px-2 sm:px-3 py-2 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div>Loading profiles...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {paginatedProfiles.map((profile) => (
              <div
                key={profile._id}
                className="relative glass-card group rounded-xl shadow-xl p-4 flex flex-col items-center transition-transform duration-300   bg-white/70  border border-blue-200 min-h-[270px]"
              >
                {/* Profile photo - inside card, not overlapping heading */}
                <div className="flex flex-col items-center w-full">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="w-28 h-28 rounded-full object-cover border-4 border-blue-300 dark:border-avengers-silver shadow bg-white dark:bg-[#0f172a] mb-2"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-blue-200 dark:bg-[#0f172a] flex items-center justify-center border-4 border-blue-300 dark:border-avengers-silver text-xl font-bold text-blue-500 dark:text-gray-300 shadow mb-2">
                      No Photo
                    </div>
                  )}
                  <div className="text-base font-bold text-blue-700 dark:text-white mb-1 tracking-wide text-center">{profile.name}</div>
                </div>
                {/* Expand/collapse details */}
                <button
                  className="mt-2 mb-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-[#0f172a] text-blue-700 dark:text-cyan-300 text-xs font-semibold shadow hover:bg-blue-200 dark:hover:bg-cyan-800/70 transition"
                  onClick={() => toggleExpand(profile._id)}
                  aria-label={expanded[profile._id] ? 'Hide Details' : 'View Details'}
                >
                  {expanded[profile._id] ? <EyeOff size={16} className="inline mr-1" /> : <Eye size={16} className="inline mr-1" />}
                  {expanded[profile._id] ? 'Hide Details' : 'View Details'}
                </button>
                {/* Make Admin Button (not for self or existing admins) */}
                {profile.role !== 'admin' && user._id !== profile._id && (
                  (() => {
                    const now = new Date();
                    const isTempAdminActive = profile.tempAdmin && profile.adminStart && profile.adminEnd &&
                      now >= new Date(profile.adminStart) && now <= new Date(profile.adminEnd);
                    if (!isTempAdminActive) {
                      return (
                        <button
                          className="mb-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold shadow hover:bg-green-200 dark:hover:bg-green-800/70 transition ml-2"
                          onClick={() => openAdminModal(profile)}
                        >
                          Make Admin
                        </button>
                      );
                    }
                    return null;
                  })()
                )}
                {/* Show if user is a temporary admin */}
                {profile.tempAdmin && profile.adminStart && profile.adminEnd && (
                  <div className="text-xs text-green-700 dark:text-green-300 mt-1">Temp Admin<br/>({new Date(profile.adminStart).toLocaleString()}<br/>to<br/>{new Date(profile.adminEnd).toLocaleString()})</div>
                )}
                {expanded[profile._id] && (
                  <div className="w-full flex flex-col gap-1 mt-2 text-xs animate-fadeIn">
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Email:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">{profile.email}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Power:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.power || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Abilities:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.abilities?.join(', ') || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Weapons:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.weapons?.join(', ') || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Past Achievements:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.pastAchievements || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Past Success Rate:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.pastSuccessRate !== undefined && profile.pastSuccessRate !== '' ? `${profile.pastSuccessRate}%` : '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Mission Style:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.missionStyle || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Availability:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.availability || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Role:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.role}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Balance:</span> <span className="text-blue-700 dark:text-gray-200 font-bold">₹{profile.balance?.toLocaleString()}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        {/* </>
      )}
    </div> */}
<br />
              <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
            <button
              className="p-2 rounded-full bg-blue-200 dark:bg-[rgba(255,255,255,0.05)] text-blue-700 dark:text-white hover:bg-blue-300 dark:hover:bg-[rgba(201,150,150,0.05)]  transition disabled:opacity-40 disabled:cursor-not-allowed "
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous"
            >
              
              <ChevronLeft size={24} />
            </button>
            <span className="text-blue-700 dark:text-white font-semibold">Page {page} of {totalPages}</span>
            <button
              className="p-2 rounded-full bg-blue-200 dark:bg-[rgba(255,255,255,0.05)] text-blue-700 dark:text-white hover:bg-blue-300 dark:hover:bg-[rgba(201,150,150,0.05)] transition disabled:opacity-40 disabled:cursor-not-allowed "
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </div>
             </>
      )}
      {/* Make Admin Modal */}
      <Modal
        isOpen={showAdminModal}
        onRequestClose={closeAdminModal}
        ariaHideApp={false}
        className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md mx-auto mt-24 shadow-lg border border-blue-200 dark:border-cyan-700 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-white">Assign Temporary Admin</h2>
        <div className="mb-4">
          <label className="block mb-1 text-blue-700 dark:text-cyan-300 font-semibold">Start Date & Time</label>
          <input
            type="datetime-local"
            value={adminStart}
            onChange={e => setAdminStart(e.target.value)}
            className="w-full rounded border px-3 py-2"
            min={new Date().toISOString().slice(0,16)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-blue-700 dark:text-cyan-300 font-semibold">End Date & Time</label>
          <input
            type="datetime-local"
            value={adminEnd}
            onChange={e => setAdminEnd(e.target.value)}
            className="w-full rounded border px-3 py-2"
            min={adminStart || new Date().toISOString().slice(0,16)}
          />
        </div>
        {modalMsg && <div className={`mb-3 text-sm ${modalMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{modalMsg}</div>}
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
            onClick={closeAdminModal}
            disabled={assigning}
          >Cancel</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            onClick={handleAssignAdmin}
            disabled={assigning}
          >{assigning ? 'Assigning...' : 'Assign'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProfiles; 
