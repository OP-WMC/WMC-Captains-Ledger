import React, { useEffect, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements, submitAnnouncement } from "../api/announcementApi";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      });

      setAnnouncements([newAnnouncement, ...announcements]);
      setFormData({ title: "", body: "" });
    } catch (err) {
      setError("Failed to submit announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 font-orbitron text-center">Announcements</h1>

      {/* Form to add new announcement */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl mb-10 max-w-xl mx-auto"
      >
        <div className="mb-4">
          <label className="block text-sm mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            required
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={formData.body}
            required
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            rows="4"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-yellow-500 px-4 py-2 rounded font-semibold hover:bg-yellow-600"
        >
          {submitting ? "Posting..." : "Post Announcement"}
        </button>
      </form>

      {/* List of announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <p>Loading announcements...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          announcements.map((ann) => (
            <AnnouncementCard key={ann.id} title={ann.title} body={ann.body} />
          ))}
      </div>
    </div>
  );
};

export default Announcements;