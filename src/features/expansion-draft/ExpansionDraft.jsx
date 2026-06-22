import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { AppSelect } from "components/ui/AppSelect";
import { apiService } from "lib/api/apiService";
import { playerUtils } from "utils/playerUtils";
import { useTheme } from "providers/ThemeContext";
import { useIsMobile } from "hooks/useIsMobile";
import { useAuth } from "providers/AuthContext";
import { checkTeamNameProfanity } from "utils/profanity";
import {
  saveDraftProgress,
  deleteDraftProgress,
  saveCompletedDraft,
  deleteUserDraft,
  DRAFT_STATUS,
} from "lib/firebase/firestore";
import {
  DRAFT_SEASONS,
  seasonLabel,
  seasonSpan,
  DRAFT_STORAGE_KEY,
} from "features/expansion-draft/utils/draftShared";
import { SaveDraftButton } from "features/expansion-draft/components/SaveDraftButton";
import { DraftLeaderboardPreview } from "features/expansion-draft/components/DraftLeaderboardPreview";
import { ConfirmDialog } from "components/ui/ConfirmDialog";
import { TeamCard } from "features/expansion-draft/components/TeamCard";
import { RosterTable } from "features/expansion-draft/components/DraftRosterTables";
import {
  ConfirmModal,
  NameModal,
} from "features/expansion-draft/components/DraftModals";
export const ExpansionDraft = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { actualTheme } = useTheme();
  const isMobile = useIsMobile();
  const { user, drafts, openAuth } = useAuth();
  const [season, setSeason] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState("");
  const [rosters, setRosters] = useState({});
  const [activeTeam, setActiveTeam] = useState(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [picks, setPicks] = useState({});
  const [confirm, setConfirm] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSaveNameModal, setShowSaveNameModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [savedTeamName, setSavedTeamName] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [savedProgressHash, setSavedProgressHash] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [pendingResume, setPendingResume] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const teamsSectionRef = useRef(null);
  const rosterSectionRef = useRef(null);
  const inProgressDrafts = useMemo(
    () =>
      drafts.filter(
        (d) => d.status === DRAFT_STATUS.IN_PROGRESS && (d.pickCount || 0) > 0
      ),
    [drafts]
  );
  const activeRoster = activeTeam ? rosters[activeTeam] : null;
  useEffect(() => {
    if (teams.length > 0) {
      const timer = setTimeout(() => {
        teamsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [teams]);
  useEffect(() => {
    if (activeTeam && activeRoster && !rosterLoading) {
      const timer = setTimeout(() => {
        rosterSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTeam, activeRoster, rosterLoading]);
  useEffect(() => {
    if (activeTeam && carouselRef.current) {
      const activeEl = document.getElementById(`team-card-${activeTeam}`);
      const container = carouselRef.current;
      if (activeEl && container) {
        const activeOffsetLeft = activeEl.offsetLeft;
        const activeWidth = activeEl.clientWidth;
        const containerWidth = container.clientWidth;
        container.scrollTo({
          left: activeOffsetLeft - containerWidth / 2 + activeWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeTeam]);
  const carouselRef = useRef(null);
  const scrollCarousel = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollLeft += dir * el.clientWidth * 0.85;
  };
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(picks).length > 0) {
        e.preventDefault();
        e.returnValue =
          "You have an expansion draft in progress. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [picks]);
  useEffect(() => {
    if (!season) return;
    let cancelled = false;
    setTeamsLoading(true);
    setTeamsError("");
    setTeams([]);
    setRosters({});
    setPicks({});
    setActiveTeam(null);
    apiService
      .fetchDraftTeams(season)
      .then((data) => {
        if (cancelled) return;
        setTeams(data.teams || []);
      })
      .catch((err) => !cancelled && setTeamsError(err.message))
      .finally(() => !cancelled && setTeamsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [season]);
  const resumeDraft = (saved) => {
    const resumedName = saved.teamName || "";
    setTeamName(resumedName);
    setSavedTeamName(resumedName);
    setPendingResume({
      season: String(saved.season),
      picks: saved.picks || {},
    });
    setSeason(String(saved.season));
  };
  const handleDeleteSaved = (d) => setConfirmDelete(d);
  const confirmDeleteSaved = async () => {
    const d = confirmDelete;
    setConfirmDelete(null);
    if (!d || !user) return;
    await deleteUserDraft(user.uid, d.id).catch(() => {});
  };
  useEffect(() => {
    if (!pendingResume) return;
    if (String(pendingResume.season) !== String(season)) return;
    if (teams.length === 0) return;
    setPicks(pendingResume.picks);
    setSavedProgressHash(
      JSON.stringify({
        season: String(pendingResume.season),
        teamName: String(teamName || "").trim(),
        picks: pendingResume.picks || {},
      })
    );
    setPendingResume(null);
  }, [pendingResume, season, teams, teamName]);
  useEffect(() => {
    const resume = location.state?.resume;
    if (resume) {
      resumeDraft(resume);
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.key]);
  const loadRoster = async (team) => {
    setActiveTeam(team);
    if (rosters[team]) return;
    setRosterLoading(true);
    try {
      const data = await apiService.fetchDraftRoster(season, team);
      setRosters((prev) => ({
        ...prev,
        [team]: data,
      }));
    } catch (err) {
      setRosters((prev) => ({
        ...prev,
        [team]: {
          error: err.message,
        },
      }));
    } finally {
      setRosterLoading(false);
    }
  };
  const confirmPick = () => {
    if (!confirm) return;
    setPicks((prev) => ({
      ...prev,
      [confirm.team]: confirm.player,
    }));
    setConfirm(null);
    const remaining = teams.find(
      (t) => !picks[t.team] && t.team !== confirm.team
    );
    if (remaining) setActiveTeam(remaining.team);
  };
  const draftedCount = Object.keys(picks).length;
  const progressHash = JSON.stringify({
    season: String(season || ""),
    teamName: String(teamName || "").trim(),
    picks,
  });
  const progressSaved = draftedCount > 0 && progressHash === savedProgressHash;
  const handleSaveProgressClick = () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (!season || draftedCount === 0) return;
    setSaveError("");
    if (savedProgressHash) {
      confirmSaveProgress(true);
      return;
    }
    setShowSaveNameModal(true);
  };
  const confirmSaveProgress = async (allowFallbackName = false) => {
    const name =
      teamName.trim() || (allowFallbackName ? savedTeamName.trim() : "");
    if (!name) {
      setSaveState("error");
      setSaveError("Please enter a franchise name.");
      return;
    }
    setSaveState("saving");
    setSaveError("");
    const nameResult = await checkTeamNameProfanity(name);
    if (!nameResult.ok) {
      setSaveState("error");
      setSaveError(nameResult.error || "Couldn't verify franchise name.");
      return;
    }
    if (nameResult.profane) {
      setSaveState("error");
      setSaveError("Please choose a different franchise name.");
      return;
    }
    try {
      await saveDraftProgress(user.uid, {
        season,
        picks,
        teamName: name,
      });
      setSavedProgressHash(
        JSON.stringify({
          season: String(season || ""),
          teamName: name,
          picks,
        })
      );
      setSavedTeamName(name);
      setTeamName(name);
      setShowSaveNameModal(false);
      setSaveState("idle");
    } catch (err) {
      console.error("saveDraftProgress failed:", err);
      setSaveState("error");
      setSaveError(
        err?.code === "permission-denied"
          ? "Permission denied — deploy Firestore rules (see SETUP.md)."
          : err?.message || "Couldn't save. Please try again."
      );
    }
  };
  const draftedPicksList = useMemo(() => Object.values(picks), [picks]);
  const forwardCount = useMemo(
    () => draftedPicksList.filter((p) => p?.position === "F").length,
    [draftedPicksList]
  );
  const defensemanCount = useMemo(
    () => draftedPicksList.filter((p) => p?.position === "D").length,
    [draftedPicksList]
  );
  const goalieCount = useMemo(
    () => draftedPicksList.filter((p) => p?.position === "G").length,
    [draftedPicksList]
  );
  const satisfiesPositionalRequirements =
    forwardCount >= 12 && defensemanCount >= 6 && goalieCount >= 2;
  const isComplete =
    teams.length > 0 &&
    draftedCount === teams.length &&
    satisfiesPositionalRequirements;
  const completeDraft = async () => {
    const pickList = teams.map((t) => ({
      ...picks[t.team],
      team: t.team,
    }));
    const name = teamName.trim() || "Expansion Club";
    setAnalyzeError("");
    const nameResult = await checkTeamNameProfanity(name);
    if (!nameResult.ok) {
      setAnalyzeError(nameResult.error || "Couldn't verify franchise name.");
      return;
    }
    if (nameResult.profane) {
      setAnalyzeError("Please choose a different franchise name.");
      return;
    }
    setAnalyzing(true);
    try {
      const profile = await apiService.analyzeDraft({
        season,
        teamName: name,
        picks: pickList,
      });
      const draft = {
        season,
        teamName: name,
        profile,
      };
      if (user) {
        try {
          draft.savedDraftId = await saveCompletedDraft(user.uid, draft);
          await deleteDraftProgress(user.uid, season);
        } catch {}
      }
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      navigate("/expansion-draft/result", {
        state: {
          draft,
        },
      });
    } catch (err) {
      setAnalyzeError(err.message || "Couldn't analyze your draft.");
    } finally {
      setAnalyzing(false);
    }
  };
  return (
    <div className="min-h-screen ice-background px-4 pb-28 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="liquid-glass-strong liquid-glass-animate rounded-[32px] p-6 sm:p-8">
          <h1 className="mt-2 text-3xl font-bold tracking-display text-white light:text-gray-900 sm:text-4xl flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <span className="flex-1 min-w-[280px] flex items-center gap-3">
              Build your expansion franchise
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold self-center"
                style={{
                  background: "var(--btn-accent)",
                  color: "var(--btn-accent-text)",
                }}
              >
                Beta
              </span>
            </span>
            <div className="w-full sm:w-[440px] shrink-0 font-normal text-base tracking-normal">
              <AppSelect
                placeholder="Select a season…"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="app-field px-4 py-3.5 pr-10 text-base text-white light:text-gray-900 flex items-center"
              >
                {DRAFT_SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {seasonLabel(s)}
                  </option>
                ))}
              </AppSelect>
            </div>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-gray-400 light:text-gray-500 sm:text-base">
            Pick a season, and every franchise protects its core under real NHL
            rules (7-3-1 or 8-1). Claim one unprotected player from each club to
            assemble your roster.
          </p>
        </div>

        {teams.length === 0 && !teamsLoading && (
          <div className="mt-6">
            <DraftLeaderboardPreview
              title="Community Drafts"
              limit={5}
              hideCta
            />
          </div>
        )}

        {inProgressDrafts.length > 0 && (
          <div className="mt-6 liquid-glass rounded-[28px] p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-white light:text-gray-900">
              <PlayCircle className="h-4 w-4 text-sky-300 light:text-sky-600" />
              Resume an in-progress draft
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {inProgressDrafts.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-white/10 light:border-slate-200 light:bg-white/60"
                >
                  <button
                    type="button"
                    onClick={() => resumeDraft(d)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-300 light:text-sky-600">
                      <PlayCircle className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-white light:text-gray-900">
                        {d.teamName || "Untitled franchise"}
                      </span>
                      <span className="block truncate text-xs text-gray-400 light:text-gray-500">
                        {seasonSpan(d.season)} · {d.pickCount} picked
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(d)}
                    className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400 light:text-gray-500"
                    aria-label="Delete saved draft"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {teamsLoading && (
          <div className="app-modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 backdrop-blur-sm light:bg-black/30">
            <div className="app-modal-panel liquid-glass-strong rounded-[30px] p-8 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-sky-300 light:text-sky-600" />
              <p className="text-lg font-medium text-white light:text-gray-900">
                Loading franchises…
              </p>
            </div>
          </div>
        )}
        {teamsError && (
          <div className="mt-6 rounded-[24px] bg-rose-500/10 p-6 text-center text-rose-400">
            {teamsError}
          </div>
        )}

        {teams.length > 0 && (
          <>
            <div
              ref={teamsSectionRef}
              className="liquid-glass-animate scroll-mt-20"
            >
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold tracking-display text-white light:text-gray-900">
                  Franchises
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    {draftedCount}/{teams.length} drafted
                  </span>
                </h2>
                {draftedCount > 0 && (
                  <div className="w-full shrink-0 sm:w-56">
                    <SaveDraftButton
                      mode="progress"
                      user={user}
                      saved={progressSaved}
                      saveState={saveState}
                      saveError={saveError}
                      onSave={handleSaveProgressClick}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-500"
                  style={{
                    width: `${(draftedCount / teams.length) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 light:border-slate-200 light:bg-white/60">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[0.7rem] font-bold text-gray-400 light:text-gray-500">
                    Forwards
                  </span>
                  <span
                    className={`mt-1 text-lg sm:text-2xl font-black tabular-nums ${forwardCount >= 12 ? "text-emerald-400 light:text-emerald-600" : "text-cyan-300 light:text-cyan-600"}`}
                  >
                    {forwardCount} / 12
                  </span>
                  <span className="mt-0.5 text-[0.65rem] text-gray-500 light:text-gray-400">
                    {forwardCount >= 12 ? "✓ Met" : "Min. 12"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center border-x border-white/10 light:border-slate-200">
                  <span className="text-[0.7rem] font-bold text-gray-400 light:text-gray-500">
                    Defensemen
                  </span>
                  <span
                    className={`mt-1 text-lg sm:text-2xl font-black tabular-nums ${defensemanCount >= 6 ? "text-emerald-400 light:text-emerald-600" : "text-cyan-300 light:text-cyan-600"}`}
                  >
                    {defensemanCount} / 6
                  </span>
                  <span className="mt-0.5 text-[0.65rem] text-gray-500 light:text-gray-400">
                    {defensemanCount >= 6 ? "✓ Met" : "Min. 6"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[0.7rem] font-bold text-gray-400 light:text-gray-500">
                    Goalies
                  </span>
                  <span
                    className={`mt-1 text-lg sm:text-2xl font-black tabular-nums ${goalieCount >= 2 ? "text-emerald-400 light:text-emerald-600" : "text-cyan-300 light:text-cyan-600"}`}
                  >
                    {goalieCount} / 2
                  </span>
                  <span className="mt-0.5 text-[0.65rem] text-gray-500 light:text-gray-400">
                    {goalieCount >= 2 ? "✓ Met" : "Min. 2"}
                  </span>
                </div>
              </div>

              {draftedCount === teams.length &&
                !satisfiesPositionalRequirements && (
                  <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-xs font-semibold text-rose-400">
                    ⚠️ Draft incomplete: you must select at least 12 forwards, 6
                    defensemen, and 2 goalies.
                  </div>
                )}

              <div className="group/carousel relative mt-5 overflow-visible">
                <button
                  type="button"
                  aria-label="Scroll franchises left"
                  onClick={() => scrollCarousel(-1)}
                  className="absolute left-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 p-2 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 light:border-slate-300 light:bg-white/85 light:text-slate-900 light:hover:bg-white sm:flex"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll franchises right"
                  onClick={() => scrollCarousel(1)}
                  className="absolute right-1 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 p-2 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 light:border-slate-300 light:bg-white/85 light:text-slate-900 light:hover:bg-white sm:flex"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="-mx-3 px-3">
                  <div
                    ref={carouselRef}
                    className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <div className="flex snap-x snap-proximity gap-3 scroll-smooth px-2 py-8">
                      {teams.map((t) => (
                        <div
                          key={t.team}
                          id={`team-card-${t.team}`}
                          className="relative z-0 w-[10.5rem] shrink-0 sm:w-52"
                        >
                          <TeamCard
                            team={t}
                            season={season}
                            actualTheme={actualTheme}
                            pick={picks[t.team]}
                            isActive={activeTeam === t.team}
                            onClick={() => loadRoster(t.team)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {activeTeam && (
              <div ref={rosterSectionRef} className="mt-8 scroll-mt-20">
                {rosterLoading && !activeRoster ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" /> Loading roster…
                  </div>
                ) : activeRoster?.error ? (
                  <div className="rounded-[24px] bg-rose-500/10 p-6 text-center text-rose-400">
                    {activeRoster.error}
                  </div>
                ) : activeRoster ? (
                  <RosterTable
                    key={activeTeam}
                    roster={activeRoster}
                    season={season}
                    isMobile={isMobile}
                    pickedId={picks[activeTeam]?.playerId}
                    onPick={(player) =>
                      setConfirm({
                        team: activeTeam,
                        player,
                      })
                    }
                  />
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {teams.length > 0 && (
        <button
          type="button"
          disabled={!isComplete}
          onClick={() => setShowNameModal(true)}
          className={`fixed bottom-6 right-6 z-40 btn-search-primary btn-search-primary-inline shadow-2xl transition-all duration-300 !min-h-[50px] py-3 text-sm ${isComplete ? "hover:scale-105 active:scale-99" : ""}`}
        >
          {isComplete ? (
            <Check className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
          Complete Draft
          {!isComplete && (
            <span className="opacity-80 text-xs">
              {draftedCount}/{teams.length}
            </span>
          )}
        </button>
      )}

      {confirm && (
        <ConfirmModal
          confirm={confirm}
          season={season}
          onCancel={() => setConfirm(null)}
          onConfirm={confirmPick}
        />
      )}

      {showNameModal && (
        <NameModal
          teamName={teamName}
          setTeamName={setTeamName}
          analyzing={analyzing}
          error={analyzeError}
          title="Name your franchise"
          description="Your expansion club is ready. Give it a name to generate its analysis."
          confirmLabel="Confirm & Analyze"
          loadingLabel="Analyzing…"
          onCancel={() => {
            if (analyzing) return;
            setShowNameModal(false);
            setAnalyzeError("");
          }}
          onConfirm={completeDraft}
        />
      )}

      {showSaveNameModal && (
        <NameModal
          teamName={teamName}
          setTeamName={setTeamName}
          analyzing={saveState === "saving"}
          error={saveError}
          title="Save draft progress"
          description="Enter a franchise name before saving this in-progress draft."
          confirmLabel="Save draft progress"
          loadingLabel="Saving…"
          onCancel={() => {
            if (saveState === "saving") return;
            setShowSaveNameModal(false);
            setSaveError("");
            setSaveState("idle");
          }}
          onConfirm={confirmSaveProgress}
        />
      )}

      <Footer />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this saved draft?"
        message="This removes it from your account. If it's posted to Community Drafts, it will be removed there too."
        confirmLabel="Delete draft"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteSaved}
      />
    </div>
  );
};
