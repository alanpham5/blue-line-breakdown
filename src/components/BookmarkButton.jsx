// Bookmark toggle for player and team profiles.
//
// Reads bookmark state from the live Firestore-backed AuthContext (so the icon,
// the account-menu list and any other indicator stay in sync instantly), and
// writes through to Firestore on click. Signed-out clicks open the auth modal.
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "../providers/AuthContext";
import { toggleBookmark } from "../firebase/firestore";

export const BookmarkButton = ({
  entityType,
  entityId,
  meta = {},
  className = "",
  size = "md",
}) => {
  const { user, isBookmarked, openAuth } = useAuth();
  const [pending, setPending] = useState(false);

  if (!entityId) return null;

  const active = user ? isBookmarked(entityType, entityId) : false;

  const handleClick = async () => {
    if (!user) {
      openAuth("signin");
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      await toggleBookmark(user.uid, entityType, entityId, meta, active);
    } catch {
      // Swallow — the snapshot listener stays the source of truth, so a failed
      // write simply leaves the icon in its prior state.
    } finally {
      setPending(false);
    }
  };

  const dims = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Add bookmark"}
      title={
        user ? (active ? "Remove bookmark" : "Bookmark") : "Sign in to bookmark"
      }
      className={`inline-flex ${dims} items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-60 ${
        active
          ? "border-amber-300/40 bg-amber-300/15 text-amber-300 light:border-amber-500/40 light:bg-amber-500/15 light:text-amber-600"
          : "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white light:border-slate-300 light:bg-white/60 light:text-slate-500 light:hover:text-slate-900"
      } ${className}`}
    >
      <Bookmark className={`${icon} ${active ? "fill-current" : ""}`} />
    </button>
  );
};
