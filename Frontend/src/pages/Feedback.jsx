import React, { useState, useEffect } from "react";
import FeedbackCard from "../components/FeedbackCard";
import { fetchFeedback } from "../api/feedbackAPI";

const FEEDBACKS_PER_PAGE = 9;

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const data = await fetchFeedback();
        setFeedbacks(data);
        setFilteredFeedbacks(data);
      } catch (err) {
        setError("Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, []);

  // Filter feedbacks based on search term and rating
  useEffect(() => {
    let filtered = feedbacks;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(feedback =>
        feedback.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.user?.name && feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.user?.codename && feedback.user.codename.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.transactionId?.sender?.name && feedback.transactionId.sender.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (feedback.transactionId?.sender?.codename && feedback.transactionId.sender.codename.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(feedback => feedback.rating === rating);
    }

    setFilteredFeedbacks(filtered);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [feedbacks, searchTerm, ratingFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFeedbacks.length / FEEDBACKS_PER_PAGE) || 1;
  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * FEEDBACKS_PER_PAGE,
    currentPage * FEEDBACKS_PER_PAGE
  );

  const getSenderName = (feedback) => {
    if (feedback.transactionId?.sender) {
      return feedback.transactionId.sender.name || feedback.transactionId.sender.codename || "Unknown";
    }
    return "Unknown";
  };

  const getFeedbackerName = (feedback) => {
    if (feedback.user) {
      return feedback.user.name || feedback.user.codename || "Anonymous";
    }
    return "Anonymous";
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="p-8 bg-blue-300 dark:bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 font-orbitron text-center text-blue-700 dark:text-white">Feedback</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search feedback by comment, name, or codename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-400 hover:bg-blue-500 dark:bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-white font-semibold dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Rating Filter */}
          <div className="md:w-48">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-400 hover:bg-blue-500 dark:bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-white dark:text-gray-400">
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-white dark:text-gray-400">Loading feedbacks...</p>
          </div>
        )}
        
        {error && (
          <div className="col-span-full text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {!loading && paginatedFeedbacks.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-white dark:text-gray-500 text-lg">
              {searchTerm || ratingFilter !== "all" 
                ? "No feedback matches your search criteria." 
                : "No feedback found."}
            </p>
          </div>
        )}
        
        {!loading &&
          paginatedFeedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback._id || feedback.id}
              name={getFeedbackerName(feedback)}
              comment={feedback.comment}
              rating={feedback.rating}
              submittedAt={feedback.submittedAt}
              paidBy={getSenderName(feedback)}
              feedbackerName={getFeedbackerName(feedback)}
            />
          ))}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredFeedbacks.length > FEEDBACKS_PER_PAGE && (
        <div className="flex justify-center items-center mt-8 space-x-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-full bg-gray-500 hover:bg-blue-500  dark:bg-gray-800 border border-gray-700 text-white text-lg font-bold transition-colors duration-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Previous page"
          >
            &#8592;
          </button>
          <span className="text-white dark:text-gray-300 text-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-full bg-gray-500 hover:bg-blue-500 dark:bg-gray-800 border border-gray-700 text-white text-lg font-bold transition-colors duration-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-label="Next page"
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
};

export default Feedback;
