import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const GaPageTrackContext = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;

    const pagePath = `${location.pathname}${location.search}${location.hash}`;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }, [location]);

  return null;
};
