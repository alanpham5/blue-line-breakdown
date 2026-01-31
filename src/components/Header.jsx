import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-row justify-between items-center p-4 w-full sm:w-auto">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/blb-dark.png"
              alt="Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 block light:hidden"
            />
            <img
              src="/blb-light.png"
              alt="Logo"
              className="w-12 h-12 sm:w-16 sm:h-16 hidden light:block"
            />
            <h1 className="text-xl sm:text-4xl font-bold text-white light:text-gray-900 ml-2">
              Blue Line Breakdown
            </h1>
          </Link>
          <button
            className="sm:hidden text-white light:text-gray-900 text-xl p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
        <nav
          className={`${isMenuOpen ? "block" : "hidden"} sm:block w-full sm:w-auto z-50`}
        >
          <ul className="flex flex-col sm:flex-row space-y-0 sm:space-x-6 px-4 py-3 sm:p-0 sm:items-center sm:justify-end">
            <li>
              <Link
                to="/"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition block py-2 sm:py-0 text-center sm:text-left"
              >
                Players
              </Link>
            </li>
            <li>
              <Link
                to="/teams"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition block py-2 sm:py-0 text-center sm:text-left"
              >
                Teams
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition block py-2 sm:py-0 text-center sm:text-left"
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
