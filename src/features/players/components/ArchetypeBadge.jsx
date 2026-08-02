import { useId } from "react";
import {
  Bomb,
  Gauge,
  Hammer,
  Home,
  MoveHorizontal,
  Octagon,
  Share2,
  Siren,
  Sparkles,
} from "lucide-react";
import { GiBrickWall, GiHorseHead } from "react-icons/gi";
import { LuCircleX } from "react-icons/lu";
import { PiBoxingGlove } from "react-icons/pi";
import { TbZzz } from "react-icons/tb";
import { Tooltip } from "components/ui/Tooltip";

export const archetypeBadgeGroups = [
  {
    label: "Forwards",
    archetypes: ["Lamp Lighter", "Magician", "200-Foot Player"],
  },
  {
    label: "Defensemen",
    archetypes: ["Quarterback", "Big Shot", "Stay at Home", "Blockaholic"],
  },
  {
    label: "All Skaters",
    archetypes: ["Battering Ram", "Fisticuffs", "Racehorse"],
  },
  {
    label: "Goalies",
    archetypes: ["Big Save Machine", "Big Wall", "Dead Stop", "Workhorse"],
  },
];

const archetypeBadges = {
  "Lamp Lighter": {
    icon: Siren,
    definition:
      "A dangerous goal scorer who consistently finds ways to put the puck in the net.",
  },
  Magician: {
    icon: Sparkles,
    definition:
      "A creative offensive player who sets up teammates and generates scoring chances with skill and vision.",
  },
  "200-Foot Player": {
    icon: MoveHorizontal,
    definition:
      "A complete forward who contributes at both ends of the ice and can be trusted in any situation.",
  },
  Quarterback: {
    icon: Share2,
    definition:
      "A puck-moving defenseman who directs the offense and creates opportunities for teammates.",
  },
  "Big Shot": {
    icon: Bomb,
    definition:
      "A defenseman with a dangerous shot who can score from the blue line or jump into the attack.",
  },
  "Stay at Home": {
    icon: Home,
    definition:
      "A defense-first player who rarely takes offensive risks and focuses on protecting their own zone.",
  },
  Blockaholic: {
    icon: Octagon,
    definition:
      "A fearless defender who regularly gets in front of shots to protect the net.",
  },
  "Battering Ram": {
    icon: Hammer,
    definition:
      "A highly physical player who uses heavy hits to wear down opponents and disrupt plays.",
  },
  Fisticuffs: {
    icon: PiBoxingGlove,
    definition:
      "A willing fighter who is never afraid to drop the gloves and stand up for teammates.",
  },
  Racehorse: {
    icon: Gauge,
    definition:
      "An exceptionally fast skater who can quickly cover open ice and separate from opponents.",
  },
  "Big Save Machine": {
    icon: LuCircleX,
    definition:
      "A goalie who repeatedly makes difficult saves on the most dangerous scoring chances.",
  },
  "Big Wall": {
    icon: GiBrickWall,
    definition:
      "A large, dependable goalie who takes up plenty of the net and keeps the puck in play rather than frequently covering it.",
  },
  "Dead Stop": {
    icon: TbZzz,
    definition:
      "A goalie who regularly secures the puck, prevents rebounds, and stops play with a whistle.",
  },
  Workhorse: {
    icon: GiHorseHead,
    definition:
      "A durable goalie who handles a heavy workload and faces a large number of shots.",
  },
};

const legacyArchetypeNames = {
  Sniper: "Lamp Lighter",
  Playmaker: "Magician",
  "Power Forward": "Battering Ram",
  "Defensive Forward": "200-Foot Player",
  "Two-Way": "200-Foot Player",
  Grinder: "Fisticuffs",
  "Point Shooter": "Big Shot",
  "Offensive Puck-Mover": "Quarterback",
  "Shot Blocker": "Blockaholic",
  "Stay-at-Home": "Stay at Home",
  "Elite Starter": "Big Save Machine",
  "High-Danger Specialist": "Big Save Machine",
  "Volume Starter": "Workhorse",
  "Rebound Controller": "Dead Stop",
  Backup: "Big Wall",
};

export const getArchetypeBadge = (archetype) => {
  const name = legacyArchetypeNames[archetype] || archetype;
  const badge = archetypeBadges[name];

  return {
    name,
    icon: badge?.icon || null,
    definition: badge?.definition || "No description available.",
  };
};

export const getArchetypeNames = (archetypes = []) => [
  ...new Set(archetypes.map((archetype) => getArchetypeBadge(archetype).name)),
];

export const ArchetypeBadge = ({ archetype, forceDark = false }) => {
  const tooltipId = useId();
  const { name, icon: Icon, definition } = getArchetypeBadge(archetype);

  return (
    <Tooltip
      id={`archetype-${tooltipId}`}
      position="top"
      width="w-64 max-w-xs"
      forceDark={forceDark}
      content={
        <>
          <h2
            className={`mb-1 inline-flex items-center gap-1.5 font-semibold text-sky-300 ${forceDark ? "" : "light:text-sky-600"}`}
          >
            {Icon && <Icon size={15} className="shrink-0" />} {name}
          </h2>
          <div>{definition}</div>
        </>
      }
    >
      <button
        type="button"
        className={`inline-flex cursor-help items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-sky-200 backdrop-blur-sm transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 sm:text-sm ${forceDark ? "" : "light:bg-sky-100 light:text-sky-800 light:hover:bg-sky-200"}`}
        aria-label={`${name}: ${definition}`}
      >
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="font-medium">{name}</span>
      </button>
    </Tooltip>
  );
};
