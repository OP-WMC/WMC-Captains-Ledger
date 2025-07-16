import React, { useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from 'react-router-dom'; // <-- Important for routing

const LandingPage = () => {
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
      <header className="fixed top-0 w-full z-50 bg-black/30 backdrop-blur-sm text-white px-8 py-4 flex justify-between items-center">
        <div className="text-cyan-400 text-2xl font-russo animate-pulse">Captain's Ledger</div>

        <nav className="flex gap-10">
          <ScrollLink
            to="hero"
            smooth={true}
    duration={500}
            className="cursor-pointer relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow"
          >
            Home
          </ScrollLink>
          <ScrollLink
    to="about"
    smooth={true}
    duration={500}
    offset={-80} // adjust if you have a fixed navbar
    className="cursor-pointer relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow"
  >
    About
  </ScrollLink>
          <Link
            to="/login"
            className="relative inline-block font-russo tracking-wide transition-all duration-300 text-white hover:text-cyan-400 hover:text-shadow-glow"
          >
            Login
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="h-screen flex items-center justify-center text-center text-white bg-black/60 px-8 shake-on-load">
        <div className="z-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl text-cyan-400 font-russo mx-auto">
            <span className="block overflow-hidden whitespace-nowrap border-r-2 border-cyan-400 pr-2 animate-typewriter">
              Unite. Lead. Protect.
            </span>
          </h1>

          <p className="text-lg mt-6 mb-8">
            The tactical command interface for Earth’s mightiest heroes.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="relative flex items-center gap-2 px-6 py-3 border-2 border-cyan-400 text-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition-all duration-300 shadow-lg group overflow-hidden font-rajdhani text-lg"
            >
              <span>🛡️</span> Join the Initiative
              <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] group-hover:animate-shine pointer-events-none"></span>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#111] text-white py-20 text-center px-6">
        <h2 className="text-3xl sm:text-4xl text-cyan-400 mb-4 font-russo">
          What is Captain’s Ledger?
        </h2>
        <p className="max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
          Captain’s Ledger is a secure Avengers management system where heroes track missions, submit feedback, mark attendance, and transfer funds. Commander Sam Wilson oversees all operations, assigning tasks, handling payments, and uniting the team.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-cyan-400 py-8 text-center border-t border-cyan-400 text-sm mt-12">
        <div>
          <p>&copy; 2025 Captain's Ledger. All rights reserved.</p>
          <p>Assembled by Commander Sam Wilson 🛡️</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;