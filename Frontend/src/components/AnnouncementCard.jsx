import React from "react";

const AnnouncementCard = ({ title, body }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow text-white">
      <h3 className="font-semibold text-lg text-yellow-400 mb-1">{title}</h3>
      <p className="text-gray-300">{body}</p>
    </div>
  );
};

export default AnnouncementCard;