import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Landing.css"; // Your custom CSS file

const Landing = () => {
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.classList.add("shake");
      setTimeout(() => {
        hero.classList.remove("shake");
      }, 3000);
    }
  }, []);

  return (
    <div>
      {/* Background Video */}
      <video className="video-bg" autoPlay loop muted playsInline>
        <source src="/assets/avengers-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Navbar */}
      <header>
        <div className="logo">Captain's Ledger</div>
        <nav>
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-content">
          <h1>
            <span className="typewriter">Unite. Lead. Protect.</span>
          </h1>
          <p>The tactical command interface for Earth’s mightiest heroes.</p>

          <div className="hero-buttons">
            <Link to="/register">
              🛡️ Join the Initiative
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2>What is Captain’s Ledger?</h2>
        <p>
          Captain’s Ledger is a secure Avengers management system where heroes track
          missions, submit feedback, mark attendance, and transfer funds. Commander Sam
          Wilson oversees all operations, assigning tasks, handling payments, and uniting
          the team.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Captain's Ledger. All rights reserved.</p>
          <p>Assembled by Commander Sam Wilson 🛡️</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
