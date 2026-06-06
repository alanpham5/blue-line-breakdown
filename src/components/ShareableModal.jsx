import { useEffect, useRef, useCallback, useState } from "react";
import { X, Download } from "lucide-react";
import html2canvas from "html2canvas";

export const ShareableModal = ({ isOpen, onClose, fileName, children }) => {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
      document.body.classList.add("shareable-modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("shareable-modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("shareable-modal-open");
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

  const handleDownload = async () => {
    if (!contentRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure images have finished layout/loading
      await new Promise((resolve) => setTimeout(resolve, 150));

      const canvas = await html2canvas(contentRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#000000",
        scale: 2, // high quality export
        logging: false,
        onclone: (clonedDoc) => {
          clonedDoc
            .querySelector(".shareable-modal-content")
            ?.classList.add("shareable-export");

          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            /* Disable animations and transitions */
            * {
              animation-delay: 0s !important;
              animation-duration: 0s !important;
              animation-iteration-count: 1 !important;
              transition-delay: 0s !important;
              transition-duration: 0s !important;
            }
            /* Force fully visible and final states for animated elements */
            .shareable-modal-content,
            .percentile-bar-container {
              opacity: 1 !important;
              transform: none !important;
            }
            /* Prevent rotated sidebar title clipping by allowing overflow during screenshotting */
            .shareable-display-dark,
            .shareable-display-dark > div {
              overflow: visible !important;
            }
            /* html2canvas paints text lower than the browser preview. Keep the
               live modal naturally centered and compensate only in the clone. */
            .shareable-export .shareable-display-dark :is(h1, h2, h3, h4, p, span, .truncate) {
              transform: translateY(-2px) !important;
            }
            .shareable-export .shareable-card-title-icon {
              transform: none !important;
            }
            .shareable-export .shareable-card-title-text {
              position: relative !important;
              top: -5px !important;
              transform: none !important;
            }
            .shareable-export .shareable-bio-container {
              transform: translateY(2px) !important;
            }
            .shareable-export .shareable-bio-value {
              position: relative !important;
              top: -1px !important;
              transform: none !important;
            }
            .shareable-export .shareable-war-score {
              position: relative !important;
              top: -6px !important;
              transform: none !important;
            }
            .shareable-export .shareable-pill-text,
            .shareable-export .shareable-similarity-score {
              transform: translateY(-1.5px) !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${fileName || "shareable"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

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
              onClick={handleDownload}
              disabled={isDownloading}
              className="shareable-modal-btn shareable-modal-btn-download"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? "Downloading..." : "Download PNG"}</span>
            </button>
            <button
              onClick={onClose}
              className="shareable-modal-btn shareable-modal-btn-close"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div ref={contentRef} className="shareable-modal-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
