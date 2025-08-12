'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface EllipticalLine {
  centerX: number
  centerY: number
  originalCenterX: number
  originalCenterY: number
  radiusX: number
  radiusY: number
  originalRadiusX: number
  originalRadiusY: number
  rotation: number
  originalRotation: number
  opacity: number
  thickness: number
}

export function EllipticalLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [ellipticalLines, setEllipticalLines] = useState<EllipticalLine[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar linhas elípticas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitialized) return

    const generateEllipticalLines = () => {
      const lines: EllipticalLine[] = []
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      
      // Criar múltiplas elipses concêntricas
      for (let i = 0; i < 15; i++) {
        const baseRadius = 30 + (i * 25)
        const distortion = 0.3 + (i * 0.05)
        const rotation = (i * 5) * (Math.PI / 180)
        
        lines.push({
          centerX,
          centerY,
          originalCenterX: centerX,
          originalCenterY: centerY,
          radiusX: baseRadius,
          radiusY: baseRadius * (1 + distortion),
          originalRadiusX: baseRadius,
          originalRadiusY: baseRadius * (1 + distortion),
          rotation,
          originalRotation: rotation,
          opacity: 0.8 - (i * 0.03),
          thickness: Math.max(1, 3 - (i * 0.1))
        })
      }
      
      setEllipticalLines(lines)
      setIsInitialized(true)
    }

    // Definir tamanho do canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    generateEllipticalLines()
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

  // Função para desenhar elipse no Canvas
  const drawEllipse = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radiusX: number, radiusY: number, rotation: number) => {
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, rotation, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Função para calcular propriedades das linhas com efeitos
  const calculateLineStyle = useCallback((line: EllipticalLine) => {
    const dx = line.originalCenterX - mousePos.x
    const dy = line.originalCenterY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    const repulsionStrength = Math.max(0, 150 - distance) / 150
    const repulsionRadius = 150
    
    let newCenterX = line.originalCenterX
    let newCenterY = line.originalCenterY
    let newRadiusX = line.originalRadiusX
    let newRadiusY = line.originalRadiusY
    let newRotation = line.originalRotation
    
    if (distance < repulsionRadius) {
      const length = Math.sqrt(dx * dx + dy * dy) || 1
      const normalizedDx = dx / length
      const normalizedDy = dy / length
      
      const repulsionDistance = repulsionStrength * 40
      
      const randomOffsetX = Math.sin(Date.now() * 0.0005 + line.originalCenterX * 0.005) * 2
      const randomOffsetY = Math.cos(Date.now() * 0.0005 + line.originalCenterY * 0.005) * 2
      
      newCenterX = line.originalCenterX + normalizedDx * repulsionDistance + randomOffsetX
      newCenterY = line.originalCenterY + normalizedDy * repulsionDistance + randomOffsetY
      
      const distortion = repulsionStrength * 0.5
      newRadiusX = line.originalRadiusX * (1 + distortion)
      newRadiusY = line.originalRadiusY * (1 + distortion)
      newRotation = line.originalRotation + repulsionStrength * 0.1
    } else {
      const subtleMovementX = Math.sin(Date.now() * 0.001 + line.originalCenterX * 0.01) * 1
      const subtleMovementY = Math.cos(Date.now() * 0.001 + line.originalCenterY * 0.01) * 1
      newCenterX = line.originalCenterX + subtleMovementX
      newCenterY = line.originalCenterY + subtleMovementY
    }
    
    const wave = Math.sin(distance * 0.01 + Date.now() * 0.001)
    const opacity = Math.max(0.4, 0.8 + wave * 0.15)
    const thickness = line.thickness + wave * 0.5 + Math.sin(Date.now() * 0.0005 + line.originalCenterX * 0.005) * 0.5
    
    return {
      centerX: newCenterX,
      centerY: newCenterY,
      radiusX: newRadiusX,
      radiusY: newRadiusY,
      rotation: newRotation,
      opacity,
      thickness: Math.max(0.5, thickness)
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

    // Configurar estilos das linhas
    ctx.strokeStyle = '#ffffff'
    ctx.lineCap = 'round'

    // Renderizar elipses
    ellipticalLines.forEach(line => {
      const calculated = calculateLineStyle(line)
      
      ctx.save()
      ctx.globalAlpha = calculated.opacity
      ctx.lineWidth = calculated.thickness
      
      drawEllipse(ctx, calculated.centerX, calculated.centerY, calculated.radiusX, calculated.radiusY, calculated.rotation)
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
  }, [ellipticalLines, calculateLineStyle, mousePos])

  // Iniciar animação
  useEffect(() => {
    if (ellipticalLines.length > 0) {
      animationRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ellipticalLines, render])

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