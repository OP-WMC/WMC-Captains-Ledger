// src/pages/TransactionSuccess.jsx
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TransactionSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white space-y-6">
      <CheckCircle className="w-24 h-24 text-green-400" />
      <h1 className="text-3xl font-orbitron font-bold">Payment Successful</h1>
      <p className="text-avengers-silver">Your mission funds have been deployed.</p>
      <Link to="/send-money" className="avengers-button mt-4">
        Back to Send Money
      </Link>
    </div>
  );
};

export default TransactionSuccess;
