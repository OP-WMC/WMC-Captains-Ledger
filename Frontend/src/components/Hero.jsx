import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section id="hero" className="h-screen flex justify-center items-center text-center text-white bg-black/60 px-6">
      <div className="max-w-2xl animate-fadeInUp">
        <h1 className="text-4xl md:text-6xl mb-4 text-[#00e0ff] typewriter">Unite. Lead. Protect.</h1>
        <p className="text-lg mb-6">The tactical command interface for Earth’s mightiest heroes.</p>
        <div className="hero-buttons flex justify-center gap-4 flex-wrap">
          <Link
            to="/register"
            className="border-2 border-[#00e0ff] px-6 py-3 rounded text-[#00e0ff] hover:bg-[#00e0ff] hover:text-black transition"
          >
            🛡️ Join the Initiative
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
