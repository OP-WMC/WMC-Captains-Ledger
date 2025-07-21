import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, ScatterChart as ScatterIcon } from 'lucide-react';

const ChartContainer = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey = 'name',
  height = 400,
  colors = ['#00ffcc', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
  labelFormat = 'default' // 'default' for name+percentage, 'date' for date only
}) => {
  const [chartType, setChartType] = useState('bar');

  const chartTypes = [
    { key: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { key: 'line', label: 'Line Chart', icon: TrendingUp },
    { key: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#00ffcc" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={xAxisKey} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="#00ffcc" 
              strokeWidth={3}
              dot={{ fill: '#00ffcc', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#00ffcc', strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent, date }) => {
                if (labelFormat === 'date' && date) {
                  return date; // Show only date for attendance trends
                }
                return `${name} ${(percent * 100).toFixed(0)}%`; // Default format
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#00ffcc' // Changed to green color
              }}
            />
            <Legend />
          </PieChart>
        );
      
      default:
        return null;
    }
  };

  // Only show pie chart option if labelFormat is not 'date' (i.e., not for attendance trends)
  const filteredChartTypes = labelFormat === 'date'
    ? chartTypes.filter(type => type.key !== 'pie')
    : chartTypes;

  return (
    <div className="bg-white p-3 sm:p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm w-full max-w-xs sm:max-w-full scale-90 sm:scale-100 overflow-x-hidden mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-600">{title}</h2>
        {/* Chart Type Selector */}
        <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-0">
          {filteredChartTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.key}
                onClick={() => setChartType(type.key)}
                className={`p-2 rounded-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2 ${
                  chartType === type.key
                    ? 'bg-yellow-500 text-blue-500 shadow-lg'
                    : 'bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-black'
                }`}
                title={type.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? (chartType === 'pie' ? 340 : 220) : height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartContainer; 