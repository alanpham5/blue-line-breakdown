import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Players } from "./pages/Players/Players";
import { Splashscreen } from "./pages/Splashscreen/Splashscreen";
import { About } from "./pages/About/About";
import { TeamSummary } from "./pages/TeamSummary/TeamSummary";
import { Loader } from "./pages/Loader/Loader";
import { ExpansionDraft } from "./pages/ExpansionDraft/ExpansionDraft";
import { DraftResult } from "./pages/ExpansionDraft/DraftResult";
import { Leaderboard } from "./pages/ExpansionDraft/Leaderboard";
import { AccountSettings } from "./pages/Account/AccountSettings";
import { SavedBookmarks } from "./pages/Account/SavedBookmarks";
import { SavedDrafts } from "./pages/Account/SavedDrafts";
import { ThemeProvider } from "./providers/ThemeContext";
import { TooltipProvider } from "./providers/TooltipContext";
import { GaPageTrackContext } from "./providers/GaPageTrackContext";
import { AuthProvider } from "./providers/AuthContext";
import { AuthModal } from "./components/auth/AuthModal";

const App = () => {
  const enablePageLoadAnimations = true;

  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GaPageTrackContext />
            {/* Single shared auth modal, opened from anywhere via openAuth() */}
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
              <Route
                path="/players"
                element={
                  <Players
                    enablePageLoadAnimations={enablePageLoadAnimations}
                  />
                }
              />
              <Route
                path="/teams"
                element={
                  <TeamSummary
                    enablePageLoadAnimations={enablePageLoadAnimations}
                  />
                }
              />
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
              <Route path="/loader" element={<Loader />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
