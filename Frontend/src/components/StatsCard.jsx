import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatsCard = ({ title, value, subtitle, trend, icon: Icon, color = "green" }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case "green": return "text-green-400 bg-green-400/10";
      case "blue": return "text-blue-400 bg-blue-400/10";
      case "yellow": return "text-yellow-400 bg-yellow-400/10";
      case "red": return "text-red-400 bg-red-400/10";
      case "purple": return "text-purple-400 bg-purple-400/10";
      default: return "text-green-400 bg-green-400/10";
    }
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-600/30 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {trend !== undefined && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(trend)}
            <span className={`text-sm font-semibold ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-black'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      
      <h2 className="text-lg font-semibold mb-1 text-blue-600">{title}</h2>
      <p className="text-3xl font-semibold text-black mb-1">{value}</p>
      {subtitle && <p className="text-sm font-medium text-blue-500">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;