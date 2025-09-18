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
    const numParticles = 30

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
  
  const asciiArt = `______________/\\\\\\\\\\\\\____________/\\\_______/\\\____________
 _____________\/\\\/////////\\\_________\///\\\___/\\\/_________________
 ____________ _\/\\\_______\/\\\___________\///\\\\\\/_____________________
   _____________\/\\\\\\\\\\\\\/______________\//\\\\______________________
   ____________ _\/\\\/////////_________________\/\\\\_____________________
  _  ___________  _\/\\\__________________________/\\\\\\_____________________
       ____________ _\/\\\________________________/\\\////\\\_________________
         _____________\/\\\______________________/\\\/___\///\\\_______________
           ____________ _\///______________________\///_______\///_______________`

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

    ctx.font = '32px "Courier New", monospace'
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
            src="/avatars/pedro.webp" 
            alt="Pedro Xavier Avatar"
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
              : 'bg-cyan-600/12'
          }`}></div>
        </div>
      </div>
    </div>
  )
}

export function PedroXavierProfile() {
  const [currentTime, setCurrentTime] = useState('')
  const [showLoadingText, setShowLoadingText] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{title: string, image: string, description: string} | null>(null)

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

  const xavierWorks = [
    { 
      title: '2GO FUNDER 3D', 
      year: '2025', 
      medium: '3D DESIGN',
      image: '/xavier/2gofunder-3d 1.png',
      description: '3D ICON DESIGN'
    },
    { 
      title: 'P#H ICON 04', 
      year: '2025', 
      medium: '3D MODELING',
      image: '/xavier/3D - Icon - P#H 04.png',
      description: '3D ICON CONCEPT'
    },
    { 
      title: 'P#H ICON 05', 
      year: '2025', 
      medium: '3D DESIGN',
      image: '/xavier/3D - Icon - P#H 05.png',
      description: '3D ICON VARIATION'
    },
    { 
      title: 'ORIGIN ASSET', 
      year: '2025', 
      medium: '3D MODELING',
      image: '/xavier/3D - Origin - Asset (9).png',
      description: '3D ASSET CREATION'
    },
    { 
      title: '3D FRONT', 
      year: '2025', 
      medium: '3D DESIGN',
      image: '/xavier/3d-front1.png',
      description: 'FRONT VIEW 3D'
    },
    { 
      title: 'ALWA SYMBOL', 
      year: '2025', 
      medium: '3D GLASS',
      image: '/xavier/alwa symbol glass 3d 1.png',
      description: 'GLASS 3D EFFECT'
    },
    { 
      title: 'BOXY 3D', 
      year: '2025', 
      medium: '3D MODELING',
      image: '/xavier/boxy 3d 3 1.png',
      description: '3D BOX CONCEPT'
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
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>SÃO PAULO [{currentTime}]</span>
            </div>
          </div>
          {showLoadingText && (
            <div className="text-center text-xs text-gray-500 transition-opacity duration-500 px-4 py-8 md:py-12">
              {'>'} ACCESSING PROFILE... CONNECTION ESTABLISHED
            </div>
          )}
        </div>

        {/* Content appears only after loading */}
        {!showLoadingText && (
          <div className="animate-in fade-in duration-1000">
            {/* Interactive ASCII Art Header */}
            <div className="text-center mb-8 md:mb-12">
              <InteractiveASCII isDarkMode={isDarkMode} />
              <div className="mt-4 text-gray-300">
                <div className="text-sm">CREATIVE DIRECTOR • 3D ARTIST</div>
                <div className="text-xs text-gray-500 mt-2">
                  SPECIALIZING IN BRANDING • 3D DESIGN • BUSINESS STRATEGY • CREATIVE DIRECTION
                </div>
              </div>
            </div>

            {/* Xavier Works Section */}
         <div className={`border p-4 transition-colors duration-300 mb-8 ${
           isDarkMode 
             ? 'border-gray-600 bg-black/80' 
             : 'border-gray-300 bg-white/90'
         }`}>
           <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
             [XAVIER_WORKS.LOG]
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {xavierWorks.map((work, index) => (
               <div 
                 key={index} 
                 className="group cursor-pointer transition-all duration-300"
                 onClick={() => setSelectedImage({
                   title: work.title,
                   image: work.image,
                   description: `${work.description} • ${work.medium} • ${work.year}`
                 })}
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

            {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          
          {/* About Section */}
          <div className={`border p-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-600 bg-black/80' 
              : 'border-gray-300 bg-white/90'
          }`}>
            <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
              [ABOUT.EXE]
            </div>
            <div className="text-xs text-gray-400 leading-relaxed space-y-2">
              <p>{'>'} CREATIVE DIRECTOR AT VISANT CO. STUDIO</p>
              <p>{'>'} 3D ARTIST & VISUAL DESIGNER</p>
              <p>{'>'} PASSIONATE ABOUT BRANDING & BUSINESS STRATEGY</p>
              <p>{'>'} EXPERT IN 3D MODELING & CREATIVE DIRECTION</p>
              <p>{'>'} BRAND IDENTITY & VISUAL COMMUNICATION</p>
              <p>{'>'} BUSINESS DEVELOPMENT & CREATIVE CONSULTING</p>
              <p>{'>'} BRIDGING ART, BUSINESS & CREATIVE VISION</p>
            </div>
          </div>

          {/* Skills & Contact Section */}
          <div className={`border p-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'border-gray-600 bg-black/80' 
              : 'border-gray-300 bg-white/90'
          }`}>
            <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
              [SKILLS.SYS]
            </div>
            <div className="text-xs text-gray-400 leading-relaxed space-y-2 mb-6">
              <p>{'>'} 3D MODELING & RENDERING</p>
              <p>{'>'} BRAND IDENTITY & VISUAL DESIGN</p>
              <p>{'>'} CREATIVE DIRECTION & STRATEGY</p>
              <p>{'>'} BUSINESS DEVELOPMENT & CONSULTING</p>
              <p>{'>'} ADOBE CREATIVE SUITE & 3D SOFTWARE</p>
            </div>
            
            <div className={`text-sm mb-4 border-b pb-2 ${isDarkMode ? 'text-gray-300 border-gray-400' : 'text-gray-700 border-gray-400'}`}>
              [CONTACT.LOG]
            </div>
            <div className="space-y-2 text-xs">
              <div className="text-gray-400">
                <span className="text-gray-500">EMAIL:</span> 
                <a href="mailto:pedro.xavier@visant.co" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">pedro.xavier@visant.co</a>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">BEHANCE:</span> 
                <a href="https://behance.net/pedroxavier" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">@pedroxavier</a>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">INSTAGRAM:</span> 
                <a href="https://instagram.com/pedroxavier" target="_blank" rel="noopener noreferrer" className="text-[#52ddeb] hover:text-[#52ddeb]/80 transition-colors">@pedroxavier</a>
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">LOCATION:</span> São Paulo, Brasil
              </div>
              <div className="text-gray-400">
                <span className="text-gray-500">STATUS:</span> 
                <span className="text-gray-300 ml-2 animate-pulse">● CREATING</span>
              </div>
            </div>
          </div>
        </div>

            {/* Universal Footer */}
            <UniversalFooter isDarkMode={isDarkMode} />
          </div>
        )}
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
