import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User as UserIcon,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Bookmark,
  Users,
  Shield,
  Settings,
  ChevronRight,
  Trophy,
  Trash2,
} from "lucide-react";
import { useAuth } from "providers/AuthContext";
import { logOut } from "lib/firebase/auth";
import {
  deleteUserDraft,
  ENTITY_TYPES,
  isCompleteDraft,
  isInProgressDraft,
} from "lib/firebase/firestore";
import { seasonSpan } from "utils/season";
import {
  bookmarkHref,
  draftNavTarget,
} from "features/account/utils/savedItems";
import { ThemeToggle } from "components/ui/ThemeToggle";
import { useTheme } from "providers/ThemeContext";
import { ConfirmDialog } from "components/ui/ConfirmDialog";
const MAX_INLINE = 3;
const initialsFromUser = (user) => {
  const source = user?.displayName || user?.email || "";
  const parts = source
    .replace(/@.*/, "")
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length === 0) return null;
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
};
export const AccountMenu = () => {
  const { user, loading, bookmarks, drafts, openAuth } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState(null);
  const [rect, setRect] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const updateRect = useCallback(() => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);
  useLayoutEffect(() => {
    if (open) updateRect();
  }, [open, updateRect]);
  useEffect(() => {
    updateRect();
  }, [updateRect]);
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onEscape = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open, updateRect]);
  if (loading) {
    return (
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10 light:bg-slate-900/10" />
    );
  }
  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAuth("signin")}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 light:bg-slate-900/10 light:text-slate-900 light:hover:bg-slate-900/20"
      >
        <UserIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }
  const initials = initialsFromUser(user);
  const savedDrafts = drafts.filter(
    (d) =>
      isCompleteDraft(d) || (isInProgressDraft(d) && (d.pickCount || 0) > 0)
  );
  const go = (href) => {
    setOpen(false);
    navigate(href);
  };
  const openDraft = (d) => {
    const { path, state } = draftNavTarget(d);
    setOpen(false);
    navigate(path, {
      state,
    });
  };
  const confirmDelete = async () => {
    const d = confirmDraft;
    setConfirmDraft(null);
    if (!d) return;
    await deleteUserDraft(user.uid, d.id).catch(() => {});
  };
  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white transition-transform hover:scale-105 light:border-slate-300 light:bg-slate-900/10 light:text-slate-900"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "Account"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
      </button>

      {rect &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: rect.bottom + 10,
              right: window.innerWidth - rect.right,
            }}
            className={`liquid-glass-strong z-[9999] w-[19rem] origin-top-right overflow-hidden rounded-[26px] p-2 transition-all duration-200 ease-out ${open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"}`}
          >
            <div className="px-3 pb-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-bold text-white light:bg-slate-900/10 light:text-slate-900">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : initials ? (
                    <span>{initials}</span>
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white light:text-gray-900">
                    {user.displayName || "NHL GM"}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-gray-400 light:text-gray-500">
                    <Mail className="h-3 w-3 shrink-0" />
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 light:text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> Email verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-400 light:text-amber-600">
                    <ShieldAlert className="h-3.5 w-3.5" /> Not verified
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => go("/account")}
                className="mt-3 flex w-full items-center gap-2 rounded-[16px] px-3 py-2 text-left text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 light:text-slate-700 light:hover:bg-slate-900/10"
              >
                <Settings className="h-4 w-4" />
                Account settings
                <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
              </button>
            </div>

            <Divider />

            <div className="px-1 py-2">
              <p className="flex items-center gap-1.5 px-3 pb-1 text-xs font-bold text-gray-500">
                <Bookmark className="h-3.5 w-3.5" /> My Bookmarks
              </p>
              {bookmarks.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-400 light:text-gray-500">
                  No bookmarks yet. Tap the bookmark icon on any player or team.
                </p>
              ) : (
                <>
                  {bookmarks.slice(0, MAX_INLINE).map((bm) => (
                    <BookmarkRow
                      key={bm.id}
                      icon={
                        bm.entityType === ENTITY_TYPES.TEAM ? Shield : UserIcon
                      }
                      bookmark={bm}
                      onSelect={() => go(bookmarkHref(bm))}
                    />
                  ))}
                  {bookmarks.length > MAX_INLINE && (
                    <SeeAll
                      label={`See all ${bookmarks.length} bookmarks`}
                      onClick={() => go("/account/bookmarks")}
                    />
                  )}
                </>
              )}
            </div>

            <Divider />

            <div className="px-1 py-2">
              <p className="flex items-center gap-1.5 px-3 pb-1 text-xs font-bold text-gray-500">
                <Trophy className="h-3.5 w-3.5" /> My Drafts
              </p>
              {savedDrafts.length === 0 ? (
                <p className="px-3 py-2 text-sm text-gray-400 light:text-gray-500">
                  No saved drafts yet.{" "}
                  <button
                    type="button"
                    onClick={() => go("/expansion-draft")}
                    className="font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
                  >
                    Build a franchise
                  </button>
                  .
                </p>
              ) : (
                <>
                  {savedDrafts.slice(0, MAX_INLINE).map((d) => (
                    <DraftRow
                      key={d.id}
                      draft={d}
                      onClick={() => openDraft(d)}
                      onDelete={() => setConfirmDraft(d)}
                    />
                  ))}
                  {savedDrafts.length > MAX_INLINE && (
                    <SeeAll
                      label={`See all ${savedDrafts.length} drafts`}
                      onClick={() => go("/account/drafts")}
                    />
                  )}
                </>
              )}
            </div>

            <Divider />

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-bold text-gray-500">
                Theme
              </span>
              <ThemeToggle showLabel={false} />
            </div>

            <Divider />

            <div className="p-1">
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  setTheme("system");
                  await logOut();
                }}
                className="flex w-full items-center gap-2 rounded-[16px] px-3 py-2.5 text-left text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 light:text-rose-600"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>,
          document.body
        )}

      <ConfirmDialog
        open={Boolean(confirmDraft)}
        title="Delete this franchise?"
        message="This removes it from your account. If it's posted to Community Drafts, it will be removed there too."
        confirmLabel="Delete franchise"
        onCancel={() => setConfirmDraft(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
const Divider = () => (
  <div className="mx-3 h-px bg-white/10 light:bg-slate-200" />
);
const SeeAll = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="mt-0.5 flex w-full items-center gap-1 rounded-[16px] px-3 py-2 text-left text-xs font-semibold text-sky-300 transition-colors hover:bg-white/10 light:text-sky-600 light:hover:bg-slate-900/10"
  >
    {label}
    <ChevronRight className="h-3.5 w-3.5" />
  </button>
);
const BookmarkRow = ({ icon: Icon, bookmark, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className="flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2 text-left text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 light:text-slate-700 light:hover:bg-slate-900/10"
  >
    <Icon className="h-4 w-4 shrink-0 text-gray-400 light:text-gray-500" />
    <span className="min-w-0 flex-1 truncate">
      {bookmark.label || bookmark.player || bookmark.team || bookmark.entityId}
    </span>
    {bookmark.season && (
      <span className="shrink-0 text-xs text-gray-500">{bookmark.season}</span>
    )}
  </button>
);
const DraftRow = ({ draft, onClick, onDelete }) => {
  const inProgress = isInProgressDraft(draft);
  const Icon = Users;
  const subtitle = inProgress
    ? `${seasonSpan(draft.season)} · ${draft.pickCount} picked`
    : `${seasonSpan(draft.season)}${draft.profile?.predictedRecord?.display ? ` · ${draft.profile.predictedRecord.display}` : ""}`;
  return (
    <div className="group flex items-center rounded-[16px] transition-colors hover:bg-white/10 light:hover:bg-slate-900/10">
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left"
      >
        <Icon className="h-4 w-4 shrink-0 text-gray-400 light:text-gray-500" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-gray-200 light:text-slate-700">
            {draft.teamName || "Untitled franchise"}
          </span>
          <span className="block truncate text-xs text-gray-500">
            {subtitle}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete draft"
        className="mr-1.5 shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
