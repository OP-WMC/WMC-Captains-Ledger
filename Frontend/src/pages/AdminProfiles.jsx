import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

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

  if (authLoading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access denied. Admins only.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br  dark:bg-[#0f172a] p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700 dark:text-white dark:text-shadow-glow  drop-shadow-lg">All User Profiles</h2>
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
        <div className="flex items-center gap-3 w-full md:w-auto order-2 md:order-none justify-end">
          <label className="font-semibold text-blue-700 dark:text-white ">Role:</label>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className=" rounded-lg border-blue-200 dark:border-black bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-white px-3 py-2 focus:outline-none "
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
                {expanded[profile._id] && (
                  <div className="w-full flex flex-col gap-1 mt-2 text-xs animate-fadeIn">
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Email:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">{profile.email}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Power:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.power || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Abilities:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.abilities?.join(', ') || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Weapons:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.weapons?.join(', ') || '-'}</span></div>
                    <div><span className="font-semibold text-blue-600 dark:text-cyan-300">Past Achievements:</span> <span className="text-gray-900 dark:text-gray-200 font-medium">{profile.pastAchievements || '-'}</span></div>
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
    </div>
  );
};

export default AdminProfiles; 