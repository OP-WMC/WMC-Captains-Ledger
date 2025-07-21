import React, { useEffect, useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-router-dom'; // <-- Important for routing

const LandingPage = () => {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.shake-on-load');
    if (hero) {
      hero.classList.add('animate-shake');
      setTimeout(() => {
        hero.classList.remove('animate-shake');
      }, 10000);
    }
  }, []);

  return (
    <div className="relative font-rajdhani">
      {/* Background Video */}
      <video
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/avengers-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-sm text-white px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
        <div className="text-cyan-400 text-xl sm:text-2xl font-russo animate-pulse">Captain's Ledger</div>
        {/* Hamburger menu for mobile */}
        <div className="sm:hidden">
          <button onClick={() => setNavOpen((prev) => !prev)} className="focus:outline-none">
            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-6 md:gap-10">
          <ScrollLink to="hero" smooth={true} duration={500} className="cursor-pointer relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow">Home</ScrollLink>
          <ScrollLink to="about" smooth={true} duration={500} offset={-80} className="cursor-pointer relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow">About</ScrollLink>
          <Link to="/login" className="relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow">Login</Link>
        </nav>
      </header>
      {/* Mobile nav dropdown */}
      {navOpen && (
        <nav className="sm:hidden fixed top-16 left-0 w-full bg-black/90 z-50 flex flex-col items-center gap-4 py-4 animate-fade-in-down">
          <ScrollLink to="hero" smooth={true} duration={500} className="w-full text-center py-2 text-cyan-400 font-russo" onClick={() => setNavOpen(false)}>Home</ScrollLink>
          <ScrollLink to="about" smooth={true} duration={500} offset={-80} className="w-full text-center py-2 text-cyan-400 font-russo" onClick={() => setNavOpen(false)}>About</ScrollLink>
          <Link to="/login" className="w-full text-center py-2 text-cyan-400 font-russo" onClick={() => setNavOpen(false)}>Login</Link>
        </nav>
      )}

      {/* Hero Section */}
      <section id="hero" className="min-h-[90vh] sm:min-h-[80vh] sm:h-screen flex items-center justify-center text-center text-white bg-black/60 px-4 sm:px-8 shake-on-load">
        <div className="z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-cyan-400 font-russo mx-auto">
            <span className="block overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 pr-2 animate-typewriter">
              Unite. Lead. Protect.
            </span>
          </h1>
          <p className="text-base sm:text-lg mt-4 sm:mt-6 mb-6 sm:mb-8">
            The tactical command interface for Earth's mightiest heroes.
          </p>
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            <Link to="/register" className="relative flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-lg group overflow-hidden font-rajdhani text-base sm:text-lg">
              <span>🛡️</span> Join the Initiative
              <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:animate-shine pointer-events-none"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#111] text-white py-8 sm:py-20 text-center px-4 sm:px-6 mt-16 sm:mt-0">
        <h2 className="text-2xl sm:text-3xl md:text-4xl text-cyan-400 mb-2 sm:mb-4 font-russo">
          What is Captain's Ledger?
        </h2>
        <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
          Captain's Ledger is a secure Avengers management system where heroes track missions, submit feedback, mark attendance, and transfer funds. Commander Sam Wilson oversees all operations, assigning tasks, handling payments, and uniting the team.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-cyan-400 py-6 sm:py-8 text-center border-t border-cyan-400 text-xs sm:text-sm mt-8 sm:mt-12 w-full overflow-x-hidden">
        <div>
          <p>&copy; 2025 Captain's Ledger. All rights reserved.</p>
          <p>Assembled by Commander Sam Wilson 🛡️</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;