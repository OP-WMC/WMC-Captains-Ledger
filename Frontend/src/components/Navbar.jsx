import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed top-0 w-full px-12 py-5 bg-black/30 text-white flex justify-between items-center z-50">
      <div className="text-[#00e0ff] text-2xl font-bold animate-pulse">Captain's Ledger</div>
      <nav className="space-x-8">
        <a href="#hero">Home</a>
        <a href="#about">About</a>
        <Link to="/login">Login</Link>
      </nav>
    </header>
  );
};

export default Navbar;
