import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Players } from "features/players/Players";
import { PlayersV2 } from "features/players/PlayersV2";
import { PlayerProfilePreview } from "features/players/PlayerProfilePreview";
import { GoalieProfilePreview } from "features/players/GoalieProfilePreview";
import { PlayerLeaderboard } from "features/players/leaderboard/PlayerLeaderboard";
import { Splashscreen } from "features/splash/Splashscreen";
import { About } from "features/about/About";
import { TeamSummary } from "features/team-summary/TeamSummary";
import { Roster } from "features/roster/Roster";
import { Loader } from "features/loader/Loader";
import { ExpansionDraft } from "features/expansion-draft/ExpansionDraft";
import { DraftResult } from "features/expansion-draft/DraftResult";
import { Leaderboard } from "features/expansion-draft/Leaderboard";
import { AccountSettings } from "features/account/AccountSettings";
import { SavedBookmarks } from "features/account/SavedBookmarks";
import { SavedDrafts } from "features/account/SavedDrafts";
import { VerifyEmail } from "features/auth/components/VerifyEmail";
import { ResetPassword } from "features/auth/components/ResetPassword";
import { GoogleCallback } from "features/auth/components/GoogleCallback";
import { NotFound } from "features/not-found/NotFound";
import { ThemeProvider } from "providers/ThemeContext";
import { TooltipProvider } from "providers/TooltipContext";
import { GaPageTrackContext } from "providers/GaPageTrackContext";
import { AuthProvider } from "providers/AuthContext";
import { AuthModal } from "features/auth/components/AuthModal";
const App = () => {
  const enablePageLoadAnimations = true;
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GaPageTrackContext />

            <AuthModal />
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
              <Route path="/leaderboard" element={<PlayerLeaderboard />} />
              <Route
                path="/teams"
                element={
                  <TeamSummary
                    enablePageLoadAnimations={enablePageLoadAnimations}
                  />
                }
              />
              <Route path="/teams/roster" element={<Roster />} />
              <Route path="/expansion-draft" element={<ExpansionDraft />} />
              <Route path="/expansion-draft/result" element={<DraftResult />} />
              <Route
                path="/expansion-draft/leaderboard"
                element={<Leaderboard />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/account" element={<AccountSettings />} />
              <Route path="/account/bookmarks" element={<SavedBookmarks />} />
              <Route path="/account/drafts" element={<SavedDrafts />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/google/callback"
                element={<GoogleCallback />}
              />
              <Route path="/loader" element={<Loader />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
