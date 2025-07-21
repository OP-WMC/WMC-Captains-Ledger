import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { CheckCircle, Clock, DollarSign, User, Mail, Calendar } from "lucide-react";
import Modal from "react-modal";
import Loader from '../components/Loader';

const PendingApprovals = () => {
  const { user, isAdmin } = useAuth();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [resultModal, setResultModal] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (isAdmin) {
      fetchPendingTransactions();
    }
  }, [isAdmin]);

  const fetchPendingTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/transactions/pending-advanced");
      setPendingTransactions(response.data);
    } catch (error) {
      console.error("Error fetching pending transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async () => {
    setPasswordError("");
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    try {
      setApproving(selectedTransactionId);
      const res = await axios.post("/auth/login", {
        email: user.email,
        password,
      });
      if (res.data && res.data.user && res.data.user.isAdmin) {
        await handleApprove(selectedTransactionId, true);
        setShowPasswordModal(false);
      } else {
        setPasswordError("Invalid password or not admin");
      }
    } catch (err) {
      setPasswordError("Invalid password");
    } finally {
      setApproving(null);
    }
  };

  const handleApprove = async (transactionId, skipPasswordModal = false) => {
    if (!skipPasswordModal) {
      handleApproveClick(transactionId);
      return;
    }
    try {
      setApproving(transactionId);
      await axios.post(`/transactions/approve-remaining/${transactionId}`);
      setPendingTransactions(prev => prev.filter(txn => txn._id !== transactionId));
      setResultModal({ open: true, message: "Remaining amount approved successfully!", type: "success" });
    } catch (error) {
      console.error("Error approving transaction:", error);
      setResultModal({ open: true, message: "Failed to approve transaction: " + (error.response?.data?.message || "Unknown error"), type: "error" });
    } finally {
      setApproving(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-avengers-silver">
            This page is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-blue-700 dark:text-white mb-2 text-shadow-glow">
          Pending Approvals
        </h1>
        <p className="text-blue-400 dark:text-avengers-silver">
          Review and approve remaining amounts for advanced money mode transactions
        </p>
      </div>

      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-orbitron font-semibold dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Advanced Transactions
          </h2>
          <button
            onClick={fetchPendingTransactions}
            disabled={loading}
            className="avengers-button px-4 py-2 text-sm"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader />
            <p className="dark:text-avengers-silver">Loading pending transactions...</p>
          </div>
        ) : pendingTransactions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className=" dark:text-avengers-silver text-lg">No pending transactions</p>
            <p className="dark:text-avengers-silver text-sm">All advanced money mode transactions have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-blue-300 dark:bg-blue-900/20 border border-blue-700/30 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">
                          {transaction.sender?.name}
                        </span>
                        <span className="dark:text-avengers-silver">→</span>
                        <span className="text-white font-semibold">
                          {transaction.receiver?.name}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-yellow-900/70 text-yellow-400 text-xs rounded">
                        Advanced Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-white dark:text-avengers-silver font-semibold">Total Amount:</span>
                        <span className="text-white font-semibold">₹{transaction.amount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                        <span className="text-white dark:text-avengers-silver font-semibold">Advanced (Sent):</span>
                        <span className="text-green-400 font-semibold">₹{transaction.advancedAmount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-orange-400" />
                        <span className="text-white dark:text-avengers-silver font-semibold">Remaining (Pending):</span>
                        <span className="text-orange-400 font-semibold">₹{transaction.remainingAmount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-m text-white dark:text-avengers-silver">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{transaction.sender?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{(() => {
                          const dateVal = transaction.timestamp || transaction.createdAt;
                          const dateObj = dateVal ? new Date(dateVal) : null;
                          return dateObj && !isNaN(dateObj) ? dateObj.toLocaleDateString() : "Invalid date";
                        })()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleApproveClick(transaction._id)}
                      disabled={approving === transaction._id}
                      className="avengers-button px-4 py-2 text-sm flex items-center gap-2"
                    >
                      {approving === transaction._id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve ₹{transaction.remainingAmount}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Confirmation Modal */}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        ariaHideApp={false}
      >
        <div className="bg-blue-300 dark:bg-blue-900/90 p-8 rounded-xl shadow-lg border border-blue-400 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-white mb-4">Admin Password Required</h2>
          <p className="mb-4 text-blue-900 dark:text-avengers-silver">Please enter your password to approve this request.</p>
          <input
            type="password"
            className="w-full px-4 py-2 mb-2 border border-blue-400 rounded-lg focus:outline-none focus:border-blue-700"
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {passwordError && <div className="text-red-500 text-sm mb-2">{passwordError}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="avengers-button px-4 py-2 text-sm"
              onClick={() => setShowPasswordModal(false)}
              disabled={approving}
            >
              Cancel
            </button>
            <button
              className="avengers-button px-4 py-2 text-sm"
              onClick={handlePasswordConfirm}
              disabled={approving}
            >
              {approving ? "Verifying..." : "Confirm & Approve"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal
        isOpen={resultModal.open}
        onRequestClose={() => setResultModal({ ...resultModal, open: false })}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
        ariaHideApp={false}
      >
        <div className="bg-blue-300 dark:bg-blue-900/90 p-8 rounded-xl shadow-lg border border-blue-400 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-blue-700 dark:text-white mb-4">
            {resultModal.type === "success" ? "Success" : "Error"}
          </h2>
          <p className="mb-4 text-blue-900 dark:text-avengers-silver">{resultModal.message}</p>
          <div className="flex justify-end">
            <button
              className="avengers-button px-4 py-2 text-sm"
              onClick={() => setResultModal({ ...resultModal, open: false })}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PendingApprovals; 