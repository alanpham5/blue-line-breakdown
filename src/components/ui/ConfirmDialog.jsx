import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDialogFocus } from "hooks/useDialogFocus";
export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}) => {
  const panelRef = useDialogFocus(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onCancel}
        className="app-modal-backdrop absolute inset-0 bg-black/60"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="app-modal-panel relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1220]/95 p-5 text-white shadow-2xl backdrop-blur light:border-slate-200 light:bg-white"
      >
        <h3 className="text-lg font-extrabold tracking-display text-white light:text-gray-900">
          {title}
        </h3>
        {message && (
          <p className="mt-2 text-sm text-gray-300 light:text-gray-600">
            {message}
          </p>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 light:border-slate-200 light:bg-white light:text-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-extrabold transition-colors ${destructive ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/20 light:text-rose-600" : "bg-sky-500/15 text-sky-300 hover:bg-sky-500/20 light:text-sky-600"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
