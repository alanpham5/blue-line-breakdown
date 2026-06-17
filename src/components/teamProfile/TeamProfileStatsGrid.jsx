import { Target, Shield, Flame, Activity } from "lucide-react";
import { TeamStatBar } from "../../pages/TeamSummary/TeamStatBar";

// Offense / Defense / Aggressiveness / Miscellaneous percentile cards, shared by
// the Team Summary page and the Expansion Draft result page. Driven entirely by
// the `stats` object returned from the backend (raw values + `*_pct` + ratings).
const RatingHeader = ({ icon: Icon, title, rating, accent }) => (
  <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-4 mb-5">
    <div className="flex items-center gap-2">
      <Icon className={`h-6 w-6 shrink-0 ${accent}`} />
      <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900">
        {title}
      </h3>
    </div>
    {rating != null && (
      <div className="flex flex-col items-end">
        <div
          className={`text-2xl sm:text-3xl font-extrabold tracking-[-0.04em] ${accent}`}
        >
          {rating.toFixed(1)}%
        </div>
        <div className="hidden sm:block text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.15em] text-gray-400 light:text-slate-500">
          Percentile Rating
        </div>
      </div>
    )}
  </div>
);

const Card = ({ children }) => (
  <div className="liquid-glass-strong rounded-[32px] p-4 sm:p-6 lg:p-7">
    {children}
  </div>
);

export const TeamProfileStatsGrid = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
      <Card>
        <RatingHeader
          icon={Target}
          title="Offense"
          rating={stats.offense_rating}
          accent="text-cyan-300 light:text-cyan-600"
        />
        <div className="space-y-4">
          <TeamStatBar
            label="Goal Scoring"
            rawValue={stats.goals_pg}
            percentile={stats.goals_pg_pct}
            type="offensive"
          />
          <TeamStatBar
            label="Chance Creation"
            rawValue={stats.xg_pg}
            percentile={stats.xg_pg_pct}
            type="offensive"
          />
          <TeamStatBar
            label="Dangerous Shots"
            rawValue={stats.high_danger_shots_pg}
            percentile={stats.high_danger_shots_pg_pct}
            type="offensive"
          />
          <TeamStatBar
            label="Shots on Net"
            rawValue={stats.shots_on_goal_pg}
            percentile={stats.shots_on_goal_pg_pct}
            type="offensive"
          />
          <TeamStatBar
            label="Rebound Chances"
            rawValue={stats.rebound_xg_pg}
            percentile={stats.rebound_xg_pg_pct}
            type="offensive"
          />
        </div>
      </Card>

      <Card>
        <RatingHeader
          icon={Shield}
          title="Defense"
          rating={stats.defense_rating}
          accent="text-rose-400 light:text-rose-600"
        />
        <div className="space-y-4">
          <TeamStatBar
            label="Goals Allowed"
            rawValue={stats.goals_against_pg}
            percentile={stats.goals_against_pg_pct}
            type="defensive"
          />
          <TeamStatBar
            label="Chances Allowed"
            rawValue={stats.xg_against_pg}
            percentile={stats.xg_against_pg_pct}
            type="defensive"
          />
          <TeamStatBar
            label="Dangerous Shots Allowed"
            rawValue={stats.high_danger_shots_against_pg}
            percentile={stats.high_danger_shots_against_pg_pct}
            type="defensive"
          />
          <TeamStatBar
            label="Shots Allowed"
            rawValue={stats.shots_against_pg}
            percentile={stats.shots_against_pg_pct}
            type="defensive"
          />
          <TeamStatBar
            label="Takeaways"
            rawValue={stats.takeaways_pg}
            percentile={stats.takeaways_pg_pct}
            type="defensive"
          />
        </div>
      </Card>

      <Card>
        <RatingHeader
          icon={Flame}
          title="Aggressiveness"
          rating={stats.aggressiveness_rating}
          accent="text-amber-300 light:text-amber-600"
        />
        <div className="space-y-4">
          <TeamStatBar
            label="Hits"
            rawValue={stats.hits_pg}
            percentile={stats.hits_pg_pct}
            type="aggressiveness"
          />
          <TeamStatBar
            label="Penalties Taken"
            rawValue={stats.penalties_pg}
            percentile={stats.penalties_pg_pct}
            type="aggressiveness"
          />
          <TeamStatBar
            label="Penalty Minutes"
            rawValue={stats.penalty_minutes_pg}
            percentile={stats.penalty_minutes_pg_pct}
            type="aggressiveness"
          />
          <TeamStatBar
            label="Shots Blocked"
            rawValue={stats.blocked_shots_pg}
            percentile={stats.blocked_shots_pg_pct}
            type="aggressiveness"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 shrink-0 text-sky-300 light:text-sky-600" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.04em] text-white light:text-gray-900">
              Miscellaneous
            </h3>
          </div>
        </div>
        <div className="space-y-6 mt-2">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.1em] text-gray-400 light:text-gray-500">
              Possession
            </h4>
            <TeamStatBar
              label="Puck Management"
              rawValue={stats.possession}
              percentile={stats.possession_pct}
              type="offensive"
            />
          </div>
          <div className="space-y-3">
            <h4 className="pt-2 border-t border-white/5 light:border-slate-100 text-sm font-semibold uppercase tracking-[0.1em] text-gray-400 light:text-gray-500">
              Pace
            </h4>
            <TeamStatBar
              label="Game Pace"
              rawValue={stats.pace_pg}
              percentile={stats.pace_pg_pct}
              type="pace"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
