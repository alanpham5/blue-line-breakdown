import React from "react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="flex justify-center space-x-4 mb-6 sm:mb-8">
      <Link
        to="/"
        className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 sm:py-2.5 sm:px-5 rounded-full transition-all duration-300 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 text-sm sm:text-base"
      >
        Home
      </Link>
      <Link
        to="/teams"
        className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 sm:py-2.5 sm:px-5 rounded-full transition-all duration-300 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 text-sm sm:text-base"
      >
        Teams
      </Link>
      <Link
        to="/about"
        className="bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2 px-4 sm:py-2.5 sm:px-5 rounded-full transition-all duration-300 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 text-sm sm:text-base"
      >
        About
      </Link>
    </nav>
  );
};
