import { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Edit, Trash2, CheckCircle, Clock, XCircle, Flag, AlertTriangle, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import Modal from 'react-modal';


const Missions = () => {
  const { user, isAdmin } = useAuth();

  const [missions, setMissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [finalizeMission, setFinalizeMission] = useState(null);
  const [finalizeStatus, setFinalizeStatus] = useState('completed');
  const [selectedMartyrs, setSelectedMartyrs] = useState([]);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [salaryMode, setSalaryMode] = useState('full');
  const [advancedAmount, setAdvancedAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [declinedInfo, setDeclinedInfo] = useState(null);
  const [reassignMission, setReassignMission] = useState(null);
  const [selectedReplacement, setSelectedReplacement] = useState('');
  const [replacementSalary, setReplacementSalary] = useState('');
  const [reassignSubmitting, setReassignSubmitting] = useState(false);
  const [showSendSalaryModal, setShowSendSalaryModal] = useState(false);
  const [finalizedMissionId, setFinalizedMissionId] = useState(null);
  const [sendingSalaryMissionId, setSendingSalaryMissionId] = useState(null);

  const defaultForm = {
    title: '',
    description: '',
    status: 'ongoing',
    priority: 'medium',
    location: '',
    startDate: '',
    endDate: '',
    assignedMembers: [], // [{ name, salary }]
  };

  const [formData, setFormData] = useState(defaultForm);

  const nowISOString = new Date().toISOString().slice(0, 16); // for min attribute

  useEffect(() => {
    fetchMissions();
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMemberDropdown(false);
      }
    };

    if (showMemberDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMemberDropdown]);

  // Check for missions to finalize (admin only)
  useEffect(() => {
    if (isAdmin) {
      const now = new Date();
      const toFinalize = missions.find(m =>
        m.status === 'ongoing' &&
        m.endDate && new Date(m.endDate) < now
      );
      if (toFinalize) {
        setFinalizeMission(toFinalize);
        setShowFinalizeModal(true);
      } else {
        setShowFinalizeModal(false);
      }
    }
  }, [missions, isAdmin]);

  // Check for declined members in missions (admin only)
  useEffect(() => {
    if (isAdmin && missions.length > 0) {
      for (const mission of missions) {
        const declined = mission.assignedMembers.find(m => m.status === 'declined');
        if (declined) {
          setDeclinedInfo({
            member: declined,
            mission
          });
          setReassignMission(mission);
          setShowReassignModal(true);
          break;
        }
      }
    }
  }, [isAdmin, missions]);

  const fetchMissions = async () => {
    try {
      const res = await axios.get('/missions');
      setMissions(res.data);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    }
  };

const fetchUsers = async () => {
  try {
    const res = await axios.get("/auth/users");
    const filtered = res.data.filter((u) => u.email !== user.email);
    setUsers(filtered);
  } catch (err) {
    console.error("Error fetching users", err);
  }
};

  const handleSubmit = async () => {
    // Validate all fields are filled
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.startDate || !formData.endDate || !formData.status || !formData.priority) {
      setValidationError('Please fill in all fields.');
      return;
    }
    if (!Array.isArray(formData.assignedMembers) || formData.assignedMembers.length === 0) {
      setValidationError('Please assign at least one member.');
      return;
    }
    // Ensure all assigned members have a salary
    if (formData.assignedMembers.some(m => m.salary === undefined || m.salary === null || m.salary === '' || isNaN(m.salary))) {
      setValidationError('Please enter a salary for all assigned members.');
      return;
    }
    // Validate startDate and endDate are not in the past
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();
    if (start < now) {
      setValidationError('Start date and time cannot be in the past.');
      return;
    }
    if (end < start) {
      setValidationError('End date/time must be after start date/time.');
      return;
    }
    try {
      const url = showEditModal
        ? `/missions/${selectedMission._id}`
        : '/missions';
      const method = showEditModal ? 'put' : 'post';

      await axios[method](url, formData);

      setFormData(defaultForm);
      setShowCreateModal(false);
      setShowEditModal(false);
      setShowMemberDropdown(false);
      fetchMissions();
    } catch (error) {
      console.error("Mission submit failed:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/missions/${id}`);
      fetchMissions();
    } catch (error) {
      console.error("Failed to delete mission:", error);
    }
  };

  // Handle member selection with checkboxes
  const handleMemberToggle = (memberName) => {
    const exists = formData.assignedMembers.find(m => m.name === memberName);
    let updatedMembers;
    if (exists) {
      updatedMembers = formData.assignedMembers.filter(m => m.name !== memberName);
    } else {
      updatedMembers = [...formData.assignedMembers, { name: memberName, salary: 0 }];
    }
    setFormData({ ...formData, assignedMembers: updatedMembers });
  };

  // Handle salary change for a member
  const handleSalaryChange = (memberName, salary) => {
    const updatedMembers = formData.assignedMembers.map(m =>
      m.name === memberName ? { ...m, salary: Number(salary) } : m
    );
    setFormData({ ...formData, assignedMembers: updatedMembers });
  };

  // Handle select all members
  const handleSelectAll = () => {
    if (formData.assignedMembers.length === users.length) {
      setFormData({ ...formData, assignedMembers: [] });
    } else {
      setFormData({
        ...formData,
        assignedMembers: users.map(u => {
          const existing = formData.assignedMembers.find(m => m.name === u.name);
          return { name: u.name, salary: existing ? existing.salary : 0 };
        })
      });
    }
  };

  const userMissions = missions.filter((m) =>
    Array.isArray(m.assignedMembers) &&
    user?.name &&
    m.assignedMembers.some(
      (member) => {
        const memberName = typeof member === 'string' ? member : (member?.name || '');
        return memberName && memberName.trim().toLowerCase() === user.name.trim().toLowerCase();
      }
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

  const handleFinalize = async () => {
    try {
      await axios.post(`/missions/finalize/${finalizeMission._id}`, {
        status: finalizeStatus,
        martyrs: finalizeStatus === 'martyred' ? selectedMartyrs : [],
        updatedBy: user?.name || 'admin',
      });
      setShowFinalizeModal(false);
      setSelectedMartyrs([]);
      setFinalizeStatus('completed');
      setFinalizedMissionId(finalizeMission._id);
      await fetchMissions();
    } catch (err) {
      alert('Failed to finalize mission.');
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignMission || !selectedReplacement) return;
    setReassignSubmitting(true);
    try {
      await axios.post(`/missions/${reassignMission._id}/reassign`, {
        oldMemberName: declinedInfo.member.name,
        newMemberName: selectedReplacement,
        newMemberSalary: replacementSalary
      });
      setShowReassignModal(false);
      setDeclinedInfo(null);
      setReassignMission(null);
      setSelectedReplacement('');
      setReplacementSalary('');
      window.location.reload();
    } catch (err) {
      alert('Failed to reassign member.');
    } finally {
      setReassignSubmitting(false);
    }
  };

  // Helper to check if there are accepted members
  const hasAcceptedMembers = (mission) => {
    return Array.isArray(mission?.assignedMembers) && mission.assignedMembers.some(m => m.status === 'accepted');
  };

  // Show Send Salary modal after missions are refreshed and finalizedMissionId is set
  useEffect(() => {
    if (finalizedMissionId && missions.length > 0) {
      const updated = missions.find(m => m._id === finalizedMissionId);
      if (updated && updated.status !== 'ongoing' && hasAcceptedMembers(updated) && !updated.salariesPaid && (updated.status === 'completed' || updated.status === 'failed' || updated.status === 'martyred')) {
        setFinalizeMission(updated);
        setShowSendSalaryModal(true);
      } else {
        setFinalizeMission(null);
        setShowSendSalaryModal(false);
      }
      setFinalizedMissionId(null); // Reset after handling
    }
  }, [missions, finalizedMissionId]);

  // Helper to check if a mission is eligible for salary payment
  const isSalaryEligible = (mission) => {
    // Only show if there are accepted members (not auto-failed with zero members)
    return (
      mission &&
      Array.isArray(mission.assignedMembers) &&
      mission.assignedMembers.length > 0 &&
      mission.salariesPaid === false &&
      (mission.status === 'completed' || mission.status === 'martyred' || mission.status === 'failed')
    );
  };

  // When opening Send Salary modal, reset mode/amounts
  const openSendSalaryModal = (mission) => {
    setFinalizeMission(mission);
    setSalaryMode('full');
    setAdvancedAmount('');
    setRemainingAmount('');
    setShowSendSalaryModal(true);
    setSendingSalaryMissionId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-10 pt-4 sm:pt-6 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-blue-700 dark:text-white mb-1 sm:mb-2 mt-10 sm:mt-0">🛰️ Mission Control</h1>
          <p className="text-slate-600 dark:text-cyan-100 text-sm sm:text-base">
            {isAdmin ? 'Manage and assign missions' : 'Your assigned missions'}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="avengers-button flex items-center space-x-2 mt-2 sm:mt-0">
            <Plus className="w-5 h-5" /> <span>Create</span>
          </button>
        )}
      </div>
      {/* Filter */}
      <div className="glass-card">
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <span className="text-slate-600 dark:text-cyan-100 text-xs sm:text-base">Filter:</span>
          {['all', 'ongoing', 'completed', 'failed', 'martyred'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg transition text-xs sm:text-base ${
                filter === status
                  ? 'bg-blue-400 text-white'
                  : 'bg-avengers-gray/50 text-white hover:bg-blue-400'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredMissions.map((mission) => (
          <div key={mission._id} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl text-blue-700 dark:text-white font-semibold font-orbitron mb-1">🕵️‍♂️ {mission.title}</h3>
                <p className="text-gray-700 dark:text-avengers-silver">{mission.description}</p>
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
                    <Edit className="w-5 h-5 text-blue-400 " />
                  </button>
                  <button onClick={() => handleDelete(mission._id)}>
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                  {/* Send Salary Button on eligible missions */}
                  {isSalaryEligible(mission) && sendingSalaryMissionId !== mission._id && (
                    <button
                      className="avengers-button bg-gradient-to-r from-green-500 to-green-700 text-white ml-2"
                      onClick={() => openSendSalaryModal(mission)}
                    >
                      Send Salary
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm mt-3 space-y-1 text-gray-700 dark:text-avengers-silver">
              <div>📍 {mission.location}</div>
              <div>📆 {mission.startDate} - {mission.endDate || 'Ongoing'}</div>
              <div>⚠️ Priority: {mission.priority}</div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(mission.status)} <span>{mission.status}</span>
              </div>
              <div>👥 {mission.assignedMembers.map(m => typeof m === 'string' ? m : `${m.name} (₹${m.salary || 0})`).join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Empty State */}
      {filteredMissions.length === 0 && (
        <div className="text-center text-gray-700 dark:text-avengers-silver mt-6 sm:mt-10 text-sm sm:text-base">
          🚫 No missions found for your selection.
        </div>
      )}
      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-blue-100 dark:bg-gray-900 p-1 sm:p-8 rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg mx-1 sm:mx-auto relative max-h-[90vh] overflow-y-auto">
            {/* Validation Error Popup */}
            {validationError && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-avengers-gray border-2 border-avengers-red text-avengers-red dark:text-red-400 rounded-xl shadow-2xl p-4 sm:p-6 max-w-xs w-full flex flex-col items-center animate-fadeInUp">
                  <span className="text-3xl mb-2">⚠️</span>
                  <p className="text-center font-semibold mb-4">{validationError}</p>
                  <button
                    className="avengers-button px-2 py-1 text-xs text-white bg-avengers-red hover:bg-red-600 rounded-lg h-9"
                    onClick={() => setValidationError("")}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); }} className="absolute top-2 right-2 text-[#f8fafc] hover:text-blue-700 dark:hover:text-white font-bold text-2xl sm:text-4xl"
              >&times;</button>
            <h2 className="text-base sm:text-2xl font-bold text-blue-700 dark:text-white mb-2 sm:mb-6 text-center">{showEditModal ? 'Edit Mission' : 'Create Mission'}</h2>
            <div className="space-y-2 sm:space-y-4">
              {/* Mission Details Section */}
              <div className="bg-[#f8fafc] dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-inner">
                <h3 className="text-lg font-bold text-blue-700 dark:text-avengers-blue mb-3 flex items-center gap-2">📝 Mission Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2 h-8 max-w-xs sm:max-w-full"
                    placeholder="🕵️‍♂️ Title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                  <input
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2 h-8 max-w-xs sm:max-w-full"
                    placeholder="📍 Location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    min={nowISOString}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2 h-8 max-w-xs sm:max-w-full"
                    required
                  />
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    min={formData.startDate || nowISOString}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2 h-8 max-w-xs sm:max-w-full"
                    required
                  />
                  <select
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option className="text-xs">ongoing</option>
                    <option className="text-xs">completed</option>
                    <option className="text-xs">failed</option>
                    <option className="text-xs">martyred</option>
                  </select>
                  <select
                    className="input bg-blue-100 dark:bg-avengers-gray dark:text-white w-full text-gray-700 font-semibold text-xs p-2"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option className="text-xs">critical</option>
                    <option className="text-xs">high</option>
                    <option className="text-xs">medium</option>
                    <option className="text-xs">low</option>
                  </select>
                </div>
                <textarea
                  className="input bg-blue-100  dark:bg-avengers-gray dark:text-white w-full mt-4 text-gray-700 font-semibold "
                  placeholder="📝 Description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Assign Members Section */}
              <div className="bg-[#f8fafc] dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-inner">
                <h3 className="text-lg font-bold text-blue-700 dark:text-green-400 mb-3 flex items-center gap-2">👥 Assign Members</h3>
                <div className="relative mb-2" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="input bg-blue-100 dark:bg-avengers-gray text-gray-700 font-semibold dark:text-white w-full flex items-center justify-between"
                  >
                    <span>
                      {formData.assignedMembers.length === 0
                        ? 'Select members...'
                        : `${formData.assignedMembers.length} member(s) selected`
                      }
                    </span>
                    {showMemberDropdown ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {showMemberDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-blue-100 dark:bg-avengers-gray border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-gray-600">
                        <label className="flex items-center space-x-2 text-gray-700 dark:text-white hover:bg-avengers-blue/20 p-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedMembers.length === users.length && users.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-avengers-blue bg-blue-100 dark:bg-gray-700 border-gray-600 rounded focus:ring-avengers-blue focus:ring-2"
                          />
                          <span className="font-medium">Select All</span>
                        </label>
                      </div>
                      {users.map((user) => {
                        const memberObj = formData.assignedMembers.find(m => m.name === user.name);
                        return (
                          <div key={user._id} className="p-2 flex items-center gap-2">
                            <label className="flex items-center space-x-2
                            text-gray-700 font-semibold dark:text-white hover:bg-avengers-blue/20 p-2 rounded cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={!!memberObj}
                                onChange={() => handleMemberToggle(user.name)}
                                className="w-4 h-4 text-gray-700 font-semibold dark:text-avengers-blue bg-blue-100  dark:bg-gray-700 border-gray-600 rounded focus:ring-avengers-blue focus:ring-2"
                              />
                              <span>{user.name}</span>
                              <span className="text-gray-700 dark:text-avengers-silver text-sm">({user.email})</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Assign Salary Section */}
              {formData.assignedMembers.length > 0 && (
                <div className="bg-[#f8fafc] dark:bg-yellow-50 rounded-xl p-4 mb-2 shadow-inner border dark:border-yellow-300">
                  <h3 className="text-lg font-bold text-blue-700 dark:text-yellow-600 mb-3 flex items-center gap-2">💸 Assign Salary</h3>
                  <div className="space-y-2">
                    {formData.assignedMembers.map((member) => {
                      const user = users.find(u => u.name === member.name);
                      return (
                        <div key={member.name} className="flex items-center gap-4 bg-blue-100 dark:bg-yellow-100 rounded p-2">
                          <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-yellow-300 flex items-center justify-center
                          text-white dark:text-yellow-900 font-bold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-700  dark:text-yellow-800">{member.name}</div>
                            <div className="text-xs text-gray-700  dark:text-yellow-700">{user?.email}</div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder="Salary"
                            value={member.salary}
                            onChange={e => handleSalaryChange(member.name, e.target.value)}
                            className="input dark:bg-yellow-200
                            text-gray-700 dark:text-yellow-900 w-28 border border-blue-600 dark:border-yellow-400"
                          />
                          <span className="text-xs text-gray-700 dark:text-yellow-700 ml-2">₹</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-right text-blue-600 dark:text-yellow-800 font-semibold">
                    Total Salary: ₹{formData.assignedMembers.reduce((sum, m) => sum + (m.salary || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-700 dark:text-yellow-700 mt-1">Please ensure all salaries are filled before submitting.</div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 sm:pt-4">
              <button
                onClick={() => {
                  setFormData(defaultForm);
                  setValidationError("");
                }}
                className="avengers-button  font-semibold text-xs sm:text-base w-full sm:w-auto py-1 sm:py-3 h-9"
                type="button"
              >
                Clear Fields
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setShowMemberDropdown(false);
                }}
                className="avengers-button  font-semibold text-xs sm:text-base w-full sm:w-auto py-1 sm:py-3 h-9"
                type="button"
              >
                Cancel
              </button>
              <button onClick={handleSubmit} className="avengers-button w-full sm:w-auto py-1 sm:py-3 text-xs sm:text-base h-9">
                {showEditModal ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalize Mission Modal (Admin) */}
      {showFinalizeModal && finalizeMission && (
        <Modal
          isOpen={showFinalizeModal}
          onRequestClose={() => setShowFinalizeModal(false)}
          className="bg-[#f8fafc] dark:bg-gray-900 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto mt-12 sm:mt-24 relative"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          ariaHideApp={false}
        >
          <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-6 text-center">Finalize Mission: {finalizeMission.title}</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Mission Outcome</label>
            <select
              value={finalizeStatus}
              onChange={e => setFinalizeStatus(e.target.value)}
              className="w-full p-2 rounded-lg bg-blue-500 dark:bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-xs"
            >
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="martyred">Martyred</option>
            </select>
          </div>
          {finalizeStatus === 'martyred' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-300">Select Martyrs</label>
              <select
                multiple
                value={selectedMartyrs}
                onChange={e => setSelectedMartyrs(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-xs"
              >
                {finalizeMission.assignedMembers
                  .filter(member => member.status === 'accepted')
                  .map(member => (
                    <option key={typeof member === 'string' ? member : member.name} value={typeof member === 'string' ? member : member.name}>
                      {typeof member === 'string' ? member : `${member.name} (₹${member.salary || 0})`}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowFinalizeModal(false)}
              className="avengers-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalize}
              className="avengers-button"
            >
              Finalize
            </button>
          </div>
        </Modal>
      )}

      {/* Send Salary Modal (reused) */}
      {showSendSalaryModal && finalizeMission && (
        <Modal
          isOpen={showSendSalaryModal}
          onRequestClose={() => setShowSendSalaryModal(false)}
          className="bg-[#f8fafc] dark:bg-gray-900 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto mt-12 sm:mt-24 relative"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          ariaHideApp={false}
        >
          <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-6 text-center">Send Salary for Mission: {finalizeMission.title}</h2>
          {/* Salary Payment Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 dark:text-gray-300">Salary Payment Mode</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="salaryMode"
                  value="full"
                  checked={salaryMode === 'full'}
                  onChange={() => { setSalaryMode('full'); setAdvancedAmount(''); setRemainingAmount(''); }}
                />
                <span>Full Salary</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="salaryMode"
                  value="advance"
                  checked={salaryMode === 'advance'}
                  onChange={() => setSalaryMode('advance')}
                />
                <span className="flex items-center gap-1">Advance Money</span>
              </label>
            </div>
          </div>
          {/* If Advance Money, show input fields */}
          {salaryMode === 'advance' && (
            <div className="mb-4 p-4 bg-blue-300 dark:bg-yellow-900/20 rounded-lg border dark:border-yellow-700/30">
              <p className="text-sm dark:text-yellow-300 font-medium mb-2">
                💡 Advanced Mode: Pay part of the salary now, and the rest after approval.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white dark:text-avengers-silver mb-2">
                    Advanced Amount (₹) - Immediate
                  </label>
                  <input
                    type="number"
                    value={advancedAmount}
                    onChange={e => {
                      setAdvancedAmount(e.target.value);
                      const total = finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0);
                      setRemainingAmount(Math.max(0, total - (parseInt(e.target.value) || 0)).toString());
                    }}
                    className="input-field w-full bg-white text-blue-500 placeholder:text-blue-500 font-bold"
                    placeholder="Immediate amount"
                    min="1"
                    max={finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0)}
                    required={salaryMode === 'advance'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white dark:text-avengers-silver mb-2">
                    Remaining Amount (₹) - After Approval
                  </label>
                  <input
                    type="number"
                    value={remainingAmount}
                    onChange={e => {
                      setRemainingAmount(e.target.value);
                      const total = finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0);
                      setAdvancedAmount(Math.max(0, total - (parseInt(e.target.value) || 0)).toString());
                    }}
                    className="input-field w-full bg-white text-blue-500 placeholder:text-blue-500 font-bold"
                    placeholder="Remaining amount"
                    min="1"
                    max={finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0)}
                    required={salaryMode === 'advance'}
                  />
                </div>
              </div>
              {advancedAmount && remainingAmount && (
                <div className="text-left p-2 text-white dark:bg-blue-900/30 rounded mt-2">
                  <p className="text-sm text-white dark:text-blue-300">
                    Total: ₹{parseInt(advancedAmount) + parseInt(remainingAmount)}
                    {parseInt(advancedAmount) + parseInt(remainingAmount) === finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0)
                      ? " ✅" : " ❌ (Must equal total salary)"}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <SendSalaryButton
              missionId={finalizeMission._id}
              salaryMode={salaryMode}
              advancedAmount={salaryMode === 'advance' ? advancedAmount : undefined}
              remainingAmount={salaryMode === 'advance' ? remainingAmount : undefined}
              totalSalary={finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0)}
              setSendingSalaryMissionId={setSendingSalaryMissionId}
              disabled={salaryMode === 'advance' && (!advancedAmount || !remainingAmount || (parseInt(advancedAmount) + parseInt(remainingAmount) !== finalizeMission.assignedMembers.filter(m => m.status === 'accepted').reduce((sum, m) => sum + (m.salary || 0), 0)))}
            />
            <button
              onClick={() => setShowSendSalaryModal(false)}
              className="avengers-button-secondary ml-2"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Reassign Member Modal (Admin) */}
      <Modal
        isOpen={showReassignModal}
        onRequestClose={() => setShowReassignModal(false)}
        className="bg-blue-100 dark:bg-gray-900 p-4 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-auto mt-12 sm:mt-24 relative"
        overlayClassName="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
        ariaHideApp={false}
      >
        {declinedInfo && (
          <div>
            <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-6 text-center">Member Declined Mission</h2>
            <div className="mb-4">
              <div className="font-semibold text-lg text-blue-700 dark:text-white">Mission: {reassignMission?.title}</div>
              <div className="text-gray-700 dark:text-cyan-200">Declined by: {declinedInfo.member.name}</div>
              <div className="text-gray-700 dark:text-cyan-200">Reason: {declinedInfo.member.declineReason}</div>
              {declinedInfo.member.declineFile && (
                <div className="text-gray-700 dark:text-cyan-200 mt-2">
                  <a href={declinedInfo.member.declineFile} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">View Attachment</a>
                </div>
              )}
            </div>
            <form onSubmit={handleReassign} className="mt-6">
              <label className="block text-gray-700 dark:text-cyan-200 font-semibold mb-2">Select Replacement Member</label>
              <select
                className="w-full p-2 rounded border border-gray-400 dark:bg-gray-800 dark:text-white text-xs"
                value={selectedReplacement}
                onChange={e => setSelectedReplacement(e.target.value)}
                required
              >
                <option value="">Select member...</option>
                {users.filter(u => u.name !== declinedInfo.member.name && !reassignMission.assignedMembers.some(m => m.name === u.name)).map(u => (
                  <option key={u._id} value={u.name}>{u.name} ({u.email})</option>
                ))}
              </select>
              <label className="block mt-4 text-gray-700 dark:text-cyan-200 font-semibold mb-2">Assign Salary</label>
              <input
                type="number"
                className="w-full p-2 rounded border border-gray-400 dark:bg-gray-800 dark:text-white"
                value={replacementSalary}
                onChange={e => setReplacementSalary(e.target.value)}
                min="0"
                required
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="avengers-button-secondary border-2 border-blue-500 text-gray-700 dark:border-blue-500 dark:text-avengers-silver hover:bg-gray-100 dark:hover:bg-blue-900/10 font-semibold"
                  onClick={() => setShowReassignModal(false)}
                  disabled={reassignSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="avengers-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  disabled={reassignSubmitting}
                >
                  Reassign
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

function SendSalaryButton({ missionId, salaryMode, advancedAmount, remainingAmount, totalSalary, setSendingSalaryMissionId, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendSalary = async () => {
    setLoading(true);
    setError(null);
    try {
      let payload = {};
      if (salaryMode === 'advance') {
        payload.advancedAmount = parseInt(advancedAmount);
        payload.remainingAmount = parseInt(remainingAmount);
      }
      const res = await axios.post(`/missions/${missionId}/send-salary`, payload);
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setError('Stripe session could not be created.');
        setSendingSalaryMissionId(null);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating Stripe session.');
      setSendingSalaryMissionId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSendSalary}
      className="avengers-button bg-gradient-to-r from-green-500 to-green-700 text-white"
      disabled={loading || disabled}
      style={{ minWidth: 120 }}
    >
      {loading ? 'Redirecting...' : 'Send Salary'}
    </button>
  );
}

export default Missions;
