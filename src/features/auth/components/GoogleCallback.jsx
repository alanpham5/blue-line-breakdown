import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { completeGoogleOAuth } from "lib/firebase/auth";

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Signing in… | Blue Line Breakdown";
    return () => { document.title = "Blue Line Breakdown"; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const customToken = params.get("customToken");
    const returnedState = params.get("state");
    const oauthError = params.get("error");

    if (oauthError) {
      if (oauthError === "access_denied") {
        navigate("/", { replace: true });
        return;
      }
      setError("Google sign-in was cancelled or failed. Please try again.");
      return;
    }

    if (!customToken) {
      setError("Sign-in failed — no session token received. Please try again.");
      return;
    }

    const savedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");

    if (savedState && returnedState !== savedState) {
      setError("Invalid sign-in state. Please try again.");
      return;
    }

    completeGoogleOAuth(customToken)
      .then(() => navigate("/", { replace: true }))
      .catch((err) => setError(err.message || "Sign-in failed. Please try again."));
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen ice-background flex items-center justify-center px-4">
        <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md text-center">
          <XCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2 light:text-gray-900">Sign-in failed</p>
          <p className="text-gray-400 text-sm mb-6 light:text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="btn-search-primary"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ice-background flex items-center justify-center px-4">
      <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md text-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400 mx-auto mb-4" />
        <p className="text-white font-semibold text-lg light:text-gray-900">Signing you in…</p>
      </div>
    </div>
  );
};
