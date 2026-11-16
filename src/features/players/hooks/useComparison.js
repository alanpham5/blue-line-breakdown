import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiService } from "lib/api/apiService";

const COMPARE_PARAM = "compare";
const POSITION_MISMATCH_ERROR =
  "Compare two skaters or two goalies so the metrics stay meaningful.";

const parseSlot = (token) => {
  const match = /^(\d+)-(\d{4})$/.exec((token || "").trim());
  return match ? { playerId: match[1], season: Number(match[2]) } : null;
};

const parseCompareParam = (value) => {
  if (value == null) return [null, null];
  const [first, second] = value.split(/[_,]/);
  return [parseSlot(first), parseSlot(second)];
};

const serializeSlots = (slots) => {
  if (!slots.some(Boolean)) return "1";
  return slots
    .map((slot) => (slot ? `${slot.playerId}-${slot.season}` : ""))
    .join("_")
    .replace(/_$/, "");
};

const slotKey = (slot) => `${slot.playerId}-${slot.season}`;

const isSameSlot = (first, second) =>
  Boolean(first && second) && slotKey(first) === slotKey(second);

const isGoalieProfile = (profile) => profile?.player?.position === "G";

const withoutKey = (record, key) =>
  Object.fromEntries(Object.entries(record).filter(([entry]) => entry !== key));

const descendingSeasons = (seasons) =>
  [...new Set((seasons || []).map(Number).filter(Number.isFinite))].sort(
    (a, b) => b - a
  );

export const useComparison = ({ searchParams, setSearchParams }) => {
  const compareParam = searchParams.get(COMPARE_PARAM);
  const enabled = compareParam != null;
  const slots = useMemo(() => parseCompareParam(compareParam), [compareParam]);
  const [profiles, setProfiles] = useState({});
  const [error, setError] = useState("");
  const lastChangedIndexRef = useRef(1);

  const writeSlots = useCallback(
    (buildSlots, options = { replace: false }) => {
      setSearchParams((previous) => {
        const params = new URLSearchParams(previous);
        const nextSlots = buildSlots(
          parseCompareParam(params.get(COMPARE_PARAM))
        );
        params.set(COMPARE_PARAM, serializeSlots(nextSlots));
        return params;
      }, options);
    },
    [setSearchParams]
  );

  const dropSlots = useCallback(
    (shouldDrop) =>
      writeSlots(
        (current) =>
          current.map((slot, index) =>
            slot && shouldDrop(slot, index) ? null : slot
          ),
        { replace: true }
      ),
    [writeSlots]
  );

  useEffect(() => {
    slots.forEach((slot) => {
      if (!slot) return;
      const key = slotKey(slot);
      if (profiles[key]) return;
      setProfiles((current) => ({ ...current, [key]: { status: "loading" } }));
      apiService
        .fetchPlayerProfileV2(slot.playerId, slot.season)
        .then((data) =>
          setProfiles((current) => ({
            ...current,
            [key]: { status: "ready", data },
          }))
        )
        .catch((requestError) => {
          setError(requestError.message);
          if (requestError.status === 404) {
            setProfiles((current) => withoutKey(current, key));
            dropSlots((candidate) => slotKey(candidate) === key);
            return;
          }
          setProfiles((current) => ({ ...current, [key]: { status: "error" } }));
        });
    });
  }, [slots, profiles, dropSlots]);

  const entries = useMemo(
    () =>
      slots.map((slot) => {
        if (!slot) return null;
        const profile = profiles[slotKey(slot)];
        if (profile?.status === "ready") return { ...slot, data: profile.data };
        if (profile?.status === "error") return { ...slot, failed: true };
        return { ...slot, loading: true };
      }),
    [slots, profiles]
  );

  useEffect(() => {
    const [left, right] = entries;
    if (!left?.data || !right?.data) return;
    if (isGoalieProfile(left.data) === isGoalieProfile(right.data)) return;
    setError(POSITION_MISMATCH_ERROR);
    dropSlots((_, index) => index === lastChangedIndexRef.current);
  }, [entries, dropSlots]);

  const addPlayer = (result) => {
    const targetIndex = slots[0] ? 1 : 0;
    const otherSlot = slots[1 - targetIndex];
    const seasons = descendingSeasons(result.seasons);
    const preferredSeason = Number(result.latestSeason ?? seasons[0]);
    const clashes = (season) =>
      isSameSlot(otherSlot, { playerId: String(result.playerId), season });
    const season = clashes(preferredSeason)
      ? seasons.find((candidate) => !clashes(candidate))
      : preferredSeason;

    if (!Number.isFinite(season)) {
      setError(`No other seasons are available for ${result.name}.`);
      return;
    }
    setError("");
    lastChangedIndexRef.current = targetIndex;
    writeSlots((current) =>
      current.map((slot, index) =>
        index === targetIndex
          ? { playerId: String(result.playerId), season }
          : slot
      )
    );
  };

  const changeSeason = (index, season) => {
    const slot = slots[index];
    if (!slot) return;
    const nextSlot = { ...slot, season: Number(season) };
    setError("");
    lastChangedIndexRef.current = index;
    if (isSameSlot(slots[1 - index], nextSlot)) {
      writeSlots((current) => [current[1], current[0]]);
      return;
    }
    writeSlots((current) =>
      current.map((existing, slotIndex) =>
        slotIndex === index ? nextSlot : existing
      )
    );
  };

  const remove = (index) => {
    setError("");
    writeSlots((current) =>
      current.map((slot, slotIndex) => (slotIndex === index ? null : slot))
    );
  };

  const swap = () => writeSlots((current) => [current[1], current[0]]);

  const reset = () => {
    setError("");
    writeSlots(() => [null, null]);
  };

  const enable = (seedSlot = null) => {
    setError("");
    writeSlots(() => [seedSlot, null]);
  };

  const disable = () => {
    setError("");
    setSearchParams((previous) => {
      const params = new URLSearchParams(previous);
      params.delete(COMPARE_PARAM);
      return params;
    });
  };

  return {
    enabled,
    entries,
    error,
    addPlayer,
    changeSeason,
    remove,
    swap,
    reset,
    enable,
    disable,
  };
};
