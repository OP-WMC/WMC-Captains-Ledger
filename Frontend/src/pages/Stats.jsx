import React from 'react';
import StatsCard from '../components/StatsCard';
import PaymentChart from '../components/PaymentChart';


const Stats = () => {
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 font-orbitron text-center">Dashboard Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatsCard title="Total Revenue" value="₹1,20,000" />
        <StatsCard title="Pending Payments" value="₹18,000" />
        <StatsCard title="Completed Orders" value="154" />
      </div>

      <PaymentChart />

      <div className="mt-10 text-avengers-silver">
        <p className="text-lg">📈 Based on trends, payments are increasing steadily since March.</p>
        <p className="text-lg">✅ Maintain this growth by ensuring timely order fulfillment.</p>
      </div>
    </div>
  );
};

export default Stats;