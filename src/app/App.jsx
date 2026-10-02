import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "providers/ThemeContext";
import { TooltipProvider } from "providers/TooltipContext";
import { GaPageTrackContext } from "providers/GaPageTrackContext";
import { AuthProvider } from "providers/AuthContext";
import { AuthModal } from "features/auth/components/AuthModal";
import { SlowRequestOverlay } from "components/ui/SlowRequestOverlay";

const lazyPage = (load, exportName) =>
  lazy(() => load().then((module) => ({ default: module[exportName] })));

const Splashscreen = lazyPage(
  () => import(/* webpackPrefetch: true */ "features/splash/Splashscreen"),
  "Splashscreen"
);
const PlayersV2 = lazyPage(
  () => import(/* webpackPrefetch: true */ "features/players/PlayersV2"),
  "PlayersV2"
);
const PlayerLeaderboard = lazyPage(
  () =>
    import(
      /* webpackPrefetch: true */ "features/players/leaderboard/PlayerLeaderboard"
    ),
  "PlayerLeaderboard"
);
const TeamSummary = lazyPage(
  () => import(/* webpackPrefetch: true */ "features/team-summary/TeamSummary"),
  "TeamSummary"
);
const Players = lazyPage(() => import("features/players/Players"), "Players");
const PlayerProfilePreview = lazyPage(
  () => import("features/players/PlayerProfilePreview"),
  "PlayerProfilePreview"
);
const GoalieProfilePreview = lazyPage(
  () => import("features/players/GoalieProfilePreview"),
  "GoalieProfilePreview"
);
const ArchetypeBadgePreview = lazyPage(
  () => import("features/players/ArchetypeBadgePreview"),
  "ArchetypeBadgePreview"
);
const About = lazyPage(() => import("features/about/About"), "About");
const TeamProfilePreview = lazyPage(
  () => import("features/team-summary/TeamProfilePreview"),
  "TeamProfilePreview"
);
const Roster = lazyPage(() => import("features/roster/Roster"), "Roster");
const LineBuilder = lazyPage(
  () => import("features/line-builder/LineBuilder"),
  "LineBuilder"
);
const Loader = lazyPage(() => import("features/loader/Loader"), "Loader");
const ExpansionDraft = lazyPage(
  () => import("features/expansion-draft/ExpansionDraft"),
  "ExpansionDraft"
);
const DraftResult = lazyPage(
  () => import("features/expansion-draft/DraftResult"),
  "DraftResult"
);
const Leaderboard = lazyPage(
  () => import("features/expansion-draft/Leaderboard"),
  "Leaderboard"
);
const AccountSettings = lazyPage(
  () => import("features/account/AccountSettings"),
  "AccountSettings"
);
const SavedBookmarks = lazyPage(
  () => import("features/account/SavedBookmarks"),
  "SavedBookmarks"
);
const SavedDrafts = lazyPage(
  () => import("features/account/SavedDrafts"),
  "SavedDrafts"
);
const VerifyEmail = lazyPage(
  () => import("features/auth/components/VerifyEmail"),
  "VerifyEmail"
);
const ResetPassword = lazyPage(
  () => import("features/auth/components/ResetPassword"),
  "ResetPassword"
);
const GoogleCallback = lazyPage(
  () => import("features/auth/components/GoogleCallback"),
  "GoogleCallback"
);
const NotFound = lazyPage(
  () => import("features/not-found/NotFound"),
  "NotFound"
);

const PageFallback = () => <div className="ice-background min-h-screen" />;
const App = () => {
  const enablePageLoadAnimations = true;
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GaPageTrackContext />
            <SlowRequestOverlay />

            <AuthModal />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Splashscreen
                      enablePageLoadAnimations={enablePageLoadAnimations}
                    />
                  }
                />
                <Route path="/players" element={<PlayersV2 />} />
                <Route
                  path="/players/legacy"
                  element={
                    <Players
                      enablePageLoadAnimations={enablePageLoadAnimations}
                    />
                  }
                />
                <Route path="/players/v2" element={<PlayersV2 />} />
                <Route path="/players/v2/:playerId" element={<PlayersV2 />} />
                <Route
                  path="/players/profile-preview"
                  element={<PlayerProfilePreview />}
                />
                <Route
                  path="/players/goalie-profile-preview"
                  element={<GoalieProfilePreview />}
                />
                <Route
                  path="/players/archetype-badges"
                  element={<ArchetypeBadgePreview />}
                />
                <Route path="/leaderboard" element={<PlayerLeaderboard />} />
                <Route
                  path="/teams"
                  element={
                    <TeamSummary
                      enablePageLoadAnimations={enablePageLoadAnimations}
                    />
                  }
                />
                <Route
                  path="/teams/profile-preview"
                  element={<TeamProfilePreview />}
                />
                <Route path="/teams/roster" element={<Roster />} />
                <Route path="/line-builder" element={<LineBuilder />} />
                <Route path="/expansion-draft" element={<ExpansionDraft />} />
                <Route
                  path="/expansion-draft/result"
                  element={<DraftResult />}
                />
                <Route
                  path="/expansion-draft/leaderboard"
                  element={<Leaderboard />}
                />
                <Route path="/about" element={<About />} />
                <Route path="/account" element={<AccountSettings />} />
                <Route path="/account/bookmarks" element={<SavedBookmarks />} />
                <Route path="/account/drafts" element={<SavedDrafts />} />
                <Route path="/auth/verify-email" element={<VerifyEmail />} />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
                <Route
                  path="/auth/google/callback"
                  element={<GoogleCallback />}
                />
                <Route path="/loader" element={<Loader />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
