import React from "react";
import {
  Target,
  Shield,
  Hammer,
  Crosshair,
  Dumbbell,
  Wand,
  ShieldCheck,
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
  "Shot Blocker": Shield,
};

export const ArchetypeBadge = ({ archetype }) => {
  const Icon = archetypeIcons[archetype] || Target;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs sm:text-sm text-cyan-300 backdrop-blur-sm">
      <Icon size={14} className="shrink-0" />
      <span className="font-medium">{archetype}</span>
    </div>
  );
};
