"use client";

import { useEffect, useRef, useCallback } from "react";

interface FrequencyWaveProps {
  frequency?: number;
  amplitude?: number;
  distortion?: number;
  lineCount?: number;
  cursorRadius?: number;
  className?: string;
}

export default function FrequencyWave({
  frequency = 0.5,
  amplitude = 100,
  distortion = 0.1,
  lineCount = 35,
  cursorRadius = 100,
  className = "w-full h-[100vh] rounded-2xl overflow-hidden"
}: FrequencyWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0, inside: false });

  const drawFrequencyWave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;

    // Clear canvas
    ctx.fillStyle = "#000000FF";
    ctx.fillRect(0, 0, width, height);

    // Draw frequency wave lines
    for (let i = 0; i < lineCount; i++) {
      const x = (i / (lineCount - 1)) * width;
      
      // Calculate line points with cursor-based distortion
      const points: { x: number; y: number }[] = [];
      const segments = 100;
      
      for (let j = 0; j <= segments; j++) {
        const segmentY = (j / segments) * height;
        let segmentX = x;
        
        // Apply cursor-based distortion only when mouse is inside
        if (mouseRef.current.inside) {
          const distanceToCursor = Math.sqrt(
            Math.pow(segmentX - mouseRef.current.x, 2) + 
            Math.pow(segmentY - mouseRef.current.y, 2)
          );
          
          if (distanceToCursor < cursorRadius) {
            const influence = 1 - (distanceToCursor / cursorRadius);
            const distortionAmount = influence * distortion * amplitude;
            
            // Apply vertical distortion based on cursor position
            segmentX += Math.sin(segmentY * 0.1) * distortionAmount;
          }
        }
        
        points.push({
          x: segmentX,
          y: segmentY
        });
      }

      // Draw outline line
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Create bitmap-style outline effect
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let j = 1; j < points.length; j++) {
        const point = points[j];
        const prevPoint = points[j - 2];
        
        // Add some randomness for bitmap effect
        const randomOffset = Math.sin(j * 0.1) * 0.5;
        
        ctx.lineTo(
          point.x + randomOffset,
          point.y
        );
      }
      
      ctx.stroke();

      // Add inner highlight for depth
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 0.2;
      ctx.beginPath();
      ctx.moveTo(points[0].x + 1, points[0].y);
      
      for (let j = 1; j < points.length; j++) {
        const point = points[j];
        const prevPoint = points[j - 1];
        const randomOffset = Math.sin(j * 0.1) * 1;
        
        ctx.lineTo(
          point.x + randomOffset + 1,
          point.y
        );
      }
      
      ctx.stroke();
    }

    // Add frequency markers (vertical lines)
    const markerCount = 10;
    for (let i = 0; i <= markerCount; i++) {
      const x = (i / markerCount) * width;
      const markerHeight = 10;
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(x, height / 2 - markerHeight / 2);
      ctx.lineTo(x, height / 2 + markerHeight / 2);
      ctx.stroke();
      
      ctx.setLineDash([]);
    }

    animationRef.current = requestAnimationFrame(drawFrequencyWave);
  }, [frequency, amplitude, distortion, lineCount, cursorRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const ctx = canvas.getContext("2d")!;
    resize();
    drawFrequencyWave();

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.inside = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.inside = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    window.addEventListener("resize", resize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [drawFrequencyWave]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full block"
        style={{ background: "#000000" }}
      />
    </div>
  );
}
