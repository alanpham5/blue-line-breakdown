import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Users, Shield, Info, Trophy } from "lucide-react";
import { AccountMenu } from "features/auth/components/AccountMenu";
const navLinkClassName = ({ isActive }) =>
  [
    "inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 outline-none focus:outline-none focus-visible:outline-none",
    isActive
      ? "bg-white/10 text-[#7ee340] light:bg-slate-900/10 light:text-[#2e6e14]"
      : "text-gray-300 hover:text-white hover:bg-white/5 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-900/5",
  ].join(" ");
const bottomNavLinkClassName = ({ isActive }) =>
  [
    "flex flex-col items-center justify-center gap-1 rounded-2xl py-1 px-3 text-[10px] font-bold tracking-wide transition-all duration-200 outline-none focus:outline-none",
    isActive
      ? "text-[#7ee340] light:text-[#2e6e14]"
      : "text-gray-400 hover:text-white light:text-slate-500 light:hover:text-slate-900",
  ].join(" ");
export const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    let ticking = false;
    let lastY = window.pageYOffset;
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      const isBottom =
        window.innerHeight + scrollY >=
        document.documentElement.scrollHeight - 20;
      if (isBottom) {
        setIsVisible(true);
        lastY = scrollY > 0 ? scrollY : 0;
        ticking = false;
        return;
      }
      if (Math.abs(scrollY - lastY) < 10) {
        ticking = false;
        return;
      }
      if (scrollY > lastY && scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const headerMobileClasses = isVisible
    ? "fixed top-4 left-4 right-4 z-50 translate-y-0 opacity-100"
    : "fixed top-4 left-4 right-4 z-50 -translate-y-[120%] opacity-0 pointer-events-none";
  return (
    <div className="h-[74px] mb-6 md:h-auto md:mb-8 relative">
      <header
        className={`transition-all duration-300 ease-in-out md:static md:translate-y-0 md:opacity-100 md:pointer-events-auto ${headerMobileClasses}`}
      >
        <div className="liquid-glass-strong rounded-[32px] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center justify-between gap-3 md:gap-4">
            <Link
              to="/"
              className="flex min-w-0 flex-1 items-center justify-center md:justify-start gap-2 sm:gap-3"
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

            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <nav>
                <ul className="flex items-center gap-2">
                  <li>
                    <NavLink to="/players" className={navLinkClassName}>
                      Players
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/teams" className={navLinkClassName}>
                      Teams
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/expansion-draft" className={navLinkClassName}>
                      <span className="flex items-center gap-1.5">
                        Expansion
                        <span
                          className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                          style={{
                            background: "var(--btn-accent)",
                            color: "var(--btn-accent-text)",
                          }}
                        >
                          Beta
                        </span>
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/about" className={navLinkClassName}>
                      About
                    </NavLink>
                  </li>
                </ul>
              </nav>
              <AccountMenu />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="md:hidden">
                <AccountMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`transition-all duration-300 ease-in-out md:hidden ${isVisible ? "fixed bottom-4 left-4 right-4 z-50 translate-y-0 opacity-100" : "fixed bottom-4 left-4 right-4 z-50 translate-y-[120%] opacity-0 pointer-events-none"}`}
      >
        <div className="liquid-glass-strong rounded-[24px] px-4 py-2 flex items-center justify-around shadow-lg">
          <NavLink to="/players" className={bottomNavLinkClassName}>
            <Users className="h-5 w-5 mb-0.5" />
            <span>Players</span>
          </NavLink>
          <NavLink to="/teams" className={bottomNavLinkClassName}>
            <Shield className="h-5 w-5 mb-0.5" />
            <span>Teams</span>
          </NavLink>
          <NavLink to="/expansion-draft" className={bottomNavLinkClassName}>
            <div className="relative">
              <Trophy className="h-5 w-5 mb-0.5" />
              <span
                className="absolute -top-1 -right-6 inline-flex items-center rounded-full px-1 text-[0.5rem] font-bold uppercase tracking-wide"
                style={{
                  background: "var(--btn-accent)",
                  color: "var(--btn-accent-text)",
                }}
              >
                BETA
              </span>
            </div>
            <span>Expansion</span>
          </NavLink>
          <NavLink to="/about" className={bottomNavLinkClassName}>
            <Info className="h-5 w-5 mb-0.5" />
            <span>About</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
