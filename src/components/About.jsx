import { Link } from "react-router-dom";
import { Header } from "./Header";

export const About = () => {
  return (
    <div className="min-h-screen ice-background text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto relative z-10">
        <Header />

        <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-cyan-400">
              About the Platform
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Blue Line Breakdown grew out of a simple truth: hockey keeps
              evolving. Inspired by my dad, who watched plenty of hockey in the
              2000s and mid-2010s and is now getting back into the game, this
              project started as a way to make sense of how today’s players play
              stylistically and how they compare to players of the past.
              <br />
              <br />
              This platform helps bring clarity to the modern game by breaking
              down player metrics into meaningful profiles and on-ice styles. By
              highlighting how players perform, the roles they fill, and how
              their games compare across eras, Blue Line Breakdown gives fans,
              scouts, and curious viewers a clearer way to understand what
              they’re seeing, and a deeper appreciation for how the game
              continues to change while staying familiar.
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mt-4">
              All data is sourced from{" "}
              <a
                href="https://moneypuck.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                MoneyPuck
              </a>
              , covering NHL seasons from 2008 to the present.
            </p>
          </section>

          <section>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-cyan-400">
              Developer
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              This platform was built by Alan Pham as a side project to explore
              hockey analytics and data visualization. Alan is a software
              engineer and data scientist with a passion for hockey and data
              visualization. He recently graduated from the University of
              California, Irvine with a Masters's degree in Data Science. You
              can learn more about him{" "}
              <a
                href="https://alanpham.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                here
              </a>
              .
            </p>
          </section>

          <div className="mt-8 flex justify-center">
            <img
              src="/dev.jpg"
              alt="Alan Pham"
              className="w-32 h-full sm:w-40 sm:h-full object-cover border-4 border-cyan-400/60 shadow-lg shadow-cyan-500/40 backdrop-blur-sm"
            />
          </div>

          <section className="pt-4">
            <Link
              to="/"
              className="inline-block bg-gradient-to-r from-cyan-500/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 backdrop-blur-sm border border-cyan-400/30 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              Back to Home
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};
