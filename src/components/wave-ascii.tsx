'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const ASCII_CHARS = '!@#$%^&*()XO|ALWA'

interface WavePoint {
  x: number
  y: number
  originalX: number
  originalY: number
  char: string
  opacity: number
  scale: number
}

export function WaveAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar pontos da grade
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitialized) return

    const generateStaticPoints = () => {
      const points: WavePoint[] = []
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const gridSize = 300
      const spacing = 30
      
      const cols = Math.floor(gridSize / spacing)
      const rows = Math.floor(gridSize / spacing)
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = centerX - (gridSize / 2) + (col * spacing)
          const y = centerY - (gridSize / 2) + (row * spacing)
          
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          )
          
          if (distanceFromCenter <= gridSize / 2) {
            const charIndex = (row + col) % ASCII_CHARS.length
            const char = ASCII_CHARS[charIndex]
            
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
      }
      
      setWavePoints(points)
      setIsInitialized(true)
    }

    // Definir tamanho do canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    generateStaticPoints()
  }, [isInitialized])

  // Gerenciar movimento do mouse
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

  // Função para calcular posição com efeitos
  const calculatePointPosition = useCallback((point: WavePoint) => {
    const dx = point.originalX - mousePos.x
    const dy = point.originalY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    const repulsionStrength = Math.max(0, 150 - distance) / 150
    const repulsionRadius = 150
    
    let newX = point.originalX
    let newY = point.originalY
    let newChar = point.char
    
    if (distance < repulsionRadius) {
      const length = Math.sqrt(dx * dx + dy * dy) || 1
      const normalizedDx = dx / length
      const normalizedDy = dy / length
      
      const repulsionDistance = repulsionStrength * 40
      
      const randomOffsetX = Math.sin(Date.now() * 0.0005 + point.originalX * 0.005) * 2
      const randomOffsetY = Math.cos(Date.now() * 0.0005 + point.originalY * 0.005) * 2
      
      newX = point.originalX + normalizedDx * repulsionDistance + randomOffsetX
      newY = point.originalY + normalizedDy * repulsionDistance + randomOffsetY
      
      if (repulsionStrength > 0.5 && Math.random() > 0.7) {
        const timeBasedIndex = Math.floor(Date.now() * 0.005 + distance * 0.05) % ASCII_CHARS.length
        newChar = ASCII_CHARS[timeBasedIndex]
      }
    } else {
      const subtleMovementX = Math.sin(Date.now() * 0.001 + point.originalX * 0.01) * 1
      const subtleMovementY = Math.cos(Date.now() * 0.001 + point.originalY * 0.01) * 1
      newX = point.originalX + subtleMovementX
      newY = point.originalY + subtleMovementY
    }
    
    const wave = Math.sin(distance * 0.01 + Date.now() * 0.001)
    const opacity = Math.max(0.4, 0.8 + wave * 0.15)
    const scale = 1 + wave * 0.15 + Math.sin(Date.now() * 0.0005 + point.originalX * 0.005) * 0.05
    
    return {
      x: newX,
      y: newY,
      char: newChar,
      opacity,
      scale
    }
  }, [mousePos])

  // Função de renderização
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Configurar fonte
    ctx.font = '16px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Renderizar pontos
    wavePoints.forEach(point => {
      const calculated = calculatePointPosition(point)
      
      ctx.save()
      ctx.globalAlpha = calculated.opacity
      ctx.fillStyle = '#ffffff'
      
      // Aplicar escala
      ctx.translate(calculated.x, calculated.y)
      ctx.scale(calculated.scale, calculated.scale)
      
      ctx.fillText(calculated.char, 0, 0)
      ctx.restore()
    })

    // Renderizar cursor
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Continuar animação
    animationRef.current = requestAnimationFrame(render)
  }, [wavePoints, calculatePointPosition, mousePos])

  // Iniciar animação
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
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
} 