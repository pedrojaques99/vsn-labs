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

// Icon component for tools (same as homepage)
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
    const numParticles = 30 // Much fewer particles for minimal effect

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
    const maxDistance = 150
    const mouse = mouseRef.current

    particles.forEach((particle, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < maxDistance) {
          const alpha = (1 - distance / maxDistance) * 0.03
          
          // Check if near mouse for subtle interaction
          const midX = (particle.x + other.x) / 2
          const midY = (particle.y + other.y) / 2
          const mouseDistToLine = Math.sqrt((midX - mouse.x) ** 2 + (midY - mouse.y) ** 2)
          const isNearMouse = mouseDistToLine < 100
          
          ctx.save()
          ctx.globalAlpha = alpha * (isNearMouse ? 2 : 1)
          ctx.strokeStyle = isNearMouse ? '#52ddeb' : '#444444'
          ctx.lineWidth = 0.5
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

      // Subtle mouse interaction
      const dx = particle.x - mouse.x
      const dy = particle.y - mouse.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 80) {
        const force = (80 - distance) / 80 * 0.005
        particle.vx += (dx / distance) * force
        particle.vy += (dy / distance) * force
      }

      particle.vx *= 0.995
      particle.vy *= 0.995

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
      
      particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      particle.y = Math.max(0, Math.min(canvas.height, particle.y))

      // Draw particle
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
  
  const asciiArt = `       @@@  @@@@@@   @@@@@@   @@@  @@@ @@@@@@@@  @@@@@@
     @@! @@!  @@@ @@!  @@@  @@!  @@@ @@!      !@@    
     !!@ @!@!@!@! @!@  !@!  @!@  !@! @!!!:!    !@@!! 
 .  .!!  !!:  !!! !!:!!:!:  !!:  !!! !!:          !:!
 ::.::    :   : :  : :. :::  :.:: :  : :: ::: ::.: : `

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
    const glowRadius = 80 // Raio menor para o efeito de glow
    
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
      
      // Efeito de glow baseado na proximidade do mouse
      if (distance <= glowRadius) {
        const glowFalloff = Math.max(0, 1 - distance / glowRadius)
        glow = glowFalloff * 0.5 // Intensidade do glow
        opacity = Math.min(1, 0.7 + glow) // Aumenta opacidade próximo ao mouse
        scale = 0.5 + glowFalloff * 0.15 // Aumenta levemente o tamanho
      }
    }
    
    // Animação sutil contínua
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

    ctx.font = '32px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    wavePoints.forEach(point => {
      const calculated = calculatePointPosition(point)
      
      ctx.save()
      ctx.globalAlpha = calculated.opacity
      
      // Aplicar efeito de glow se necessário
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
            src="/avatars/jacao.webp" 
            alt="Pedro Jaques Avatar"
            className={`w-16 h-16 rounded-full border shadow-md opacity-90 hover:opacity-100 transition-opacity duration-300 ${
              isDarkMode 
                ? 'border-cyan-400/20 shadow-cyan-400/8' 
                : 'border-cyan-600/30 shadow-cyan-600/12 invert'
            }`}
          />
          {/* Glow effect */}
          <div className={`absolute inset-0 w-16 h-16 rounded-full animate-pulse blur-sm ${
            isDarkMode 
              ? 'bg-cyan-400/8' 
              : 'bg-cyan-600/6'
          }`}></div>
        </div>
      </div>
    </div>
  )
}

export function JaquesProfile() {
  const [currentTime, setCurrentTime] = useState('')
  const [showLoadingText, setShowLoadingText] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{title: string, image: string, description: string} | null>(null)
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
    const interval = setInterval(updateTime, 500)
    
    // Hide loading text after 1 second
    const loadingTimer = setTimeout(() => {
      setShowLoadingText(false)
    }, 1000)
    
    return () => {
      clearInterval(interval)
      clearTimeout(loadingTimer)
    }
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedImage])


  const tools = [
    { 
      name: 'YOUTUBE MIXER', 
      desc: 'Real-time audio visualization hub with frequency analysis and dynamic particle systems',
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
      name: 'VISANT LABS', 
      desc: 'Experimental interactive effects laboratory with particle systems and visual algorithms',
      link: '/vsn-labs', 
      icon: 'vsn-labs' 
    }
  ]

  const artworks = [
    { 
      title: 'ALEE DAEMON', 
      year: '2025', 
      medium: 'DIGITAL ART',
      image: '/Projects/alee-daemon2.png',
      description: 'CHARACTER DESIGN'
    },
    { 
      title: 'SAINTY SKETCHES', 
      year: '2025', 
      medium: 'TYPOGRAPHY',
      image: '/Projects/sainty-sketches-type.png',
      description: 'LETTERING DESIGN'
    },
    { 
      title: 'CURSED PEJAQUES', 
      year: '2025', 
      medium: 'ILLUSTRATION',
      image: '/Projects/cursed-pejaques.png',
      description: 'EXPERIMENTAL ART'
    },
    { 
      title: 'BRAND CONCEPT', 
      year: '2025', 
      medium: 'VISUAL DESIGN',
      image: '/Projects/Slice 3.png',
      description: 'IDENTITY SYSTEM'
    },
    { 
      title: 'ER TYPPER GRID', 
      year: '2025', 
      medium: 'GRID DESIGN',
      image: '/Projects/ER - Typper - Grid.png',
      description: 'GRID SYSTEM DESIGN'
    },
    { 
      title: 'GRID GIRO', 
      year: '2025', 
      medium: 'EXPERIMENTAL',
      image: '/Projects/Grid Giro.png',
      description: 'ROTATIONAL GRID'
    },
    { 
      title: 'GRID PLUMA 03', 
      year: '2025', 
      medium: 'SOCIAL DESIGN',
      image: '/Projects/GRID PLUMA 03 - PINTEREST.png',
      description: 'PINTEREST OPTIMIZED'
    },
    { 
      title: 'GRID PLUMA 04', 
      year: '2025', 
      medium: 'SOCIAL DESIGN',
      image: '/Projects/GRID PLUMA 04 - PINTEREST.png',
      description: 'PINTEREST VARIATION'
    },
    { 
      title: 'GRID TYPPER', 
      year: '2025', 
      medium: 'GRID DESIGN',
      image: '/Projects/Grid Typper.png',
      description: 'TYPOGRAPHY GRID'
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
            <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>VISANT CO. STUDIO</span>
            <div className="flex items-center gap-4">
              <PixelModeToggle 
                isDarkMode={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>BALNEÁRIO CAMBORIÚ [{currentTime}]</span>
            </div>
          </div>
          {showLoadingText && (
            <div className="text-center text-xs text-gray-500 transition-opacity duration-500 px-4 py-8 md:py-12">
              {'>'} ACCESSING PROFILE... CONNECTION ESTABLISHED
            </div>
          )}
        </div>

        {/* Interactive ASCII Art Header */}
        <div className="text-center mb-8 md:mb-12">
          <InteractiveASCII isDarkMode={isDarkMode} />
          <div className="mt-4 text-gray-300">
            <div className="text-sm">EXPERIMENTAL DESIGNER • VISANT CO. STUDIO OWNER</div>
            <div className="text-xs text-gray-500 mt-2">
              SPECIALIZING IN BRANDING • CUSTOM TYPOGRAPHY • NEXT.JS TOOLS • INTERACTIVE DESIGN
            </div>
          </div>
        </div>

         {/* 1. Recent Works Section - Full Width */}
         <div className="border p-4 transition-colors duration-300 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         } mb-8">
           <div className="text-gray-300 text-sm mb-4 border-b border-gray-400 pb-2">
             [RECENT_WORKS.LOG]
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             {artworks.map((artwork, index) => (
               <div 
                 key={index} 
                 className="group cursor-pointer transition-all duration-300"
                 onClick={() => setSelectedImage({
                   title: artwork.title,
                   image: artwork.image,
                   description: `${artwork.description} • ${artwork.medium} • ${artwork.year}`
                 })}
               >
                 <div className="relative aspect-square bg-black/40 border border-gray-600/30 rounded mb-2 hover:border-gray-400/60 transition-colors group-hover:scale-105 overflow-hidden">
                   <img 
                     src={artwork.image} 
                     alt={artwork.title}
                     className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 </div>
                 <div className="text-xs">
                   <div className="flex justify-between items-start mb-1">
                     <span className="text-gray-300 group-hover:text-[#52ddeb] transition-colors duration-300 font-medium">
                       {artwork.title}
                     </span>
                     <span className="text-gray-500 text-xs">{artwork.year}</span>
                   </div>
                   <div className="text-gray-500 text-xs">{artwork.medium}</div>
                   <div className="text-gray-600 text-xs mt-1">{artwork.description}</div>
                 </div>
               </div>
             ))}
           </div>
         </div>

         {/* Main Content Grid */}
         <div className="grid md:grid-cols-2 gap-4 md:gap-8">
           
           {/* 2. About Section */}
          <div className="border p-4 transition-colors duration-300 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         }">
            <div className="text-gray-300 text-sm mb-4 border-b border-gray-400 pb-2">
              [ABOUT.EXE]
            </div>
            <div className="text-xs text-gray-400 leading-relaxed space-y-2">
              <p>{'>'} CREATIVE DIRECTOR AT VISANT CO. STUDIO</p>
              <p>{'>'} EXPERIMENTAL APPROACH TO DESIGN</p>
              <p>{'>'} PASSION FOR TEXTURES & AMBIENT AESTHETICS</p>
              <p>{'>'} BRIDGING ANALOG NOSTALGIA WITH DIGITAL INNOVATION</p>
              <p>{'>'} SPECIALIZED IN BRAND IDENTITY & VISUAL SYSTEMS</p>
              <p>{'>'} CUSTOM TYPOGRAPHY & LETTERING ENTHUSIAST</p>
              <p>{'>'} INTERACTIVE TOOLS & WEB EXPERIENCES CREATOR</p>
            </div>
          </div>

           {/* 3. Find Me (Contact/Links) Section */}
           <div className="border border-gray-600 bg-black/80 overflow-hidden">
             <div className="p-4 pb-3">
               <div className="text-gray-300 text-sm mb-4 border-b border-gray-400 pb-2">
                 [FIND_ME.SYS]
               </div>
               <div className="space-y-2 text-xs">
                 <div className="text-gray-400">
                   <span className="text-gray-500">EMAIL:</span> 
                   <a href="mailto:pedrohjaques99@gmail.com" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">pedrohjaques99@gmail.com</a>
                 </div>
                 <div className="text-gray-400">
                   <span className="text-gray-500">STUDIO:</span> 
                   <a href="https://visant.co" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">visant.co</a>
                 </div>
                 <div className="text-gray-400">
                   <span className="text-gray-500">LOCATION:</span> Balneário Camboriú, Brasil
                 </div>
                 <div className="text-gray-400">
                   <span className="text-gray-500">STATUS:</span> 
                   <span className="text-gray-300 ml-2 animate-pulse">● ONLINE</span>
                 </div>
               </div>
             </div>
             
             {/* Social Media Footer Bar */}
             <div className="border-t border-gray-600 bg-black/60 p-3">
               <div className="flex justify-center gap-4">
                 <a href="https://instagram.com/pejaques" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors" title="Instagram">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                   </svg>
                 </a>
                 <a href="https://youtube.com/@pejaques" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors" title="YouTube">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                   </svg>
                 </a>
                 <a href="https://substack.com/@pejaques" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors" title="Substack">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.539 24V10.812H1.46zM22.539 0H1.46v2.836h21.08V0z"/>
                   </svg>
                 </a>
                 <a href="https://bento.me/pejaques" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors" title="Bento">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M7.443 5.35c.639 0 1.280.24 1.771.731.982.982.982 2.56 0 3.542L6.772 12l2.442 2.378c.982.982.982 2.56 0 3.542-.491.491-1.132.731-1.771.731s-1.280-.24-1.771-.731L1.229 13.477c-.982-.982-.982-2.56 0-3.542L5.672 6.081c.491-.491 1.132-.731 1.771-.731zm9.114 0c.639 0 1.280.24 1.771.731l4.443 3.854c.982.982.982 2.56 0 3.542l-4.443 3.854c-.491.491-1.132.731-1.771.731s-1.280-.24-1.771-.731c-.982-.982-.982-2.56 0-3.542L17.228 12l-2.442-2.378c-.982-.982-.982-2.56 0-3.542.491-.491 1.132-.731 1.771-.731z"/>
                   </svg>
                 </a>
                 <a href="https://pinterest.com/pejaques" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors" title="Pinterest">
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                     <path d="M0 12c0 5.123 3.211 9.497 7.73 11.218-.11-.937-.227-2.482.025-3.566.217-.932 1.401-5.938 1.401-5.938s-.357-.715-.357-1.774c0-1.66.962-2.9 2.161-2.9 1.020 0 1.512.765 1.512 1.682 0 1.025-.653 2.557-.99 3.978-.281 1.189.597 2.159 1.769 2.159 2.123 0 3.756-2.239 3.756-5.471 0-2.861-2.056-4.86-4.991-4.86-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.4.159-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.750-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.366 11.99-12C24 5.366 18.641.001 12.017.001 5.383.001.001 5.366.001 12z"/>
                   </svg>
                 </a>
               </div>
             </div>
           </div>
         </div>

         {/* Universal Footer */}
        <UniversalFooter isDarkMode={isDarkMode} />
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-black/80 border border-gray-400 rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/60 border border-gray-400 rounded text-gray-300 hover:text-white hover:bg-black/80 transition-colors duration-100 flex items-center justify-center"
            >
              ×
            </button>
            
            {/* Image */}
            <div className="relative">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            </div>
            
            {/* Image info */}
            <div className="p-4 border-t border-gray-600">
              <div className="text-gray-300 text-sm mb-1 font-mono font-bold">
                {selectedImage.title}
              </div>
              <div className="text-gray-500 text-xs font-mono">
                {selectedImage.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
