import { useEffect, useState } from "react";
import { useNavigationType } from "react-router-dom";

export function useIsExternal() {
  const navType = useNavigationType();
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("appVisited") === "true";

    const spaNavigation = navType === "PUSH" || navType === "REPLACE";

    const sameHostReload =
      navType === "POP" &&
      document.referrer &&
      new URL(document.referrer).host === window.location.host;

    const firstVisit = !hasVisited;

    setIsExternal(!(spaNavigation || sameHostReload) || firstVisit);

    sessionStorage.setItem("appVisited", "true");
  }, [navType]);

  return isExternal;
}
