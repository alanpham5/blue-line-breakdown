import { useEffect, useRef, useState } from "react";
import {
  isLikeReorder,
  mergeByCurrentOrder,
  LEADERBOARD_RANK_DELAY_MS,
} from "features/expansion-draft/utils/leaderboardOrder";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const useDelayedLeaderboardOrder = (
  incomingDrafts,
  delayMs = LEADERBOARD_RANK_DELAY_MS
) => {
  const [displayDrafts, setDisplayDrafts] = useState(incomingDrafts);
  const [reorderAnimationKey, setReorderAnimationKey] = useState(0);
  const displayRef = useRef(incomingDrafts);
  const pendingRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (incomingDrafts === null) {
      pendingRef.current = null;
      displayRef.current = null;
      setDisplayDrafts(null);
      return;
    }

    const currentDrafts = displayRef.current;
    if (currentDrafts === null) {
      displayRef.current = incomingDrafts;
      setDisplayDrafts(incomingDrafts);
      return;
    }

    if (
      !prefersReducedMotion() &&
      isLikeReorder(currentDrafts, incomingDrafts)
    ) {
      const mergedDrafts = mergeByCurrentOrder(currentDrafts, incomingDrafts);
      displayRef.current = mergedDrafts;
      setDisplayDrafts(mergedDrafts);
      pendingRef.current = incomingDrafts;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        const nextDrafts = pendingRef.current;
        pendingRef.current = null;
        if (!nextDrafts) return;
        displayRef.current = nextDrafts;
        setDisplayDrafts(nextDrafts);
        setReorderAnimationKey((key) => key + 1);
      }, delayMs);
      return;
    }

    pendingRef.current = null;
    displayRef.current = incomingDrafts;
    setDisplayDrafts(incomingDrafts);
  }, [incomingDrafts, delayMs]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return { drafts: displayDrafts, reorderAnimationKey };
};
