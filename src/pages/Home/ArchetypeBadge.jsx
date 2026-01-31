import {
  Crosshair,
  Wand,
  Hammer,
  Shield,
  Dumbbell,
  ShieldCheck,
  Home,
} from "lucide-react";
import { Tooltip } from "../../components/Tooltip";

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

export const ArchetypeBadge = ({ archetype, forceDark = false }) => {
  const Icon = archetypeIcons[archetype] || null;

  return (
    <Tooltip
      id={archetype}
      position="top"
      width="w-56 max-w-xs"
      forceDark={forceDark}
      content={
        <>
          <h2
            className={`font-semibold inline-flex text-cyan-400 gap-1 mb-1 ${forceDark ? "" : "light:text-cyan-600"}`}
          >
            {Icon && <Icon size={14} className="shrink-0" />} {archetype}
          </h2>
          <div>
            {archetypeDefinitions[archetype] || "No description available."}
          </div>
        </>
      }
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 rounded-full text-xs sm:text-sm text-cyan-300 backdrop-blur-sm cursor-default ${forceDark ? "" : "light:bg-cyan-100 light:border-cyan-300/60 light:text-cyan-800"}`}
      >
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="font-medium">{archetype}</span>
      </div>
    </Tooltip>
  );
};
