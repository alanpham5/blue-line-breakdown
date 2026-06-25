import {
  Crosshair,
  Wand,
  Hammer,
  Shield,
  Dumbbell,
  ShieldCheck,
  Home,
  Crown,
  Zap,
  Flame,
  Layers,
  Activity,
} from "lucide-react";
import { Tooltip } from "components/ui/Tooltip";
export const archetypeIcons = {
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
  "Elite Starter": Crown,
  Workhorse: Zap,
  "High-Danger Specialist": Flame,
  "Volume Starter": Layers,
  "Rebound Controller": Activity,
  Backup: ShieldCheck,
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
  "Elite Starter":
    "Top-tier goalie with elite save percentage and high goals saved above expected.",
  Workhorse:
    "Starts a high volume of games and faces a heavy workload of shots.",
  "High-Danger Specialist":
    "Excels at stopping high-difficulty, high-danger scoring chances.",
  "Volume Starter":
    "Plays a large portion of games and maintains solid efficiency under heavy volume.",
  "Rebound Controller":
    "Excellent at freezing the puck and preventing second-chance opportunities.",
  Backup: "Plays a supporting role with limited game appearances.",
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
            className={`mb-1 inline-flex gap-1 font-semibold text-sky-300 ${forceDark ? "" : "light:text-sky-600"}`}
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
        className={`inline-flex cursor-default items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-sky-200 backdrop-blur-sm sm:text-sm ${forceDark ? "" : "light:bg-sky-100 light:text-sky-800"}`}
      >
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="font-medium">{archetype}</span>
      </div>
    </Tooltip>
  );
};
