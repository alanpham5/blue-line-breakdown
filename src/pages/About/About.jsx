import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const About = ({ enablePageLoadAnimations = true }) => {
  useEffect(() => {
    document.title = "About | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);

  return (
    <div className="min-h-screen ice-background px-4 pb-10 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="max-w-6xl mx-auto relative z-10">
        <Header />
        <div className="space-y-6">
          <div
            className={`liquid-glass-strong rounded-[32px] p-6 sm:p-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
          >
            <h1 className="section-title text-4xl sm:text-5xl mb-6">About</h1>
            <section>
              <p className="text-base leading-relaxed text-gray-300 light:text-gray-600 sm:text-lg">
                Blue Line Breakdown grew out of a simple truth: hockey keeps
                evolving. Inspired by my dad, who watched plenty of hockey in
                the 2000s and mid-2010s and is now getting back into the game,
                this project started as a way to make sense of how today’s
                players play stylistically and how they compare to players of
                the past.
                <br />
                <br />
                This platform helps bring clarity to the modern game by breaking
                down player metrics into meaningful profiles and on-ice styles.
                By highlighting how players perform, the roles they fill, and
                how their games compare across eras, Blue Line Breakdown gives
                fans, scouts, and curious viewers a clearer way to understand
                what they’re seeing, and a deeper appreciation for how the game
                continues to change while staying familiar.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-300 light:text-gray-600 sm:text-lg">
                Powered by{" "}
                <a
                  href="https://moneypuck.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent font-medium"
                >
                  MoneyPuck
                </a>{" "}
                data, with in-house metrics and analysis, covering NHL seasons
                from 2008 to the present.
              </p>
              <div className="mt-6 flex justify-start">
                <a
                  href="https://x.com/BLBreakdown"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 light:bg-slate-900/10 light:hover:bg-slate-900/20 px-5 py-2.5 text-sm font-semibold text-white light:text-gray-900 transition-all duration-200 shadow-sm border border-white/5 light:border-slate-200/50"
                >
                  <span>Follow on</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current text-white light:text-gray-900"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </section>
          </div>

          <div
            className={`liquid-glass rounded-[32px] p-6 sm:p-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
          >
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:text-left">
              <div className="h-32 w-32 overflow-hidden rounded-full bg-white/[0.04] lg:h-40 lg:w-40">
                <img
                  src="dev.png"
                  alt={"Alan Pham"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-bold text-white light:text-gray-900 sm:text-3xl">
                  Developer
                </h2>
                <p className="text-base leading-relaxed text-gray-300 light:text-gray-600 sm:text-lg">
                  This platform was built by Alan Pham as a side project to
                  explore hockey analytics and data visualization. Alan is a
                  software engineer and data scientist with a passion for hockey
                  and data visualization. He recently graduated from the
                  University of California, Irvine with a Masters&apos;s degree
                  in Data Science. You can learn more about him{" "}
                  <a
                    href="https://alanpham.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent font-semibold"
                  >
                    here
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          <div
            className={`liquid-glass rounded-[32px] p-6 sm:p-8 ${enablePageLoadAnimations ? "liquid-glass-animate" : ""}`}
          >
            <h2 className="mb-6 text-2xl font-bold text-center text-white light:text-gray-900 sm:text-3xl">
              Discover More
            </h2>
            <div className="flex justify-center gap-12 sm:gap-16">
              <a
                href="https://full-court-focus.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-[22%] bg-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group-focus-visible:ring-2 group-focus-visible:ring-[#7ee340] border border-white/10 shadow-md">
                  <img
                    src="/fcf.png"
                    alt="Full Court Focus"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-300 light:text-gray-600 transition-colors duration-200 group-hover:text-[#7ee340] light:group-hover:text-[#2e6e14]">
                  Full Court Focus
                </span>
              </a>

              <a
                href="https://redzone-report.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-[22%] bg-white/[0.04] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group-focus-visible:ring-2 group-focus-visible:ring-[#7ee340] border border-white/10 shadow-md">
                  <img
                    src="/rr-color.png"
                    alt="RedZone Report"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-300 light:text-gray-600 transition-colors duration-200 group-hover:text-[#7ee340] light:group-hover:text-[#2e6e14]">
                  RedZone Report
                </span>
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
