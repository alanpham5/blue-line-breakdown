import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Heart, Trophy, Loader2, ListOrdered } from "lucide-react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { AppSelect } from "../../components/AppSelect";
import { playerUtils } from "../../utils/playerUtils";
import { useAuth } from "../../providers/AuthContext";
import { subscribeLeaderboard, toggleLike } from "../../firebase/firestore";
import { DRAFT_SEASONS, seasonLabel, seasonSpan } from "./draftShared";

// Community leaderboard — top 50 expansion drafts by likes, optionally filtered
// by season. Streams live from Firestore via onSnapshot.
export const Leaderboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, openAuth, isConfigured } = useAuth();

  const initialSeason = searchParams.get("season") || "ALL";
  const [season, setSeason] = useState(initialSeason);
  const [drafts, setDrafts] = useState(null);

  useEffect(() => {
    if (!isConfigured) {
      setDrafts([]);
      return;
    }
    setDrafts(null);
    const unsub = subscribeLeaderboard(season, setDrafts);
    return unsub;
  }, [season, isConfigured]);

  const onSeasonChange = (value) => {
    setSeason(value);
    if (value === "ALL") {
      searchParams.delete("season");
    } else {
      searchParams.set("season", value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleLike = async (draft) => {
    if (!user) {
      openAuth("signin");
      return;
    }
    const liked = (draft.likedBy || []).includes(user.uid);
    try {
      await toggleLike(draft.id, user.uid, liked);
    } catch {
      // snapshot remains the source of truth
    }
  };

  const openDraft = (d) => {
    navigate("/expansion-draft/result", {
      state: {
        viewOnly: true,
        leaderboardId: d.id,
        draft: {
          season: d.season,
          teamName: d.teamName,
          profile: d.profile,
          picks: d.picks,
          ownerId: d.ownerId,
          ownerName: d.ownerName,
          leaderboardId: d.id,
        },
      },
    });
  };

  return (
    <div className="ice-background min-h-screen px-4 pb-16 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="liquid-glass-strong rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sky-300 light:text-sky-600">
            <ListOrdered className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Community Leaderboard
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
            Top expansion franchises
          </h1>

          <div className="mt-5 max-w-xs">
            <AppSelect
              placeholder="Filter by season"
              value={season}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="app-field px-4 py-3 pr-10 text-base text-white light:text-gray-900"
            >
              <option value="ALL">All Seasons</option>
              {DRAFT_SEASONS.map((s) => (
                <option key={s} value={String(s)}>
                  {seasonLabel(s)}
                </option>
              ))}
            </AppSelect>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {drafts === null ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : drafts.length === 0 ? (
            <div className="liquid-glass rounded-[24px] p-10 text-center text-gray-400">
              <Trophy className="mx-auto mb-3 h-10 w-10 opacity-40" />
              No franchises posted yet. Be the first —{" "}
              <Link
                to="/expansion-draft"
                className="font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
              >
                run a draft
              </Link>
              .
            </div>
          ) : (
            drafts.map((draft, idx) => {
              const liked = user && (draft.likedBy || []).includes(user.uid);
              const stats = draft.profile?.stats || {};
              return (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => openDraft(draft)}
                  className="liquid-glass flex w-full items-center gap-4 rounded-[22px] p-4 text-left transition-colors hover:bg-white/5 light:hover:bg-slate-900/5"
                >
                  <span className="w-7 shrink-0 text-center text-lg font-bold text-gray-500">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-white light:text-gray-900">
                      {draft.teamName}
                    </p>
                    <p className="truncate text-xs text-gray-400 light:text-gray-500">
                      {seasonSpan(draft.season)} · by {draft.ownerName}
                    </p>
                    {draft.profile?.predictedRecord?.display && (
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs font-semibold">
                        <span className="text-sky-300 light:text-sky-600">
                          {draft.profile.predictedRecord.display} predicted
                        </span>
                        {stats.offense_rating != null && (
                          <span className="text-cyan-300 light:text-cyan-600">
                            {stats.offense_rating.toFixed(0)}% OFF
                          </span>
                        )}
                        {stats.defense_rating != null && (
                          <span className="text-rose-400 light:text-rose-600">
                            {stats.defense_rating.toFixed(0)}% DEF
                          </span>
                        )}
                        {stats.aggressiveness_rating != null && (
                          <span className="text-amber-300 light:text-amber-600">
                            {stats.aggressiveness_rating.toFixed(0)}% AGG
                          </span>
                        )}
                      </p>
                    )}
                    {/* mini roster preview */}
                    <div className="mt-2 flex -space-x-2">
                      {(draft.picks || []).slice(0, 8).map((p) => (
                        <img
                          key={`${p.team}-${p.playerId}`}
                          src={playerUtils.getPlayerHeadshot(
                            p.playerId,
                            p.team,
                            draft.season
                          )}
                          alt={p.name}
                          title={`${p.position} - ${p.name}`}
                          className="h-7 w-7 rounded-full border-2 border-[#0b1220] object-cover light:border-white bg-[var(--team-color)]"
                          style={{
                            "--team-color": playerUtils.getTeamColor(
                              p.team,
                              draft.season
                            ),
                          }}
                          onError={(e) =>
                            (e.target.src = playerUtils.getDefaultHeadshot())
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(draft);
                    }}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold transition-colors ${
                      liked
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-white/10 text-gray-300 hover:bg-white/20 light:bg-slate-900/10 light:text-slate-600"
                    }`}
                    aria-pressed={liked}
                  >
                    <Heart
                      className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                    />
                    {draft.likes || 0}
                  </button>
                </button>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};
