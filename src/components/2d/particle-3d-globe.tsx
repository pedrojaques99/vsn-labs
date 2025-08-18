"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  alpha: number;
  color: string;
}

interface Particle3DGlobeProps {
  numParticles?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  interactionType?: 'repel' | 'attract' | 'both';
  className?: string;
}

export default function Particle3DGlobe({
  numParticles = 150,
  rotationSpeed = 0.5,
  interactive = true,
  interactionType = 'repel',
  className = "w-full h-[100vh] rounded-2xl overflow-hidden"
}: Particle3DGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0, inside: false });
  const timeRef = useRef(0);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const particles: Particle[] = [];
    const radius = Math.min(canvas.width, canvas.height) * 0.25;

    for (let i = 0; i < numParticles; i++) {
      // Generate particles in a spherical distribution
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particles.push({
        x,
        y,
        z,
        originalX: x,
        originalY: y,
        originalZ: z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.6 + 0.4,
        color: "#ffffff"
      });
    }

    particlesRef.current = particles;
  }, [numParticles]);

  const project3D = useCallback((x: number, y: number, z: number, distance: number) => {
    const scale = distance / (distance + z);
    return {
      x: x * scale,
      y: y * scale,
      scale: scale
    };
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const distance = 1000;

    // Clear canvas with trail effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update time
    timeRef.current += 0.032;

    // Mouse influence
    const mouseInfluence = mouseRef.current.inside ? 0.3 : 0;
    const mouseX = (mouseRef.current.x / canvas.width) * 2 - 1;
    const mouseY = (mouseRef.current.y / canvas.height) * 2 - 1;

    // Sort particles by Z for proper depth rendering
    const sortedParticles = particlesRef.current.slice().sort((a, b) => b.z - a.z);

    sortedParticles.forEach((particle) => {
      // Apply mouse influence based on interaction type
      if (mouseRef.current.inside) {
        const dx = particle.x - mouseX * 50;
        const dy = particle.y - mouseY * 50;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.exp(-dist / 15) * mouseInfluence;
        
        if (interactionType === 'repel') {
          particle.vx += dx * influence * 0.001;
          particle.vy += dy * influence * 0.001;
        } else if (interactionType === 'attract') {
          particle.vx -= dx * influence * 0.001;
          particle.vy -= dy * influence * 0.001;
        }
      }

      // Add movement
      particle.x += particle.vx * rotationSpeed;
      particle.y += particle.vy * rotationSpeed;
      particle.z += particle.vz * rotationSpeed;

      const projected = project3D(particle.x, particle.y, particle.z, distance);

      // Draw particle
      if (projected.scale > 0.1) {
        const x = centerX + projected.x;
        const y = centerY + projected.y;
        const size = particle.size * projected.scale;

        ctx.save();
        ctx.globalAlpha = particle.alpha * projected.scale;
        
        // Draw bitmap-style particle
        const particleSize = Math.max(1, size);
        
        ctx.fillStyle = particle.color;
        ctx.fillRect(x - particleSize/2, y - particleSize/2, particleSize, particleSize);
        
        // Add subtle inner highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x - particleSize/2 + 1, y - particleSize/2 + 1, particleSize - 2, particleSize - 2);
        
        ctx.restore();
      }
      
      // Return particles to original position gradually
      if (!mouseRef.current.inside) {
        const returnSpeed = 0.12;
        particle.x += (particle.originalX - particle.x) * returnSpeed;
        particle.y += (particle.originalY - particle.y) * returnSpeed;
        particle.z += (particle.originalZ - particle.z) * returnSpeed;
      }
      
      // Reset particle position if it goes too far
      if (Math.abs(particle.x) > 200 || Math.abs(particle.y) > 150 || Math.abs(particle.z) > 200) {
        particle.x = particle.originalX;
        particle.y = particle.originalY;
        particle.z = particle.originalZ;
      }

      // Dampen velocity
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.vz *= 0.98;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [rotationSpeed, project3D, interactionType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    initParticles();

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

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("resize", resize);
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      window.removeEventListener("resize", resize);
    };
  }, [initParticles, animate, interactive]);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="h-full w-full block cursor-pointer"
        style={{ background: "#000000" }}
      />
    </div>
  );
}
