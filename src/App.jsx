import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home/Home";
import { About } from "./pages/About/About";
import { Teams } from "./pages/Teams/Teams";

const App = () => {
  const [enablePageLoadAnimations, setEnablePageLoadAnimations] =
    useState(true);

  useEffect(() => {
    setEnablePageLoadAnimations(true);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home enablePageLoadAnimations={enablePageLoadAnimations} />}
        />
        <Route
          path="/teams"
          element={
            <Teams enablePageLoadAnimations={enablePageLoadAnimations} />
          }
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
