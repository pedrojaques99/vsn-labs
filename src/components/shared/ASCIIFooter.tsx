'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'

interface ASCIIFooterProps {
  text?: string
  className?: string
  height?: number
  textColor?: string
}

export default function ASCIIFooter({ 
  text = 'visant labs',
  className = '',
  height = 30,
  textColor = '#2F474B'
}: ASCIIFooterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [time, setTime] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [randomChars, setRandomChars] = useState<string[]>([])

  // Memoize points generation - only recalculate when text changes
  const points = useMemo(() => {
    const points: Array<{
      x: number
      y: number
      char: string
      originalChar: string
      originalX: number
      originalY: number
    }> = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      points.push({
        x: i * 8, // Reduced spacing for better performance
        y: 0,
        char,
        originalChar: char,
        originalX: i * 8,
        originalY: 0
      })
    }

    return points
  }, [text])

  // Optimized position calculation
  const calculatePosition = useCallback((point: { originalX: number; originalY: number; originalChar: string }, centerX: number, centerY: number, textWidth: number) => {
    const centeredX = centerX - textWidth / 2 + point.originalX
    const centeredY = centerY
    
    const dx = mousePos.x - centeredX
    const dy = mousePos.y - centeredY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 10 // Reduced by 50% for tighter interaction

    const wave = Math.sin(time * 0.008 + point.originalX * 0.08) * 0.9 // Reduced wave intensity
    const mouseInfluence = Math.max(0, 2 - distance / maxDistance)
    
    // Use random character based on mouse influence intensity
    const charInfluence = Math.min(mouseInfluence * 1.2, 1) // Scale influence for character change
    const shouldUseRandom = isHovering && charInfluence > 0.3 && randomChars.length > 0
    const displayChar = shouldUseRandom 
      ? randomChars[point.originalX / 8] || point.originalChar
      : point.originalChar
    
    return {
      x: centeredX + wave + dx * mouseInfluence * 0.2, // Reduced influence
      y: centeredY + wave + dy * mouseInfluence * 0.2,
      scale: 1 + mouseInfluence * 0.10, // Reduced scale effect
      opacity: 0.5 + mouseInfluence * 0.3, // Higher base opacity
      char: displayChar
    }
  }, [mousePos, time, isHovering, randomChars])

  // Optimized render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const textWidth = text.length * 8

    ctx.font = '16px "Courier New", monospace' // Smaller font for better performance
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = textColor

    // Batch operations for better performance
    points.forEach(point => {
      const pos = calculatePosition(point, centerX, centerY, textWidth)
      
      if (pos.opacity > 0.1) { // Skip rendering if too transparent
        ctx.save()
        ctx.globalAlpha = pos.opacity
        ctx.translate(pos.x, pos.y)
        ctx.scale(pos.scale, pos.scale)
        ctx.fillText(pos.char, 0, 0)
        ctx.restore()
      }
    })

    animationRef.current = requestAnimationFrame(render)
  }, [text, points, calculatePosition, textColor])

  // Initialize canvas - simplified
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateCanvasSize = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = height
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [height])

  // Optimized mouse/touch handlers
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let isMouseDown = false
    let hoverTimeout: NodeJS.Timeout

    const generateRandomChars = () => {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
      return Array.from({ length: text.length }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      )
    }

    // Throttle random char generation
    let lastCharUpdate = 0
    const updateRandomChars = () => {
      const now = Date.now()
      if (now - lastCharUpdate > 100) { // Max once every 100ms
        setRandomChars(generateRandomChars())
        lastCharUpdate = now
      }
    }

    const updateMousePos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
      updateRandomChars()
    }

    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        setIsHovering(false)
        setRandomChars([])
      }, 50) // Reduced delay for better responsiveness
    }

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePos(e.clientX, e.clientY)
      
      if (isMouseDown) {
        // Regenerate random chars less frequently while dragging
        if (isHovering && Math.random() > 0.5) { // 30% chance to regenerate
          updateRandomChars()
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true
      updateMousePos(e.clientX, e.clientY)
      setIsHovering(true)
      updateRandomChars()
    }

    const handleMouseUp = () => {
      isMouseDown = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Only prevent default if we're actually interacting with the component
        if (isHovering || isMouseDown) {
          e.preventDefault()
        }
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY)
        // Regenerate random chars less frequently while dragging
        if (isHovering && Math.random() > 0.7) { // 30% chance to regenerate
          updateRandomChars()
        }
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Only prevent default if we're starting interaction
        e.preventDefault()
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY)
        setIsHovering(true)
        updateRandomChars()
      }
    }

    const handleTouchEnd = () => {
      setTimeout(() => {
        setIsHovering(false)
        setRandomChars([])
      }, 100)
    }

    canvas.addEventListener('mouseenter', handleMouseEnter)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('mouseover', handleMouseEnter) // Backup hover detection
    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      clearTimeout(hoverTimeout)
      canvas.removeEventListener('mouseenter', handleMouseEnter)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('mouseover', handleMouseEnter)
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isHovering])

  // Optimized animation loop
  useEffect(() => {
    let lastTime = 0
    const animate = (currentTime: number) => {
      if (currentTime - lastTime > 16) { // ~60fps
        setTime(prev => prev + 1)
        lastTime = currentTime
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Start render loop
  useEffect(() => {
    render()
  }, [render])

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}