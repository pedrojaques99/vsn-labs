'use client'

import { useEffect, useRef, useState } from 'react'

interface EllipticalLine {
  centerX: number
  centerY: number
  radiusX: number
  radiusY: number
  rotation: number
  opacity: number
  thickness: number
}

export function EllipticalLines() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [ellipticalLines, setEllipticalLines] = useState<EllipticalLine[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || isInitialized) return

    // Criar linhas elípticas concêntricas
    const generateEllipticalLines = () => {
      const lines: EllipticalLine[] = []
      const centerX = container.clientWidth / 2
      const centerY = container.clientHeight / 2
      
      // Criar múltiplas elipses concêntricas
      for (let i = 0; i < 15; i++) {
        const baseRadius = 30 + (i * 25) // Começa pequeno e cresce
        const distortion = 0.3 + (i * 0.05) // Distorção progressiva
        const rotation = (i * 5) * (Math.PI / 180) // Rotação sutil
        
        lines.push({
          centerX,
          centerY,
          radiusX: baseRadius,
          radiusY: baseRadius * (1 + distortion),
          rotation,
          opacity: 0.8 - (i * 0.03),
          thickness: Math.max(1, 3 - (i * 0.1))
        })
      }
      
      setEllipticalLines(lines)
      setIsInitialized(true)
    }

    generateEllipticalLines()
  }, [isInitialized])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      })
    }

    // Usar throttling para melhor performance
    let ticking = false
    const throttledMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('mousemove', throttledMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', throttledMouseMove)
  }, [])

  // Função para desenhar uma elipse usando SVG path
  const createEllipsePath = (line: EllipticalLine) => {
    const { centerX, centerY, radiusX, radiusY, rotation } = line
    
    // Calcular pontos da elipse
    const points: string[] = []
    const segments = 60 // Número de segmentos para suavidade
    
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI
      const x = centerX + radiusX * Math.cos(angle) * Math.cos(rotation) - 
                radiusY * Math.sin(angle) * Math.sin(rotation)
      const y = centerY + radiusX * Math.cos(angle) * Math.sin(rotation) + 
                radiusY * Math.sin(angle) * Math.cos(rotation)
      
      if (i === 0) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }
    
    return points.join(' ')
  }

  // Aplicar efeitos baseados na posição do mouse
  const getLineStyle = (line: EllipticalLine) => {
    const distance = Math.sqrt(
      Math.pow(line.centerX - mousePos.x, 2) + Math.pow(line.centerY - mousePos.y, 2)
    )
    
    const influenceRadius = 200
    const influence = Math.max(0, influenceRadius - distance) / influenceRadius
    
    // Distorção baseada na posição do mouse
    let newRadiusX = line.radiusX
    let newRadiusY = line.radiusY
    let newRotation = line.rotation
    
    if (influence > 0) {
      const distortion = influence * 0.5
      newRadiusX = line.radiusX * (1 + distortion)
      newRadiusY = line.radiusY * (1 + distortion)
      newRotation = line.rotation + influence * 0.1
    }
    
    return {
      centerX: line.centerX,
      centerY: line.centerY,
      radiusX: newRadiusX,
      radiusY: newRadiusY,
      rotation: newRotation,
      opacity: line.opacity + influence * 0.2,
      thickness: line.thickness + influence * 2
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-none"
    >
      <svg className="absolute inset-0 w-full h-full">
        {ellipticalLines.map((line, index) => {
          const style = getLineStyle(line)
          const path = createEllipsePath(style)
          
          return (
            <path
              key={index}
              d={path}
              fill="none"
              stroke="white"
              strokeWidth={style.thickness}
              opacity={style.opacity}
              className="transition-all duration-300 ease-out"
            />
          )
        })}
      </svg>
      
      {/* Mouse cursor indicator */}
      <div
        className="absolute w-2 h-2 bg-white rounded-full pointer-events-none z-10"
        style={{
          left: mousePos.x - 4,
          top: mousePos.y - 4,
          transition: 'all 0.1s ease-out'
        }}
      />
    </div>
  )
} 