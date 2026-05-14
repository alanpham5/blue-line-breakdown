import { useEffect, useState, useRef, cloneElement } from "react";
import { createPortal } from "react-dom";
import { useTooltipManager } from "../providers/TooltipContext";

export function Tooltip({
  id,
  content,
  position = "top",
  width = "w-56",
  offset = 8,
  children,
  forceDark = false,
}) {
  const { openId, setOpenId } = useTooltipManager();
  const open = openId === id;

  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

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

    setCoords({ top, left });
  }, [open, position, offset]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpenId(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

  const child = cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: () => setOpenId(id),
    onMouseLeave: () => setOpenId(null),
    onClick: () => setOpenId(open ? null : id),
  });

  return (
    <>
      {child}
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`
              fixed z-[999999]
              ${width}
              pointer-events-none rounded-2xl border p-3 text-xs shadow-lg
              border backdrop-blur-sm
              bg-[#17181b]/95 border-white/10 text-gray-200
              ${forceDark ? "" : "light:bg-white/95 light:border-slate-200 light:text-gray-700 light:shadow-xl"}
            `}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}
