import React, { Fragment, useState } from "react";
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

const archetypeDefinitions = {
  Sniper: "Scores goals with quick, accurate shots.",
  Playmaker: "Sets up teammates with smart passes.",
  "Power Forward": "Uses strength to score and control space.",
  "Defensive Forward": "Known more for defensive play and hounding opponents.",
  "Two-Way": "Helps the team on both offense and defense.",
  Grinder:
    "High-energy player known for hard work, physical play, and toughness.",
  "Point Shooter": "Known for shooting, usually from the blue line.",
  Quarterback: "Contributes on offense with passing and decision-making.",
  "Shot Blocker": "Puts their body on the line to stop shots.",
  "Stay-at-Home": "Focuses on defense and protecting the goal area.",
};
export const ArchetypeBadge = ({ archetype }) => {
  const Icon = archetypeIcons[archetype] || null;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs sm:text-sm text-cyan-300 backdrop-blur-sm"
    >
      {Icon && <Icon size={14} className="shrink-0" />}
      {showTooltip && (
        <div className="absolute right-2 top-full mb-2 w-56 max-w-xs p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg text-xs text-gray-200 z-[9999] shadow-lg">
          {archetypeDefinitions[archetype] || "No description available."}
        </div>
      )}
      <span className="font-medium">{archetype}</span>
    </div>
  );
};
