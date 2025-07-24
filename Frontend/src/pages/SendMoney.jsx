import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import Loader from "../components/Loader";
import { DollarSign, Send, ArrowRight, ChevronLeft, ChevronRight, Users, MessageSquare, Zap, Plus, X, Split } from "lucide-react";

const SendMoney = () => {
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState({ 
    recipients: [], 
    amount: "", 
    feedback: "",
    isAdvancedMode: false,
    advancedAmount: "",
    remainingAmount: "",
    splitType: "equal", // "equal" or "manual"
    manualAmounts: {} // { recipientId: amount }
  });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]); // ✅ New state for transactions
  const [loading, setLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(""); // For dropdown
  const [loadingUsers, setLoadingUsers] = useState(true);
const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('transfer'); // 'transfer' or 'history'

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
      finally {
      setLoadingUsers(false);
    }
    };
    if (user) fetchUsers();
  }, [user]);

  // ✅ Fetch user transactions
useEffect(() => {
  axios
    .get("/transactions/my-transactions")
    .then((res) => setTransactions(res.data))
    .catch((err) => console.error("Error fetching transactions:", err))
    .finally(() => setLoadingTransactions(false)); // ✅ This line must be chained correctly
}, []);
  // Show loader while fetching users or transactions for the first time
// if (users.length === 0 || transactions.length === 0) {
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <Loader />
//     </div>
//   );
// }

// Show loader during payment submission
// if (loading) {
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <Loader />
//     </div>
//   );
// }
  // Add recipient from dropdown
  const handleAddRecipient = () => {
    if (selectedRecipient && !formData.recipients.includes(selectedRecipient)) {
      const newRecipients = [...formData.recipients, selectedRecipient];
      setFormData({ ...formData, recipients: newRecipients });
      setSelectedRecipient("");
      
      // Initialize manual amount for new recipient if in manual mode
      if (formData.splitType === "manual") {
        const recipientUser = users.find(u => u.name === selectedRecipient);
        if (recipientUser) {
          setFormData(prev => ({
            ...prev,
            manualAmounts: {
              ...prev.manualAmounts,
              [recipientUser._id]: ""
            }
          }));
        }
      }
    }
  };

  // Remove recipient
  const handleRemoveRecipient = (recipientName) => {
    const newRecipients = formData.recipients.filter(r => r !== recipientName);
    const recipientUser = users.find(u => u.name === recipientName);
    
    setFormData(prev => {
      const newManualAmounts = { ...prev.manualAmounts };
      if (recipientUser && newManualAmounts[recipientUser._id]) {
        delete newManualAmounts[recipientUser._id];
      }
      
      return {
        ...prev,
        recipients: newRecipients,
        manualAmounts: newManualAmounts
      };
    });
  };

  // Handle manual amount change for specific recipient
  const handleManualAmountChange = (recipientId, amount) => {
    setFormData(prev => ({
      ...prev,
      manualAmounts: {
        ...prev.manualAmounts,
        [recipientId]: amount
      }
    }));
  };

  // Calculate total manual amount
  const getTotalManualAmount = () => {
    return Object.values(formData.manualAmounts).reduce((sum, amount) => {
      return sum + (parseInt(amount) || 0);
    }, 0);
  };

  // Calculate equal split amount
  const getEqualSplitAmount = () => {
    if (!formData.amount || formData.recipients.length === 0) return 0;
    return Math.round(parseInt(formData.amount) / formData.recipients.length);
  };

  // ✅ Stripe Payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.recipients.length === 0) {
      return alert("Please select at least one recipient");
    }

    const selectedUsers = users.filter((u) => 
      formData.recipients.includes(u.name)
    );
    
    if (selectedUsers.length === 0) {
      return alert("Please select valid recipients");
    }

    // Validate manual amounts if in manual mode
    if (formData.splitType === "manual") {
      const totalManualAmount = getTotalManualAmount();
      const totalAmount = parseInt(formData.amount);
      
      if (totalManualAmount !== totalAmount) {
        return alert(`Manual amounts total (₹${totalManualAmount}) must equal total amount (₹${totalAmount})`);
      }
      
      // Check if all recipients have amounts
      const missingAmounts = selectedUsers.filter(user => 
        !formData.manualAmounts[user._id] || parseInt(formData.manualAmounts[user._id]) <= 0
      );
      
      if (missingAmounts.length > 0) {
        return alert("Please enter amounts for all selected recipients");
      }
    }

    // Validate advanced mode amounts
    if (formData.isAdvancedMode) {
      const totalAmount = parseInt(formData.amount);
      const advancedAmount = parseInt(formData.advancedAmount);
      const remainingAmount = parseInt(formData.remainingAmount);
      
      if (advancedAmount + remainingAmount !== totalAmount) {
        return alert("Advanced amount + remaining amount must equal total amount");
      }
      
      if (advancedAmount <= 0 || remainingAmount <= 0) {
        return alert("Both advanced and remaining amounts must be greater than 0");
      }
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/transactions/stripe-checkout",
        {
          amount: parseInt(formData.amount),
          receiverEmails: selectedUsers.map(u => u.email),
          feedback: formData.feedback,
          advancedAmount: formData.isAdvancedMode ? parseInt(formData.advancedAmount) : null,
          remainingAmount: formData.isAdvancedMode ? parseInt(formData.remainingAmount) : null,
          splitType: formData.splitType,
          manualAmounts: formData.splitType === "manual" ? formData.manualAmounts : null,
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

  // Handle split type change
  const handleSplitTypeChange = (splitType) => {
    setFormData(prev => ({
      ...prev,
      splitType,
      manualAmounts: splitType === "manual" ? prev.manualAmounts : {}
    }));
  };

  // Handle advanced mode toggle
  const handleAdvancedModeToggle = () => {
    setFormData(prev => ({
      ...prev,
      isAdvancedMode: !prev.isAdvancedMode,
      advancedAmount: "",
      remainingAmount: ""
    }));
  };

  // Auto-calculate remaining amount when advanced amount changes
  const handleAdvancedAmountChange = (e) => {
    const advancedAmount = parseInt(e.target.value) || 0;
    const totalAmount = parseInt(formData.amount) || 0;
    const remainingAmount = Math.max(0, totalAmount - advancedAmount);
    
    setFormData(prev => ({
      ...prev,
      advancedAmount: e.target.value,
      remainingAmount: remainingAmount.toString()
    }));
  };

  // Auto-calculate advanced amount when remaining amount changes
  const handleRemainingAmountChange = (e) => {
    const remainingAmount = parseInt(e.target.value) || 0;
    const totalAmount = parseInt(formData.amount) || 0;
    const advancedAmount = Math.max(0, totalAmount - remainingAmount);
    
    setFormData(prev => ({
      ...prev,
      remainingAmount: e.target.value,
      advancedAmount: advancedAmount.toString()
    }));
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

  // Helper to detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  //  if (loading && (users.length === 0 || transactions.length === 0)) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader />
  //     </div>
  //   );
  // }
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
      <div>
        <h1 className="text-2xl sm:text-3xl font-orbitron text-blue-700 font-bold dark:text-white mb-1 sm:mb-2 dark:text-shadow-glow mt-10 sm:mt-0">
          Send Money
        </h1>
        <p className="text-xs sm:text-base text-gray-700 dark:text-avengers-silver">
          Transfer funds to multiple Avengers at once (Max: ₹10,000 per transaction)
        </p>
      </div>
      {/* Mobile toggle for Transfer/History */}
      <div className="block sm:hidden w-full mb-2">
        <div className="flex w-full justify-center gap-2">
          <button
            className={`flex-1 py-2 rounded-l-lg font-semibold text-xs ${mobileTab === 'transfer' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-cyan-300'}`}
            onClick={() => setMobileTab('transfer')}
          >
            Transfer Funds
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg font-semibold text-xs ${mobileTab === 'history' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-cyan-300'}`}
            onClick={() => setMobileTab('history')}
          >
            Transaction History
          </button>
        </div>
      </div>
            {loadingUsers || loadingTransactions ? (
  <div className="flex justify-center items-center h-64">
    <Loader />
  </div>
) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Transfer Funds section (mobile: show only if selected, desktop: always show) */}
        {(mobileTab === 'transfer' || window.innerWidth >= 640) && (
          <div className="glass-card">
            <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Transfer Funds
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm text-gray-700 font-medium dark:text-avengers-silver mb-2">
                  Select Recipients
                </label>
                {/* Mobile custom dropdown */}
                <div className="block sm:hidden w-full">
                  <button
                    type="button"
                    onClick={() => setMobileDropdownOpen(true)}
                    className="input-field w-full text-left text-white font-semibold rounded-md px-3 py-2 dark:text-white bg-blue-300 dark:bg-blue-700/50 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {selectedRecipient ? selectedRecipient : 'Choose an Avenger...'}
                  </button>
                  {mobileDropdownOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-4">
                        <h3 className="text-lg font-bold mb-2 text-blue-700 dark:text-cyan-400">Select an Avenger</h3>
                        <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                          {users.filter(u => !formData.recipients.includes(u.name)).map((u) => (
                            <li key={u._id}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
                                onClick={() => {
                                  setSelectedRecipient(u.name);
                                  setMobileDropdownOpen(false);
                                }}
                              >
                                {u.name} ({u.email})
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="mt-4 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
                          onClick={() => setMobileDropdownOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Desktop native select */}
                <div className="hidden sm:block w-full">
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="input-field flex-1 w-full text-white font-semibold rounded-md px-3 py-2 dark:text-white bg-blue-300 dark:bg-blue-700/50 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Choose an Avenger...</option>
                    {users
                      .filter(u => !formData.recipients.includes(u.name))
                      .map((u) => (
                        <option key={u._id} value={u.name}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  disabled={!selectedRecipient}
                  className="w-full xs:w-auto px-4 py-2 bg-blue-400 hover:bg-blue-500 dark:bg-blue-900 dark:disabled:bg-blue-900/20 dark:hover:bg-blue-700 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Selected recipients list */}
              {formData.recipients.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-green-400">
                    Selected: {formData.recipients.length} recipient(s)
                  </p>
                  <div className="space-y-2">
                    {formData.recipients.map((recipientName) => {
                      const recipientUser = users.find(u => u.name === recipientName);
                      return (
                        <div key={recipientName} className="flex items-center justify-between p-3 text-white bg-blue-300 dark:bg-blue-900/20 rounded-lg border border-blue-700/30">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {recipientName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="dark:text-white  font-semibold">{recipientName}</p>
                              <p className="text-xs dark:text-avengers-silver">{recipientUser?.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipient(recipientName)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div>
                <label className="block text-sm  text-black font-medium dark:text-avengers-silver mb-2">
                  Total Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="input-field  w-full dark:bg-blue-900/20 bg-blue-300 border-blue-500 text-white placeholder-white"
                  placeholder="Enter total amount (min ₹50 & max ₹10,000)"
                  min="50"
                  max="10000"
                  required
                />
              </div>

              {/* Split Options */}
              <div>
                <label className="block text-sm font-medium dark:text-avengers-silver mb-2 flex items-center gap-2">
                  <Split className="w-4 h-4" />
                  Split Options
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSplitTypeChange("equal")}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.splitType === "equal"
                        ? "bg-blue-600 border-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-600 dark:border-blue-700"
                        : "bg-gray-400 border-gray-200 text-avengers-silver hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 dark:border-blue-700"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-white mb-1">Split Equally</div>
                      <div className="text-xs text-white opacity-80">
                        {formData.amount && formData.recipients.length > 0 
                          ? `₹${getEqualSplitAmount()} each`
                          : "Equal distribution"
                        }
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleSplitTypeChange("manual")}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.splitType === "manual"
                        ? "bg-blue-600 border-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-600 dark:border-blue-700"
                        : "bg-gray-400 border-gray-200 text-avengers-silver hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 dark:border-blue-700"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-white mb-1">Split Manually</div>
                      <div className="text-xs text-white opacity-80">
                        {formData.splitType === "manual" && formData.amount
                          ? `₹${getTotalManualAmount()}/${formData.amount}`
                          : "Custom amounts"
                        }
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Manual Amount Inputs */}
              {formData.splitType === "manual" && formData.recipients.length > 0 && (
                <div className="space-y-3 p-4 bg-blue-300 dark:bg-blue-900/20 rounded-lg border dark:border-blue-700/30">
                  <p className="text-sm dark:text-white font-medium">
                    💡 Manual Split: Enter individual amounts for each recipient
                  </p>
                  
                  <div className="space-y-3">
                    {formData.recipients.map((recipientName) => {
                      const recipientUser = users.find(u => u.name === recipientName);
                      if (!recipientUser) return null;
                      
                      return (
                        <div key={recipientUser._id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs dark:text-whiter mb-1">
                              {recipientName}
                            </label>
                            <input
                              type="number"
                              value={formData.manualAmounts[recipientUser._id] || ""}
                              onChange={(e) => handleManualAmountChange(recipientUser._id, e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="Enter amount"
                              min="1"
                              max={parseInt(formData.amount) || 10000}
                              required={formData.splitType === "manual"}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {formData.amount && (
                    <div className="text-center p-2 bg-blue-900/30 rounded">
                      <p className="text-sm text-blue-300 dark:text-white">
                        Total: ₹{getTotalManualAmount()}/{formData.amount} 
                        {getTotalManualAmount() === parseInt(formData.amount) 
                          ? " ✅" : " ❌ (Must equal total amount)"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Advanced Money Mode Toggle */}
              {isAdmin && (
                <>
                  <div className="flex items-center bg-blue-300 space-x-3 p-3 dark:bg-blue-900/20 rounded-lg border border-blue-700/30">
                    <input
                      type="checkbox"
                      id="advancedMode"
                      checked={formData.isAdvancedMode}
                      onChange={handleAdvancedModeToggle}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="advancedMode" className="flex items-center gap-2 text-sm font-semibold dark:text-avengers-silver cursor-pointer">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Advanced Money Mode
                    </label>
                  </div>

                  {formData.isAdvancedMode && (
                    <div className="space-y-4 p-4 bg-blue-300 dark:bg-blue-900/20 rounded-lg border dark:border-blue-700/30">
                      <p className="text-sm dark:text-white font-medium">
                        💡 Advanced Mode: Send money in two parts - immediate and after approval
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white dark:text-white mb-2">
                            Advanced Amount (₹) - Immediate
                          </label>
                          <input
                            type="number"
                            value={formData.advancedAmount}
                            onChange={handleAdvancedAmountChange}
                            className="input-field w-full bg-white dark:bg-blue-900/20 dark:border-blue-700/30 text-black dark:text-white placeholder:text-gray-400 font-semibold"
                            placeholder="Immediate amount"
                            min="1"
                            max={parseInt(formData.amount) || 10000}
                            required={formData.isAdvancedMode}
                          />
                          {formData.advancedAmount && formData.recipients.length > 0 && (
                            <p className="text-xs text-white dark:text-green-400 mt-1">
                              Each gets: ₹{Math.round(parseInt(formData.advancedAmount) / formData.recipients.length)} immediately
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white dark:text-white mb-2">
                            Remaining Amount (₹) - After Approval
                          </label>
                          <input
                            type="number"
                            value={formData.remainingAmount}
                            onChange={handleRemainingAmountChange}
                            className="input-field w-full bg-white dark:bg-blue-900/20 dark:border-blue-700/30 text-black dark:text-white placeholder:text-gray-400 font-semibold"
                            placeholder="Remaining amount"
                            min="1"
                            max={parseInt(formData.amount) || 10000}
                            required={formData.isAdvancedMode}
                          />
                          {formData.remainingAmount && formData.recipients.length > 0 && (
                            <p className="text-xs text-white dark:text-orange-400 mt-1">
                              Each gets: ₹{Math.round(parseInt(formData.remainingAmount) / formData.recipients.length)} after approval
                            </p>
                          )}
                        </div>
                      </div>
                      {formData.amount && formData.advancedAmount && formData.remainingAmount && (
                        <div className="text-left p-2 text-white dark:bg-blue-900/30 rounded">
                          <p className="text-sm text-white dark:text-blue-300">
                            Total: ₹{parseInt(formData.advancedAmount) + parseInt(formData.remainingAmount)} 
                            {parseInt(formData.advancedAmount) + parseInt(formData.remainingAmount) === parseInt(formData.amount) 
                              ? " ✅" : " ❌ (Must equal total amount)"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium dark:text-white  mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Feedback Message (Optional)
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) =>
                    setFormData({ ...formData, feedback: e.target.value })
                  }
                  className="input-field w-full min-h-[80px] resize-none bg-blue-300 dark:bg-blue-900/30 text-white font-semibold dark:font-medium placeholder-white"
                  placeholder="Add a message to include in the email notification..."
                  maxLength="500"
                />
                <p className="text-xs dark:text-avengers-silver mt-1">
                  {formData.feedback.length}/500 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || formData.recipients.length === 0 || !formData.amount || 
                  (formData.isAdvancedMode && (!formData.advancedAmount || !formData.remainingAmount)) ||
                  (formData.splitType === "manual" && getTotalManualAmount() !== parseInt(formData.amount))}
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
        )}
        {/* Transaction History section (mobile: show only if selected, desktop: always show) */}
        {(mobileTab === 'history' || window.innerWidth >= 640) && (
          <div className="glass-card">
            <h2 className="text-xl font-orbitron text-blue-700 font-semibold dark:text-white mb-4">
              Transaction History
            </h2>

            <table className="w-full text-sm text-black text-left dark:text-avengers-silver">
              <thead className="border-b text-black border-gray-600 dark:text-white">
                <tr>
                  <th className="py-2">From</th>
                  <th className="py-2">To</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-black dark:text-avengers-silver">
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
                        {txn.isAdvancedMode && (
                          <span className="text-xs text-yellow-400 block">
                            Advanced: ₹{txn.advancedAmount} | Pending: ₹{txn.remainingAmount}
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          txn.status === 'completed' ? 'bg-green-300 dark:bg-[#059669] dark:text-white font-semibold' :
                          txn.status === 'partially_completed' ? 'dark:bg-[#f59e0b] dark:text-white bg-yellow-200/80   font-semibold ' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {txn.status}
                        </span>
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
                <div className="text-sm text-gray-700 dark:text-avengers-silver">
                  Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-700 dark:text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-avengers-silver px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "text-gray-700 cursor-not-allowed"
                        : "text-gray-700 dark:text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
   )}  
    </div>
  );
};

export default SendMoney;

// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import axios from "../api/axios";
// import { DollarSign, Send, ArrowRight, ChevronLeft, ChevronRight, Users, MessageSquare, Zap, Plus, X, Split } from "lucide-react";
// import Loader from '../components/Loader';

// const SendMoney = () => {
//   const { user, isAdmin } = useAuth();
//   const [formData, setFormData] = useState({ 
//     recipients: [], 
//     amount: "", 
//     feedback: "",
//     isAdvancedMode: false,
//     advancedAmount: "",
//     remainingAmount: "",
//     splitType: "equal", // "equal" or "manual"
//     manualAmounts: {} // { recipientId: amount }
//   });
//   const [users, setUsers] = useState([]);
//   const [transactions, setTransactions] = useState([]); // ✅ New state for transactions
//   const [loading, setLoading] = useState(false);
//   const [selectedRecipient, setSelectedRecipient] = useState(""); // For dropdown
//   const [loadingUsers, setLoadingUsers] = useState(true);
// const [loadingTransactions, setLoadingTransactions] = useState(true);

  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const transactionsPerPage = 10;

//   const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
//   const [mobileTab, setMobileTab] = useState('transfer'); // 'transfer' or 'history'

//   // ✅ Fetch users from DB (excluding current user)
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get("/auth/users"); // Cookies sent automatically
//         const filtered = res.data.filter((u) => user._id !== u._id);
//         setUsers(filtered);
//       } catch (err) {
//         console.error("Error fetching users", err);
//       }finally {
//       setLoadingUsers(false);
//     }
//     };
//     if (user) fetchUsers();
//   }, [user]);

//   // ✅ Fetch user transactions
// useEffect(() => {
//   axios
//     .get("/transactions/my-transactions", { withCredentials: true })
//     .then((res) => setTransactions(res.data))
//     .catch((err) => console.error("Error fetching transactions:", err))
//     .finally(() => setLoadingTransactions(false)); // ✅ wrap in arrow function
// }, []);

//   // Add recipient from dropdown
//   const handleAddRecipient = () => {
//     if (selectedRecipient && !formData.recipients.includes(selectedRecipient)) {
//       const newRecipients = [...formData.recipients, selectedRecipient];
//       setFormData({ ...formData, recipients: newRecipients });
//       setSelectedRecipient("");
      
//       // Initialize manual amount for new recipient if in manual mode
//       if (formData.splitType === "manual") {
//         const recipientUser = users.find(u => u.name === selectedRecipient);
//         if (recipientUser) {
//           setFormData(prev => ({
//             ...prev,
//             manualAmounts: {
//               ...prev.manualAmounts,
//               [recipientUser._id]: ""
//             }
//           }));
//         }
//       }
//     }
//   };

//   // Remove recipient
//   const handleRemoveRecipient = (recipientName) => {
//     const newRecipients = formData.recipients.filter(r => r !== recipientName);
//     const recipientUser = users.find(u => u.name === recipientName);
    
//     setFormData(prev => {
//       const newManualAmounts = { ...prev.manualAmounts };
//       if (recipientUser && newManualAmounts[recipientUser._id]) {
//         delete newManualAmounts[recipientUser._id];
//       }
      
//       return {
//         ...prev,
//         recipients: newRecipients,
//         manualAmounts: newManualAmounts
//       };
//     });
//   };

//   // Handle manual amount change for specific recipient
//   const handleManualAmountChange = (recipientId, amount) => {
//     setFormData(prev => ({
//       ...prev,
//       manualAmounts: {
//         ...prev.manualAmounts,
//         [recipientId]: amount
//       }
//     }));
//   };

//   // Calculate total manual amount
//   const getTotalManualAmount = () => {
//     return Object.values(formData.manualAmounts).reduce((sum, amount) => {
//       return sum + (parseInt(amount) || 0);
//     }, 0);
//   };

//   // Calculate equal split amount
//   const getEqualSplitAmount = () => {
//     if (!formData.amount || formData.recipients.length === 0) return 0;
//     return Math.round(parseInt(formData.amount) / formData.recipients.length);
//   };

//   // ✅ Stripe Payment
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (formData.recipients.length === 0) {
//       return alert("Please select at least one recipient");
//     }

//     const selectedUsers = users.filter((u) => 
//       formData.recipients.includes(u.name)
//     );
    
//     if (selectedUsers.length === 0) {
//       return alert("Please select valid recipients");
//     }

//     // Validate manual amounts if in manual mode
//     if (formData.splitType === "manual") {
//       const totalManualAmount = getTotalManualAmount();
//       const totalAmount = parseInt(formData.amount);
      
//       if (totalManualAmount !== totalAmount) {
//         return alert(`Manual amounts total (₹${totalManualAmount}) must equal total amount (₹${totalAmount})`);
//       }
      
//       // Check if all recipients have amounts
//       const missingAmounts = selectedUsers.filter(user => 
//         !formData.manualAmounts[user._id] || parseInt(formData.manualAmounts[user._id]) <= 0
//       );
      
//       if (missingAmounts.length > 0) {
//         return alert("Please enter amounts for all selected recipients");
//       }
//     }

//     // Validate advanced mode amounts
//     if (formData.isAdvancedMode) {
//       const totalAmount = parseInt(formData.amount);
//       const advancedAmount = parseInt(formData.advancedAmount);
//       const remainingAmount = parseInt(formData.remainingAmount);
      
//       if (advancedAmount + remainingAmount !== totalAmount) {
//         return alert("Advanced amount + remaining amount must equal total amount");
//       }
      
//       if (advancedAmount <= 0 || remainingAmount <= 0) {
//         return alert("Both advanced and remaining amounts must be greater than 0");
//       }
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post(
//         "/transactions/stripe-checkout",
//         {
//           amount: parseInt(formData.amount),
//           receiverEmails: selectedUsers.map(u => u.email),
//           feedback: formData.feedback,
//           advancedAmount: formData.isAdvancedMode ? parseInt(formData.advancedAmount) : null,
//           remainingAmount: formData.isAdvancedMode ? parseInt(formData.remainingAmount) : null,
//           splitType: formData.splitType,
//           manualAmounts: formData.splitType === "manual" ? formData.manualAmounts : null,
//         }
//       );
//       // 🔁 Redirect to Stripe Checkout
//       window.location.href = res.data.url;
//     } catch (err) {
//       console.error("Payment error", err);
//       alert("Payment failed: " + (err.response?.data?.error || "Unknown error"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle split type change
//   const handleSplitTypeChange = (splitType) => {
//     setFormData(prev => ({
//       ...prev,
//       splitType,
//       manualAmounts: splitType === "manual" ? prev.manualAmounts : {}
//     }));
//   };

//   // Handle advanced mode toggle
//   const handleAdvancedModeToggle = () => {
//     setFormData(prev => ({
//       ...prev,
//       isAdvancedMode: !prev.isAdvancedMode,
//       advancedAmount: "",
//       remainingAmount: ""
//     }));
//   };

//   // Auto-calculate remaining amount when advanced amount changes
//   const handleAdvancedAmountChange = (e) => {
//     const advancedAmount = parseInt(e.target.value) || 0;
//     const totalAmount = parseInt(formData.amount) || 0;
//     const remainingAmount = Math.max(0, totalAmount - advancedAmount);
    
//     setFormData(prev => ({
//       ...prev,
//       advancedAmount: e.target.value,
//       remainingAmount: remainingAmount.toString()
//     }));
//   };

//   // Auto-calculate advanced amount when remaining amount changes
//   const handleRemainingAmountChange = (e) => {
//     const remainingAmount = parseInt(e.target.value) || 0;
//     const totalAmount = parseInt(formData.amount) || 0;
//     const advancedAmount = Math.max(0, totalAmount - remainingAmount);
    
//     setFormData(prev => ({
//       ...prev,
//       remainingAmount: e.target.value,
//       advancedAmount: advancedAmount.toString()
//     }));
//   };

//   // Pagination calculations
//   const indexOfLastTransaction = currentPage * transactionsPerPage;
//   const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
//   const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
//   const totalPages = Math.ceil(transactions.length / transactionsPerPage);

//   // Pagination handlers
//   const goToNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const goToPreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   // Helper to detect mobile
//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
// // if (loadingUsers || loadingTransactions) {
//   return (
    
//     <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-visible">
    
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-orbitron text-blue-700 font-bold dark:text-white mb-1 sm:mb-2 dark:text-shadow-glow mt-10 sm:mt-0">
//           Send Money
//         </h1>
//         <p className="text-xs sm:text-base text-gray-700 dark:text-avengers-silver">
//           Transfer funds to multiple Avengers at once (Max: ₹10,000 per transaction)
//         </p>
//       </div>
//       {/* Mobile toggle for Transfer/History */}
//       <div className="block sm:hidden w-full mb-2">
//         <div className="flex w-full justify-center gap-2">
//           <button
//             className={`flex-1 py-2 rounded-l-lg font-semibold text-xs ${mobileTab === 'transfer' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-cyan-300'}`}
//             onClick={() => setMobileTab('transfer')}
//           >
//             Transfer Funds
//           </button>
//           <button
//             className={`flex-1 py-2 rounded-r-lg font-semibold text-xs ${mobileTab === 'history' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-cyan-300'}`}
//             onClick={() => setMobileTab('history')}
//           >
//             Transaction History
//           </button>
//         </div>
//       </div>
//       {loadingUsers || loadingTransactions ? (
//   <div className="flex justify-center items-center h-64">
//     <Loader />
//   </div>
// ) : (
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//         {/* Transfer Funds section (mobile: show only if selected, desktop: always show) */}
//         {(mobileTab === 'transfer' || window.innerWidth >= 640) && (
//           <div className="glass-card">
//             <h2 className="text-xl font-orbitron font-semibold text-blue-700 dark:text-white mb-4 flex items-center gap-2">
//               <Users className="w-5 h-5" />
//               Transfer Funds
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Recipient Selection */}
//               <div>
//                 <label className="block text-sm text-gray-700 font-medium dark:text-avengers-silver mb-2">
//                   Select Recipients
//                 </label>
//                 {/* Mobile custom dropdown */}
//                 <div className="block sm:hidden w-full">
//                   <button
//                     type="button"
//                     onClick={() => setMobileDropdownOpen(true)}
//                     className="input-field w-full text-left text-white font-semibold rounded-md px-3 py-2 dark:text-white bg-blue-300 dark:bg-blue-700/50 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   >
//                     {selectedRecipient ? selectedRecipient : 'Choose an Avenger...'}
//                   </button>
//                   {mobileDropdownOpen && (
//                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
//                       <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-4">
//                         <h3 className="text-lg font-bold mb-2 text-blue-700 dark:text-cyan-400">Select an Avenger</h3>
//                         <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
//                           {users.filter(u => !formData.recipients.includes(u.name)).map((u) => (
//                             <li key={u._id}>
//                               <button
//                                 type="button"
//                                 className="w-full text-left px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300"
//                                 onClick={() => {
//                                   setSelectedRecipient(u.name);
//                                   setMobileDropdownOpen(false);
//                                 }}
//                               >
//                                 {u.name} ({u.email})
//                               </button>
//                             </li>
//                           ))}
//                         </ul>
//                         <button
//                           type="button"
//                           className="mt-4 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold"
//                           onClick={() => setMobileDropdownOpen(false)}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//                 {/* Desktop native select */}
//                 <div className="hidden sm:block w-full">
//                   <select
//                     value={selectedRecipient}
//                     onChange={(e) => setSelectedRecipient(e.target.value)}
//                     className="input-field flex-1 w-full text-white font-semibold rounded-md px-3 py-2 dark:text-white bg-blue-300 dark:bg-blue-700/50 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                   >
//                     <option value="">Choose an Avenger...</option>
//                     {users
//                       .filter(u => !formData.recipients.includes(u.name))
//                       .map((u) => (
//                         <option key={u._id} value={u.name}>
//                           {u.name} ({u.email})
//                         </option>
//                       ))}
//                   </select>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={handleAddRecipient}
//                   disabled={!selectedRecipient}
//                   className="w-full xs:w-auto px-4 py-2 bg-blue-400 hover:bg-blue-500 dark:bg-blue-900 dark:disabled:bg-blue-900/20 dark:hover:bg-blue-700 disabled:cursor-not-allowed text-white rounded-md flex items-center justify-center gap-2 transition-colors mt-2"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add
//                 </button>
//               </div>

//               {/* Selected recipients list */}
//               {formData.recipients.length > 0 && (
//                 <div className="space-y-2">
//                   <p className="text-sm text-green-400">
//                     Selected: {formData.recipients.length} recipient(s)
//                   </p>
//                   <div className="space-y-2">
//                     {formData.recipients.map((recipientName) => {
//                       const recipientUser = users.find(u => u.name === recipientName);
//                       return (
//                         <div key={recipientName} className="flex items-center justify-between p-3 text-white bg-blue-300 dark:bg-blue-900/20 rounded-lg border border-blue-700/30">
//                           <div className="flex items-center gap-3">
//                             <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                               {recipientName.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="dark:text-white  font-semibold">{recipientName}</p>
//                               <p className="text-xs dark:text-avengers-silver">{recipientUser?.email}</p>
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => handleRemoveRecipient(recipientName)}
//                             className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Total Amount */}
//               <div>
//                 <label className="block text-sm  text-black font-medium dark:text-avengers-silver mb-2">
//                   Total Amount (₹)
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.amount}
//                   onChange={(e) =>
//                     setFormData({ ...formData, amount: e.target.value })
//                   }
//                   className="input-field  w-full dark:bg-blue-900/20 bg-blue-300 border-blue-500 text-white placeholder-white"
//                   placeholder="Enter total amount (max ₹10,000)"
//                   min="50"
//                   max="10000"
//                   required
//                 />
//               </div>

//               {/* Split Options */}
//               <div>
//                 <label className="block text-sm font-medium dark:text-avengers-silver mb-2 flex items-center gap-2">
//                   <Split className="w-4 h-4" />
//                   Split Options
//                 </label>
                
//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     type="button"
//                     onClick={() => handleSplitTypeChange("equal")}
//                     className={`p-3 rounded-lg border transition-all ${
//                       formData.splitType === "equal"
//                         ? "bg-blue-600 border-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-600 dark:border-blue-700"
//                         : "bg-gray-400 border-gray-200 text-avengers-silver hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 dark:border-blue-700"
//                     }`}
//                   >
//                     <div className="text-center">
//                       <div className="font-semibold text-white mb-1">Split Equally</div>
//                       <div className="text-xs text-white opacity-80">
//                         {formData.amount && formData.recipients.length > 0 
//                           ? `₹${getEqualSplitAmount()} each`
//                           : "Equal distribution"
//                         }
//                       </div>
//                     </div>
//                   </button>
                  
//                   <button
//                     type="button"
//                     onClick={() => handleSplitTypeChange("manual")}
//                     className={`p-3 rounded-lg border transition-all ${
//                       formData.splitType === "manual"
//                         ? "bg-blue-600 border-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-600 dark:border-blue-700"
//                         : "bg-gray-400 border-gray-200 text-avengers-silver hover:bg-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-600 dark:border-blue-700"
//                     }`}
//                   >
//                     <div className="text-center">
//                       <div className="font-semibold text-white mb-1">Split Manually</div>
//                       <div className="text-xs text-white opacity-80">
//                         {formData.splitType === "manual" && formData.amount
//                           ? `₹${getTotalManualAmount()}/${formData.amount}`
//                           : "Custom amounts"
//                         }
//                       </div>
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Manual Amount Inputs */}
//               {formData.splitType === "manual" && formData.recipients.length > 0 && (
//                 <div className="space-y-3 p-4 bg-blue-300 dark:bg-blue-900/20 rounded-lg border dark:border-blue-700/30">
//                   <p className="text-sm dark:text-white font-medium">
//                     💡 Manual Split: Enter individual amounts for each recipient
//                   </p>
                  
//                   <div className="space-y-3">
//                     {formData.recipients.map((recipientName) => {
//                       const recipientUser = users.find(u => u.name === recipientName);
//                       if (!recipientUser) return null;
                      
//                       return (
//                         <div key={recipientUser._id} className="flex items-center gap-3">
//                           <div className="flex-1">
//                             <label className="block text-xs dark:text-whiter mb-1">
//                               {recipientName}
//                             </label>
//                             <input
//                               type="number"
//                               value={formData.manualAmounts[recipientUser._id] || ""}
//                               onChange={(e) => handleManualAmountChange(recipientUser._id, e.target.value)}
//                               className="input-field w-full text-sm"
//                               placeholder="Enter amount"
//                               min="1"
//                               max={parseInt(formData.amount) || 10000}
//                               required={formData.splitType === "manual"}
//                             />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
                  
//                   {formData.amount && (
//                     <div className="text-center p-2 bg-blue-900/30 rounded">
//                       <p className="text-sm text-blue-300 dark:text-white">
//                         Total: ₹{getTotalManualAmount()}/{formData.amount} 
//                         {getTotalManualAmount() === parseInt(formData.amount) 
//                           ? " ✅" : " ❌ (Must equal total amount)"}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Advanced Money Mode Toggle */}
//               {isAdmin && (
//                 <>
//                   <div className="flex items-center bg-blue-300 space-x-3 p-3 dark:bg-blue-900/20 rounded-lg border border-blue-700/30">
//                     <input
//                       type="checkbox"
//                       id="advancedMode"
//                       checked={formData.isAdvancedMode}
//                       onChange={handleAdvancedModeToggle}
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <label htmlFor="advancedMode" className="flex items-center gap-2 text-sm font-semibold dark:text-avengers-silver cursor-pointer">
//                       <Zap className="w-4 h-4 text-yellow-400" />
//                       Advanced Money Mode
//                     </label>
//                   </div>

//                   {formData.isAdvancedMode && (
//                     <div className="space-y-4 p-4 bg-blue-300 dark:bg-blue-900/20 rounded-lg border dark:border-blue-700/30">
//                       <p className="text-sm dark:text-white font-medium">
//                         💡 Advanced Mode: Send money in two parts - immediate and after approval
//                       </p>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-white dark:text-white mb-2">
//                             Advanced Amount (₹) - Immediate
//                           </label>
//                           <input
//                             type="number"
//                             value={formData.advancedAmount}
//                             onChange={handleAdvancedAmountChange}
//                             className="input-field w-full bg-white dark:bg-blue-900/20 dark:border-blue-700/30 text-black dark:text-white placeholder:text-gray-400 font-semibold"
//                             placeholder="Immediate amount"
//                             min="1"
//                             max={parseInt(formData.amount) || 10000}
//                             required={formData.isAdvancedMode}
//                           />
//                           {formData.advancedAmount && formData.recipients.length > 0 && (
//                             <p className="text-xs text-white dark:text-green-400 mt-1">
//                               Each gets: ₹{Math.round(parseInt(formData.advancedAmount) / formData.recipients.length)} immediately
//                             </p>
//                           )}
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-white dark:text-white mb-2">
//                             Remaining Amount (₹) - After Approval
//                           </label>
//                           <input
//                             type="number"
//                             value={formData.remainingAmount}
//                             onChange={handleRemainingAmountChange}
//                             className="input-field w-full bg-white dark:bg-blue-900/20 dark:border-blue-700/30 text-black dark:text-white placeholder:text-gray-400 font-semibold"
//                             placeholder="Remaining amount"
//                             min="1"
//                             max={parseInt(formData.amount) || 10000}
//                             required={formData.isAdvancedMode}
//                           />
//                           {formData.remainingAmount && formData.recipients.length > 0 && (
//                             <p className="text-xs text-white dark:text-orange-400 mt-1">
//                               Each gets: ₹{Math.round(parseInt(formData.remainingAmount) / formData.recipients.length)} after approval
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                       {formData.amount && formData.advancedAmount && formData.remainingAmount && (
//                         <div className="text-left p-2 text-white dark:bg-blue-900/30 rounded">
//                           <p className="text-sm text-white dark:text-blue-300">
//                             Total: ₹{parseInt(formData.advancedAmount) + parseInt(formData.remainingAmount)} 
//                             {parseInt(formData.advancedAmount) + parseInt(formData.remainingAmount) === parseInt(formData.amount) 
//                               ? " ✅" : " ❌ (Must equal total amount)"}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </>
//               )}

//               <div>
//                 <label className="block text-sm font-medium dark:text-white  mb-2 flex items-center gap-2">
//                   <MessageSquare className="w-4 h-4" />
//                   Feedback Message (Optional)
//                 </label>
//                 <textarea
//                   value={formData.feedback}
//                   onChange={(e) =>
//                     setFormData({ ...formData, feedback: e.target.value })
//                   }
//                   className="input-field w-full min-h-[80px] resize-none bg-blue-300 dark:bg-blue-900/30 text-white font-semibold dark:font-medium placeholder-gray-300"
//                   placeholder="Add a message to include in the email notification..."
//                   maxLength="500"
//                 />
//                 <p className="text-xs dark:text-avengers-silver mt-1">
//                   {formData.feedback.length}/500 characters
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 disabled={loading || formData.recipients.length === 0 || !formData.amount || 
//                   (formData.isAdvancedMode && (!formData.advancedAmount || !formData.remainingAmount)) ||
//                   (formData.splitType === "manual" && getTotalManualAmount() !== parseInt(formData.amount))}
//                 className="avengers-button w-full flex items-center justify-center space-x-2"
//               >
//                 {loading ? (
//                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 ) : (
//                   <>
//                     <Send className="w-5 h-5" />
//                     <span>Pay via Stripe</span>
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//         )}
//         {/* Transaction History section (mobile: show only if selected, desktop: always show) */}
//         {(mobileTab === 'history' || window.innerWidth >= 640) && (
//           <div className="glass-card">
//             <h2 className="text-xl font-orbitron text-blue-700 font-semibold dark:text-white mb-4">
//               Transaction History
//             </h2>

//             <table className="w-full text-sm text-black text-left dark:text-avengers-silver">
//               <thead className="border-b text-black border-gray-600 dark:text-white">
//                 <tr>
//                   <th className="py-2">From</th>
//                   <th className="py-2">To</th>
//                   <th className="py-2">Amount</th>
//                   <th className="py-2">Status</th>
//                   <th className="py-2">Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {transactions.length === 0 ? (
//                   <tr>
//                     <td colSpan="5" className="py-4 text-center text-black dark:text-avengers-silver">
//                       No transactions yet.
//                     </td>
//                   </tr>
//                 ) : (
//                   currentTransactions.map((txn) => (
//                     <tr key={txn._id} className="border-b border-gray-700">
//                       <td className="py-2">{txn.sender?.name}</td>
//                       <td className="py-2">{txn.receiver?.name}</td>
//                       <td className={`py-2 font-semibold ${txn.sender?._id === user?._id ? "text-red-500" : "text-green-400"}`}>
//                         ₹{txn.amount}
//                         {txn.isAdvancedMode && (
//                           <span className="text-xs text-yellow-400 block">
//                             Advanced: ₹{txn.advancedAmount} | Pending: ₹{txn.remainingAmount}
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-2">
//                         <span className={`px-2 py-1 rounded text-xs ${
//                           txn.status === 'completed' ? 'bg-green-300 dark:bg-[#059669] dark:text-white font-semibold' :
//                           txn.status === 'partially_completed' ? 'dark:bg-[#f59e0b] dark:text-white bg-yellow-200/80   font-semibold ' :
//                           'bg-gray-900/30 text-gray-400'
//                         }`}>
//                           {txn.status}
//                         </span>
//                       </td>
//                       <td className="py-2">{new Date(txn.timestamp || txn.createdAt).toLocaleString()}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>

//             {/* Pagination Controls */}
//             {transactions.length > transactionsPerPage && (
//               <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-600">
//                 <div className="text-sm text-gray-700 dark:text-avengers-silver">
//                   Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={goToPreviousPage}
//                     disabled={currentPage === 1}
//                     className={`p-2 rounded-lg transition-colors ${
//                       currentPage === 1
//                         ? "text-gray-500 cursor-not-allowed"
//                         : "text-gray-700 dark:text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
//                     }`}
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <span className="text-sm text-gray-700 dark:text-avengers-silver px-3">
//                     Page {currentPage} of {totalPages}
//                   </span>
//                   <button
//                     onClick={goToNextPage}
//                     disabled={currentPage === totalPages}
//                     className={`p-2 rounded-lg transition-colors ${
//                       currentPage === totalPages
//                         ? "text-gray-700 cursor-not-allowed"
//                         : "text-gray-700 dark:text-avengers-silver hover:text-white hover:bg-avengers-blue/20"
//                     }`}
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
            
//               </div>
              
//             )}
//           </div>
//         )}
//       </div>
//       )} 
//     </div>
    
//   );
// };

// export default SendMoney;