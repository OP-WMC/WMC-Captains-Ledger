// const FeedbackCard = ({ name, comment, rating }) => {
//   return (
//     <div className="bg-gray-800 p-4 rounded-xl shadow-sm text-white">
//       <h3 className="font-semibold text-green-400 mb-1">
//         {name || "Anonymous"} • ⭐ {rating}
//       </h3>
//       <p className="text-gray-300">{comment}</p>
//     </div>
//   );
// };

// export default FeedbackCard;
const FeedbackCard = ({ 
  name, 
  comment, 
  rating, 
  submittedAt, 
  paidBy, 
  feedbackerName 
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

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-900 p-6 rounded-xl shadow-lg text-blue-500 border border-blue-500 dark:hover:border-gray-600 transition-all duration-200 ">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-green-400 text-lg">
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
      
      <div className="mb-3">
        <p className="text-sm text-blue-500 font-semibold dark:text-gray-400 mb-1">
          <span className="text-blue-500 font-semibold">Paid by:</span> {paidBy || "Unknown"}
        </p>
      </div>
      
      <p className="text-black font-semibold dark:text-gray-300 leading-relaxed">{comment}</p>
    </div>
  );
};

export default FeedbackCard;
