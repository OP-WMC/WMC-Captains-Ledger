import React, { useEffect, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements, submitAnnouncement } from "../api/announcementApi";
import { useAuth } from "../context/AuthContext";
import { Megaphone, Plus, Loader2, AlertCircle } from "lucide-react";

const Announcements = () => {
  const { isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "", important: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Megaphone className="w-12 h-12 text-yellow-400 mr-4" />
            <h1 className="text-5xl font-bold font-orbitron bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Announcements
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Stay updated with the latest news and important updates from the team
          </p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 flex items-center mx-auto"
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
              className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl shadow-2xl border border-gray-600 max-w-2xl mx-auto backdrop-blur-sm"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Announcement</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  required
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter announcement title..."
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-300">Description</label>
                <textarea
                  value={formData.body}
                  required
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full p-4 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="4"
                  placeholder="Enter announcement details..."
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-300">Type</label>
                <select
                  value={formData.important ? "important" : "normal"}
                  onChange={e => setFormData({ ...formData, important: e.target.value === "important" })}
                  className="w-full p-4 rounded-lg bg-gray-600 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="normal">📢 Normal Announcement</option>
                  <option value="important">🚨 Important Announcement (Will send email to all users)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 disabled:transform-none disabled:shadow-none flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Posting...
                  </>
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

        {/* List of announcements */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Announcements Yet</h3>
              <p className="text-gray-500">Be the first to post an announcement!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {announcements.map((ann, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;