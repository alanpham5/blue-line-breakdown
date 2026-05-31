import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

export const ShareableModal = ({
  isOpen,
  onClose,
  children,
}) => {
  const backdropRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="shareable-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="shareable-modal-scroll-area">
        <div className="shareable-modal-container">
          <div className="shareable-modal-controls">
            <button
              onClick={onClose}
              className="shareable-modal-btn shareable-modal-btn-close"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="shareable-modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
