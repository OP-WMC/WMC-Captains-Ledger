import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { CheckCircle, Clock, DollarSign, User, Mail, Calendar } from "lucide-react";

const PendingApprovals = () => {
  const { user } = useAuth();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchPendingTransactions();
    }
  }, [user]);

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

  const handleApprove = async (transactionId) => {
    try {
      setApproving(transactionId);
      await axios.post(`/transactions/approve-remaining/${transactionId}`);
      
      // Remove the approved transaction from the list
      setPendingTransactions(prev => 
        prev.filter(txn => txn._id !== transactionId)
      );
      
      alert("Remaining amount approved successfully!");
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Failed to approve transaction: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setApproving(null);
    }
  };

  if (user?.role !== "admin") {
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
        <h1 className="text-3xl font-orbitron font-bold text-blue-700 dark:text-white mb-2">
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
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
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
                        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleApprove(transaction._id)}
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
    </div>
  );
};

export default PendingApprovals; 