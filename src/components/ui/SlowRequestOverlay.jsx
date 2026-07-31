import { useEffect, useState } from "react";
import { LoadingScreen } from "components/ui/LoadingScreen";
import { subscribeToSlowRequests } from "lib/api/requestActivity";

export const SlowRequestOverlay = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => subscribeToSlowRequests(setIsVisible), []);

  useEffect(() => {
    if (!isVisible) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  if (!isVisible) return null;

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
