import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Target,
  Shield,
  Hammer,
  Crosshair,
  Dumbbell,
  Wand,
  ShieldCheck,
  Home,
} from "lucide-react";

const archetypeIcons = {
  Sniper: Crosshair,
  Playmaker: Wand,
  "Power Forward": Hammer,
  "Defensive Forward": Shield,
  "Two-Way": ShieldCheck,
  Grinder: Dumbbell,
  "Point Shooter": Crosshair,
  "Offensive Puck-Mover": Wand,
  Quarterback: Wand,
  "Shot Blocker": Shield,
  "Stay-at-Home": Home,
};

export const ArchetypeBadge = ({ archetype }) => {
  const Icon = archetypeIcons[archetype] || null;
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (showTooltip && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setPosition({
        left: rect.left + rect.width / 2,
        top: rect.top,
      });
    }
  }, [showTooltip]);

  return (
    <>
      <div
        ref={badgeRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs sm:text-sm text-cyan-300 backdrop-blur-sm"
      >
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="font-medium">{archetype}</span>
      </div>
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[10000] transform -translate-x-1/2 -translate-y-full w-56 max-w-xs p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 shadow-lg pointer-events-none"
            style={{ left: position.left + "px", top: position.top + "px" }}
          >
            <h2 className="font-semibold inline-flex text-cyan-400 gap-1 mb-1">
              {Icon && <Icon size={14} className="shrink-0" />} {archetype}
            </h2>
            <div>
              {archetypeDefinitions[archetype] || "No description available."}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
