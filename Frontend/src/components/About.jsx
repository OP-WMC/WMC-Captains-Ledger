import React from "react";

const About = () => {
  return (
    <section id="about" className="bg-[#111] text-white py-10 sm:py-16 md:py-20 text-center px-3 sm:px-4 md:px-8">
      <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#00e0ff] mb-3 sm:mb-4 md:mb-6">What is Captain’s Ledger?</h2>
      <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
        Captain’s Ledger is a secure Avengers management system where heroes track missions,
        submit feedback, mark attendance, and transfer funds. Commander Sam Wilson oversees all operations,
        assigning tasks, handling payments, and uniting the team.
      </p>
    </section>
  );
};

export default About;