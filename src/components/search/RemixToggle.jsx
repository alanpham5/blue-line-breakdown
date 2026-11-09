import { useEffect } from "react";
import { useTheme } from "providers/ThemeContext";
import { isHtrActive, isHtrSeason } from "utils/htr";

export const RemixToggle = ({ team, season, profileKey }) => {
  const { setHtrOverride } = useTheme();
  const resetKey = profileKey ?? `${team}-${season}`;

  useEffect(() => () => setHtrOverride(null), [resetKey, setHtrOverride]);

  if (!isHtrSeason(season)) return null;
  const active = isHtrActive(team, season);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label="Remix logos"
      title={active ? "Remix on" : "Remix off"}
      onClick={() => setHtrOverride(!active)}
      className={`app-field flex h-14 !w-14 shrink-0 items-center justify-center p-2.5 ${
        active ? "ring-2 ring-lime-400/80 light:ring-lime-500" : ""
      }`}
    >
      <img
        src="/HTR/remix.png"
        alt=""
        className={`h-full w-full object-contain transition duration-300 ${
          active ? "" : "opacity-50 grayscale"
        }`}
      />
    </button>
  );
};
