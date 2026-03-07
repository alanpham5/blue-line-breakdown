import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function capitalizeWordsRegex(str) {
  return str.replace(/(^|\s)\S/g, function (match) {
    return match.toUpperCase();
  });
}

export const GaPageTrackContext = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const searchParams = new URLSearchParams(location.search);
    const normalizedPath =
      location.pathname.length > 1 && location.pathname.endsWith("/")
        ? location.pathname.slice(0, -1)
        : location.pathname;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
      debug_mode: process.env.NODE_ENV !== "production",
    });

    if (normalizedPath === "/") {
      const player = searchParams.get("player");
      const season = searchParams.get("season");

      if (player && season) {
        window.gtag("event", "player_view", {
          player: capitalizeWordsRegex(player),
          season,
          debug_mode: process.env.NODE_ENV !== "production",
        });
      }
    }

    if (normalizedPath === "/teams") {
      const team = searchParams.get("team");
      const season = searchParams.get("season");
      const position = searchParams.get("position");

      if (team && season && position) {
        window.gtag("event", "team_view", {
          team,
          season,
          position,
          debug_mode: process.env.NODE_ENV !== "production",
        });
      }
    }
  }, [location]);

  return null;
};
