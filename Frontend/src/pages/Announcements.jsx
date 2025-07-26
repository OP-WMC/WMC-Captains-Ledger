import React, { useEffect, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements, submitAnnouncement, deleteAnnouncement } from "../api/announcementApi";
import { useAuth } from "../context/AuthContext";
import { Megaphone, Plus, AlertCircle } from "lucide-react";
import Loader from '../components/Loader';

const Announcements = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "", important: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 4;
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  
  
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
    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load announcements:", err);
        setError("Failed to load announcements. Please try again.");
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const newAnnouncement = await submitAnnouncement({
        title: formData.title,
        body: formData.body,
        important: formData.important,
      });

      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({ title: "", body: "", important: false });
      setShowForm(false);
    } catch (err) {
      console.error("Failed to submit announcement:", err);
      setError("Failed to submit announcement. Please check your input and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open modal and set which announcement to delete
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!isAdmin) {
      setError("You are not authorized to delete announcements.");
      setShowDeleteModal(false);
      return;
    }
    try {
      await deleteAnnouncement(deleteId);
      setAnnouncements(prevAnnouncements => prevAnnouncements.filter(ann => ann._id !== deleteId));
      setError("");
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError("Failed to delete announcement. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDelete = (id) => {
    openDeleteModal(id);
  };

  const filteredAnnouncements = announcements.filter(ann => {
    if (filter === "all") return true;
    if (filter === "important") return ann.important;
    if (filter === "normal") return !ann.important;
    return true;
  });

  const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * announcementsPerPage,
    currentPage * announcementsPerPage
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const displayedAnnouncements = isMobile ? paginatedAnnouncements.slice(0, 3) : paginatedAnnouncements;

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-blue-300 dark:bg-[#0f172a] p-6">
  //       <Loader />
  //     </div>
  //   );
  // }



  return (
    <>
    <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>
    <div className="min-h-screen  dark:bg-[rgb(15,23,42)] p-3 sm:p-6 w-full max-w-full overflow-visible">
      <div className="max-w-6xl mx-auto">
        {/* 🌐 Loader while data is fetching */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader />
        </div>
      ) : (
        <>
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-2 sm:mb-4 gap-2 sm:gap-4">
            <Megaphone className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 dark:text-white mr-0 sm:mr-4" />
            <h1 className="text-2xl sm:text-5xl font-bold font-orbitron text-blue-700 dark:text-white dark:bg-clip-text dark:text-transparent">
              Announcements
            </h1>
          </div>
          <p className="text-white dark:text-gray-400 text-base sm:text-lg">
            Stay updated with the latest news and important updates from the team
          </p>
        </div>

        {/* Admin Controls: Button to toggle new announcement form */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className=" bg-white hover:bg-blue-400 text-blue-600 hover:text-white font-bold dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-gray-700 dark:text-white dark:font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 hover:shadow-none flex items-center mx-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              {showForm ? "Cancel" : "Post New Announcement"}
            </button>
          </div>
        )}

        {/* Form to add new announcement (admin only) */}
        {isAdmin && showForm && (
          <div className="mb-10 animate-fadeIn">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl shadow-2xl border dark:border-gray-600 max-w-2xl mx-auto backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-blue-500 dark:text-white mb-6 text-center">Create New Announcement</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  required
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 rounded-lg text-black placeholder:text-black dark:placeholder:text-white dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  placeholder="Enter announcement title..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.body}
                  required
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full p-4 rounded-lg text-black placeholder:text-black dark:placeholder:text-white dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Enter announcement details..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Type</label>
                {/* Custom dropdown for mobile */}
                <div className="block sm:hidden w-full max-w-[220px]">
                  <button
                    type="button"
                    onClick={() => setMobileDropdownOpen('type')}
                    className="p-2 rounded-lg bg-white dark:bg-blue-700/30 dark:text-white text-blue-500 font-semibold border dark:border-blue-900/20 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
                  >
                    {formData.important ? '🚨 Important Announcement' : '📢 Normal Announcement'}
                    <span className="ml-2">▼</span>
                  </button>
                  {mobileDropdownOpen === 'type' && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                        <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Select Type</h3>
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          <li>
                            <button
                              type="button"
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${!formData.important ? 'font-bold' : ''}`}
                              onClick={() => { setFormData({ ...formData, important: false }); setMobileDropdownOpen(false); }}
                            >
                              📢 Normal Announcement
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${formData.important ? 'font-bold' : ''}`}
                              onClick={() => { setFormData({ ...formData, important: true }); setMobileDropdownOpen(false); }}
                            >
                              🚨 Important Announcement (Will send email to all users)
                            </button>
                          </li>
                        </ul>
                        <button
                          type="button"
                          className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs"
                          onClick={() => setMobileDropdownOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Native select for desktop/tablet */}
                <select
                  value={formData.important ? "important" : "normal"}
                  onChange={e => setFormData({ ...formData, important: e.target.value === "important" })}
                  className="hidden sm:block w-full p-2 rounded-lg dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-xs h-8"
                >
                  <option value="normal" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                    📢 Normal Announcement
                  </option>
                  <option value="important" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                    🚨 Important Announcement (Will send email to all users)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-500 dark:bg-blue-900/20 dark:hover:bg-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center"
              >
                {submitting ? (
                  <div className="flex items-center justify-center my-4">
                    <Loader />
                  </div>
                ) : (
                  <>
                    <Megaphone className="w-5 h-5 mr-2" />
                    Post Announcement
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Filter Dropdown */}
        <div className="mb-8 flex justify-end">
          {/* Mobile custom dropdown for filter */}
          <div className="block sm:hidden w-full max-w-[180px]">
            <button
              type="button"
              onClick={() => setMobileDropdownOpen(true)}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
            >
              {filter === 'all' && 'All Announcements'}
              {filter === 'important' && '🚨 Important'}
              {filter === 'normal' && '📢 Normal'}
              <span className="ml-2">▼</span>
            </button>
            {mobileDropdownOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                  <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Filter Announcements</h3>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
                        onClick={() => { setFilter('all'); setMobileDropdownOpen(false); }}
                      >
                        All Announcements
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
                        onClick={() => { setFilter('important'); setMobileDropdownOpen(false); }}
                      >
                        🚨 Important
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
                        onClick={() => { setFilter('normal'); setMobileDropdownOpen(false); }}
                      >
                        📢 Normal
                      </button>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs"
                    onClick={() => setMobileDropdownOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Desktop native select for filter */}
          <select
            value={filter}
            onChange={handleFilterChange}
            className="hidden sm:block p-2 sm:p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg text-xs sm:text-base w-full max-w-[180px]"
          >
            <option value="all" className="text-xs py-2 px-3">All Announcements</option>
            <option value="important" className="text-xs py-2 px-3">🚨 Important</option>
            <option value="normal" className="text-xs py-2 px-3">📢 Normal</option>
          </select>
        </div>

        {/* List of announcements */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader />
              <p className="text-white dark:text-gray-400">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Announcements Yet</h3>
              <p className="text-gray-500">Be the first to post an announcement!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedAnnouncements.map((ann, index) => (
                  <div key={ann._id || ann.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <AnnouncementCard
                      title={ann.title}
                      body={ann.body}
                      important={ann.important}
                      author={ann.author}
                      date={ann.date}
                      id={ann._id || ann.id}
                      isAdmin={isAdmin}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border bg-white hover:bg-blue-500 dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  &#8592; Prev
                </button>
                <span className="text-white font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border bg-white hover:bg-blue-500 dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white ${currentPage === totalPages || totalPages === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Next &#8594;
                </button>
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-sm mx-auto p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-700 dark:text-cyan-400">Delete Announcement</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this announcement? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
</>
      )}
      </div>
    </div>
    </>
  );
};

export default Announcements;

// import React, { useEffect, useState } from "react";
// import AnnouncementCard from "../components/AnnouncementCard";
// import { fetchAnnouncements, submitAnnouncement, deleteAnnouncement } from "../api/announcementApi";
// import { useAuth } from "../context/AuthContext";
// import { Megaphone, Plus, AlertCircle } from "lucide-react";
// import Loader from '../components/Loader';

// const Announcements = () => {
//   const { isAdmin } = useAuth();
//   const [announcements, setAnnouncements] = useState([]);
//   const [formData, setFormData] = useState({ title: "", body: "", important: false });
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [filter, setFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const announcementsPerPage = 4;
//   const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deleteId, setDeleteId] = useState(null);
//   useEffect(() => {
//     const loadAnnouncements = async () => {
//       try {
//         const data = await fetchAnnouncements();
//         setAnnouncements(data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load announcements:", err);
//         setError("Failed to load announcements. Please try again.");
//         setLoading(false);
//       }
//     };

//     loadAnnouncements();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError("");

//     try {
//       const newAnnouncement = await submitAnnouncement({
//         title: formData.title,
//         body: formData.body,
//         important: formData.important,
//       });

//       setAnnouncements([newAnnouncement, ...announcements]);
//       setFormData({ title: "", body: "", important: false });
//       setShowForm(false);
//     } catch (err) {
//       console.error("Failed to submit announcement:", err);
//       setError("Failed to submit announcement. Please check your input and try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };
// // Open modal and set which announcement to delete
//   const openDeleteModal = (id) => {
//     setDeleteId(id);
//     setShowDeleteModal(true);
//   };

//   // Confirm delete
//   const confirmDelete = async () => {
//     if (!isAdmin) {
//       setError("You are not authorized to delete announcements.");
//       setShowDeleteModal(false);
//       return;
//     }
//     try {
//       await deleteAnnouncement(deleteId);
//       setAnnouncements(prevAnnouncements => prevAnnouncements.filter(ann => ann._id !== deleteId));
//       setError("");
//     } catch (err) {
//       console.error("Failed to delete announcement:", err);
//       setError("Failed to delete announcement. Please try again.");
//     } finally {
//       setShowDeleteModal(false);
//       setDeleteId(null);
//     }
//   };
//   const cancelDelete = () => {
//     setShowDeleteModal(false);
//     setDeleteId(null);
//   };

//   const filteredAnnouncements = announcements.filter(ann => {
//     if (filter === "all") return true;
//     if (filter === "important") return ann.important;
//     if (filter === "normal") return !ann.important;
//     return true;
//   });

//   const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);
//   const paginatedAnnouncements = filteredAnnouncements.slice(
//     (currentPage - 1) * announcementsPerPage,
//     currentPage * announcementsPerPage
//   );

//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
//   const displayedAnnouncements = isMobile ? paginatedAnnouncements.slice(0, 3) : paginatedAnnouncements;

//   const handleFilterChange = (e) => {
//     setFilter(e.target.value);
//     setCurrentPage(1);
//   };

//   const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
//   const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-blue-300 dark:bg-[#0f172a] p-6">
//         <Loader />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-blue-300 dark:bg-[rgb(15,23,42)] p-3 sm:p-6 w-full max-w-full overflow-x-hidden">
//       <div className="max-w-6xl mx-auto">
//         {/* Header Section */}
//         <div className="text-center mb-6 sm:mb-8">
//           <div className="flex flex-col sm:flex-row items-center justify-center mb-2 sm:mb-4 gap-2 sm:gap-4">
//             <Megaphone className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 dark:text-white mr-0 sm:mr-4" />
//             <h1 className="text-2xl sm:text-5xl font-bold font-orbitron text-blue-700 dark:text-white dark:bg-clip-text dark:text-transparent">
//               Announcements
//             </h1>
//           </div>
//           <p className="text-white dark:text-gray-400 text-base sm:text-lg">
//             Stay updated with the latest news and important updates from the team
//           </p>
//         </div>

//         {/* Admin Controls: Button to toggle new announcement form */}
//         {isAdmin && (
//           <div className="mb-8 text-center">
//             <button
//               onClick={() => setShowForm(!showForm)}
//               className=" bg-white hover:bg-blue-400 text-blue-600 hover:text-white font-bold dark:bg-[rgba(255,255,255,0.05)] dark:hover:bg-gray-700 dark:text-white dark:font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 hover:shadow-none flex items-center mx-auto"
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               {showForm ? "Cancel" : "Post New Announcement"}
//             </button>
//           </div>
//         )}

//         {/* Form to add new announcement (admin only) */}
//         {isAdmin && showForm && (
//           <div className="mb-10 animate-fadeIn">
//             <form
//               onSubmit={handleSubmit}
//               className="bg-white dark:bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl shadow-2xl border dark:border-gray-600 max-w-2xl mx-auto backdrop-blur-sm"
//             >
//               <h2 className="text-2xl font-bold text-blue-500 dark:text-white mb-6 text-center">Create New Announcement</h2>
              
//               <div className="mb-6">
//                 <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Title</label>
//                 <input
//                   type="text"
//                   value={formData.title}
//                   required
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   className="w-full p-4 rounded-lg text-black placeholder:text-black dark:placeholder:text-white dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter announcement title..."
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Description</label>
//                 <textarea
//                   value={formData.body}
//                   required
//                   onChange={(e) => setFormData({ ...formData, body: e.target.value })}
//                   className="w-full p-4 rounded-lg text-black placeholder:text-black dark:placeholder:text-white dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none"
//                   rows="4"
//                   placeholder="Enter announcement details..."
//                 ></textarea>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Type</label>
//                 {/* Custom dropdown for mobile */}
//                 <div className="block sm:hidden w-full max-w-[220px]">
//                   <button
//                     type="button"
//                     onClick={() => setMobileDropdownOpen('type')}
//                     className="p-2 rounded-lg bg-white dark:bg-blue-700/30 dark:text-white text-blue-500 font-semibold border dark:border-blue-900/20 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
//                   >
//                     {formData.important ? '🚨 Important Announcement' : '📢 Normal Announcement'}
//                     <span className="ml-2">▼</span>
//                   </button>
//                   {mobileDropdownOpen === 'type' && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//                       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
//                         <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Select Type</h3>
//                         <ul className="divide-y divide-gray-200 dark:divide-gray-700">
//                           <li>
//                             <button
//                               type="button"
//                               className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${!formData.important ? 'font-bold' : ''}`}
//                               onClick={() => { setFormData({ ...formData, important: false }); setMobileDropdownOpen(false); }}
//                             >
//                               📢 Normal Announcement
//                             </button>
//                           </li>
//                           <li>
//                             <button
//                               type="button"
//                               className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${formData.important ? 'font-bold' : ''}`}
//                               onClick={() => { setFormData({ ...formData, important: true }); setMobileDropdownOpen(false); }}
//                             >
//                               🚨 Important Announcement (Will send email to all users)
//                             </button>
//                           </li>
//                         </ul>
//                         <button
//                           type="button"
//                           className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs"
//                           onClick={() => setMobileDropdownOpen(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 {/* Native select for desktop/tablet */}
//                 <select
//                   value={formData.important ? "important" : "normal"}
//                   onChange={e => setFormData({ ...formData, important: e.target.value === "important" })}
//                   className="hidden sm:block w-full p-2 rounded-lg dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-xs h-8"
//                 >
//                   <option value="normal" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
//                     📢 Normal Announcement
//                   </option>
//                   <option value="important" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
//                     🚨 Important Announcement (Will send email to all users)
//                   </option>
//                 </select>
//               </div>

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className="w-full bg-blue-500 dark:bg-blue-900/20 dark:hover:bg-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center"
//               >
//                 {submitting ? (
//                   <div className="flex items-center justify-center my-4">
//                     <Loader />
//                   </div>
//                 ) : (
//                   <>
//                     <Megaphone className="w-5 h-5 mr-2" />
//                     Post Announcement
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//         )}

//         {/* Error Message Display */}
//         {error && (
//           <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center">
//             <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
//             <span className="text-red-400">{error}</span>
//           </div>
//         )}

//         {/* Filter Dropdown */}
//         <div className="mb-8 flex justify-end">
//           {/* Mobile custom dropdown for filter */}
//           <div className="block sm:hidden w-full max-w-[180px]">
//             <button
//               type="button"
//               onClick={() => setMobileDropdownOpen(true)}
//               className="p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
//             >
//               {filter === 'all' && 'All Announcements'}
//               {filter === 'important' && '🚨 Important'}
//               {filter === 'normal' && '📢 Normal'}
//               <span className="ml-2">▼</span>
//             </button>
//             {mobileDropdownOpen && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//                 <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
//                   <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Filter Announcements</h3>
//                   <ul className="divide-y divide-gray-200 dark:divide-gray-700">
//                     <li>
//                       <button
//                         type="button"
//                         className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
//                         onClick={() => { setFilter('all'); setMobileDropdownOpen(false); }}
//                       >
//                         All Announcements
//                       </button>
//                     </li>
//                     <li>
//                       <button
//                         type="button"
//                         className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
//                         onClick={() => { setFilter('important'); setMobileDropdownOpen(false); }}
//                       >
//                         🚨 Important
//                       </button>
//                     </li>
//                     <li>
//                       <button
//                         type="button"
//                         className="w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
//                         onClick={() => { setFilter('normal'); setMobileDropdownOpen(false); }}
//                       >
//                         📢 Normal
//                       </button>
//                     </li>
//                   </ul>
//                   <button
//                     type="button"
//                     className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs"
//                     onClick={() => setMobileDropdownOpen(false)}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* Desktop native select for filter */}
//           <select
//             value={filter}
//             onChange={handleFilterChange}
//             className="hidden sm:block p-2 sm:p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg text-xs sm:text-base w-full max-w-[180px]"
//           >
//             <option value="all" className="text-xs py-2 px-3">All Announcements</option>
//             <option value="important" className="text-xs py-2 px-3">🚨 Important</option>
//             <option value="normal" className="text-xs py-2 px-3">📢 Normal</option>
//           </select>
//         </div>

//         {/* List of announcements */}
//         <div className="space-y-6">
//           {loading ? (
//             <div className="text-center py-12">
//               <Loader />
//               <p className="text-white dark:text-gray-400">Loading announcements...</p>
//             </div>
//           ) : filteredAnnouncements.length === 0 ? (
//             <div className="text-center py-12">
//               <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-400 mb-2">No Announcements Yet</h3>
//               <p className="text-gray-500">Be the first to post an announcement!</p>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {displayedAnnouncements.map((ann, index) => (
//                   <div key={ann._id || ann.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
//                     <AnnouncementCard
//                       title={ann.title}
//                       body={ann.body}
//                       important={ann.important}
//                       author={ann.author}
//                       date={ann.date}
//                       id={ann._id || ann.id}
//                       isAdmin={isAdmin}
//                       onDelete={handleDelete}
//                     />
//                   </div>
//                 ))}
//               </div>
//               {/* Pagination Controls */}
//               <div className="flex justify-center items-center mt-8 space-x-4">
//                 <button
//                   onClick={handlePrevPage}
//                   disabled={currentPage === 1}
//                   className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border bg-white hover:bg-blue-500 dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
//                 >
//                   &#8592; Prev
//                 </button>
//                 <span className="text-white font-semibold">
//                   Page {currentPage} of {totalPages}
//                 </span>
//                 <button
//                   onClick={handleNextPage}
//                   disabled={currentPage === totalPages || totalPages === 0}
//                   className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border bg-white hover:bg-blue-500 dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white ${currentPage === totalPages || totalPages === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
//                 >
//                   Next &#8594;
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Announcements;