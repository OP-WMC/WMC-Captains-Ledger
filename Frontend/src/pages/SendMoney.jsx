import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { DollarSign, Send, ArrowRight } from "lucide-react";

const SendMoney = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ recipient: "", amount: "" });
  const [users, setUsers] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]); // ✅ New state for transactions
  const [loading, setLoading] = useState(false);

  // ✅ Fetch users from DB (excluding current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = JSON.parse(localStorage.getItem("user"));
        const filtered = res.data.filter((u) => u.email !== currentUser.email);
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users", err);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Fetch user transactions
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/transactions/my-transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
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
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/transactions/stripe-checkout",
        {
          amount: parseInt(formData.amount),
          receiverEmail: recipient.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
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
        transactions.map((txn) => (
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
</div>



      </div>
    </div>
  );
};

export default SendMoney;