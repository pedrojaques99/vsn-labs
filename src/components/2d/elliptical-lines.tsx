'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface StarburstLine {
  x: number
  y: number
  endX: number
  endY: number
  length: number
  angle: number
  originalLength: number
  opacity: number
}

export function EllipticalLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [starburstLines, setStarburstLines] = useState<StarburstLine[]>([])

  // Initialize starburst lines
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const generateStarburst = () => {
      const lineCount = 60
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const voidRadius = 30
      const maxLength = 200
      
      const newLines: StarburstLine[] = []
      
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2 + Math.random() * 0.2
        const length = voidRadius + Math.random() * maxLength
        const endX = centerX + Math.cos(angle) * length
        const endY = centerY + Math.sin(angle) * length
        
        newLines.push({
          x: centerX + Math.cos(angle) * voidRadius,
          y: centerY + Math.sin(angle) * voidRadius,
          endX,
          endY,
          length,
          angle,
          originalLength: length,
          opacity: Math.random() * 0.4 + 1
        })
      }
      
      setStarburstLines(newLines)
    }

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    generateStarburst()
  }, [])

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      })
    }

    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Update starburst lines with mouse following animation
  const updateStarburst = useCallback(() => {
    setStarburstLines(prevLines => 
      prevLines.map(line => {
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        
        // Calculate distance from mouse to center
        const dx = mousePos.x - centerX
        const dy = mousePos.y - centerY
        const mouseDistance = Math.sqrt(dx * dx + dy * dy)
        
        // Calculate angle from center to mouse
        const mouseAngle = Math.atan2(dy, dx)
        
        // Calculate angle difference between line and mouse
        const angleDiff = Math.abs(line.angle - mouseAngle)
        const normalizedAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff) / Math.PI
        
        // Lines closer to mouse direction get longer, others get shorter
        const directionInfluence = 1 - normalizedAngleDiff * 0.1
        
        // Distance influence: closer mouse = longer lines, farther mouse = shorter lines
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const distanceInfluence = Math.max(0.3, 1 - (mouseDistance / maxDistance) * 0.7)
        
        // Combine influences with breathing animation
        const breathing = Math.sin(Date.now() * 0.002 + line.angle * 15) * 0.05
        const newLength = line.originalLength * (1 + breathing) * directionInfluence * distanceInfluence
        
        return {
          ...line,
          endX: line.x + Math.cos(line.angle) * newLength,
          endY: line.y + Math.sin(line.angle) * newLength,
          length: newLength
        }
      })
    )
  }, [mousePos])

  // Render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update starburst
    updateStarburst()

    // Draw central void with subtle glow
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    ctx.save()
    
    // Draw outer glow ring
    ctx.globalAlpha = 0.05
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = '#52ddeb'
    ctx.shadowBlur = 150
    ctx.beginPath()
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw core void
    ctx.globalAlpha = 1
    ctx.shadowBlur = 0
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.restore()

    // Draw starburst lines with glow effect
    starburstLines.forEach(line => {
      ctx.save()
      
      // Draw outer glow (larger, more transparent)
      ctx.globalAlpha = line.opacity * 0.1
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 50
      
      ctx.beginPath()
      ctx.moveTo(line.x, line.y)
      ctx.lineTo(line.endX, line.endY)
      ctx.stroke()
      
      // Draw middle glow
      ctx.globalAlpha = line.opacity * 0.6
      ctx.lineWidth = 3
      ctx.shadowBlur = 8
      
      ctx.beginPath()
      ctx.moveTo(line.x, line.y)
      ctx.lineTo(line.endX, line.endY)
      ctx.stroke()
      
      // Draw core line
      ctx.globalAlpha = line.opacity
      ctx.lineWidth = 1
      ctx.shadowBlur = 0
      
      ctx.beginPath()
      ctx.moveTo(line.x, line.y)
      ctx.lineTo(line.endX, line.endY)
      ctx.stroke()
      
      // Draw glowing dot at end
      ctx.globalAlpha = line.opacity * 0.4
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(line.endX, line.endY, 4, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw core dot
      ctx.globalAlpha = line.opacity
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(line.endX, line.endY, 2, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })

    // Draw cursor
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    animationRef.current = requestAnimationFrame(render)
  }, [starburstLines, updateStarburst, mousePos])

  // Start animation
  useEffect(() => {
    if (starburstLines.length > 0) {
      animationRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [starburstLines, render])

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
} 