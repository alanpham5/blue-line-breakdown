import { useState } from "react";
import { TutorialForm } from "./TutorialForm";
import { Slideshow } from "./Slideshow";
import { useNavigate } from "react-router-dom";

export const Tutorial = ({ enablePageLoadAnimations = true }) => {
  const [dashboard, setDashboard] = useState();
  const navigate = useNavigate();

  const screenshots = {
    players: {
      desktop: [
        {
          src: "/desktop-player-1.png",
          desc: "Search for any player, select a season, and choose their position to get an insight into their season and how they performed on the ice.",
        },
        {
          src: "/desktop-player-2.png",
          desc: "Explore metrics that reveal their unique playing style and overall impact on the ice.",
        },
        {
          src: "/desktop-player-3.png",
          desc: "View a list of players whose style closely matches theirs, highlighting others who play the game in a similar way.",
        },
        {
          src: "/desktop-player-4.png",
          desc: "Focus on a specific season to find players who share the most similar style and characteristics during that year.",
        },
      ],
      mobile: [
        {
          src: "/mobile-player-1.png",
          desc: "Search for any player, select a season, and choose their position to get an insight into their season and how they performed on the ice.",
        },
        {
          src: "/mobile-player-2.png",
          desc: "Explore metrics that reveal their unique playing style and overall impact on the ice.",
        },
        {
          src: "/mobile-player-3.png",
          desc: "View a list of players whose style closely matches theirs, highlighting others who play the game in a similar way.",
        },
        {
          src: "/mobile-player-4.png",
          desc: "Focus on a specific season to find players who share the most similar style and characteristics during that year.",
        },
      ],
    },
    team: {
      desktop: [
        {
          src: "/desktop-team-1.png",
          desc: "Search for any team, select a season, and choose a position group to get insight into how that part of the roster performed that year.",
        },
        {
          src: "/desktop-team-2.png",
          desc: "See all the players in the selected position group and explore their impact on the ice throughout the season.",
        },
        {
          src: "/desktop-team-3.png",
          desc: "Net Impact ratings reveal each player’s overall contribution to the team’s performance, giving a clear view of who made the biggest difference.",
        },
      ],
      mobile: [
        {
          src: "/mobile-team-1.png",
          desc: "Search for any team, select a season, and choose a position group to get insight into how that part of the roster performed that year.",
        },
        {
          src: "/mobile-team-2.png",
          desc: "See all the players in the selected position group and explore their impact on the ice throughout the season.",
        },
        {
          src: "/mobile-team-3.png",
          desc: "Net Impact ratings reveal each player’s overall contribution to the team’s performance, giving a clear view of who made the biggest difference.",
        },
      ],
    },
  };

  return (
    <div className="flex flex-col h-screen mx-auto max-w-6xl text-white p-4 sm:p-6 pt-8 sm:pt-12">
      <div className="mx-auto relative z-10 flex flex-col flex-1 min-h-0 w-full">
        <button
          className="fixed top-5 right-10 z-50 px-5 py-2 bg-white/20 font-semibold text-white rounded-full hover:bg-white/30 transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="flex flex-col flex-1 min-h-0 gap-4">
          {/* Tutorial Form wrapper */}
          <div
            className={
              dashboard
                ? "mt-4"
                : "mt-4 flex flex-1 min-h-0 items-center justify-center"
            }
          >
            <TutorialForm
              dashboard={dashboard}
              setDashboard={setDashboard}
              enablePageLoadAnimations={enablePageLoadAnimations}
            />
          </div>

          {dashboard && (
            <>
              <div className="hidden md:flex flex-1 min-h-0">
                <Slideshow
                  key={`${dashboard}-desktop`}
                  slides={screenshots[dashboard].desktop}
                  enablePageLoadAnimations={enablePageLoadAnimations}
                />
              </div>

              <div className="md:hidden flex-1 min-h-0">
                <Slideshow
                  key={`${dashboard}-mobile`}
                  slides={screenshots[dashboard].mobile}
                  enablePageLoadAnimations={enablePageLoadAnimations}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
