import { useState, useRef } from "react";

export const Slideshow = ({ slides, enablePageLoadAnimations = true }) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");

  const startX = useRef(0);
  const dragX = useRef(0);
  const isDragging = useRef(false);
  const frame = useRef(null);
  const imgRef = useRef(null);

  const SWIPE_THRESHOLD = 80;

  const changeSlide = (dir) => {
    if (isAnimating) return;

    setDirection(dir);
    setIsAnimating(true);

    setTimeout(() => {
      setCurrent((prev) =>
        dir === "next"
          ? (prev + 1) % slides.length
          : (prev - 1 + slides.length) % slides.length
      );
    }, 200);

    setTimeout(() => {
      setIsAnimating(false);
    }, 400);
  };

  const onStart = (x) => {
    startX.current = x;
    dragX.current = 0;
    isDragging.current = true;
    cancelAnimationFrame(frame.current);

    if (imgRef.current) {
      imgRef.current.style.transition = "none";
    }
  };

  const onMove = (x) => {
    if (!isDragging.current || !imgRef.current) return;

    dragX.current = x - startX.current;

    frame.current = requestAnimationFrame(() => {
      imgRef.current.style.transform = `translateX(${dragX.current}px)`;
    });
  };

  const snapBack = () => {
    if (!imgRef.current) return;
    imgRef.current.style.transition = "transform 0.3s ease";
    imgRef.current.style.transform = "translateX(0)";
  };

  const onEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const delta = dragX.current;

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) changeSlide("next");
      else changeSlide("prev");
    } else {
      snapBack();
    }
  };

  return (
    <div
      className={`liquid-glass-strong rounded-2xl p-4 sm:p-6 ${
        enablePageLoadAnimations ? "liquid-glass-animate" : ""
      } w-full h-full flex flex-col`}
    >
      <div className="flex flex-col flex-1 min-h-0 items-center gap-3">
        <div className="w-full flex-[1_1_0%] min-h-0 flex items-center justify-center">
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
            onTouchStart={(e) => {
              e.preventDefault();
              onStart(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              onMove(e.touches[0].clientX);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onEnd();
            }}
            onMouseDown={(e) => onStart(e.clientX)}
            onMouseMove={(e) => isDragging.current && onMove(e.clientX)}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
          >
            <img
              ref={imgRef}
              key={current}
              src={slides[current].src}
              alt={slides[current].desc}
              draggable={false}
              className={`
                w-full h-full object-contain rounded-lg
                transition-all duration-300 ease-out
                ${
                  isAnimating
                    ? direction === "next"
                      ? "opacity-0 translate-x-6"
                      : "opacity-0 -translate-x-6"
                    : "opacity-100 translate-x-0"
                }
              `}
            />
          </div>
        </div>

        <div className="h-100 flex items-center overflow-hidden">
          <p
            key={current}
            className={`
              text-white light:text-gray-900 text-center text-base sm:text-xl leading-snug
              transition-all duration-300 ease-out
              ${
                isAnimating
                  ? "opacity-0 translate-y-2"
                  : "opacity-100 translate-y-0"
              }
            `}
          >
            {slides[current].desc}
          </p>
        </div>

        <div className="h-[3.25rem] flex items-center gap-4">
          <button
            onClick={() => changeSlide("prev")}
            className="px-5 py-2 bg-white/20 light:bg-gray-200/80 text-white light:text-gray-900 rounded-full hover:bg-white/30 light:hover:bg-gray-300 transition"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-4 h-4 rounded-full transition ${
                  current === idx ? "bg-white light:bg-gray-800" : "bg-white/30 light:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => changeSlide("next")}
            className="px-5 py-2 bg-white/20 light:bg-gray-200/80 text-white light:text-gray-900 rounded-full hover:bg-white/30 light:hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
