import React from 'react';

const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 text-white">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-3xl font-bold text-green-400">{value}</p>
    </div>
  );
};

export default StatsCard;