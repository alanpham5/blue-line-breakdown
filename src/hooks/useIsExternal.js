import { useEffect, useState } from "react";
import { useNavigationType } from "react-router-dom";

export function useIsExternal() {
  const navType = useNavigationType();
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("appVisited") === "true";
    const isFromTutorial = sessionStorage.getItem("fromTutorial") === "true";
    const isStandalone = window.navigator.standalone === true;

    const externalBehavior = !hasVisited || isStandalone || isFromTutorial;

    setIsExternal(externalBehavior);

    sessionStorage.setItem("appVisited", "true");
    sessionStorage.removeItem("fromTutorial"); // consume once
  }, [navType]);

  return isExternal;
}
