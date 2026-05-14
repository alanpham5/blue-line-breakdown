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
          className={`rounded-full px-6 py-2 font-semibold transition ${
            dashboard === "players"
              ? "bg-[linear-gradient(180deg,#4f9ef7_0%,#3d8deb_42%,#2f7fe3_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(32,100,190,0.22)]"
              : "bg-white/10 text-gray-200 hover:bg-[#3d8deb]/35 light:bg-gray-200/80 light:text-gray-700 light:hover:bg-[#bdd9fb]"
          }`}
        >
          Player Dash
        </button>

        <button
          onClick={() => setDashboard("team")}
          className={`rounded-full px-6 py-2 font-semibold transition ${
            dashboard === "team"
              ? "bg-[linear-gradient(180deg,#4f9ef7_0%,#3d8deb_42%,#2f7fe3_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_rgba(32,100,190,0.22)]"
              : "bg-white/10 text-gray-200 hover:bg-[#3d8deb]/35 light:bg-gray-200/80 light:text-gray-700 light:hover:bg-[#bdd9fb]"
          }`}
        >
          Team Dash
        </button>
      </div>
    </div>
  );
};
