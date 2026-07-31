import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LoadingScreen } from "components/ui/LoadingScreen";
import { subscribeToSlowRequests } from "lib/api/requestActivity";

export const SlowRequestOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname } = useLocation();
  const shouldShow = isVisible && pathname !== "/";

  useEffect(() => subscribeToSlowRequests(setIsVisible), []);

  useEffect(() => {
    if (!shouldShow) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div
      className="ice-background fixed inset-0 z-[10000] bg-[var(--bg-primary)] px-4 text-white light:text-gray-900"
      role="status"
      aria-live="polite"
      aria-label="The stats server is starting up"
    >
      <LoadingScreen immediate />
    </div>
  );
};
