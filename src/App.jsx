import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Players } from "./pages/Players/Players";
import { Splashscreen } from "./pages/Splashscreen/Splashscreen";
import { About } from "./pages/About/About";
import { TeamSummary } from "./pages/TeamSummary/TeamSummary";
import { Loader } from "./pages/Loader/Loader";
import { ThemeProvider } from "./providers/ThemeContext";
import { TooltipProvider } from "./providers/TooltipContext";
import { GaPageTrackContext } from "./providers/GaPageTrackContext";

const App = () => {
  const enablePageLoadAnimations = true;

  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <GaPageTrackContext />
          <Routes>
            <Route
              path="/"
              element={
                <Splashscreen enablePageLoadAnimations={enablePageLoadAnimations} />
              }
            />
            <Route
              path="/players"
              element={
                <Players enablePageLoadAnimations={enablePageLoadAnimations} />
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
            <Route path="/about" element={<About />} />
            <Route path="/loader" element={<Loader />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
