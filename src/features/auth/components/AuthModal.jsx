import { useEffect, useRef, useState } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useAuth } from "providers/AuthContext";
import {
  signUpWithEmail,
  signInWithEmail,
  initiateGoogleOAuth,
  resetPassword,
  mapAuthError,
} from "lib/firebase/auth";
import { checkTeamNameProfanity } from "utils/profanity";

const VIEW = {
  SIGNIN: "signin",
  SIGNUP: "signup",
  RESET: "reset",
};

const GoogleGlyph = () => (
  <svg aria-hidden="true" viewBox="0 0 18 18" className="h-5 w-5">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
    />
  </svg>
);

export const AuthModal = () => {
  const { authModal, closeAuth, isConfigured } = useAuth();
  const isOpen = authModal.open;
  const [view, setView] = useState(VIEW.SIGNIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setView(authModal.mode === "signup" ? VIEW.SIGNUP : VIEW.SIGNIN);
      setError("");
      setNotice("");
      setPassword("");
    }
  }, [isOpen, authModal.mode]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && closeAuth();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeAuth]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setError("");
    setNotice("");
  };

  const handleGoogle = () => {
    closeAuth();
    initiateGoogleOAuth();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      if (view === VIEW.SIGNIN) {
        await signInWithEmail(email, password);
        closeAuth();
      } else if (view === VIEW.SIGNUP) {
        const normalizedName = displayName.trim().replace(/\s+/g, " ");
        if (normalizedName) {
          const profanity = await checkTeamNameProfanity(normalizedName);
          if (!profanity.ok) {
            throw new Error(
              "Couldn't validate your display name right now. Please try again."
            );
          }
          if (profanity.profane) {
            throw new Error("Please choose a display name without profanity.");
          }
        }
        await signUpWithEmail(email, password, normalizedName || undefined);
        setNotice(
          "Account created. We've sent a verification link to your email. Check your spam folder if you don't see it."
        );
      } else if (view === VIEW.RESET) {
        await resetPassword(email);
        setNotice("Password reset email sent. Check your inbox — and your spam folder if you don't see it.");
      }
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    [VIEW.SIGNIN]: "Welcome back",
    [VIEW.SIGNUP]: "Create your account",
    [VIEW.RESET]: "Reset your password",
  };

  const subtitles = {
    [VIEW.SIGNIN]: "Sign in to save bookmarks and post drafts.",
    [VIEW.SIGNUP]: "Join to bookmark players and run the Expansion Draft.",
    [VIEW.RESET]: "We'll email you a secure reset link.",
  };

  const showPassword = view !== VIEW.RESET;

  const submitLabel = {
    [VIEW.SIGNIN]: "Sign in",
    [VIEW.SIGNUP]: "Create account",
    [VIEW.RESET]: "Send reset link",
  }[view];

  return (
    <div
      ref={backdropRef}
      onMouseDown={(e) => e.target === backdropRef.current && closeAuth()}
      className="app-modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm light:bg-black/30"
    >
      <div className="app-modal-panel liquid-glass-strong relative w-full max-w-md rounded-[32px] p-6 sm:p-8">
        <button
          type="button"
          onClick={closeAuth}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white light:text-slate-500 light:hover:bg-slate-900/10 light:hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-display text-white light:text-gray-900">
            {titles[view]}
          </h2>
          <p className="mt-1 text-sm text-gray-400 light:text-gray-500">
            {subtitles[view]}
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-4 rounded-[20px] border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300 light:text-amber-700">
            Firebase isn't configured yet. Add your REACT_APP_FIREBASE_* keys
            (see SETUP.md) to enable sign-in.
          </div>
        )}

        {(view === VIEW.SIGNIN || view === VIEW.SIGNUP) && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy || !isConfigured}
              className="flex w-full items-center justify-center gap-3 rounded-[26px] border border-white/15 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 light:border-slate-300 light:bg-white light:text-slate-900 light:hover:bg-slate-50"
            >
              <GoogleGlyph />
              Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
              <span className="h-px flex-1 bg-white/10 light:bg-slate-200" />
              or
              <span className="h-px flex-1 bg-white/10 light:bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {view === VIEW.SIGNUP && (
            <Field
              icon={UserIcon}
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={setDisplayName}
              autoComplete="name"
            />
          )}
          <Field
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />
          {showPassword && (
            <Field
              icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
              autoComplete={view === VIEW.SIGNUP ? "new-password" : "current-password"}
              required
            />
          )}

          {view === VIEW.SIGNIN && (
            <button
              type="button"
              onClick={() => {
                resetMessages();
                setView(VIEW.RESET);
              }}
              className="block text-right text-xs font-medium text-sky-300 hover:text-sky-200 light:text-sky-600 ml-auto"
            >
              Forgot password?
            </button>
          )}

          {error && (
            <p className="rounded-[18px] bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400 light:text-rose-600">
              {error}
            </p>
          )}
          {notice && (
            <p className="flex items-center gap-2 rounded-[18px] bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400 light:text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !isConfigured}
            className="btn-search-primary mt-2 flex w-full items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400 light:text-gray-500">
          {view === VIEW.SIGNIN && (
            <>
              New here?{" "}
              <Switcher onClick={() => setView(VIEW.SIGNUP)}>
                Create an account
              </Switcher>
            </>
          )}
          {view === VIEW.SIGNUP && (
            <>
              Already have an account?{" "}
              <Switcher onClick={() => setView(VIEW.SIGNIN)}>Sign in</Switcher>
            </>
          )}
          {view === VIEW.RESET && (
            <Switcher onClick={() => setView(VIEW.SIGNIN)}>
              Back to sign in
            </Switcher>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ icon: Icon, value, onChange, ...props }) => (
  <div className="relative">
    <Icon className="app-field-icon absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="app-field py-3.5 pl-12 pr-4 text-base text-white light:text-gray-900"
    />
  </div>
);

const Switcher = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-semibold text-sky-300 hover:text-sky-200 light:text-sky-600"
  >
    {children}
  </button>
);
