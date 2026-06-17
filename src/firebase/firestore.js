// Firestore data layer (modular SDK v10).
//
// Two domains live here:
//   1. Bookmarks  — users/{uid}/bookmarks/{entityType}_{entityId}
//   2. Expansion drafts (community leaderboard) — root `expansion_drafts`
//
// Components never import firebase/firestore directly; they call these helpers
// so collection paths and document shapes stay in one place.
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
} from "firebase/firestore";
import { db } from "./config";

// Firestore rejects nested `undefined` values. Strip them before any write that
// carries API-shaped objects (draft picks, analyzed profiles, bookmark meta).
const sanitizeForFirestore = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map(sanitizeForFirestore);
  }
  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (val === undefined) continue;
      out[key] = sanitizeForFirestore(val);
    }
    return out;
  }
  return value;
};

// Only persist fields needed to resume a draft and re-run /draft/analyze.
const PICK_STORAGE_KEYS = [
  "playerId",
  "name",
  "position",
  "goals",
  "assists",
  "points",
  "plusMinus",
  "age",
  "savePct",
  "gaa",
  "gamesPlayed",
  "saves",
  "shotsAgainst",
];

const slimPlayerPick = (player) => {
  if (!player || player.playerId == null) return null;
  const slim = {};
  for (const key of PICK_STORAGE_KEYS) {
    const val = player[key];
    if (val !== undefined && val !== null) slim[key] = val;
  }
  return slim;
};

const slimPicksMap = (picks) => {
  const out = {};
  for (const [team, player] of Object.entries(picks || {})) {
    const slim = slimPlayerPick(player);
    if (slim) out[team] = slim;
  }
  return out;
};

// Ensures the owner profile doc exists so subcollection writes satisfy rules.
const ensureUserDoc = async (uid) => {
  await setDoc(
    doc(db, "users", uid),
    { updatedAt: serverTimestamp() },
    { merge: true }
  );
};

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export const ENTITY_TYPES = { PLAYER: "PLAYER", TEAM: "TEAM" };

// Deterministic doc id so a given entity is bookmarked at most once and the
// toggle is idempotent (no duplicate reads needed to find an existing mark).
const bookmarkId = (entityType, entityId) => `${entityType}_${entityId}`;

const bookmarksCol = (uid) => collection(db, "users", uid, "bookmarks");

const bookmarkRef = (uid, entityType, entityId) =>
  doc(bookmarksCol(uid), bookmarkId(entityType, entityId));

// Reactive subscription. Drives the global state so the account menu, profile
// indicators and bookmark buttons all update instantly on any write — no page
// refresh. Returns the unsubscribe function.
export const subscribeBookmarks = (uid, callback) => {
  const q = query(bookmarksCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    () => callback([])
  );
};

// Adds or removes a bookmark depending on `isActive`. `meta` carries the
// display label + any routing params (season, position) so the account menu
// can render and link the item without a second fetch.
export const toggleBookmark = async (
  uid,
  entityType,
  entityId,
  meta = {},
  isActive
) => {
  const ref = bookmarkRef(uid, entityType, entityId);
  if (isActive) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, {
    entityId: String(entityId),
    entityType,
    ...meta,
    createdAt: serverTimestamp(),
  });
  return true;
};

export const getBookmark = async (uid, entityType, entityId) => {
  const snap = await getDoc(bookmarkRef(uid, entityType, entityId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ---------------------------------------------------------------------------
// Saved expansion drafts — private to the user (users/{uid}/drafts)
//
// Two kinds share the collection but use distinct document shapes:
//   • in-progress — doc id `progress_{season}`; stores picks only.
//   • complete    — auto id; stores analyzed profile only.
// ---------------------------------------------------------------------------

export const DRAFT_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETE: "complete",
};

const userDraftsCol = (uid) => collection(db, "users", uid, "drafts");

// Deterministic id so in-progress saves upsert one resumable doc per season.
const progressDraftId = (season) => `progress_${Number(season)}`;

export const isProgressDraftId = (id) =>
  typeof id === "string" && id.startsWith("progress_");

export const isInProgressDraft = (draft) =>
  draft?.status === DRAFT_STATUS.IN_PROGRESS || isProgressDraftId(draft?.id);

export const isCompleteDraft = (draft) =>
  draft?.status === DRAFT_STATUS.COMPLETE && !isProgressDraftId(draft?.id);

// Live stream of every saved draft (newest first), used by the account menu and
// the draft splash page. Returns the unsubscribe function.
export const subscribeUserDrafts = (uid, callback) => {
  const q = query(userDraftsCol(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => callback([])
  );
};

// Upserts the in-progress save for a season. Full replace keeps completed-only
// fields (e.g. profile) from leaking via merge.
export const saveDraftProgress = async (uid, { season, picks, teamName }) => {
  await ensureUserDoc(uid);
  const storedPicks = slimPicksMap(picks);
  const ref = doc(userDraftsCol(uid), progressDraftId(season));
  await setDoc(ref, {
    status: DRAFT_STATUS.IN_PROGRESS,
    season: Number(season),
    teamName: teamName || "",
    picks: sanitizeForFirestore(storedPicks),
    pickCount: Object.keys(storedPicks).length,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

// Clears a season's in-progress autosave (e.g. once it's completed).
export const deleteDraftProgress = async (uid, season) => {
  await deleteDoc(doc(userDraftsCol(uid), progressDraftId(season)));
};

// Persists a completed, analyzed franchise. Saves the roster as picks so the
// result page can re-analyze dynamically; metrics/stats/predictions are NOT
// persisted here since they are always recalculated on demand. Leaderboard
// posts use a separate path (postDraft) that does store the full profile.
// Updates an existing saved franchise when `existingId` is provided; always
// retires the season's in-progress doc.
export const saveCompletedDraft = async (uid, draft, existingId = null) => {
  await ensureUserDoc(uid);

  // Use profile.roster as the canonical picks source — it includes every
  // field the backend needs to re-analyze (team, playerId, position, age,
  // goals, assists, points, plusMinus, savePct, gaa, saves, shotsAgainst).
  const picks = sanitizeForFirestore(draft.profile?.roster || []);

  const payload = {
    status: DRAFT_STATUS.COMPLETE,
    season: Number(draft.season),
    teamName: draft.teamName,
    picks,
    pickCount: picks.length,
    updatedAt: serverTimestamp(),
  };

  const docId =
    existingId && !isProgressDraftId(existingId) ? existingId : null;

  let id;
  if (docId) {
    await setDoc(
      doc(userDraftsCol(uid), docId),
      {
        ...payload,
        // Clear any previously stored profile — metrics are now dynamic.
        profile: deleteField(),
      },
      { merge: true }
    );
    id = docId;
  } else {
    const ref = await addDoc(userDraftsCol(uid), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    id = ref.id;
  }

  await deleteDraftProgress(uid, draft.season);
  return id;
};

export const deleteUserDraft = async (uid, draftId) => {
  await deleteDoc(doc(userDraftsCol(uid), draftId));
};

// Patch helper for the user's saved draft docs (e.g. attaching leaderboardId).
export const updateUserDraft = async (uid, draftId, patch = {}) => {
  await ensureUserDoc(uid);
  await updateDoc(doc(userDraftsCol(uid), draftId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
};

// ---------------------------------------------------------------------------
// Expansion drafts — community leaderboard
// ---------------------------------------------------------------------------

const draftsCol = () => collection(db, "expansion_drafts");

// Persists a completed expansion draft to the public leaderboard. Security
// rules additionally enforce ownerId == auth.uid and a verified email; we set
// the fields here so the document shape matches those rules.
export const postDraft = async (user, draft) => {
  const { profile } = draft;
  const payload = {
    ownerId: user.uid,
    ownerName: user.displayName || user.email || "Anonymous GM",
    teamName: draft.teamName,
    season: Number(draft.season),
    profile: sanitizeForFirestore(profile),
    picks: sanitizeForFirestore(profile.roster),
    metrics: sanitizeForFirestore(profile.draftSummary || {}),
    likes: 0,
    likedBy: [],
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(draftsCol(), payload);
  return ref.id;
};

export const deletePostedDraft = async (draftId) => {
  await deleteDoc(doc(draftsCol(), draftId));
};

// Leaderboard query: top 50 by likes, optionally partitioned by season.
// NOTE: the season-filtered variant needs a composite index (season ASC,
// likes DESC) — Firebase logs a one-click "create index" link the first time
// it runs. Documented in SETUP.md.
export const subscribeLeaderboard = (season, callback) => {
  const constraints = [];
  if (season != null && season !== "ALL") {
    constraints.push(where("season", "==", Number(season)));
  }
  constraints.push(orderBy("likes", "desc"), limit(50));
  const q = query(draftsCol(), ...constraints);
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    () => callback([])
  );
};

// Toggles a like. `likedBy` tracks which users have liked so the count can't be
// inflated by repeat clicks; `likes` mirrors the array length for cheap sorting.
export const toggleLike = async (draftId, uid, alreadyLiked) => {
  const ref = doc(draftsCol(), draftId);
  await updateDoc(ref, {
    likes: increment(alreadyLiked ? -1 : 1),
    likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
};
