// // const FeedbackCard = ({ name, comment, rating }) => {
// //   return (
// //     <div className="bg-gray-800 p-4 rounded-xl shadow-sm text-white">
// //       <h3 className="font-semibold text-green-400 mb-1">
// //         {name || "Anonymous"} • ⭐ {rating}
// //       </h3>
// //       <p className="text-gray-300">{comment}</p>
// //     </div>
// //   );
// // };

// // export default FeedbackCard;
// const FeedbackCard = ({ 
//   name, 
//   comment, 
//   rating, 
//   submittedAt, 
//   paidBy, 
//   feedbackerName 
// }) => {
//   // Generate stars based on rating
//   const stars = Array.from({ length: rating }, (_, i) => (
//     <span key={i} className="text-yellow-400">⭐</span>
//   ));

//   // Format date
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 dark:border-gray-900 p-4 sm:p-6 rounded-xl shadow-lg text-blue-500 border border-blue-500 dark:hover:border-gray-600 transition-all duration-200 w-full max-w-full">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-0">
//         <div className="flex items-center space-x-1 sm:space-x-2">
//           <h3 className="font-semibold text-green-400 text-base sm:text-lg">
//             {feedbackerName || name || "Anonymous"}
//           </h3>
//           <div className="flex items-center space-x-1">
//             {stars}
//           </div>
//         </div>
//         <span className="text-xs text-blue-500 font-medium dark:text-gray-400">
//           {formatDate(submittedAt)}
//         </span>
//       </div>
//       <div className="mb-2 sm:mb-3">
//         <p className="text-xs sm:text-sm text-blue-500 font-semibold dark:text-gray-400 mb-1">
//           <span className="text-blue-500 font-semibold">Paid by:</span> {paidBy || "Unknown"}
//         </p>
//       </div>
//       <p className="text-black font-semibold dark:text-gray-300 leading-relaxed text-sm sm:text-base">{comment}</p>
//     </div>
//   );
// };

// export default FeedbackCard;
// src/components/FeedbackCard.jsx
// src/components/FeedbackCard.jsx
// src/components/FeedbackCard.jsx
import React from "react";
import { Trash2 } from "lucide-react"; // Import Trash2 icon

const FeedbackCard = ({
  id,
  name,
  comment,
  rating,
  submittedAt,
  paidBy,
  feedbackerName,
  isAdmin,
  onDelete
}) => {
  // Generate stars based on rating
  const stars = Array.from({ length: rating }, (_, i) => (
    <span key={i} className="text-yellow-400">⭐</span>
  ));

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click if any
    if (onDelete) {
      onDelete(id); // Call the onDelete function with the feedback's ID
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 dark:border-gray-900 p-4 sm:p-6 rounded-xl shadow-lg text-blue-500 border border-blue-500 dark:hover:border-gray-600 transition-all duration-200 w-full max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-0">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <h3 className="font-semibold text-green-400 text-base sm:text-lg">
            {feedbackerName || name || "Anonymous"}
          </h3>
          <div className="flex items-center space-x-1">
            {stars}
          </div>
        </div>
        <span className="text-xs text-blue-500 font-medium dark:text-gray-400">
          {formatDate(submittedAt)}
        </span>
      </div>
      <div className="mb-2 sm:mb-3">
        <p className="text-xs sm:text-sm text-blue-500 font-semibold dark:text-gray-400 mb-1">
          <span className="text-blue-500 font-semibold">Paid by:</span> {paidBy || "Unknown"}
        </p>
      </div>
      <p className="text-black font-semibold dark:text-gray-300 leading-relaxed text-sm sm:text-base">{comment}</p>

      {/* NEW: Delete Button for Admin */}
      {isAdmin && onDelete && (
        <button
          onClick={handleDeleteClick}
          // Adjusted 'top-' class from 'top-8' to 'top-12' for more clearance.
          className="absolute top-12 right-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-full bg-white/50 dark:bg-gray-700/50"
          aria-label="Delete feedback"
          title="Delete Feedback"
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </div>
  );
};

export default FeedbackCard;