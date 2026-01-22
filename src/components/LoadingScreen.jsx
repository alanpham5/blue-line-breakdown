import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  const messages = [
    "Hold on, we need to refresh the data...",
    "Turning on the lights...",
    "Zamboni resurfacing the ice...",
    "Players warming up...",
    "Coaches reviewing the game plan...",
    "Referees checking the lines...",
    "Almost ready...",
  ];

  const [loadingMessage, setLoadingMessage] = useState(messages[0]);
  const [showLoader, setShowLoader] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pulse, setPulse] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    const loaderTimeout = setTimeout(() => {
      setShowLoader(true);
      setPulse(false);

      const interval = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % messages.length;
        setLoadingMessage(messages[indexRef.current]);
      }, 10000);
      return () => clearInterval(interval);
    }, 4000);
    const tutorialTimeout = setTimeout(() => {
      setShowTutorial(true);
    }, 12000);

    return () => {
      clearTimeout(loaderTimeout);
      clearTimeout(tutorialTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center pb-10 justify-center h-screen text-white text-lg">
      <div
        className={`flex items-center mb-6 transition-opacity duration-1000 ${
          pulse ? "animate-bounce" : ""
        }`}
      >
        <img
          src="/blb-dark.png"
          alt="Logo"
          className="w-12 h-12 sm:w-16 sm:h-16"
        />
        <h1 className="text-xl sm:text-4xl font-bold text-white ml-2">
          Blue Line Breakdown
        </h1>
      </div>

      {showLoader && (
        <div className="liquid-glass-animate">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-lg sm:text-xl">{loadingMessage}</p>
        </div>
      )}
      {showTutorial && (
        <p className="mt-6 text-center text-sm sm:text-base max-w-md liquid-glass-animate">
          New here? Check out a{" "}
          <a
            href="/tutorial"
            className="text-cyan-400 hover:text-cyan-600 font-bold"
          >
            tutorial
          </a>
        </p>
      )}
    </div>
  );
};
