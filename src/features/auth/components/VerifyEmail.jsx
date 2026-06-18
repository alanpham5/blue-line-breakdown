import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "Verify Email | Blue Line Breakdown";
    return () => { document.title = "Blue Line Breakdown"; };
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("No verification token found. Please use the link from your email.");
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json.error || "Verification failed.");
        return json;
      })
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/", { replace: true }), 3000);
      })
      .catch((err) => {
        setMessage(err.message);
        setStatus("error");
      });
  }, [navigate]);

  return (
    <div className="min-h-screen ice-background flex items-center justify-center px-4">
      <div className="liquid-glass-strong rounded-[32px] p-8 sm:p-10 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-sky-400 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg light:text-gray-900">Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
            <p className="text-white font-bold text-xl mb-2 light:text-gray-900">Email verified!</p>
            <p className="text-gray-400 text-sm light:text-gray-500">Your account is now fully active. Redirecting you home…</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 text-rose-400 mx-auto mb-4" />
            <p className="text-white font-bold text-xl mb-2 light:text-gray-900">Verification failed</p>
            <p className="text-gray-400 text-sm light:text-gray-500">{message}</p>
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="mt-6 btn-search-primary"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  );
};
