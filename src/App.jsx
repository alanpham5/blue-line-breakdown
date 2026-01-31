import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { About } from "./pages/About/About";
import { Teams } from "./pages/Teams/Teams";
import { Tutorial } from "./pages/Tutorial/Tutorial";
import { ThemeProvider } from "./providers/ThemeContext";
const App = () => {
  const enablePageLoadAnimations = true;

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Home enablePageLoadAnimations={enablePageLoadAnimations} />
            }
          />
          <Route
            path="/teams"
            element={
              <Teams enablePageLoadAnimations={enablePageLoadAnimations} />
            }
          />
          <Route path="/about" element={<About />} />
          <Route
            path="/tutorial"
            element={
              <Tutorial enablePageLoadAnimations={enablePageLoadAnimations} />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
