import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { observeAuth } from "lib/firebase/auth";
import { isFirebaseConfigured } from "lib/firebase/config";
import {
  reconcileLeaderboardOrphans,
  subscribeBookmarks,
  subscribeUserDrafts,
} from "lib/firebase/firestore";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [authModal, setAuthModal] = useState({
    open: false,
    mode: "signin",
  });
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("__MOCK_USER")) {
      setLoading(false);
      return;
    }
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = observeAuth((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    const unsub = subscribeBookmarks(user.uid, setBookmarks);
    return unsub;
  }, [user]);
  useEffect(() => {
    if (!user) {
      setDrafts([]);
      return;
    }
    let reconciled = false;
    const unsub = subscribeUserDrafts(user.uid, (items) => {
      setDrafts(items);
      if (!reconciled) {
        reconciled = true;
        reconcileLeaderboardOrphans(
          user.uid,
          items.map((d) => d.id)
        ).catch(() => {});
      }
    });
    return unsub;
  }, [user]);
  const openAuth = useCallback(
    (mode = "signin") =>
      setAuthModal({
        open: true,
        mode,
      }),
    []
  );
  const closeAuth = useCallback(
    () =>
      setAuthModal((s) => ({
        ...s,
        open: false,
      })),
    []
  );
  const syncDisplayName = useCallback((displayName) => {
    setUser((u) =>
      u
        ? {
            ...u,
            displayName: displayName || null,
          }
        : u
    );
  }, []);
  const bookmarkKeys = useMemo(
    () => new Set(bookmarks.map((b) => `${b.entityType}_${b.entityId}`)),
    [bookmarks]
  );
  const value = useMemo(
    () => ({
      user,
      loading,
      bookmarks,
      bookmarkKeys,
      drafts,
      isBookmarked: (entityType, entityId) =>
        bookmarkKeys.has(`${entityType}_${entityId}`),
      authModal,
      openAuth,
      closeAuth,
      syncDisplayName,
      isConfigured: isFirebaseConfigured,
    }),
    [
      user,
      loading,
      bookmarks,
      bookmarkKeys,
      drafts,
      authModal,
      openAuth,
      closeAuth,
      syncDisplayName,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
