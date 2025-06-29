import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockUsers, mockTransactions } from '../services/mockData';
import { 
  DollarSign, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  User,
  CreditCard,
  Shield
} from 'lucide-react';

const SendMoney = () => {
  const { user, updateUserBalance } = useAuth();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    note: ''
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const availableUsers = mockUsers.filter(u => u.id !== user?.id);
  const userTransactions = transactions.filter(t => 
    t.from === user?.name || t.to === user?.name
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const recipient = availableUsers.find(u => u.name === formData.recipient);
    if (!recipient) return;

    setSelectedRecipient(recipient);
    setShowOTPModal(true);
  };

  const handleSendMoney = async () => {
    if (otp !== '123456') {
      alert('Invalid OTP');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTransaction = {
      id: transactions.length + 1,
      from: user?.name,
      to: selectedRecipient.name,
      amount: parseInt(formData.amount),
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      type: 'transfer'
    };

    setTransactions([newTransaction, ...transactions]);
    updateUserBalance(user?.balance - parseInt(formData.amount));
    
    setShowOTPModal(false);
    setOtp('');
    setFormData({ recipient: '', amount: '', note: '' });
    setLoading(false);
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
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="input-field w-full"
                required
              >
                <option value="">Choose an Avenger</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.codename}) - ₹{u.balance.toLocaleString()}
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field w-full"
                placeholder="Enter amount (max ₹10,000)"
                min="1"
                max="10000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!formData.recipient || !formData.amount}
              className="avengers-button w-full flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>Send Money</span>
            </button>
          </form>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-orbitron font-semibold text-white mb-4">
            Transaction History
          </h2>
          
          <div className="space-y-3">
            {userTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-avengers-gray/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-5 h-5 text-avengers-blue" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {transaction.from === user?.name ? `To ${transaction.to}` : `From ${transaction.from}`}
                    </p>
                    <p className="text-xs text-avengers-silver">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.from === user?.name ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {transaction.from === user?.name ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-avengers-silver">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOTPModal && selectedRecipient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-md">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-avengers-blue mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-semibold text-white mb-2">
                Security Verification
              </h2>
              <p className="text-avengers-silver">
                Enter the 6-digit OTP sent to your email
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-avengers-silver mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field w-full text-center text-2xl font-orbitron tracking-widest"
                  placeholder="123456"
                  maxLength="6"
                />
                <p className="text-xs text-avengers-silver mt-1">
                  Demo OTP: <span className="text-avengers-gold font-mono">123456</span>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtp('');
                  }}
                  className="avengers-button-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMoney}
                  disabled={loading || otp.length !== 6}
                  className="avengers-button flex-1 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      <span>Confirm Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney; 