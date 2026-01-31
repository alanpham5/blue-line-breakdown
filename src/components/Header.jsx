import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <div className="flex flex-row justify-between items-center p-4 w-full md:w-auto">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/blb-dark.png"
              alt="Logo"
              className="w-12 h-12 lg:w-16 lg:h-16 block light:hidden"
            />
            <img
              src="/blb-light.png"
              alt="Logo"
              className="w-12 h-12 lg:w-16 lg:h-16 hidden light:block"
            />
            <h1 className="text-2xl lg:text-4xl font-bold text-white light:text-gray-900 ml-2">
              Blue Line Breakdown
            </h1>
          </Link>

          <button
            className="md:hidden text-white light:text-gray-900 text-xl p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        <nav
          className={`${isMenuOpen ? "block" : "hidden"} md:block w-full md:w-auto z-50`}
        >
          <ul className="flex flex-col md:flex-row items-center gap-4 md:gap-6 px-4 py-3 md:p-0">
            <li>
              <Link
                to="/"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition"
              >
                Players
              </Link>
            </li>

            <li>
              <Link
                to="/teams"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition"
              >
                Teams
              </Link>
            </li>

            <li>
              <Link
                to="/about"
                className="text-white light:text-gray-900 hover:text-yellow-400 light:hover:text-cyan-600 transition"
              >
                About
              </Link>
            </li>

            <li className="flex justify-center w-full md:hidden">
              <ThemeToggle showLabel={false} />
            </li>

            <li className="hidden md:flex">
              <ThemeToggle showLabel={true} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
