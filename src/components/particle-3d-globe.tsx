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
  numParticles = 300,
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

  const rotate3D = useCallback((x: number, y: number, z: number, rx: number, ry: number, rz: number) => {
    // Rotate around X axis
    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotate around Y axis
    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    // Rotate around Z axis
    const cosZ = Math.cos(rz);
    const sinZ = Math.sin(rz);
    const x3 = x2 * cosZ - y1 * sinZ;
    const y3 = x2 * sinZ + y1 * cosZ;

    return { x: x3, y: y3, z: z2 };
  }, []);

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
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

         // Update time
     timeRef.current += 0.032;

    // Mouse influence
    const mouseInfluence = mouseRef.current.inside ? 0.3 : 0;
    const mouseX = (mouseRef.current.x / canvas.width) * 2 - 1;
    const mouseY = (mouseRef.current.y / canvas.height) * 2 - 1;

    // Sort particles by Z for proper depth rendering
    const sortedParticles = [...particlesRef.current].sort((a, b) => b.z - a.z);

    sortedParticles.forEach((particle) => {
             // Apply mouse influence based on interaction type
       if (mouseRef.current.inside) {
         const dx = particle.x - mouseX * 50;
         const dy = particle.y - mouseY * 50;
         const distance = Math.sqrt(dx * dx + dy * dy);
         const influence = Math.exp(-distance / 15) * mouseInfluence;
        
        if (interactionType === 'repel') {
          // Repel particles away from mouse
          particle.vx += dx * influence * 0.001;
          particle.vy += dy * influence * 0.001;
        } else if (interactionType === 'attract') {
          // Attract particles toward mouse
          particle.vx -= dx * influence * 0.001;
          particle.vy -= dy * influence * 0.001;
                 } else if (interactionType === 'both') {
           // Alternate between attract and repel based on distance
           const attractThreshold = 25;
           if (distance < attractThreshold) {
            // Attract when close
            particle.vx -= dx * influence * 0.001;
            particle.vy -= dy * influence * 0.001;
          } else {
            // Repel when far
            particle.vx += dx * influence * 0.001;
            particle.vy += dy * influence * 0.001;
          }
        }
      }

      // Add subtle movement
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;

                    // No rotation - particles stay in their current positions
       const projected = project3D(particle.x, particle.y, particle.z, distance);

      // Draw particle
      if (projected.scale > 0.1) {
        const x = centerX + projected.x;
        const y = centerY + projected.y;
        const size = particle.size * projected.scale;

        ctx.save();
        ctx.globalAlpha = particle.alpha * projected.scale;
        
        // Draw bitmap-style particle (square with rounded corners)
        const particleSize = Math.max(1, size);
        const cornerRadius = particleSize * 0.2;
        
        // Create bitmap effect with sharp edges
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        
        // Draw rounded rectangle for bitmap look
        const halfSize = particleSize / 2;
        ctx.roundRect(x - halfSize, y - halfSize, particleSize, particleSize, cornerRadius);
        ctx.fill();
        
        // Add subtle inner highlight for depth
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.roundRect(x - halfSize + 1, y - halfSize + 1, particleSize - 2, particleSize - 2, cornerRadius);
        ctx.fill();
        
        ctx.restore();
      }
      


             // Return particles to original position gradually when not interacting
       if (!mouseRef.current.inside) {
         const returnSpeed = 0.08;
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
       particle.vx *= 0.99;
       particle.vy *= 0.99;
       particle.vz *= 0.99;
    });

         animationRef.current = requestAnimationFrame(animate);
   }, [rotationSpeed, rotate3D, project3D, interactionType]);

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
    
    // Polyfill for roundRect if not supported
    if (!ctx.roundRect) {
      ctx.roundRect = function(x: number, y: number, width: number, height: number, radius: number) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }
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
