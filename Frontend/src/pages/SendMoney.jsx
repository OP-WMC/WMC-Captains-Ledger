import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { DollarSign, Send, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SendMoney = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ recipient: "", amount: "" });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]); // ✅ New state for transactions
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // ✅ Fetch users from DB (excluding current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/auth/users"); // Cookies sent automatically
        const filtered = res.data.filter((u) => user._id !== u._id);
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // ✅ Fetch user transactions
  useEffect(() => {
    axios
      .get("/transactions/my-transactions")
      .then((res) => setTransactions(res.data))
      .catch((err) => console.error("Error fetching transactions:", err));
  }, []);

  // ✅ Stripe Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    const recipient = users.find((u) => u.name === formData.recipient);
    if (!recipient) return alert("Please select a valid recipient");

    setLoading(true);
    try {
      const res = await axios.post(
        "/transactions/stripe-checkout",
        {
          amount: parseInt(formData.amount),
          receiverEmail: recipient.email,
        }
      );
      // 🔁 Redirect to Stripe Checkout
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Payment error", err);
      alert("Payment failed: " + (err.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
          Send Money
        </h1>
        <p className="text-avengers-silver">
          Transfer funds to other Avengers (Max: ₹10,000 per transaction)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            Transfer Funds
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Select Recipient
              </label>
              <select
                value={formData.recipient}
                onChange={(e) =>
                  setFormData({ ...formData, recipient: e.target.value })
                }
                className="input-field w-full rounded-md px-3 py-2 text-white bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Choose an Avenger</option>
                {users.map((u) => (
                  <option key={u._id} value={u.name}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-avengers-silver mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="input-field w-full"
                placeholder="Enter amount (max ₹10,000)"
                min="1"
                max="10000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.recipient || !formData.amount}
              className="avengers-button w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Pay via Stripe</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            Transaction History
          </h2>

          <table className="w-full text-sm text-left text-avengers-silver">
            <thead className="border-b border-gray-600 text-white">
              <tr>
                <th className="py-2">From</th>
                <th className="py-2">To</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-avengers-silver">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                currentTransactions.map((txn) => (
                  <tr key={txn._id} className="border-b border-gray-700">
                    <td className="py-2">{txn.sender?.name}</td>
                    <td className="py-2">{txn.receiver?.name}</td>
                    <td className={`py-2 font-semibold ${txn.sender?._id === user?._id ? "text-red-500" : "text-green-400"}`}>
                      ₹{txn.amount}
                    </td>
                    <td className="py-2">{new Date(txn.timestamp || txn.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {transactions.length > transactionsPerPage && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
              <div className="text-sm text-avengers-silver">
                Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-avengers-silver px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendMoney;