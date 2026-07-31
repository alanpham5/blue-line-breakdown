import { useState, useEffect, useRef } from "react";
import { LoadingWheel } from "components/ui/LoadingWheel";
import { useTheme } from "providers/ThemeContext";

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

export const LoadingScreen = ({
  onZamboniCircleComplete,
  immediate = false,
}) => {
  const [loadingMessage, setLoadingMessage] = useState(messages[0]);
  const [showLoader, setShowLoader] = useState(immediate);
  const [pulse, setPulse] = useState(!immediate);
  const indexRef = useRef(0);
  const { actualTheme } = useTheme();
  useEffect(() => {
    let interval;
    const startMessageRotation = () => {
      setShowLoader(true);
      setPulse(false);
      interval = setInterval(() => {
        indexRef.current = (indexRef.current + 1) % messages.length;
        setLoadingMessage(messages[indexRef.current]);
      }, 10000);
    };
    const loaderTimeout = immediate
      ? null
      : setTimeout(startMessageRotation, 4000);
    if (immediate) startMessageRotation();

    return () => {
      if (loaderTimeout) clearTimeout(loaderTimeout);
      if (interval) clearInterval(interval);
    };
  }, [immediate]);
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
