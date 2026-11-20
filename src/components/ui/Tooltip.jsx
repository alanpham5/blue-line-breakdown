import { useEffect, useState, useRef, cloneElement } from "react";
import { createPortal } from "react-dom";
import { useTooltipManager } from "providers/TooltipContext";
export function Tooltip({
  id,
  content,
  position = "top",
  width = "w-56",
  offset = 8,
  children,
  forceDark = false,
  interactive = false,
}) {
  const { openId, setOpenId } = useTooltipManager();
  const open = openId === id;
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const closeTimer = useRef(null);
  const show = () => {
    clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const hide = () => {
    clearTimeout(closeTimer.current);
    if (!interactive) {
      setOpenId(null);
      return;
    }
    closeTimer.current = setTimeout(() => setOpenId(null), 150);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
  });
  useEffect(() => {
    if (!open || !triggerRef.current || !tooltipRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const tip = tooltipRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;
    if (position === "top") {
      top = t.top - tip.height - offset;
      left = t.left + t.width / 2 - tip.width / 2;
    }
    if (position === "bottom") {
      top = t.bottom + offset;
      left = t.left + t.width / 2 - tip.width / 2;
    }
    const pad = 8;
    left = Math.max(pad, Math.min(left, window.innerWidth - tip.width - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - tip.height - pad));
    setCoords({
      top,
      left,
    });
  }, [open, position, offset]);
  useEffect(() => {
    if (!open) return;
    const close = () => setOpenId(null);
    window.addEventListener("scroll", close, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", close);
  }, [open]);
  const child = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
    onClick: show,
    "aria-describedby": open ? `${id}-content` : undefined,
  });
  return (
    <>
      {child}
      {open &&
        createPortal(
          <div
            id={`${id}-content`}
            ref={tooltipRef}
            role="tooltip"
            onMouseEnter={interactive ? show : undefined}
            onMouseLeave={interactive ? hide : undefined}
            className={`
              fixed z-[999999]
              ${width}
              ${interactive ? "" : "pointer-events-none"} rounded-2xl border p-3 text-xs shadow-lg
              border backdrop-blur-sm
              bg-[#17181b]/95 border-white/10 text-gray-200
              ${forceDark ? "" : "light:bg-white/95 light:border-slate-200 light:text-gray-700 light:shadow-xl"}
            `}
            style={{
              top: coords.top,
              left: coords.left,
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
