import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/Home";
import { About } from "./components/About";
import { Teams } from "./components/Teams";

const App = () => {
  const [enablePageLoadAnimations, setEnablePageLoadAnimations] =
    useState(true);

  useEffect(() => {
    // Enable animations on initial page load
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
