import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Shield,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { useAuth } from "providers/AuthContext";
import { ENTITY_TYPES, toggleBookmark } from "lib/firebase/firestore";
import { bookmarkHref } from "features/account/utils/savedItems";
export const SavedBookmarks = () => {
  const { user, loading, bookmarks, openAuth } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "My Bookmarks | Blue Line Breakdown";
    return () => {
      document.title = "Blue Line Breakdown";
    };
  }, []);
  useEffect(() => {
    if (!loading && !user) {
      openAuth("signin");
      navigate("/", {
        replace: true,
      });
    }
  }, [loading, user, openAuth, navigate]);
  const teams = bookmarks.filter((b) => b.entityType === ENTITY_TYPES.TEAM);
  const players = bookmarks.filter((b) => b.entityType === ENTITY_TYPES.PLAYER);
  const removeBookmark = (bm) =>
    toggleBookmark(user.uid, bm.entityType, bm.entityId, {}, true).catch(
      () => {}
    );
  return (
    <div className="min-h-screen ice-background px-4 pb-28 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white light:text-gray-500 light:hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="mb-6 flex items-center gap-2 text-3xl font-extrabold tracking-[-0.04em] text-white light:text-gray-900 sm:text-4xl">
            <Bookmark className="h-7 w-7 text-sky-300 light:text-sky-600" /> My
            Bookmarks
          </h1>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="liquid-glass rounded-[28px] p-10 text-center text-gray-400 light:text-gray-500">
              No bookmarks yet. Tap the bookmark icon on any player or team.
            </div>
          ) : (
            <div className="space-y-6">
              {teams.length > 0 && (
                <Section
                  icon={Shield}
                  label="Teams"
                  items={teams}
                  onOpen={(bm) => navigate(bookmarkHref(bm))}
                  onRemove={removeBookmark}
                />
              )}
              {players.length > 0 && (
                <Section
                  icon={Users}
                  label="Players"
                  items={players}
                  onOpen={(bm) => navigate(bookmarkHref(bm))}
                  onRemove={removeBookmark}
                />
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};
const Section = ({ icon: Icon, label, items, onOpen, onRemove }) => (
  <section className="liquid-glass-strong rounded-[28px] p-4 sm:p-6">
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-gray-400 light:text-gray-500">
      <Icon className="h-4 w-4" /> {label}
      <span className="text-gray-500">({items.length})</span>
    </h2>
    <div className="space-y-1.5">
      {items.map((bm) => (
        <div
          key={bm.id}
          className="group flex items-center rounded-[18px] border border-white/10 bg-white/5 transition-colors hover:bg-white/10 light:border-slate-200 light:bg-white/60"
        >
          <button
            type="button"
            onClick={() => onOpen(bm)}
            className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
          >
            <Icon className="h-4 w-4 shrink-0 text-gray-400 light:text-gray-500" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white light:text-gray-900">
              {bm.label || bm.player || bm.team || bm.entityId}
            </span>
            {bm.season && (
              <span className="shrink-0 text-xs text-gray-500">
                {bm.season}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onRemove(bm)}
            aria-label="Remove bookmark"
            className="mr-2 shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </section>
);
