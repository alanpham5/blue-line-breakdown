import { useLayoutEffect, useRef } from "react";

const RANK_MOVE_MS = 500;

export const LeaderboardAnimatedList = ({
  items,
  reorderAnimationKey = 0,
  className = "",
  children,
}) => {
  const containerRef = useRef(null);
  const positionsRef = useRef(new Map());
  const prevAnimationKeyRef = useRef(reorderAnimationKey);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !items?.length) {
      positionsRef.current = new Map();
      return;
    }

    const rows = container.querySelectorAll("[data-leaderboard-row]");
    const nextPositions = new Map();
    rows.forEach((row) => {
      nextPositions.set(row.dataset.leaderboardRow, row.getBoundingClientRect());
    });

    const shouldAnimate =
      reorderAnimationKey > prevAnimationKeyRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    prevAnimationKeyRef.current = reorderAnimationKey;

    if (shouldAnimate) {
      rows.forEach((row) => {
        const id = row.dataset.leaderboardRow;
        const previousRect = positionsRef.current.get(id);
        const nextRect = nextPositions.get(id);
        if (!previousRect || !nextRect) return;

        const deltaY = previousRect.top - nextRect.top;
        if (Math.abs(deltaY) < 1) return;

        row.style.transform = `translateY(${deltaY}px)`;
        row.style.transition = "none";
        row.style.willChange = "transform";
      });

      void container.offsetHeight;

      requestAnimationFrame(() => {
        rows.forEach((row) => {
          row.style.transition = `transform ${RANK_MOVE_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`;
          row.style.transform = "";
        });
      });

      const cleanupTimer = window.setTimeout(() => {
        rows.forEach((row) => {
          row.style.transition = "";
          row.style.willChange = "";
        });
      }, RANK_MOVE_MS + 50);

      positionsRef.current = nextPositions;
      return () => window.clearTimeout(cleanupTimer);
    }

    positionsRef.current = nextPositions;
  }, [items, reorderAnimationKey]);

  if (!items?.length) return null;

  return (
    <div ref={containerRef} className={className}>
      {items.map((item, index) => children(item, index))}
    </div>
  );
};
