import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
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
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import { db } from "lib/firebase/config";
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
const ensureUserDoc = async (uid) => {
  await setDoc(
    doc(db, "users", uid),
    {
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
};
export const ENTITY_TYPES = {
  PLAYER: "PLAYER",
  TEAM: "TEAM",
};
const bookmarkId = (entityType, entityId) => `${entityType}_${entityId}`;
const bookmarksCol = (uid) => collection(db, "users", uid, "bookmarks");
const bookmarkRef = (uid, entityType, entityId) =>
  doc(bookmarksCol(uid), bookmarkId(entityType, entityId));
export const subscribeBookmarks = (uid, callback) => {
  const q = query(bookmarksCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      callback(items);
    },
    () => callback([])
  );
};
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
  return snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null;
};
export const DRAFT_STATUS = {
  IN_PROGRESS: "in_progress",
  COMPLETE: "complete",
};
const userDraftsCol = (uid) => collection(db, "users", uid, "drafts");
const progressDraftId = (season) => `progress_${Number(season)}`;
export const isProgressDraftId = (id) =>
  typeof id === "string" && id.startsWith("progress_");
export const isInProgressDraft = (draft) =>
  draft?.status === DRAFT_STATUS.IN_PROGRESS || isProgressDraftId(draft?.id);
export const isCompleteDraft = (draft) =>
  draft?.status === DRAFT_STATUS.COMPLETE && !isProgressDraftId(draft?.id);
export const subscribeUserDrafts = (uid, callback) => {
  const q = query(userDraftsCol(uid), orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      ),
    () => callback([])
  );
};
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
export const deleteDraftProgress = async (uid, season) => {
  await deleteDoc(doc(userDraftsCol(uid), progressDraftId(season)));
};
export const saveCompletedDraft = async (uid, draft, existingId = null) => {
  await ensureUserDoc(uid);
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
        profile: deleteField(),
      },
      {
        merge: true,
      }
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
  const userDraftRef = doc(userDraftsCol(uid), draftId);
  const entryRef = leaderboardRef(draftId);
  await runTransaction(db, async (tx) => {
    const entry = await tx.get(entryRef);
    tx.delete(userDraftRef);
    if (entry.exists()) tx.delete(entryRef);
  });
};
const draftsCol = () => collection(db, "expansion_drafts");
const leaderboardRef = (draftId) => doc(draftsCol(), draftId);
const leaderboardPayload = (user, draft) => {
  const { profile } = draft;
  return {
    draftId: draft.savedDraftId,
    ownerId: user.uid,
    ownerName: user.displayName || user.email || "Anonymous GM",
    teamName: draft.teamName,
    season: Number(draft.season),
    profile: sanitizeForFirestore(profile),
    picks: sanitizeForFirestore(profile.roster),
    metrics: sanitizeForFirestore(profile.draftSummary || {}),
  };
};
export const postDraftToLeaderboard = async (user, draft) => {
  const draftId = draft.savedDraftId;
  if (!draftId) throw new Error("Save your franchise before posting it.");
  const userDraftRef = doc(userDraftsCol(user.uid), draftId);
  const entryRef = leaderboardRef(draftId);
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(entryRef);
    if (existing.exists()) return;
    const savedDraft = await tx.get(userDraftRef);
    if (!savedDraft.exists()) {
      throw new Error("Save your franchise before posting it.");
    }
    tx.set(entryRef, {
      ...leaderboardPayload(user, draft),
      likes: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
    });
    tx.update(userDraftRef, {
      postedToLeaderboard: true,
      updatedAt: serverTimestamp(),
    });
  });
  return draftId;
};
export const removeDraftFromLeaderboard = async (uid, draftId) => {
  const userDraftRef = doc(userDraftsCol(uid), draftId);
  const entryRef = leaderboardRef(draftId);
  await runTransaction(db, async (tx) => {
    const entry = await tx.get(entryRef);
    tx.update(userDraftRef, {
      postedToLeaderboard: false,
      updatedAt: serverTimestamp(),
    });
    if (entry.exists()) tx.delete(entryRef);
  });
};
export const reconcileLeaderboardOrphans = async (uid, validDraftIds) => {
  const snap = await getDocs(query(draftsCol(), where("ownerId", "==", uid)));
  const valid = new Set(validDraftIds);
  const stale = snap.docs.filter((d) => !valid.has(d.id));
  if (stale.length === 0) return;
  const batch = writeBatch(db);
  stale.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};
export const subscribeLeaderboard = (season, callback) => {
  const constraints = [];
  if (season != null && season !== "ALL") {
    constraints.push(where("season", "==", Number(season)));
  }
  constraints.push(orderBy("likes", "desc"), limit(50));
  const q = query(draftsCol(), ...constraints);
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      ),
    () => callback([])
  );
};
export const toggleLike = async (draftId, uid, alreadyLiked) => {
  const ref = doc(draftsCol(), draftId);
  await updateDoc(ref, {
    likes: increment(alreadyLiked ? -1 : 1),
    likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
  });
};
