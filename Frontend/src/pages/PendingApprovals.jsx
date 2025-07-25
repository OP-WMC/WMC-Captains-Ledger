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
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
      <canvas
      id="particles"
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    ></canvas>
    
      <div>
        <h1 className="text-2xl sm:text-3xl font-orbitron font-bold text-blue-700 dark:text-white mb-1 sm:mb-2  mt-10 sm:mt-0">
          Pending Approvals
        </h1>
        <p className="text-xs sm:text-base text-blue-400 dark:text-avengers-silver">
          Review and approve remaining amounts for advanced money mode transactions
        </p>
      </div>

      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-6 gap-1 sm:gap-0">
          <h2 className="text-base sm:text-xl font-orbitron font-semibold dark:text-white flex items-center gap-1 sm:gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-lg">Pending Advanced Transactions</span>
          </h2>
          <button
            onClick={fetchPendingTransactions}
            disabled={loading}
            className="avengers-button px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
            style={{ minWidth: 80 }}
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
          <div className="space-y-2 sm:space-y-4">
            {pendingTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="bg-blue-300 dark:bg-blue-900/20 border border-blue-700/30 rounded-lg p-2 sm:p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 mb-2">
                      <div className="flex items-center gap-1 xs:gap-2">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-xs sm:text-base text-white font-semibold">
                          {transaction.sender?.name}
                        </span>
                        <span className="dark:text-avengers-silver text-xs">→</span>
                        <span className="text-xs sm:text-base text-white font-semibold">
                          {transaction.receiver?.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-yellow-900/70 text-yellow-400 text-xs rounded mt-1 xs:mt-0">
                        Advanced Mode
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-4 mb-2 sm:mb-3">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="text-xs sm:text-base text-white dark:text-avengers-silver font-semibold">Total Amount:</span>
                        <span className="text-xs sm:text-base text-white font-semibold">₹{transaction.amount}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-xs sm:text-base text-white dark:text-avengers-silver font-semibold">Advanced (Sent):</span>
                        <span className="text-xs sm:text-base text-green-400 font-semibold">₹{transaction.advancedAmount}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                        <span className="text-xs sm:text-base text-white dark:text-avengers-silver font-semibold">Remaining (Pending):</span>
                        <span className="text-xs sm:text-base text-orange-400 font-semibold">₹{transaction.remainingAmount}</span>
                      </div>
                    </div>

                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-4 text-xs sm:text-m text-white dark:text-avengers-silver">
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

                  <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                    <button
                      onClick={() => handleApproveClick(transaction._id)}
                      disabled={approving === transaction._id}
                      className="avengers-button px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm flex items-center gap-1 sm:gap-2 w-full sm:w-auto"
                    >
                      {approving === transaction._id ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="bg-blue-300 dark:bg-blue-900/90 p-4 sm:p-8 rounded-xl shadow-lg border border-blue-400 max-w-sm w-full mx-2 sm:mx-4">
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
        <div className="bg-blue-300 dark:bg-blue-900/90 p-4 sm:p-8 rounded-xl shadow-lg border border-blue-400 max-w-sm w-full mx-2 sm:mx-4">
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