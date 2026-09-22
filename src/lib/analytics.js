export const SITE_NAME = "Blue Line Breakdown";

export const buildPageTitle = (pageTitle) =>
  pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME;

export const trackEvent = (eventName, params = {}) => {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, {
    ...params,
    debug_mode: process.env.NODE_ENV !== "production",
  });
};

export const trackPageView = (pageTitle) => {
  if (typeof window === "undefined") return;
  trackEvent("page_view", {
    page_title: pageTitle || document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  });
};
