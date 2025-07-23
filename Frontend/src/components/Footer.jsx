import React from "react";
import { FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="dark:bg-black/80 text-black font-semibold dark:text-white py-2 sm:py-3 text-center text-xs sm:text-sm border-t border-[#00e0ff] w-full overflow-x-hidden">
      <div className="max-w-screen-sm mx-auto">
        <p className="mb-0.5">&copy; 2025 Captain's Ledger. All rights reserved.</p>
        <p className="mb-1">Assembled by Commander Sam Wilson 🛡️</p>

        <p className="uppercase text-[10px] sm:text-xs tracking-wider mb-1 text-[#00e0ff] font-bold">
          Designed and Developed by
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 text-xs sm:text-sm">
          <a
            href="https://www.linkedin.com/in/even-patel/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-all duration-200 inline-flex items-baseline gap-1"
          >
            Even Patel
            <FaLinkedinIn className="text-[#00e0ff] dark:text-white text-[0.9rem] relative top-[2px]" />
          </a>

          <a
            href="https://www.linkedin.com/in/nitant-jain-58a5332a4/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-all duration-200 inline-flex items-baseline gap-1"
          >
            Nitant Jain
            <FaLinkedinIn className="text-[#00e0ff] dark:text-white text-[0.9rem] relative top-[2px]" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
