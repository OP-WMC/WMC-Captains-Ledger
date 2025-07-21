import React, { useState, useEffect } from "react";
import FeedbackCard from "../components/FeedbackCard";
import { fetchFeedback } from "../api/feedbackAPI";
import Loader from '../components/Loader';

const getFeedbacksPerPage = () => (typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : 9);

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [FEEDBACKS_PER_PAGE, setFeedbacksPerPage] = useState(getFeedbacksPerPage());
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

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

  useEffect(() => {
    const handleResize = () => setFeedbacksPerPage(getFeedbacksPerPage());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    <div className="p-3 sm:p-8 bg-blue-300 dark:bg-[#0f172a] min-h-screen text-white w-full max-w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 font-orbitron text-center text-blue-700 dark:text-white dark:text-shadow-glow">Feedback</h1>

      {/* Search and Filter Section */}
      <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-4">
        <div className="flex flex-col md:flex-row gap-2 sm:gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search feedback by comment, name, or codename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 sm:px-4 py-2 sm:py-3 bg-white hover:bg-blue-500 dark:bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-blue-500 hover:placeholder:text-white font-semibold dark:placeholder-gray-400 focus:outline-none transition-colors text-xs sm:text-base"
            />
          </div>

          {/* Rating Filter */}
          <div className="md:w-36 sm:md:w-48">
            {/* Custom dropdown for mobile */}
            <div className="block sm:hidden w-full max-w-[180px]">
              <button
                type="button"
                onClick={() => setMobileDropdownOpen('rating')}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-blue-500 font-semibold border dark:border-gray-700 focus:outline-none transition-all duration-200 shadow-lg text-xs w-full flex items-center justify-between"
              >
                {ratingFilter === 'all' && 'All Ratings'}
                {ratingFilter === '5' && '⭐⭐⭐⭐⭐ 5 Stars'}
                {ratingFilter === '4' && '⭐⭐⭐⭐ 4 Stars'}
                {ratingFilter === '3' && '⭐⭐⭐ 3 Stars'}
                {ratingFilter === '2' && '⭐⭐ 2 Stars'}
                {ratingFilter === '1' && '⭐ 1 Star'}
                <span className="ml-2">▼</span>
              </button>
              {mobileDropdownOpen === 'rating' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-11/12 max-w-xs mx-auto p-2">
                    <h3 className="text-xs font-bold mb-2 text-blue-700 dark:text-cyan-400">Filter by Rating</h3>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === 'all' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('all'); setMobileDropdownOpen(false); }}>All Ratings</button></li>
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === '5' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('5'); setMobileDropdownOpen(false); }}>⭐⭐⭐⭐⭐ 5 Stars</button></li>
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === '4' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('4'); setMobileDropdownOpen(false); }}>⭐⭐⭐⭐ 4 Stars</button></li>
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === '3' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('3'); setMobileDropdownOpen(false); }}>⭐⭐⭐ 3 Stars</button></li>
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === '2' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('2'); setMobileDropdownOpen(false); }}>⭐⭐ 2 Stars</button></li>
                      <li><button type="button" className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-700 dark:text-cyan-300 ${ratingFilter === '1' ? 'font-bold' : ''}`} onClick={() => { setRatingFilter('1'); setMobileDropdownOpen(false); }}>⭐ 1 Star</button></li>
                    </ul>
                    <button type="button" className="mt-2 w-full py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs" onClick={() => setMobileDropdownOpen(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
            {/* Native select for desktop/tablet */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="hidden sm:block w-full px-2 sm:px-4 py-2 sm:py-3 bg-white font-semibold hover:bg-blue-500 dark:text-white hover:text-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-blue-500 focus:outline-none focus:border-blue-500 transition-colors text-xs sm:text-base"
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
        <div className="text-xs sm:text-sm text-white dark:text-gray-400">
          Showing {filteredFeedbacks.length} of {feedbacks.length} feedbacks
        </div>
      </div>

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {loading && (
          <div className="col-span-full text-center py-8">
            <Loader />
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
        <div className="flex justify-center items-center mt-6 sm:mt-8 space-x-4 sm:space-x-6">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-full bg-white dark:text-white hover:bg-blue-500 hover:text-white dark:bg-gray-800 border border-blue-500 dark:border-gray-700 text-blue-500 text-lg font-bold transition-colors duration-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`}
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
            className={`px-4 py-2 rounded-full bg-white dark:text-white hover:bg-blue-500 hover:text-white dark:bg-gray-800 border border-blue-500 dark:border-gray-700 text-blue-500 text-lg font-bold transition-colors duration-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed`}
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
