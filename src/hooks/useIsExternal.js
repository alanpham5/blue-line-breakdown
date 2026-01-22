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
    const isStandalone = window.navigator.standalone === true;
    const isFromTutorial = document.referrer.includes("/tutorial");

    const externalBehavior =
      !(spaNavigation || sameHostReload) ||
      !hasVisited ||
      isStandalone ||
      isFromTutorial;

    setIsExternal(externalBehavior);

    sessionStorage.setItem("appVisited", "true");
  }, [navType]);

  return isExternal;
}
