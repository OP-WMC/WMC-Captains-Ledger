import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[120px] sm:min-h-[200px] w-full max-w-full">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-b-cyan-400 border-l-transparent border-r-transparent dark:border-t-yellow-400 dark:border-b-orange-400 dark:border-l-transparent dark:border-r-transparent animate-spin" />
        {/* Inner glowing dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-6 sm:h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400 dark:bg-yellow-400 shadow-lg shadow-cyan-400/40 dark:shadow-yellow-400/40 animate-pulse" />
      </div>
      <span className="mt-2 sm:mt-4 text-blue-700 dark:text-yellow-300 font-semibold text-base sm:text-lg animate-fadeIn">Loading...</span>
    </div>
  );
};

export default Loader; 