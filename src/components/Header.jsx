import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClassName = ({ isActive }) =>
  [
    "inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none",
    isActive
      ? "bg-sky-400/10 text-sky-300 shadow-[0_6px_16px_rgba(88,166,255,0.12)] light:bg-sky-500/10 light:text-sky-700"
      : "text-gray-300 hover:text-white hover:bg-white/5 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-900/5",
  ].join(" ");

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="mb-6 sm:mb-8">
      <div className="liquid-glass-strong rounded-[32px] px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          <Link
            to="/"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <img
              src="/blb-dark.png"
              alt="Logo"
              className="h-10 w-10 shrink-0 sm:h-11 sm:w-11 lg:h-14 lg:w-14 block light:hidden"
            />
            <img
              src="/blb-light.png"
              alt="Logo"
              className="h-10 w-10 shrink-0 sm:h-11 sm:w-11 lg:h-14 lg:w-14 hidden light:block"
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <h1 className="whitespace-nowrap text-[clamp(0.72rem,4.2vw,2.8rem)] font-bold leading-none tracking-[-0.04em] text-white light:text-gray-900 sm:text-[clamp(1rem,2.4vw,2.8rem)]">
                Blue Line Breakdown
              </h1>
            </div>
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white outline-none transition-colors hover:bg-white/10 focus:outline-none focus-visible:outline-none md:hidden light:bg-white/80 light:text-slate-900 light:hover:bg-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" strokeWidth={2.25} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={2.25} />
            )}
          </button>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <nav>
              <ul className="flex items-center gap-2">
                <li>
                  <NavLink to="/" end className={navLinkClassName}>
                    Players
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/teams" className={navLinkClassName}>
                    Teams
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className={navLinkClassName}>
                    About
                  </NavLink>
                </li>
              </ul>
            </nav>
            <ThemeToggle showLabel={true} />
          </div>
        </div>

        <nav
          className={`${isMenuOpen ? "block" : "hidden"} md:hidden mt-4 w-full z-50`}
          aria-hidden={!isMenuOpen}
        >
          <div className="liquid-glass rounded-[28px] p-3">
            <ul className="flex flex-col items-center gap-2">
              <li className="flex w-full max-w-xs justify-center">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `${navLinkClassName({ isActive })} w-full justify-center`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Players
                </NavLink>
              </li>
              <li className="flex w-full max-w-xs justify-center">
                <NavLink
                  to="/teams"
                  className={({ isActive }) =>
                    `${navLinkClassName({ isActive })} w-full justify-center`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Teams
                </NavLink>
              </li>
              <li className="flex w-full max-w-xs justify-center">
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `${navLinkClassName({ isActive })} w-full justify-center`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </NavLink>
              </li>
            </ul>
            <div className="mt-3 flex justify-center">
              <ThemeToggle showLabel={true} />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};
