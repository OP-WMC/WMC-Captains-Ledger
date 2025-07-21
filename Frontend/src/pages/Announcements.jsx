import React, { useEffect, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements, submitAnnouncement } from "../api/announcementApi";
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

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const data = await fetchAnnouncements();
        setAnnouncements(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load announcements.");
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

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
      setError("Failed to submit announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered announcements based on dropdown
  const filteredAnnouncements = announcements.filter(ann => {
    if (filter === "all") return true;
    if (filter === "important") return ann.important;
    if (filter === "normal") return !ann.important;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnouncements.length / announcementsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * announcementsPerPage,
    currentPage * announcementsPerPage
  );

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle page navigation
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-300 dark:bg-[#0f172a] p-6">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-300 dark:bg-[#0f172a]  p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Megaphone className="w-12 h-12 text-blue-500 dark:text-white mr-4" />
            <h1 className="text-5xl font-bold font-orbitron text-blue-700  dark:text-white dark:text-shadow-glow dark:bg-clip-text dark:text-transparent">
              Announcements
            </h1>
          </div>
          <p className="text-white dark:text-gray-400 text-lg">
            Stay updated with the latest news and important updates from the team
          </p>
        </div>

        {/* Admin Controls */}
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
                  className="w-full p-4 rounded-lg text-black placeholder:text-black dark:placeholder:text-white  dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20  focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Enter announcement details..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-blue-500 dark:text-gray-300">Type</label>
                <select
                  value={formData.important ? "important" : "normal"}
                  onChange={e => setFormData({ ...formData, important: e.target.value === "important" })}
                  className="w-full p-4 rounded-lg dark:bg-blue-700/30 dark:text-white border border-gray-500 font-medium dark:border-blue-900/20 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                >
                  <option value="normal">📢 Normal Announcement</option>
                  <option value="important">🚨 Important Announcement (Will send email to all users)</option>
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Filter Dropdown */}
        <div className="mb-8 flex justify-end">
          <select
            value={filter}
            onChange={handleFilterChange}
            className="p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg"
          >
            <option value="all">All Announcements</option>
            <option value="important">🚨 Important</option>
            <option value="normal">📢 Normal</option>
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
                {paginatedAnnouncements.map((ann, index) => (
                  <div key={ann._id || ann.id} className="animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                    <AnnouncementCard 
                      title={ann.title} 
                      body={ann.body} 
                      important={ann.important}
                      author={ann.author}
                      date={ann.date}
                    />
                  </div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-8 space-x-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border bg-white hover:bg-blue-500  dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white disabled:bg-white disabled:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  &#8592; Prev
                </button>
                <span className="text-white font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-5 py-2 rounded-lg font-bold transition-all duration-200 shadow-lg border
                    bg-white hover:bg-blue-500 dark:border-gray-600 dark:bg-gray-500 text-blue-500 dark:text-white dark:hover:bg-gray-700 hover:text-white disabled:bg-white disabled:text-blue-500 disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Next &#8594;
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;