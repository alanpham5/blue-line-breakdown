import app from "lib/firebase/config";

let firestorePromise = null;

const loadFirestore = () => {
  firestorePromise ??= import("firebase/firestore").then((sdk) => ({
    ...sdk,
    db: sdk.getFirestore(app),
  }));
  return firestorePromise;
};

const subscribeWhenLoaded = (subscribe) => {
  let unsubscribe = null;
  let cancelled = false;
  loadFirestore().then((fs) => {
    if (!cancelled) unsubscribe = subscribe(fs);
  });
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
};

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
const ensureUserDoc = async (fs, uid) => {
  await fs.setDoc(
    fs.doc(fs.db, "users", uid),
    {
      updatedAt: fs.serverTimestamp(),
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
const bookmarksCol = (fs, uid) =>
  fs.collection(fs.db, "users", uid, "bookmarks");
const bookmarkRef = (fs, uid, entityType, entityId) =>
  fs.doc(bookmarksCol(fs, uid), bookmarkId(entityType, entityId));
export const subscribeBookmarks = (uid, callback) =>
  subscribeWhenLoaded((fs) => {
    const q = fs.query(bookmarksCol(fs, uid), fs.orderBy("createdAt", "desc"));
    return fs.onSnapshot(
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
  });
export const toggleBookmark = async (
  uid,
  entityType,
  entityId,
  meta = {},
  isActive
) => {
  const fs = await loadFirestore();
  const ref = bookmarkRef(fs, uid, entityType, entityId);
  if (isActive) {
    await fs.deleteDoc(ref);
    return false;
  }
  await fs.setDoc(ref, {
    entityId: String(entityId),
    entityType,
    ...meta,
    createdAt: fs.serverTimestamp(),
  });
  return true;
};
export const getBookmark = async (uid, entityType, entityId) => {
  const fs = await loadFirestore();
  const snap = await fs.getDoc(bookmarkRef(fs, uid, entityType, entityId));
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
const userDraftsCol = (fs, uid) => fs.collection(fs.db, "users", uid, "drafts");
const progressDraftId = (season) => `progress_${Number(season)}`;
export const isProgressDraftId = (id) =>
  typeof id === "string" && id.startsWith("progress_");
export const isInProgressDraft = (draft) =>
  draft?.status === DRAFT_STATUS.IN_PROGRESS || isProgressDraftId(draft?.id);
export const isCompleteDraft = (draft) =>
  draft?.status === DRAFT_STATUS.COMPLETE && !isProgressDraftId(draft?.id);
export const subscribeUserDrafts = (uid, callback) =>
  subscribeWhenLoaded((fs) => {
    const q = fs.query(userDraftsCol(fs, uid), fs.orderBy("updatedAt", "desc"));
    return fs.onSnapshot(
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
  });
export const saveDraftProgress = async (uid, { season, picks, teamName }) => {
  const fs = await loadFirestore();
  await ensureUserDoc(fs, uid);
  const storedPicks = slimPicksMap(picks);
  const ref = fs.doc(userDraftsCol(fs, uid), progressDraftId(season));
  await fs.setDoc(ref, {
    status: DRAFT_STATUS.IN_PROGRESS,
    season: Number(season),
    teamName: teamName || "",
    picks: sanitizeForFirestore(storedPicks),
    pickCount: Object.keys(storedPicks).length,
    updatedAt: fs.serverTimestamp(),
  });
  return ref.id;
};
export const deleteDraftProgress = async (uid, season) => {
  const fs = await loadFirestore();
  await fs.deleteDoc(fs.doc(userDraftsCol(fs, uid), progressDraftId(season)));
};
export const saveCompletedDraft = async (uid, draft, existingId = null) => {
  const fs = await loadFirestore();
  await ensureUserDoc(fs, uid);
  const picks = sanitizeForFirestore(draft.profile?.roster || []);
  const payload = {
    status: DRAFT_STATUS.COMPLETE,
    season: Number(draft.season),
    teamName: draft.teamName,
    picks,
    pickCount: picks.length,
    updatedAt: fs.serverTimestamp(),
  };
  const docId =
    existingId && !isProgressDraftId(existingId) ? existingId : null;
  let id;
  if (docId) {
    await fs.setDoc(
      fs.doc(userDraftsCol(fs, uid), docId),
      {
        ...payload,
        profile: fs.deleteField(),
      },
      {
        merge: true,
      }
    );
    id = docId;
  } else {
    const ref = await fs.addDoc(userDraftsCol(fs, uid), {
      ...payload,
      createdAt: fs.serverTimestamp(),
    });
    id = ref.id;
  }
  await deleteDraftProgress(uid, draft.season);
  return id;
};
export const deleteUserDraft = async (uid, draftId) => {
  const fs = await loadFirestore();
  const userDraftRef = fs.doc(userDraftsCol(fs, uid), draftId);
  const entryRef = leaderboardRef(fs, draftId);
  await fs.runTransaction(fs.db, async (tx) => {
    const entry = await tx.get(entryRef);
    tx.delete(userDraftRef);
    if (entry.exists()) tx.delete(entryRef);
  });
};
const draftsCol = (fs) => fs.collection(fs.db, "expansion_drafts");
const leaderboardRef = (fs, draftId) => fs.doc(draftsCol(fs), draftId);
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
  const fs = await loadFirestore();
  const userDraftRef = fs.doc(userDraftsCol(fs, user.uid), draftId);
  const entryRef = leaderboardRef(fs, draftId);
  await fs.runTransaction(fs.db, async (tx) => {
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
      createdAt: fs.serverTimestamp(),
    });
    tx.update(userDraftRef, {
      postedToLeaderboard: true,
      updatedAt: fs.serverTimestamp(),
    });
  });
  return draftId;
};
export const removeDraftFromLeaderboard = async (uid, draftId) => {
  const fs = await loadFirestore();
  const userDraftRef = fs.doc(userDraftsCol(fs, uid), draftId);
  const entryRef = leaderboardRef(fs, draftId);
  await fs.runTransaction(fs.db, async (tx) => {
    const entry = await tx.get(entryRef);
    tx.update(userDraftRef, {
      postedToLeaderboard: false,
      updatedAt: fs.serverTimestamp(),
    });
    if (entry.exists()) tx.delete(entryRef);
  });
};
export const reconcileLeaderboardOrphans = async (uid, validDraftIds) => {
  const fs = await loadFirestore();
  const snap = await fs.getDocs(
    fs.query(draftsCol(fs), fs.where("ownerId", "==", uid))
  );
  const valid = new Set(validDraftIds);
  const stale = snap.docs.filter((d) => !valid.has(d.id));
  if (stale.length === 0) return;
  const batch = fs.writeBatch(fs.db);
  stale.forEach((d) => batch.delete(d.ref));
  await batch.commit();
};
export const subscribeLeaderboard = (season, callback) =>
  subscribeWhenLoaded((fs) => {
    const constraints = [];
    if (season != null && season !== "ALL") {
      constraints.push(fs.where("season", "==", Number(season)));
    }
    constraints.push(fs.orderBy("likes", "desc"), fs.limit(50));
    const q = fs.query(draftsCol(fs), ...constraints);
    return fs.onSnapshot(
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
  });
export const toggleLike = async (draftId, uid, alreadyLiked) => {
  const fs = await loadFirestore();
  const ref = fs.doc(draftsCol(fs), draftId);
  await fs.updateDoc(ref, {
    likes: fs.increment(alreadyLiked ? -1 : 1),
    likedBy: alreadyLiked ? fs.arrayRemove(uid) : fs.arrayUnion(uid),
  });
};
