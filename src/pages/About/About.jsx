import { Link } from "react-router-dom";
import { Header } from "../../components/Header";

export const About = ({ enablePageLoadAnimations = true }) => {
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

                <div className="pt-6">
                  <Link
                    to="/"
                    className="btn-search-primary btn-search-primary-inline"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
