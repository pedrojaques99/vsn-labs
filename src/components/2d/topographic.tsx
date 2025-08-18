"use client";
import { useEffect, useRef } from "react";

type Props = {
  contourDensity?: number;
  lineThickness?: number;
  bg?: string;
  fg?: string;
  className?: string;
};

export default function Topographic({
  contourDensity = 2,
  lineThickness = 0.1,
  bg = "#000000",
  fg = "#1D1D1D",
  className = "w-full h-[100vh] rounded-2xl overflow-hidden"
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef<{x: number; y: number; inside: boolean}>({x: 0, y: 0, inside: false});

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    const wrap = wrapRef.current!;

    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(width * DPR));
      canvas.height = Math.max(2, Math.floor(height * DPR));
    }

    // simple noise function
    const noise = (x: number, y: number, t: number) => {
      return (Math.sin(x * 2.5 + t * 0.1) * Math.sin(y * 2.5 + t * 0.1) + 1) * 0.5;
    };

    // mouse influence
    const mouseInfluence = (x: number, y: number) => {
      if (!mouse.current.inside) return 0;
      
      const mx = (mouse.current.x / canvas.width) * 2 - 1;
      const my = (mouse.current.y / canvas.height) * 2 - 1;
      
      const dx = x - mx;
      const dy = y - my;
      const r2 = dx * dx + dy * dy;
      
      return Math.exp(-8 * r2);
    };

    function draw() {
      const W = canvas.width, H = canvas.height;
      const t = Date.now() * 0.001;

      // clear background
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // get image data
      const img = ctx.getImageData(0, 0, W, H);
      const data = img.data;

      // parse colors
      const fr = parseInt(fg.slice(1, 3), 16);
      const fgG = parseInt(fg.slice(3, 5), 16);
      const fb = parseInt(fg.slice(5, 7), 16);

      for (let j = 0; j < H; j++) {
        for (let i = 0; i < W; i++) {
          const x = i / W;
          const y = j / H;

          // generate elevation
          let elevation = noise(x * 10, y * 10, t);
          elevation += mouseInfluence(x * 2 - 1, y * 2 - 1);
          
          // create contour lines
          const contourValue = elevation * contourDensity;
          const contourLine = 0.5 + 0.5 * Math.cos(contourValue * Math.PI * 2);
          
          // line mask
          const mask = contourLine > (1.0 - lineThickness) ? 1 : 0;

          const idx = (j * W + i) * 4;
          data[idx] = fr * mask;
          data[idx + 1] = fgG * mask;
          data[idx + 2] = fb * mask;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);
      raf = requestAnimationFrame(draw);
    }

    // mouse events
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) * (canvas.width / rect.width);
      mouse.current.y = (e.clientY - rect.top) * (canvas.height / rect.height);
      mouse.current.inside = true;
    };
    
    const onLeave = () => { mouse.current.inside = false; };

    // setup
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [bg, fg, contourDensity, lineThickness]);

  return (
    <div ref={wrapRef} className={className}>
      <canvas ref={canvasRef} className="h-full w-full block" />
    </div>
  );
}
