'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import PixelModeToggle from '@/components/PixelModeToggle'
import { UniversalFooter } from '@/components/UniversalFooter'

interface WavePoint {
  x: number
  y: number
  originalX: number
  originalY: number
  char: string
  opacity: number
  scale: number
}

// Icon component for tools (same as Jaques)
const ToolIcon = ({ type, size = 16 }: { type: string, size?: number }) => {
  const commonProps = { width: size, height: size, viewBox: '0 0 32 32', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1 }
  
  switch (type) {
    case 'vortex':
      return (
        <svg {...commonProps}>
          <path d="M16 4 C8 4, 4 8, 4 16 C4 24, 8 28, 16 28 C24 28, 28 24, 28 16 C28 8, 24 4, 16 4 Z" fill="none" />
          <path d="M16 8 C12 8, 8 12, 8 16 C8 20, 12 24, 16 24 C20 24, 24 20, 24 16 C24 12, 20 8, 16 8 Z" fill="none" />
          <circle cx="16" cy="16" r="4" fill="none" />
          <circle cx="16" cy="16" r="1" />
        </svg>
      )
    case 'grid-paint':
      return (
        <svg {...commonProps}>
          <rect x="6" y="6" width="6" height="6" rx="2" />
          <rect x="14" y="6" width="6" height="6" rx="2" />
          <rect x="22" y="6" width="6" height="6" rx="2" />
          <rect x="6" y="14" width="6" height="6" rx="2" />
          <rect x="22" y="14" width="6" height="6" rx="2" />
          <rect x="6" y="22" width="6" height="6" rx="2" />
          <rect x="14" y="22" width="6" height="6" rx="2" />
          <rect x="22" y="22" width="6" height="6" rx="2" />
          <line x1="12" y1="9" x2="14" y2="9" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="9" x2="22" y2="9" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="12" x2="9" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="12" x2="25" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="20" x2="9" y2="22" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="20" x2="17" y2="22" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="25" x2="14" y2="25" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="25" x2="22" y2="25" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...commonProps}>
          <rect x="4" y="8" width="24" height="16" rx="2" fill="none" />
          <polygon points="12,12 12,20 18,16" />
          <rect x="20" y="10" width="2" height="4" />
          <rect x="23" y="12" width="2" height="2" />
          <rect x="20" y="18" width="2" height="4" />
          <rect x="23" y="18" width="2" height="2" />
        </svg>
      )
    case 'ellipse-audio':
      return (
        <svg {...commonProps}>
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" />
          <ellipse cx="16" cy="16" rx="6" ry="10" fill="none" />
          <circle cx="16" cy="16" r="2" />
          <rect x="22" y="14" width="1" height="4" />
          <rect x="24" y="12" width="1" height="8" />
          <rect x="26" y="10" width="1" height="12" />
        </svg>
      )
    case 'palette':
      return (
        <svg {...commonProps}>
          <circle cx="16" cy="16" r="8" fill="none" />
          <circle cx="16" cy="10" r="2" fill="currentColor" />
          <circle cx="22" cy="14" r="2" fill="currentColor" />
          <circle cx="22" cy="18" r="2" fill="currentColor" />
          <circle cx="16" cy="22" r="2" fill="currentColor" />
          <circle cx="10" cy="18" r="2" fill="currentColor" />
          <circle cx="10" cy="14" r="2" fill="currentColor" />
          <circle cx="16" cy="16" r="1" fill="currentColor" />
        </svg>
      )
    case 'halftone':
      return (
        <svg {...commonProps}>
          <rect x="6" y="6" width="20" height="20" rx="2" fill="none" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1" />
          <circle cx="22" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1" />
          <circle cx="16" cy="16" r="2" />
          <circle cx="22" cy="16" r="1" />
          <circle cx="10" cy="22" r="1.5" />
          <circle cx="16" cy="22" r="1" />
          <circle cx="22" cy="22" r="1.5" />
        </svg>
      )
    case 'vsn-labs':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="24" height="24" rx="2" fill="none" />
          <rect x="8" y="8" width="6" height="6" rx="1" />
          <rect x="18" y="8" width="6" height="6" rx="1" />
          <rect x="8" y="18" width="6" height="6" rx="1" />
          <rect x="18" y="18" width="6" height="6" rx="1" />
          <circle cx="16" cy="16" r="1" />
          <line x1="11" y1="14" x2="11" y2="18" strokeWidth="1" />
          <line x1="21" y1="14" x2="21" y2="18" strokeWidth="1" />
          <line x1="14" y1="11" x2="18" y2="11" strokeWidth="1" />
          <line x1="14" y1="21" x2="18" y2="21" strokeWidth="1" />
        </svg>
      )
    case 'team':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="10" r="3" fill="none" />
          <circle cx="20" cy="10" r="3" fill="none" />
          <path d="M6 22 C6 18, 8 16, 12 16 C16 16, 18 18, 18 22" fill="none" />
          <path d="M14 22 C14 18, 16 16, 20 16 C24 16, 26 18, 26 22" fill="none" />
        </svg>
      )
    default:
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="16" height="16" rx="2" fill="none" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      )
  }
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  size: number
}

function MinimalParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const mouseRef = useRef({ x: 0, y: 0 })

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const particles: Particle[] = []
    const numParticles = 60

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.2 + 0.05,
        size: Math.random() * 1 + 0.5
      })
    }

    particlesRef.current = particles
  }, [])

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const particles = particlesRef.current
    const maxDistance = 100
    const mouse = mouseRef.current

    particles.forEach((particle, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.05
          
          const midX = (particle.x + other.x) / 2
          const midY = (particle.y + other.y) / 2
          const mouseDistToLine = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2)
          const isNearMouse = mouseDistToLine < 100
          
          ctx.save()
          ctx.globalAlpha = alpha * (isNearMouse ? 3 : 1)
          ctx.strokeStyle = isNearMouse ? '#52ddeb' : '#444444'
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(particle.x, particle.y)
          ctx.lineTo(other.x, other.y)
          ctx.stroke()
          ctx.restore()
        }
      }
    })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current
    const mouse = mouseRef.current

    particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy

      const dx = particle.x - mouse.x
      const dy = particle.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 80) {
        const force = (80 - distance) / 80 * 0.008
        particle.vx += (dx / distance) * force
        particle.vy += (dy / distance) * force
      }

      particle.vx *= 0.995
      particle.vy *= 0.995

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))

      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = '#666666'
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    })

    drawConnections(ctx)
    animationRef.current = requestAnimationFrame(animate)
  }, [drawConnections])

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
    window.addEventListener('mousemove', handleMouseMove)

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

// Interactive ASCII Art component
function InteractiveASCII({ isDarkMode }: { isDarkMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  
  const asciiArt = ` 


 ##:  :##   ######    :####:     :##:    ###   ##  ########
 ##    ##   ######   :######      ##     ###   ##  ########
 :##  ##:     ##     ##:  :#     ####    ###:  ##     ##
 :##  ##:     ##     ##          ####    ####  ##     ##
  ## .##      ##     ###:       :#  #:   ##:#: ##     ##
  ##::##      ##     :#####:     #::#    ## ## ##     ##
  ##::##      ##      .#####:   ##  ##   ## ## ##     ##
  :####:      ##         :###   ######   ## :#:##     ##
  .####.      ##           ##  .######.  ##  ####     ##
   ####       ##     #:.  :##  :##  ##:  ##  :###     ##
   ####     ######   #######:  ###  ###  ##   ###     ##
    ##      ######   .#####:   ##:  :##  ##   ###     ##   
      
      
      
                                                            `

  // Generate points from ASCII art
  const generatePointsFromASCII = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const points: WavePoint[] = []
    const lines = asciiArt.trim().split('\n')
    const charSize = 20
    const lineHeight = 24
    
    const totalWidth = Math.max(...lines.map(line => line.length)) * charSize * 0.6
    const totalHeight = lines.length * lineHeight
    
    const startX = (canvas.width - totalWidth) / 2
    const startY = (canvas.height - totalHeight) / 2

    lines.forEach((line, lineIndex) => {
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const char = line[charIndex]
        if (char !== ' ') {
          const x = startX + charIndex * charSize * 0.6
          const y = startY + lineIndex * lineHeight
          
          points.push({
            x,
            y,
            originalX: x,
            originalY: y,
            char,
            opacity: 0.8,
            scale: 1
          })
        }
      }
    })

    setWavePoints(points)
  }, [])

  // Calculate point position with vortex effect
  const calculatePointPosition = useCallback((point: WavePoint) => {
    const dx = point.originalX - mousePos.x
    const dy = point.originalY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    let newX = point.originalX
    let newY = point.originalY
    let opacity = 0.7
    let scale = 1
    let glow = 0
    
    const cursorRadius = 150
    const glowRadius = 80
    
    if (distance <= cursorRadius) {
      const dirX = dx / distance
      const dirY = dy / distance
      
      const tangX = -dirY
      const tangY = dirX
      
      const vortexIntensity = 1
      const falloff = Math.max(0, 1 - distance / cursorRadius)
      const attract = 0.5
      
      const tangentialForce = vortexIntensity * falloff
      const attractionForce = attract * falloff
      
      newX = point.originalX + tangX * tangentialForce * 15 - dirX * attractionForce * 10
      newY = point.originalY + tangY * tangentialForce * 15 - dirY * attractionForce * 10
      
      const timeOffset = Date.now() * 0.001
      const subtleX = Math.sin(timeOffset + point.originalX * 0.01) * 0.3
      const subtleY = Math.cos(timeOffset + point.originalY * 0.01) * 0.3
      
      newX += subtleX
      newY += subtleY
      
      if (distance <= glowRadius) {
        const glowFalloff = Math.max(0, 1 - distance / glowRadius)
        glow = glowFalloff * 0.5
        opacity = Math.min(1, 0.7 + glow)
        scale = 0.5 + glowFalloff * 0.15
      }
    }
    
    scale += Math.sin(Date.now() * 0.001 + point.originalX * 0.005) * 0.02
    
    return {
      x: newX,
      y: newY,
      char: point.char,
      opacity,
      scale,
      glow
    }
  }, [mousePos])

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.font = '32x "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    wavePoints.forEach(point => {
      const calculated = calculatePointPosition(point)
      
      ctx.save()
      ctx.globalAlpha = calculated.opacity
      
      if (calculated.glow > 0) {
        ctx.shadowColor = '#52ddeb'
        ctx.shadowBlur = 8 + calculated.glow * 12
        ctx.fillStyle = `rgba(82, 221, 235, ${0.6 + calculated.glow * 0.4})`
      } else {
        ctx.shadowBlur = 0
        ctx.fillStyle = '#2F474BFF'
      }
      
      ctx.translate(calculated.x, calculated.y)
      ctx.scale(calculated.scale, calculated.scale)
      
      ctx.fillText(calculated.char, 0, 0)
      ctx.restore()
    })

    animationRef.current = requestAnimationFrame(render)
  }, [wavePoints, calculatePointPosition])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
        generatePointsFromASCII()
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [generatePointsFromASCII])

  // Mouse move handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Start animation
  useEffect(() => {
    if (wavePoints.length > 0) {
      animationRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [wavePoints, render])

  return (
    <div className="relative w-full h-90 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Avatar overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <img 
            src="/avatars/visant.png" 
            alt="Visant Labs Avatar"
            className={`w-16 h-16 rounded-full border shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode 
                ? 'border-cyan-400/20 shadow-cyan-400/8' 
                : 'border-cyan-600/30 shadow-cyan-600/12 invert'
            }`}
          />
          {/* Glow effect */}
          <div className={`absolute inset-0 w-16 h-16 rounded-full animate-pulse blur-sm ${
            isDarkMode 
              ? 'bg-cyan-400/2' 
              : 'bg-cyan-600/6'
          }`}></div>
        </div>
      </div>
    </div>
  )
}

export function VisantHomepage() {
  const [currentTime, setCurrentTime] = useState('')
  const [showLoadingText, setShowLoadingText] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        timeZone: 'America/Sao_Paulo'
      }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    
    const loadingTimer = setTimeout(() => {
      setShowLoadingText(false)
    }, 1000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(loadingTimer)
    }
  }, [])


  const visantWorks = [
    { 
      title: 'TRINITY PROJECT', 
      year: '2025', 
      medium: 'BRAND IDENTITY',
      image: '/visant-works/Trinity 02.png',
      description: 'BRAND IDENTITY'
    },
    { 
      title: 'CALHA NORTE', 
      year: '2025', 
      medium: 'DIGITAL DESIGN',
      image: '/visant-works/Calha Norte - 04.png',
      description: 'BRAND IDENTITY'
    },
    { 
      title: 'CARDS TYPPER', 
      year: '2025', 
      medium: 'UI/UX DESIGN',
      image: '/visant-works/cards - typper.webp',
      description: 'BRAND DESIGN'
    },
    { 
      title: 'PORTFOLIO TRINITY', 
      year: '2025', 
      medium: 'VISUAL DESIGN',
      image: '/visant-works/Portf - Trinity - 11.png',
      description: 'BRAND DESIGN'
    },
    { 
      title: 'EXPERIMENTAL 35', 
      year: '2025', 
      medium: 'DIGITAL ART',
      image: '/visant-works/35.png',
      description: 'BRAND DESIGN'
    },
    { 
      title: 'MINIMAL 53', 
      year: '2025', 
      medium: 'GRAPHIC DESIGN',
      image: '/visant-works/53-min.png',
      description: 'BRAND DESIGN'
    },
    { 
      title: 'ABSTRACT 56', 
      year: '2025', 
      medium: 'EXPERIMENTAL',
      image: '/visant-works/56.png',
      description: 'BRAND DESIGN'
    }
  ]

  const tools = [
    { 
      name: 'YOUTUBE MIXER', 
      desc: 'Connect multiple YouTube videos simultaneously, control audio levels and create live mixes',
      link: '/youtube-mixer', 
      icon: 'youtube' 
    },
    { 
      name: 'IMAGE ASCII VORTEX', 
      desc: 'Transform images into interactive ASCII art with mouse-responsive vortex effects',
      link: '/ascii-vortex', 
      icon: 'vortex' 
    },
    { 
      name: 'GRID PAINT', 
      desc: 'Minimalist vector drawing tool with grid-based precision and export capabilities',
      link: '/grid-paint', 
      icon: 'grid-paint' 
    },
    { 
      name: 'ELLIPSE AUDIO FREQ', 
      desc: 'Circular audio spectrum analyzer with elliptical frequency visualization patterns',
      link: '/elipse-audio-freq', 
      icon: 'ellipse-audio' 
    },
    { 
      name: 'COLOR EXTRACTOR', 
      desc: 'Extract beautiful color palettes from any image with AI-powered analysis',
      link: 'https://gradient-machine.vercel.app/', 
      icon: 'palette' 
    },
    { 
      name: 'HALFTONE MACHINE', 
      desc: 'Retro halftone pattern processor for images and videos with customizable effects',
      link: 'https://pedrojaques99.github.io/halftone-machine/', 
      icon: 'halftone' 
    },
    { 
      name: 'MORE TOOLS',
      desc: 'Experimental interactive effects laboratory with particle systems and visual algorithms',
      link: '/vsn-labs', 
      icon: 'vsn-labs' 
    }
  ]

  const teamMembers = [
    {
      name: 'PEDRO JAQUES',
      role: 'CREATIVE DIRECTOR',
      profile: '/jaques-profile',
      status: 'ONLINE',
      avatar: '/avatars/jacao.webp'
    },
    {
      name: 'PEDRO XAVIER',
      role: 'CREATIVE DIRECTOR',
      profile: '/pedro-xavier',
      status: 'ONLINE',
      avatar: '/avatars/pedro.webp'
    }
  ]

  return (
    <div className={`min-h-screen font-mono overflow-hidden relative transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-gray-400' 
        : 'bg-gray-100 text-gray-700'
    }`}>
      {/* Interactive Background */}
      <MinimalParticleBackground />
      
      {/* Scanlines Effect */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <div className="w-full h-full opacity-10 bg-gradient-to-b from-transparent via-gray-500/10 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-repeat opacity-3" 
             style={{
               backgroundImage: `repeating-linear-gradient(
                 0deg,
                 transparent,
                 transparent 2px,
                 rgba(255, 255, 255, 0.05) 2px,
                 rgba(255, 255, 255, 0.05) 4px
               )`
             }}>
        </div>
      </div>

      <div className="relative z-20 p-4 md:p-6 max-w-6xl mx-auto">
        {/* Terminal Header */}
        <div className="mb-8 p-2">
          <div className="flex justify-between items-center mb-4">
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>VISANT.CO STUDIO</span>
            <div className="flex items-center gap-4">
              <PixelModeToggle 
                isDarkMode={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>BRASIL [{currentTime}]</span>
            </div>
          </div>
          {showLoadingText && (
            <div className="text-center text-xs text-gray-500 transition-opacity duration-500 px-4 py-8 md:py-12">
              {'>'} ACCESSING STUDIO... CONNECTION ESTABLISHED
            </div>
          )}
        </div>

        {/* Content appears only after loading */}
        {!showLoadingText && (
          <div className="animate-in fade-in duration-500">
            {/* Interactive ASCII Art Header */}
            <div className="text-center mb-8 md:mb-12">
              <InteractiveASCII isDarkMode={isDarkMode} />
              <div className="mt-4 text-gray-300">
                <div className="text-sm">EXPERIMENTAL DESIGN STUDIO • CREATIVE TECHNOLOGY LAB • BRAZILIAN</div>
                <div className="text-xs text-gray-500 mt-2">
                  SPECIALIZING IN BRANDING • DIGITAL INNOVATION • INTERACTIVE EXPERIENCES • VISUAL SYSTEMS
                </div>
              </div>
            </div>

            {/* Call to Action Bar */}
            <div className={`mb-6 p-4 border rounded-lg transition-all duration-300 ${
              isDarkMode 
                ? 'border-cyan-400/30 bg-cyan-400/5 hover:bg-cyan-400/10' 
                : 'border-cyan-600/40 bg-cyan-600/5 hover:bg-cyan-600/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`transition-colors duration-300 ${
                    isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                  }`}>
                    <ToolIcon type="youtube" size={24} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      🎵 YOUTUBE MIXER [NEW]
                    </h3>
                    <p className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Connect multiple YouTube videos simultaneously, control audio levels and create live mixes
                    </p>
                  </div>
                </div>
                <a 
                  href="/youtube-mixer"
                  className={`px-4 py-2 text-xs font-medium rounded transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-400/30 hover:border-cyan-400/50' 
                      : 'bg-cyan-600/20 text-cyan-700 border border-cyan-600/30 hover:bg-cyan-600/30 hover:border-cyan-600/50'
                  }`}
                >
                  EXPLORE MIXER →
                </a>
              </div>
            </div>

            {/* Tools Section */}
         <div className={`border p-4 transition-colors duration-300 mb-8 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         }`}>
           <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
             [TOOLS]
           </div>
           <div className="grid md:grid-cols-3 gap-4">
             {tools.map((tool, index) => (
               <a 
                 key={index}
                 href={tool.link}
                 target={tool.link.startsWith('http') ? '_blank' : '_self'}
                 rel={tool.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                 className={`group flex flex-col p-4 border rounded transition-all duration-300 hover:scale-[1.02] ${
                   isDarkMode 
                     ? 'border-gray-600/30 bg-black/20 hover:border-gray-400/60 hover:bg-black/40' 
                     : 'border-gray-300/50 bg-white/40 hover:border-gray-400/80 hover:bg-white/60'
                 }`}
               >
                 {/* Icon Container - Full Width and Height */}
                 <div className="w-full h-20 flex items-center justify-center mb-4">
                   <div className={`transition-colors duration-300 ${
                     isDarkMode 
                       ? 'text-gray-400 group-hover:text-[#52ddeb]' 
                       : 'text-gray-600 group-hover:text-[#52ddeb]'
                   }`}>
                     <ToolIcon type={tool.icon} size={48} />
                   </div>
                 </div>
                 
                 {/* Title and Number Row */}
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                       {String(index + 1).padStart(2, '0')}
                     </span>
                     <h3 className={`text-sm font-medium transition-colors duration-300 ${
                       isDarkMode 
                         ? 'text-gray-300 group-hover:text-[#52ddeb]' 
                         : 'text-gray-800 group-hover:text-[#52ddeb]'
                     }`}>
                       {tool.name}
                     </h3>
                   </div>
                   
                   <div className={`text-xs transition-colors duration-300 ${
                     isDarkMode 
                       ? 'text-gray-600 group-hover:text-gray-400' 
                       : 'text-gray-500 group-hover:text-gray-700'
                   }`}>
                     →
                   </div>
                 </div>
                 
                 <p className={`text-xs leading-relaxed ${
                   isDarkMode ? 'text-gray-500' : 'text-gray-600'
                 }`}>
                   {tool.desc}
                 </p>
               </a>
             ))}
           </div>
         </div>

         {/* Team Section */}
         <div className={`border p-4 transition-colors duration-300 mb-8 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         }`}>
           <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
             [TEAM]
           </div>
           <div className="grid md:grid-cols-2 gap-4">
             {teamMembers.map((member, index) => (
               <a 
                 key={index}
                 href={member.profile}
                 className={`group flex items-center gap-4 p-4 border rounded transition-all duration-300 hover:scale-[1.02] ${
                   isDarkMode 
                     ? 'border-gray-600/30 bg-black/20 hover:border-gray-400/60 hover:bg-black/40' 
                     : 'border-gray-300/50 bg-white/40 hover:border-gray-400/80 hover:bg-white/60'
                 }`}
               >
                 <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                   <div className="relative">
                     <img 
                       src={member.avatar} 
                       alt={member.name}
                       className={`w-12 h-12 rounded-full border shadow-md opacity-90 group-hover:opacity-100 transition-opacity duration-300 ${
                         isDarkMode 
                           ? 'border-cyan-400/20 shadow-cyan-400/8' 
                           : 'border-cyan-600/30 shadow-cyan-600/12 invert'
                       }`}
                     />
                     <div className={`absolute inset-0 w-12 h-12 rounded-full animate-pulse blur-sm ${
                       isDarkMode 
                         ? 'bg-cyan-400/8' 
                         : 'bg-cyan-600/6'
                     }`}></div>
                   </div>
                 </div>
                 
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                       {String(index + 1).padStart(2, '0')}
                     </span>
                     <h3 className={`text-sm font-medium transition-colors duration-300 ${
                       isDarkMode 
                         ? 'text-gray-300 group-hover:text-[#52ddeb]' 
                         : 'text-gray-800 group-hover:text-[#52ddeb]'
                     }`}>
                       {member.name}
                     </h3>
                   </div>
                   <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                     {member.role}
                   </p>
                 </div>
                 
                 <div className="flex flex-col items-end gap-1">
                   <div className={`flex-shrink-0 text-xs transition-colors duration-300 ${
                     isDarkMode 
                       ? 'text-gray-600 group-hover:text-gray-400' 
                       : 'text-gray-500 group-hover:text-gray-700'
                   }`}>
                     →
                   </div>
                   <span className={`text-xs animate-pulse ${
                     member.status === 'ONLINE' ? 'text-green-400' : 'text-blue-400'
                   }`}>
                     ● {member.status}
                   </span>
                 </div>
               </a>
             ))}
           </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid md:grid-cols-2 gap-4 md:gap-8">
           
           {/* About Studio Section */}
          <div className={`border p-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-600 bg-black/80' 
              : 'border-gray-300 bg-white/90'
          }`}>
            <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
              [ABOUT]
            </div>
             <div className="text-xs text-gray-400 leading-relaxed space-y-2">
               <p>{'>'} BRAZILIAN INDEPENDENT STUDIO</p>
               <p>{'>'} WHO LOVES TO EXPERIMENT WITH DESIGN</p>
               <p>{'>'} TECHNOLOGY, INTERACTIVENESS</p>
               <p>{'>'} BRIDGING ART, CODE, COFFEE & DESIGN</p>
               <p>{'>'} FEEL FREE TO USE OUR ASSETS</p>
               <p>{'>'} OR EXPLORE A NEW PROJECT</p>
             </div>
          </div>

           {/* Contact Studio Section */}
           <div className={`border p-4 transition-colors duration-300 ${
             isDarkMode 
               ? 'border-gray-600 bg-black/80' 
               : 'border-gray-300 bg-white/90'
           }`}>
             <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
               [CONTACT]
             </div>
             <div className="space-y-2 text-xs">
               <div className="text-gray-400">
                 <span className="text-gray-500">WEBSITE:</span> 
                 <a href="https://visant.co" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">visant.co</a>
               </div>
               <div className="text-gray-400">
                 <span className="text-gray-500">EMAIL:</span> 
                 <a href="mailto:contato@visant.co" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">contato@visant.co</a>
               </div>
               <div className="text-gray-400">
                 <span className="text-gray-500">INSTAGRAM:</span> 
                 <a href="https://instagram.com/visant.co" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">@visant.co</a>
               </div>
               <div className="text-gray-400">
                 <span className="text-gray-500">LOCATION:</span> Brazil
               </div>
               <div className="text-gray-400">
                 <span className="text-gray-500">STATUS:</span> 
                 <span className="text-gray-300 ml-2 animate-pulse">● ACTIVE</span>
               </div>
             </div>
           </div>
         </div>

            {/* Visant Works Section */}
         <div className={`border p-4 transition-colors duration-300 mb-8 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         }`}>
           <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
             [VISANT STUDIO]
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {visantWorks.map((work, index) => (
               <div 
                 key={index} 
                 className="group cursor-pointer transition-all duration-300"
               >
                 <div className="relative aspect-square bg-black/40 border border-gray-600/30 rounded mb-2 hover:border-gray-400/60 transition-colors group-hover:scale-105 overflow-hidden">
                   <img 
                     src={work.image} 
                     alt={work.title}
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 </div>
                 <div className="text-xs">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-gray-300 group-hover:text-[#52ddeb] transition-colors duration-300 font-medium">
                       {work.title}
                     </span>
                     <span className="text-gray-500 text-xs">{work.year}</span>
                   </div>
                   <div className="text-gray-500 text-xs">{work.medium}</div>
                   <div className="text-gray-600 text-xs mt-1">{work.description}</div>
                 </div>
               </div>
             ))}
           </div>
         </div>

            {/* Universal Footer */}
            <UniversalFooter isDarkMode={isDarkMode} />
          </div>
        )}
      </div>
    </div>
  )
}
