import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildPageTitle, trackEvent, trackPageView } from "lib/analytics";
import { playerUtils } from "utils/playerUtils";

const SELF_REPORTING_PATHS = /^\/players(\/v2(\/.*)?)?$/;

const STATIC_PAGE_TITLES = {
  "/players/legacy": "Players",
  "/players/profile-preview": "Player Profile Preview",
  "/players/goalie-profile-preview": "Goalie Profile Preview",
  "/players/archetype-badges": "Archetype Badges",
  "/leaderboard": "Player Rankings",
  "/teams/profile-preview": "Team Profile Preview",
  "/teams/roster": "Roster",
  "/line-builder": "Line Builder",
  "/expansion-draft": "Expansion Draft",
  "/expansion-draft/result": "Expansion Draft Results",
  "/expansion-draft/leaderboard": "Expansion Draft Leaderboard",
  "/about": "About",
  "/account": "Account",
  "/account/bookmarks": "My Bookmarks",
  "/account/drafts": "My Drafts",
  "/auth/verify-email": "Verify Email",
  "/auth/reset-password": "Reset Password",
  "/auth/google/callback": "Signing in…",
  "/loader": "Loading",
};

const normalizePath = (pathname) =>
  pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

export const GaPageTrackContext = () => {
  const location = useLocation();

  useEffect(() => {
    const normalizedPath = normalizePath(location.pathname);
    if (SELF_REPORTING_PATHS.test(normalizedPath)) return;

    const searchParams = new URLSearchParams(location.search);
    const team = searchParams.get("team");
    const season = searchParams.get("season") || searchParams.get("year");
    const isTeamPage = normalizedPath === "/teams";

    let pageTitle = STATIC_PAGE_TITLES[normalizedPath];
    if (isTeamPage) {
      pageTitle = team
        ? playerUtils.getFullTeamName(team, season) || team
        : "Teams";
    }

    document.title = buildPageTitle(pageTitle);
    trackPageView(document.title);

    if (isTeamPage && team && season) {
      trackEvent("team_view", {
        team,
        season,
        position: searchParams.get("position") || "summary",
        datetime: new Date().toISOString(),
      });
    }
  }, [location]);

  return null;
};
