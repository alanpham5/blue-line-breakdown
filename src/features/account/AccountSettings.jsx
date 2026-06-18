import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Mail,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Pencil,
  Loader2,
  Check,
  User as UserIcon,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { Header } from "components/layout/Header";
import { Footer } from "components/layout/Footer";
import { useAuth } from "providers/AuthContext";
import {
  logOut,
  resetPassword,
  resendVerification,
  updateDisplayName,
} from "lib/firebase/auth";
import { useTheme } from "providers/ThemeContext";
import { checkTeamNameProfanity } from "utils/profanity";
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
export const AccountSettings = () => {
  const { user, loading, openAuth, syncDisplayName } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  useEffect(() => {
    document.title = "Account | Blue Line Breakdown";
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
  useEffect(() => {
    if (!user) return;
    setNameDraft(user.displayName || "");
  }, [user]);
  useEffect(() => {
    if (!nameModalOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && busy !== "name") {
        setNameModalOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [nameModalOpen, busy]);
  const handleSaveName = async () => {
    const normalized = nameDraft.trim().replace(/\s+/g, " ");
    setBusy("name");
    setNotice("");
    setError("");
    if (normalized.length > 40) {
      setBusy("");
      setError("Display name must be 40 characters or fewer.");
      return;
    }
    if (normalized) {
      const profanity = await checkTeamNameProfanity(normalized);
      if (!profanity.ok) {
        setBusy("");
        setError("Couldn't validate that name right now. Please try again.");
        return;
      }
      if (profanity.profane) {
        setBusy("");
        setError("Please choose a display name without profanity.");
        return;
      }
    }
    try {
      await updateDisplayName(normalized || null);
      syncDisplayName(normalized || null);
      setNameDraft(normalized);
      setNotice(normalized ? "Display name updated." : "Display name removed.");
      setNameModalOpen(false);
    } catch {
      setError("Couldn't update your display name. Please try again.");
    } finally {
      setBusy("");
    }
  };
  const openNameModal = () => {
    setNameDraft(user?.displayName || "");
    setNameModalOpen(true);
    setError("");
    setNotice("");
  };
  const handleReset = async () => {
    if (!user?.email) return;
    setBusy("reset");
    setNotice("");
    setError("");
    try {
      await resetPassword(user.email);
      setNotice("Password reset email sent. Check your inbox — and your spam folder if you don't see it.");
    } catch {
      setError("Couldn't send reset email. Please try again.");
    } finally {
      setBusy("");
    }
  };
  const handleResend = async () => {
    setBusy("verify");
    setNotice("");
    setError("");
    try {
      await resendVerification();
      setNotice("Verification email sent. Check your inbox — and your spam folder if you don't see it.");
    } catch {
      setError("Couldn't send verification email. Please try again.");
    } finally {
      setBusy("");
    }
  };
  if (loading || !user) {
    return (
      <div className="min-h-screen ice-background px-4 pb-28 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Header />
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-2 py-20 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          </div>
        </div>
      </div>
    );
  }
  const initials = initialsFromUser(user);
  return (
    <div className="min-h-screen ice-background px-4 pb-28 pt-5 text-white light:text-gray-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Header />

        <div className="mx-auto max-w-2xl">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white light:text-gray-500 light:hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          <h1 className="mb-6 text-3xl font-extrabold tracking-[-0.04em] text-white light:text-gray-900 sm:text-4xl">
            Account settings
          </h1>

          <section className="liquid-glass-strong liquid-glass-animate rounded-[28px] p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-lg font-bold text-white light:bg-slate-900/10 light:text-slate-900">
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
                  <UserIcon className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white light:text-gray-900">
                  {user.displayName || "NHL GM"}
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm text-gray-400 light:text-gray-500">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {user.email}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={openNameModal}
                className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 light:bg-slate-900/10 light:text-slate-900 light:hover:bg-slate-900/20"
              >
                <Pencil className="h-4 w-4" />
                Edit name
              </button>
            </div>
          </section>

          {notice && (
            <p className="mt-4 flex items-center gap-2 rounded-[18px] bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 light:text-emerald-600">
              <Check className="h-4 w-4 shrink-0" /> {notice}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-[18px] bg-rose-500/10 px-4 py-3 text-sm text-rose-400 light:text-rose-600">
              {error}
            </p>
          )}

          <section className="mt-4 liquid-glass-strong liquid-glass-animate rounded-[28px] p-6 sm:p-7">
            <h2 className="text-base font-bold text-white light:text-gray-900">
              Email verification
            </h2>
            {user.emailVerified ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400 light:text-emerald-600">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                Your email address is verified.
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2 text-sm text-amber-400 light:text-amber-600">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>
                     Your email isn't verified yet. Verify it to secure your
                     account and unlock posting. Check your spam folder if you
                     haven't received the email.
                   </span>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={busy === "verify"}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[18px] bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50 light:bg-slate-900/10 light:text-slate-900 light:hover:bg-slate-900/20"
                >
                  {busy === "verify" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Resend verification
                </button>
              </div>
            )}
          </section>

          <section className="mt-4 liquid-glass-strong liquid-glass-animate rounded-[28px] p-6 sm:p-7">
            <h2 className="text-base font-bold text-white light:text-gray-900">
              Password
            </h2>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-400 light:text-gray-500">
                We'll email a secure link to reset your password.
              </p>
              <button
                type="button"
                onClick={handleReset}
                disabled={busy === "reset"}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[18px] bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-50 light:bg-slate-900/10 light:text-slate-900 light:hover:bg-slate-900/20"
              >
                {busy === "reset" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Send password reset
              </button>
            </div>
          </section>

          <section className="mt-4 liquid-glass-strong liquid-glass-animate rounded-[28px] p-6 sm:p-7">
            <button
              type="button"
              onClick={async () => {
                setTheme("system");
                await logOut();
                navigate("/", {
                  replace: true,
                });
              }}
              className="inline-flex items-center gap-2 rounded-[18px] px-3 py-2 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 light:text-rose-600"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </section>
        </div>

        <Footer />
      </div>

      {nameModalOpen && (
        <div
          className="app-modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm light:bg-black/30"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && busy !== "name") {
              setNameModalOpen(false);
            }
          }}
        >
          <div className="app-modal-panel liquid-glass-strong relative w-full max-w-md rounded-[32px] p-6 sm:p-8">
            <button
              type="button"
              onClick={() => setNameModalOpen(false)}
              disabled={busy === "name"}
              aria-label="Close edit name modal"
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50 light:text-slate-500 light:hover:bg-slate-900/10 light:hover:text-slate-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold tracking-tight text-white light:text-gray-900">
              Edit display name
            </h2>
            <p className="mt-1 text-sm text-gray-400 light:text-gray-500">
              This name appears in your account menu and profile.
            </p>

            <div className="mt-5">
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                Display name
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={40}
                  placeholder="NHL GM"
                  className="mt-1.5 app-field py-3 pl-4 pr-4 text-sm text-white light:text-gray-900"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleSaveName}
              disabled={
                busy === "name" ||
                nameDraft.trim().replace(/\s+/g, " ") ===
                  (user.displayName || "")
              }
              className="btn-search-primary mt-5 flex w-full items-center justify-center gap-2"
            >
              {busy === "name" && <Loader2 className="h-4 w-4 animate-spin" />}
              Save name
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
