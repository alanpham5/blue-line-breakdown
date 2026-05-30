import { useEffect, useState } from "react";
import { useNavigationType } from "react-router-dom";

export function useIsExternal() {
  const navType = useNavigationType();
  const [isExternal, setIsExternal] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("appVisited") === "true";
    const isStandalone = window.navigator.standalone === true;

    const externalBehavior = !hasVisited || isStandalone;

    setIsExternal(externalBehavior);

    sessionStorage.setItem("appVisited", "true");
  }, [navType]);

  return isExternal;
}
