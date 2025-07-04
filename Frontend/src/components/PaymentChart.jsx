import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const data = [
  { month: 'Jan', payments: 4000 },
  { month: 'Feb', payments: 3000 },
  { month: 'Mar', payments: 5000 },
  { month: 'Apr', payments: 7000 },
  { month: 'May', payments: 6000 },
  { month: 'Jun', payments: 8000 },
];

const PaymentChart = () => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl text-white">
      <h2 className="text-xl font-semibold mb-4">Monthly Payment Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="payments" stroke="#00ffcc" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;