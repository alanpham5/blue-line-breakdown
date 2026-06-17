import { useState, useEffect, useRef } from "react";
import { LoadingWheel } from "components/ui/LoadingWheel";
import { useTheme } from "providers/ThemeContext";
export const LoadingScreen = ({ onZamboniCircleComplete }) => {
  const messages = [
    "Hold on, we need to refresh the data...",
    "Turning on the lights...",
    "Zamboni resurfacing the ice...",
    "Players putting on their gear...",
    "Players warming up...",
    "Coaches reviewing the game plan...",
    "Referees checking the lines...",
    "Almost ready...",
  ];
  const [loadingMessage, setLoadingMessage] = useState(messages[0]);
  const [showLoader, setShowLoader] = useState(false);
  const [pulse, setPulse] = useState(true);
  const indexRef = useRef(0);
  const { actualTheme } = useTheme();
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
    return () => {
      clearTimeout(loaderTimeout);
    };
  }, []);
  return (
    <div className="flex flex-col items-center pb-10 justify-center h-screen text-white light:text-gray-900 text-lg">
      <div
        className={`flex items-center mb-2 transition-opacity duration-1000 ${pulse ? "animate-bounce" : ""}`}
      >
        <img
          src="/blb-dark.png"
          alt="Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 block light:hidden"
        />
        <img
          src="/blb-light.png"
          alt="Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 hidden light:block"
        />
        <h1 className="text-xl sm:text-4xl font-bold text-white light:text-gray-900 ml-2">
          Blue Line Breakdown
        </h1>
      </div>

      {showLoader && (
        <div className="liquid-glass-animate">
          <div className="flex items-center justify-center">
            <LoadingWheel
              size={80}
              actualTheme={actualTheme}
              onCircleComplete={onZamboniCircleComplete}
            />
          </div>
          <p className="text-lg sm:text-xl text-white light:text-gray-900">
            {loadingMessage}
          </p>
        </div>
      )}
    </div>
  );
};
