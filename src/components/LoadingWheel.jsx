import React, { useRef, useEffect } from "react";

export const LoadingWheel = ({ size = 650, actualTheme = "dark" }) => {
  const canvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const padding = size * 0.15;
    const W = size + padding * 2;
    const H = size + padding * 2;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2;
    const cy = H / 2;

    const trailCanvas = document.createElement("canvas");
    trailCanvas.width = W;
    trailCanvas.height = H;
    const tctx = trailCanvas.getContext("2d");
    trailCanvasRef.current = tctx;

    const radius = size * 0.37;
    const speed = 0.01;

    function clear() {
      ctx.clearRect(0, 0, W, H);
    }

    function fadeTrail() {
      tctx.globalCompositeOperation = "destination-out";
      tctx.fillStyle = "rgba(0,0,0,0.012)";
      tctx.fillRect(0, 0, W, H);
      tctx.globalCompositeOperation = "lighter";
    }

    function drawZamboni(x, y, rot) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);

      const scale = size / 200;
      ctx.scale(-scale, scale);

      ctx.fillStyle = "#4fa3d1";
      ctx.beginPath();
      ctx.roundRect(5, -12, 30, 35, 8);
      ctx.fill();

      ctx.fillStyle = "#f2f4f7";
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-40, -16, 65, 40, 8);
      ctx.fill();
      ctx.stroke();

      // Vents on blue back
      ctx.strokeStyle = "#cfe8f3";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(18, -8 + i * 6);
        ctx.lineTo(30, -8 + i * 6);
        ctx.stroke();
      }

      ctx.fillStyle = "#999";
      ctx.beginPath();
      ctx.roundRect(30, -16, 6, 45, 4);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,200,0.9)";
      ctx.beginPath();
      ctx.arc(-42, -8, 3, 0, Math.PI * 2);
      ctx.arc(-42, 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawTrail(x, y, rot = 0) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      tctx.save();
      tctx.globalAlpha = 0.07;

      const isDark = actualTheme === "dark";

      const innerColor = isDark
        ? "rgba(255,255,255,0.5)"
        : "rgb(171, 214, 250)";

      const outerColor = isDark
        ? "rgba(128, 202, 255, 0.34)"
        : "rgba(156, 198, 235, 0.85)";

      const trailOffset = size * 0.02;
      const tx = x - trailOffset * Math.cos(rot);
      const ty = y - trailOffset * Math.sin(rot);

      const trailRadius = size * 0.06;

      const g = tctx.createRadialGradient(
        tx,
        ty,
        size * 0.02,
        tx,
        ty,
        trailRadius
      );

      g.addColorStop(0, innerColor);
      g.addColorStop(1, outerColor);

      tctx.fillStyle = g;
      tctx.beginPath();
      tctx.arc(tx, ty, trailRadius, 0, Math.PI * 2);
      tctx.fill();
      tctx.restore();
    }

    function animate() {
      clear();

      fadeTrail();

      ctx.drawImage(trailCanvas, 0, 0);

      const angle = angleRef.current;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      const rot = angle + Math.PI / 2;

      drawTrail(x, y);
      drawZamboni(x, y, rot);

      angleRef.current += speed;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationRef.current);
  }, [size, actualTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        background: "transparent",
        borderRadius: "50%",
      }}
    />
  );
};
