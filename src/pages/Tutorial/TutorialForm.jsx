export const TutorialForm = ({
  dashboard,
  setDashboard,
  enablePageLoadAnimations = true,
}) => {
  return (
    <div
      className={`p-2 ${
        enablePageLoadAnimations ? "liquid-glass-animate" : ""
      } w-full flex flex-col flex-1 justify-center gap-6`}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white light:text-gray-900 text-center">
        Learn About
      </h2>

      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setDashboard("players")}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            dashboard === "players"
              ? "bg-cyan-500 text-white"
              : "bg-white/10 light:bg-gray-200/80 text-gray-200 light:text-gray-700 hover:bg-cyan-500/40 light:hover:bg-cyan-100"
          }`}
        >
          Player Dash
        </button>

        <button
          onClick={() => setDashboard("team")}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            dashboard === "team"
              ? "bg-blue-500 text-white"
              : "bg-white/10 light:bg-gray-200/80 text-gray-200 light:text-gray-700 hover:bg-blue-500/40 light:hover:bg-blue-100"
          }`}
        >
          Team Dash
        </button>
      </div>
    </div>
  );
};
