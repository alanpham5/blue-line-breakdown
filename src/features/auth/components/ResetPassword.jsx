import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const passwordRef = useRef(null);

  useEffect(() => {
    document.title = "Reset Password | Blue Line Breakdown";
    return () => { document.title = "Blue Line Breakdown"; };
  }, []);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setTokenInvalid(true);
    } else {
      setToken(t);
      passwordRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (success) {
      const id = setTimeout(() => navigate("/", { replace: true }), 3000);
      return () => clearTimeout(id);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.error || "Password reset failed.");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (tokenInvalid) {
    return (
      <div className="min-h-screen ice-background flex items-center justify-center px-4">
        <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md text-center">
          <XCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2 light:text-gray-900">Invalid reset link</p>
          <p className="text-gray-400 text-sm light:text-gray-500">
            This link is missing or invalid. Please request a new password reset from the sign-in screen.
          </p>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="mt-6 btn-search-primary"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen ice-background flex items-center justify-center px-4">
        <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2 light:text-gray-900">Password updated!</p>
          <p className="text-gray-400 text-sm light:text-gray-500">You can now sign in with your new password. Redirecting you home…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ice-background flex items-center justify-center px-4">
      <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 light:text-gray-900">
          Choose a new password
        </h1>
        <p className="text-sm text-gray-400 mb-6 light:text-gray-500">
          Must be at least 6 characters.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock className="app-field-icon absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              ref={passwordRef}
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              className="app-field py-3.5 pl-12 pr-4 text-base text-white light:text-gray-900"
            />
          </div>

          <div className="relative">
            <Lock className="app-field-icon absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="app-field py-3.5 pl-12 pr-4 text-base text-white light:text-gray-900"
            />
          </div>

          {error && (
            <p className="rounded-[18px] bg-rose-500/10 px-4 py-2.5 text-sm text-rose-400 light:text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-search-primary mt-2 flex w-full items-center justify-center gap-2"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Set new password
          </button>
        </form>
      </div>
    </div>
  );
};
