import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="h-screen w-screen font-orbitron bg-black text-[#00ffcc] overflow-hidden relative">
      
      {/* YOUTUBE VIDEO BACKGROUND */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden">
        <iframe
          src="https://www.youtube.com/embed/3cKVH-ebghs?autoplay=1&mute=1&controls=0&loop=1&playlist=3cKVH-ebghs"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full pointer-events-none"
        ></iframe>
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 -z-10"></div>

      {/* FLICKERING "TOP SECRET" */}
      <div className="absolute top-8 right-8 text-red-600 font-bold text-xl animate-flicker">
        TOP SECRET
      </div>

      {/* MAIN CONTENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center animate-fadeIn">
        <h1 className="text-5xl mb-4 tracking-widest drop-shadow-[0_0_10px_#00ffff]">Captain's Ledger</h1>
        <p className="text-lg mb-8 opacity-80">Welcome, Agent. Secure access required to proceed.</p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="border border-[#00ffcc] px-6 py-3 rounded-lg text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black transition shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="border border-[#00ffcc] px-6 py-3 rounded-lg text-[#00ffcc] hover:bg-[#00ffcc] hover:text-black transition shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;