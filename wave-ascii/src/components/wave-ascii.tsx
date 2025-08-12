'use client'

import { useEffect, useRef, useState } from 'react'

const ASCII_CHARS = '!@#$%^&*()XO|ALWA'

interface WavePoint {
  x: number
  y: number
  char: string
  opacity: number
  scale: number
}

export function WaveAscii() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || isInitialized) return

    // Criar pontos estáticos em formato de grade retangular
    const generateStaticPoints = () => {
      const points: WavePoint[] = []
      const centerX = container.clientWidth / 2
      const centerY = container.clientHeight / 2
      const gridSize = 300 // Tamanho da grade aumentado
      const spacing = 30 // Espaçamento maior entre pontos
      
      // Calcular quantas colunas e linhas cabem na grade
      const cols = Math.floor(gridSize / spacing)
      const rows = Math.floor(gridSize / spacing)
      
      // Criar grade retangular centralizada
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = centerX - (gridSize / 2) + (col * spacing)
          const y = centerY - (gridSize / 2) + (row * spacing)
          
          // Verificar se está dentro da área da grade
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          )
          
          // Manter apenas pontos dentro de um círculo para manter o formato
          if (distanceFromCenter <= gridSize / 2) {
            // Caractere baseado na posição da grade
            const charIndex = (row + col) % ASCII_CHARS.length
            const char = ASCII_CHARS[charIndex]
            
            points.push({
              x,
              y,
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

    generateStaticPoints()
  }, [isInitialized])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      // Usar coordenadas precisas do mouse sem arredondamento
      setMousePos({
        x: e.clientX,
        y: e.clientY
      })
    }

    // Usar throttling para melhor performance sem perder precisão
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

    // Adicionar listener na janela para movimento livre
    window.addEventListener('mousemove', throttledMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', throttledMouseMove)
  }, [])

  // Aplicar efeito de repulsão que move as posições
  const getPointStyle = (point: WavePoint) => {
    // Usar coordenadas precisas sem arredondamento
    const dx = point.x - mousePos.x
    const dy = point.y - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Efeito de repulsão mais suave e amplo
    const repulsionStrength = Math.max(0, 150 - distance) / 150 // Força mais suave
    const repulsionRadius = 150 // Raio de influência maior
    
    let newX = point.x
    let newY = point.y
    let newChar = point.char
    
    if (distance < repulsionRadius) {
      // Calcular direção da repulsão usando vetores normalizados para maior precisão
      const length = Math.sqrt(dx * dx + dy * dy) || 1
      const normalizedDx = dx / length
      const normalizedDy = dy / length
      
      const repulsionDistance = repulsionStrength * 40 // Distância máxima de movimento reduzida
      
      // Adicionar movimento aleatório sutil para deixar mais solto
      const randomOffsetX = Math.sin(Date.now() * 0.0005 + point.x * 0.005) * 2
      const randomOffsetY = Math.cos(Date.now() * 0.0005 + point.y * 0.005) * 2
      
      newX = point.x + normalizedDx * repulsionDistance + randomOffsetX
      newY = point.y + normalizedDy * repulsionDistance + randomOffsetY
      
      // Mudar o caractere quando há interatividade (menos frequente)
      if (repulsionStrength > 0.5 && Math.random() > 0.7) {
        const timeBasedIndex = Math.floor(Date.now() * 0.005 + distance * 0.05) % ASCII_CHARS.length
        newChar = ASCII_CHARS[timeBasedIndex]
      }
    } else {
      // Movimento sutil mesmo quando longe do mouse (reduzido)
      const subtleMovementX = Math.sin(Date.now() * 0.001 + point.x * 0.01) * 1
      const subtleMovementY = Math.cos(Date.now() * 0.001 + point.y * 0.01) * 1
      newX = point.x + subtleMovementX
      newY = point.y + subtleMovementY
    }
    
    // Efeito de onda na opacidade e escala mais suave
    const wave = Math.sin(distance * 0.01 + Date.now() * 0.001)
    const opacity = Math.max(0.4, 0.8 + wave * 0.15)
    const scale = 1 + wave * 0.15 + Math.sin(Date.now() * 0.0005 + point.x * 0.005) * 0.05
    
    return {
      left: newX,
      top: newY,
      opacity,
      transform: `scale(${scale})`,
      fontSize: '16px',
      lineHeight: '1',
      transition: 'all 0.15s ease-out', // Transição mais rápida
      content: `"${newChar}"` // Forçar mudança do caractere
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-none"
    >
      {wavePoints.map((point, index) => {
        const style = getPointStyle(point)
        const dynamicChar = style.content ? style.content.replace(/"/g, '') : point.char
        
        return (
          <div
            key={index}
            className="absolute font-mono text-white select-none pointer-events-none"
            style={{
              left: style.left,
              top: style.top,
              opacity: style.opacity,
              transform: style.transform,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              transition: style.transition
            }}
          >
            {dynamicChar}
          </div>
        )
      })}
      
      {/* Mouse cursor indicator */}
      <div
        className="absolute w-2 h-2 bg-white rounded-full pointer-events-none z-10"
        style={{
          left: mousePos.x - 4,
          top: mousePos.y - 4,
          transition: 'all 0.05s ease-in-out'
        }}
      />
    </div>
  )
} 