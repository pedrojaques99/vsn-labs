'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
}

interface ParticleGlitchProps {
  numParticles?: number
  showCursor?: boolean
  interactive?: boolean
}

export function ParticleGlitch({ 
  numParticles = 200, 
  showCursor = true, 
  interactive = true 
}: ParticleGlitchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: 0, y: 0 })

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const particles: Particle[] = []

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        size: Math.random() * 2 + 1
      })
    }

    particlesRef.current = particles
  }, [numParticles])

  const drawBitmapLine = useCallback((ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha: number) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const steps = Math.floor(distance / 8) // Bitmap spacing
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t
      const y = y1 + (y2 - y1) * t
      
      // Bitmap pattern
      if (i % 2 === 0) {
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#444444'
        ctx.fillRect(x - 1, y - 1, 2, 2)
        ctx.restore()
      }
    }
  }, [])

  const drawGlitchedBitmapLine = useCallback((ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, alpha: number, time: number, distortion: number) => {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const steps = Math.floor(distance / 6) // Denser bitmap for glitch
    const glitchIntensity = Math.max(0, 1 - distortion / 120)
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      let x = x1 + (x2 - x1) * t
      let y = y1 + (y2 - y1) * t
      
      // Apply glitch distortion
      const glitch = Math.sin(time * 10 + i * 0.5) * glitchIntensity
      const digitalNoise = (Math.random() - 0.5) * glitchIntensity
      
      x += glitch * 8 + digitalNoise * 4
      y += Math.cos(time * 8 + i * 0.3) * glitchIntensity * 6 + digitalNoise * 3
      
      // Random bitmap pattern with glitch colors
      if (Math.random() > 0.3) {
        ctx.save()
        ctx.globalAlpha = alpha * (0.5 + glitchIntensity * 0.5)
        
        // Glitch colors
        const colors = ['#52ddeb', '#C6F6FAFF', '#52ddeb', '#F6FEFFFF', '#83F5FFFF']
        const color = glitchIntensity > 0.1 ? colors[Math.floor(Math.random() * colors.length)] : '#52ddeb'
        
        ctx.fillStyle = color
        const size = 1 + glitchIntensity * 4
        ctx.fillRect(x - size/20, y - size/20, size, size)
        ctx.restore()
      }
    }
  }, [])

  const drawBitmapLines = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current
    const maxDistance = 100
    const mouse = mouseRef.current
    const time = Date.now() * 0.001

    particles.forEach((particle, i) => {
      // Conectar partículas próximas com bitmap particles
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.15
          
          // Calcular distância média da linha ao mouse para glitch
          const midX = (particle.x + other.x) / 2
          const midY = (particle.y + other.y) / 2
          const mouseDistToLine = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2)
          const glitchZone = interactive && mouseDistToLine < 120
          
          if (glitchZone) {
            // Desenhar linha glitched com bitmap particles
            drawGlitchedBitmapLine(ctx, particle.x, particle.y, other.x, other.y, alpha, time, mouseDistToLine)
          } else {
            // Linha normal com bitmap particles
            drawBitmapLine(ctx, particle.x, particle.y, other.x, other.y, alpha)
          }
        }
      }

      // Conectar com mouse usando bitmap particles
      if (interactive) {
        const mouseDx = particle.x - mouse.x
        const mouseDy = particle.y - mouse.y
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy)

        if (mouseDistance < 150) {
          const alpha = (1 - mouseDistance / 150) * 0.5
          drawGlitchedBitmapLine(ctx, particle.x, particle.y, mouse.x, mouse.y, alpha, time, mouseDistance)
        }
      }
    })
  }, [drawBitmapLine, drawGlitchedBitmapLine, interactive])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    const mouse = mouseRef.current

    // Atualizar e desenhar partículas
    particles.forEach(particle => {
      // Movimento básico
      particle.x += particle.vx
      particle.y += particle.vy

      // Repulsão do mouse (apenas se interativo)
      if (interactive) {
        const dx = particle.x - mouse.x
        const dy = particle.y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          const force = (100 - distance) / 100 * 0.02
          particle.vx += (dx / distance) * force
          particle.vy += (dy / distance) * force
        }
      }

      // Fricção
      particle.vx *= 0.98
      particle.vy *= 0.98

      // Bordas
      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))

      // Desenhar partícula
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = '#464646FF'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    // Desenhar linhas bitmap
    drawBitmapLines(ctx)

    animationRef.current = requestAnimationFrame(animate)
  }, [drawBitmapLines, interactive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, initParticles, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${showCursor ? '' : 'cursor-none'}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
