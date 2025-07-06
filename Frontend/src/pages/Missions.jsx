import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus, Edit, Trash2, CheckCircle, Clock, XCircle, Flag, AlertTriangle
} from 'lucide-react';

const Missions = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filter, setFilter] = useState('all');

  const defaultForm = {
    title: '',
    description: '',
    status: 'ongoing',
    priority: 'medium',
    location: '',
    startDate: '',
    endDate: '',
    assignedMembers: [],
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchMissions();
    if (isAdmin) fetchUsers();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/missions');
      setMissions(res.data);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    }
  };

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get("http://localhost:5000/api/auth/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const filtered = res.data.filter((u) => u.email !== currentUser.email);
    setUsers(filtered);
  } catch (err) {
    console.error("Error fetching users", err);
  }
};


  const handleSubmit = async () => {
    try {
      const url = showEditModal
        ? `http://localhost:5000/api/missions/${selectedMission._id}`
        : 'http://localhost:5000/api/missions';
      const method = showEditModal ? 'put' : 'post';

      await axios[method](url, formData);

      setFormData(defaultForm);
      setShowCreateModal(false);
      setShowEditModal(false);
      fetchMissions();
    } catch (error) {
      console.error("Mission submit failed:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/missions/${id}`);
      fetchMissions();
    } catch (error) {
      console.error("Failed to delete mission:", error);
    }
  };

  const userMissions = missions.filter((m) =>
    Array.isArray(m.assignedMembers) &&
    user?.name &&
    m.assignedMembers.some(
      (name) => name.trim().toLowerCase() === user.name.trim().toLowerCase()
    )
  );

  const displayedMissions = isAdmin ? missions : userMissions;
  const filteredMissions = displayedMissions.filter(m =>
    filter === 'all' || m.status === filter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ongoing': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'martyred': return <Flag className="w-5 h-5 text-purple-400" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-10 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">🛰️ Mission Control</h1>
          <p className="text-avengers-silver">
            {isAdmin ? 'Manage and assign missions' : 'Your assigned missions'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="avengers-button flex items-center space-x-2">
            <Plus className="w-5 h-5" /> <span>Create</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card">
        <div className="flex items-center flex-wrap gap-3">
          <span className="text-avengers-silver">Filter:</span>
          {['all', 'ongoing', 'completed', 'failed', 'martyred'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === status
                  ? 'bg-avengers-blue text-white'
                  : 'bg-avengers-gray/50 text-avengers-silver hover:bg-avengers-gray'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMissions.map((mission) => (
          <div key={mission._id} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl text-white font-orbitron mb-1">🕵️‍♂️ {mission.title}</h3>
                <p className="text-avengers-silver">{mission.description}</p>
              </div>
              {isAdmin && (
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setFormData({ ...mission });
                      setSelectedMission(mission);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="w-5 h-5 text-blue-400" />
                  </button>
                  <button onClick={() => handleDelete(mission._id)}>
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm mt-3 space-y-1 text-avengers-silver">
              <div>📍 {mission.location}</div>
              <div>📆 {mission.startDate} - {mission.endDate || 'Ongoing'}</div>
              <div>⚠️ Priority: {mission.priority}</div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(mission.status)} <span>{mission.status}</span>
              </div>
              <div>👥 {mission.assignedMembers.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="text-center text-avengers-silver mt-10">
          🚫 No missions found for your selection.
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && isAdmin && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="glass-card w-full max-w-xl p-6 space-y-4">
            <h2 className="text-2xl text-white font-orbitron">
              {showEditModal ? '✏️ Edit Mission' : '🚀 Create New Mission'}
            </h2>

            <input
              className="input bg-avengers-gray text-white w-full"
              placeholder="🕵️‍♂️ Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <textarea
              className="input bg-avengers-gray text-white w-full"
              placeholder="📝 Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              className="input bg-avengers-gray text-white w-full"
              placeholder="📍 Location"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />

            <div className="flex gap-3">
              <input
                type="date"
                className="input bg-avengers-gray text-white w-full"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
              <input
                type="date"
                className="input bg-avengers-gray text-white w-full"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <select
              className="input bg-avengers-gray text-white w-full"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option>ongoing</option>
              <option>completed</option>
              <option>failed</option>
              <option>martyred</option>
            </select>

            <select
              className="input bg-avengers-gray text-white w-full"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
            >
              <option>critical</option>
              <option>high</option>
              <option>medium</option>
              <option>low</option>
            </select>

            <label className="text-avengers-silver text-sm">👥 Assign Members:</label>
            <select
              multiple
              className="input bg-avengers-gray text-white w-full"
              value={formData.assignedMembers}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assignedMembers: Array.from(e.target.selectedOptions).map(opt => opt.value),
                })
              }
            >
              {users.map((u) => (
                <option key={u._id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="avengers-button-secondary"
              >
                Cancel
              </button>
              <button onClick={handleSubmit} className="avengers-button">
                {showEditModal ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missions;
