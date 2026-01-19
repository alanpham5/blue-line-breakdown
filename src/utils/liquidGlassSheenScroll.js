let enabledCount = 0;
let rafPending = false;
let observer = null;
const visibleEls = new Set();

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isElementVisible(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom >= -40 && rect.top <= vh + 40;
}

function triggerSheenOn(el) {
  el.classList.remove("liquid-glass-sheen-animate");
  // Force reflow so the one-shot animation can restart
  void el.offsetWidth;
  el.classList.add("liquid-glass-sheen-animate");
}

function triggerSheen() {
  if (prefersReducedMotion()) return;

  // Prefer IntersectionObserver set; fall back to viewport check.
  const candidates =
    visibleEls.size > 0
      ? Array.from(visibleEls)
      : Array.from(
          document.querySelectorAll(".liquid-glass, .liquid-glass-strong")
        ).filter(isElementVisible);

  candidates.forEach(triggerSheenOn);
}

function onScroll() {
  if (rafPending) return;
  rafPending = true;
  window.requestAnimationFrame(() => {
    triggerSheen();
    rafPending = false;
  });
}

function startObserver() {
  if (observer || !("IntersectionObserver" in window)) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleEls.add(entry.target);
        else visibleEls.delete(entry.target);
      });
    },
    { root: null, rootMargin: "60px 0px 60px 0px", threshold: 0.01 }
  );

  document
    .querySelectorAll(".liquid-glass, .liquid-glass-strong")
    .forEach((el) => observer.observe(el));
}

function stopObserver() {
  if (!observer) return;
  observer.disconnect();
  observer = null;
  visibleEls.clear();
}

export function enableLiquidGlassSheenOnScroll() {
  if (typeof window === "undefined") return;

  enabledCount += 1;
  if (enabledCount !== 1) return;

  startObserver();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Kick once so it feels alive even before the first scroll.
  triggerSheen();
}

export function disableLiquidGlassSheenOnScroll() {
  if (typeof window === "undefined") return;

  enabledCount = Math.max(0, enabledCount - 1);
  if (enabledCount !== 0) return;

  window.removeEventListener("scroll", onScroll);
  stopObserver();
}
