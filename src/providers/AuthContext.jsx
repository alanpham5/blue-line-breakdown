// Global auth + bookmark state.
//
// Wraps the app once (in App.jsx). Exposes the current Firebase user, a loading
// flag while the initial auth state resolves, and the user's bookmarks streamed
// live from Firestore via onSnapshot. Also owns the single AuthModal instance
// so any component can open the sign-in flow through `openAuth()`.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { observeAuth } from "../firebase/auth";
import { isFirebaseConfigured } from "../firebase/config";
import { subscribeBookmarks, subscribeUserDrafts } from "../firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  // Controls the shared AuthModal. `mode` lets callers deep-link to sign-up.
  const [authModal, setAuthModal] = useState({ open: false, mode: "signin" });

  // Observe Firebase auth session. If Firebase isn't configured we resolve
  // immediately as signed-out so the rest of the UI still renders.
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

  // Stream the signed-in user's bookmarks. Re-subscribes whenever the uid
  // changes; clears on sign-out.
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    const unsub = subscribeBookmarks(user.uid, setBookmarks);
    return unsub;
  }, [user]);

  // Stream the user's saved expansion drafts (in-progress + completed).
  useEffect(() => {
    if (!user) {
      setDrafts([]);
      return;
    }
    const unsub = subscribeUserDrafts(user.uid, setDrafts);
    return unsub;
  }, [user]);

  const openAuth = useCallback(
    (mode = "signin") => setAuthModal({ open: true, mode }),
    []
  );
  const closeAuth = useCallback(
    () => setAuthModal((s) => ({ ...s, open: false })),
    []
  );
  const syncDisplayName = useCallback((displayName) => {
    setUser((u) => (u ? { ...u, displayName: displayName || null } : u));
  }, []);

  // O(1) membership lookup for bookmark buttons.
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
