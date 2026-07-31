import { useEffect, useRef, useCallback, useState } from "react";
import { X, Download, Share } from "lucide-react";
import html2canvas from "html2canvas";
import { useIsMobile } from "hooks/useIsMobile";
import { shareImage, getShareUrl } from "utils/shareCard";
export const ShareableModal = ({ isOpen, onClose, fileName, children }) => {
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(() =>
    typeof window === "undefined"
      ? 1
      : Math.min(1, (window.innerWidth - 32) / 1200)
  );
  const [naturalSize, setNaturalSize] = useState(null);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const measure = () =>
      setNaturalSize({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const fit = () => {
      const cardWidth = naturalSize?.width || 1200;
      const available = window.innerWidth - 32;
      setPreviewScale(Math.min(1, available / cardWidth));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [isOpen, naturalSize]);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
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
  const generateImage = async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const node = contentRef.current;
    const wrapper = node.parentElement;
    const scaled = previewScale !== 1;
    const prevNodeTransform = node.style.transform;
    const prevWrapperStyle = wrapper.getAttribute("style") || "";
    if (scaled) {
      node.style.transform = "none";
      wrapper.style.cssText =
        "position: fixed; left: -100000px; top: 0; width: auto; height: auto; overflow: visible;";
    }
    const ctxProto = CanvasRenderingContext2D.prototype;
    const origCreatePattern = ctxProto.createPattern;
    ctxProto.createPattern = function (image, repetition) {
      const w = image && (image.width ?? image.naturalWidth ?? image.videoWidth);
      const h =
        image && (image.height ?? image.naturalHeight ?? image.videoHeight);
      if (!w || !h) return null;
      return origCreatePattern.call(this, image, repetition);
    };
    try {
      const canvas = await html2canvas(node, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#000000",
        scale: 2,
        logging: false,
        windowWidth: 1280,
        windowHeight: node.offsetHeight,
        onclone: (clonedDoc) => {
          clonedDoc
            .querySelector(".shareable-modal-content")
            ?.classList.add("shareable-export");
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * {
              animation-delay: 0s !important;
              animation-duration: 0s !important;
              animation-iteration-count: 1 !important;
              transition-delay: 0s !important;
              transition-duration: 0s !important;
            }
            .shareable-modal-content,
            .percentile-bar-container {
              opacity: 1 !important;
              transform: none !important;
            }
            .shareable-modal-preview {
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
            }
            .shareable-display-dark,
            .shareable-display-dark > div {
              overflow: visible !important;
            }
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
      return canvas.toDataURL("image/png");
    } finally {
      ctxProto.createPattern = origCreatePattern;
      if (scaled) {
        node.style.transform = prevNodeTransform;
        wrapper.setAttribute("style", prevWrapperStyle);
      }
    }
  };
  const downloadImage = (dataUrl) => {
    const link = document.createElement("a");
    link.download = `${fileName || "shareable"}.png`;
    link.href = dataUrl;
    link.click();
  };
  const handleDownload = async () => {
    if (!contentRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      downloadImage(await generateImage());
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setIsDownloading(false);
    }
  };
  const handleShare = async () => {
    if (!contentRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await generateImage();
      const shared = await shareImage({
        dataUrl,
        fileName: fileName || "Blue Line Breakdown",
        text: getShareUrl(),
      });
      if (!shared) downloadImage(dataUrl);
    } catch (err) {
      console.error("Error sharing image:", err);
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
            {isMobile ? (
              <button
                onClick={handleShare}
                disabled={isDownloading}
                className="shareable-modal-btn shareable-modal-btn-download"
              >
                <Share className="h-4 w-4" />
                <span>{isDownloading ? "Preparing..." : "Share"}</span>
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="shareable-modal-btn shareable-modal-btn-download"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? "Downloading..." : "Download PNG"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="shareable-modal-btn shareable-modal-btn-close"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div
            className="shareable-modal-preview"
            style={{
              width: (naturalSize?.width || 1200) * previewScale,
              height: naturalSize
                ? naturalSize.height * previewScale
                : undefined,
            }}
          >
            <div
              ref={contentRef}
              className="shareable-modal-content"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
