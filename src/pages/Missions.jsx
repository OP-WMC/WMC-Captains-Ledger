import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockMissions, mockUsers } from '../services/mockData';
import { 
  Plus, 
  Edit, 
  Users, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Flag
} from 'lucide-react';

const Missions = () => {
  const { user, isAdmin } = useAuth();
  const [missions, setMissions] = useState(mockMissions);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filter, setFilter] = useState('all');

  const userMissions = missions.filter(mission => 
    mission.assignedMembers.includes(user?.name)
  );

  const displayedMissions = isAdmin ? missions : userMissions;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'ongoing':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'martyred':
        return <Flag className="w-5 h-5 text-purple-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'ongoing':
        return 'status-ongoing';
      case 'failed':
        return 'status-failed';
      case 'martyred':
        return 'status-martyred';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredMissions = displayedMissions.filter(mission => {
    if (filter === 'all') return true;
    return mission.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Mission Control
          </h1>
          <p className="text-avengers-silver">
            {isAdmin ? 'Manage all missions and assignments' : 'View your assigned missions'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="avengers-button flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Mission</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card">
        <div className="flex items-center space-x-4">
          <span className="text-avengers-silver font-medium">Filter:</span>
          {['all', 'ongoing', 'completed', 'failed', 'martyred'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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

      {/* Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMissions.map((mission) => (
          <div key={mission.id} className="glass-card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-orbitron font-semibold text-white mb-2">
                  {mission.title}
                </h3>
                <p className="text-avengers-silver mb-3">{mission.description}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    setSelectedMission(mission);
                    setShowEditModal(true);
                  }}
                  className="p-2 text-avengers-silver hover:text-white hover:bg-avengers-blue/20 rounded-lg transition-all duration-200"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-avengers-silver text-sm">Status:</span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(mission.status)}`}>
                  {getStatusIcon(mission.status)}
                  <span className="capitalize">{mission.status}</span>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center justify-between">
                <span className="text-avengers-silver text-sm">Priority:</span>
                <span className={`text-sm font-medium ${getPriorityColor(mission.priority)}`}>
                  {mission.priority.charAt(0).toUpperCase() + mission.priority.slice(1)}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <span className="text-avengers-silver text-sm">Location:</span>
                <div className="flex items-center space-x-1 text-white">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{mission.location}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between">
                <span className="text-avengers-silver text-sm">Duration:</span>
                <div className="flex items-center space-x-1 text-white">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {mission.startDate} - {mission.endDate || 'Ongoing'}
                  </span>
                </div>
              </div>

              {/* Team Members */}
              <div className="flex items-center justify-between">
                <span className="text-avengers-silver text-sm">Team:</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-avengers-silver" />
                  <span className="text-sm text-white">
                    {mission.assignedMembers.length} members
                  </span>
                </div>
              </div>

              {/* Team Members List */}
              <div className="flex flex-wrap gap-2 mt-2">
                {mission.assignedMembers.map((member) => {
                  const user = mockUsers.find(u => u.name === member);
                  return (
                    <div
                      key={member}
                      className="flex items-center space-x-2 px-3 py-1 bg-avengers-gray/50 rounded-full"
                    >
                      <span className="text-lg">{user?.avatar || '🦸'}</span>
                      <span className="text-xs text-avengers-silver">{member}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="glass-card text-center py-12">
          <Flag className="w-16 h-16 text-avengers-silver mx-auto mb-4" />
          <h3 className="text-xl font-orbitron font-semibold text-white mb-2">
            No missions found
          </h3>
          <p className="text-avengers-silver">
            {filter === 'all' 
              ? 'No missions have been assigned yet.' 
              : `No ${filter} missions found.`
            }
          </p>
        </div>
      )}

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md">
            <h2 className="text-2xl font-orbitron font-semibold text-white mb-4">
              Create New Mission
            </h2>
            <p className="text-avengers-silver mb-4">
              Mission creation form coming soon...
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="avengers-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="avengers-button flex-1"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mission Modal */}
      {showEditModal && selectedMission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md">
            <h2 className="text-2xl font-orbitron font-semibold text-white mb-4">
              Edit Mission
            </h2>
            <p className="text-avengers-silver mb-4">
              Mission editing form coming soon...
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="avengers-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="avengers-button flex-1"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Missions; 