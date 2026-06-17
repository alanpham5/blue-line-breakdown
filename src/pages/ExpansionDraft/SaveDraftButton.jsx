import { Check, Loader2, Save } from "lucide-react";

const COPY = {
  progress: {
    save: "Save draft progress",
    signIn: "Sign in to save progress",
    saved: "Draft progress saved",
  },
  complete: {
    save: "Save franchise to account",
    signIn: "Sign in to save franchise",
    saved: "Franchise saved to your account",
  },
};

// Explicit save control for expansion drafts. `mode` distinguishes in-progress
// picks from a completed, analyzed franchise.
export const SaveDraftButton = ({
  mode = "complete",
  user,
  saved,
  saveState,
  saveError,
  onSave,
}) => {
  const labels = COPY[mode] || COPY.complete;

  if (saved) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-[18px] border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 light:text-emerald-700">
        <Check className="h-4 w-4 shrink-0" /> {labels.saved}
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={onSave}
        disabled={saveState === "saving"}
        className="btn-search-primary inline-flex w-full items-center justify-center gap-2"
      >
        {saveState === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {user ? labels.save : labels.signIn}
      </button>
      {saveState === "error" && (
        <p className="mt-1.5 text-xs text-rose-400">
          {saveError || "Couldn't save. Please try again."}
        </p>
      )}
    </div>
  );
};
