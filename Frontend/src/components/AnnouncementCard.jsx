import React from "react";
import { Megaphone, User, Calendar, AlertTriangle } from "lucide-react";

const AnnouncementCard = ({ title, body, important, author, date }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
      important 
        ? 'bg-gradient-to-br from-red-900/20 to-red-800/30 border border-red-500/30' 
        : 'bg-gray-400 dark:bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-gray-600/30'
    } backdrop-blur-sm`}>
      
      {/* Important Badge */}
      {important && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Important
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start mb-4">
          <div className={`p-3 rounded-full mr-4 ${
            important ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-xl mb-2 ${
              important ? 'text-red-100' : 'text-yellow-400'
            }`}>
              {title}
            </h3>
          </div>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-white dark:text-gray-300 leading-relaxed text-base">
            {body}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-white dark:text-gray-400 border-t border-gray-600/30 pt-4">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>{author || 'Unknown'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(date)}</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${
        important 
          ? 'from-red-500/5 to-red-600/5' 
          : 'from-yellow-500/5 to-orange-500/5'
      } opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
};

export default AnnouncementCard;