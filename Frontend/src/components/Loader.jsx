import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-b-cyan-400 border-l-transparent border-r-transparent dark:border-t-yellow-400 dark:border-b-orange-400 dark:border-l-transparent dark:border-r-transparent animate-spin" />
        {/* Inner glowing dot */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400 dark:bg-yellow-400 shadow-lg shadow-cyan-400/40 dark:shadow-yellow-400/40 animate-pulse" />
      </div>
      <span className="mt-4 text-blue-700 dark:text-yellow-300 font-semibold text-lg animate-fadeIn">Loading...</span>
    </div>
  );
};

export default Loader; 