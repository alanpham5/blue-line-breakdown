import { useEffect, useState } from "react";

// True when the viewport is mobile-sized. Responsive — backed by matchMedia so
// it updates on resize/rotation and in browser dev tools, rather than sniffing
// the user agent. Defaults to Tailwind's `md` breakpoint (768px).
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
