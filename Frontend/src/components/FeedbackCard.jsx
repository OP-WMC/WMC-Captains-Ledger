const FeedbackCard = ({ name, comment, rating }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-sm text-white">
      <h3 className="font-semibold text-green-400 mb-1">
        {name || "Anonymous"} • ⭐ {rating}
      </h3>
      <p className="text-gray-300">{comment}</p>
    </div>
  );
};

export default FeedbackCard;
