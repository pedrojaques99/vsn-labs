'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface RadioWavePoint {
  x: number
  y: number
  originalX: number
  originalY: number
  intensity: number
  frequency: number
  phase: number
  visible: boolean
}

export function BitmapRadioWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<RadioWavePoint[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar pontos da grade bitmap
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitialized) return

    const generateWavePoints = () => {
      const points: RadioWavePoint[] = []
      const spacing = 8 // Espaçamento menor para efeito bitmap
      const cols = Math.floor(canvas.width / spacing)
      const rows = Math.floor(canvas.height / spacing)
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * spacing + spacing / 2
          const y = row * spacing + spacing / 2
          
          // Criar padrões de ondas diferentes baseado na posição
          const frequency = 0.02 + (Math.sin(x * 0.01) * 0.01)
          const phase = (x * 0.02) + (y * 0.01)
          
          points.push({
            x,
            y,
            originalX: x,
            originalY: y,
            intensity: 0.5,
            frequency,
            phase,
            visible: true
          })
        }
      }
      
      setWavePoints(points)
      setIsInitialized(true)
    }

    // Definir tamanho do canvas
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    generateWavePoints()
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
        setIsInitialized(false) // Re-gerar pontos no resize
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Função para calcular propriedades dos pontos com efeitos de onda
  const calculateWaveProperties = useCallback((point: RadioWavePoint) => {
    const time = Date.now() * 0.002
    const canvas = canvasRef.current
    if (!canvas) return { x: point.x, y: point.y, intensity: 0, visible: false, size: 1, spacing: 1 }

    // Distância do mouse
    const dx = point.originalX - mousePos.x
    const dy = point.originalY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Influência do mouse (cria ondas circulares)
    const mouseInfluence = Math.max(0, 1 - distance / 300)
    const mouseWave = Math.sin(distance * 0.02 - time * 1.5) * mouseInfluence
    
    // Ondas de fundo baseadas na posição
    const backgroundWave1 = Math.sin(point.originalX * 0.02 + time)
    const backgroundWave2 = Math.sin(point.originalY * 0.015 + time * 0.8)
    const backgroundWave3 = Math.sin((point.originalX + point.originalY) * 0.01 + time * 0.6)
    
    // Combinar ondas para criar padrões complexos
    const combinedWave = (backgroundWave1 + backgroundWave2 + backgroundWave3) / 3
    const finalWave = combinedWave + mouseWave * 2
    
    // Calcular intensidade (0 a 1)
    const intensity = Math.max(0, Math.min(1, (finalWave + 1) / 2))
    
    // Efeito de distorção nas posições com espaçamento dinâmico
    const spacingMultiplier = 1 + mouseInfluence * 2 // Espaçamento aumenta próximo ao mouse
    const distortionX = Math.sin(point.originalY * 0.01 + time)  * intensity * 3 * spacingMultiplier
    const distortionY = Math.sin(point.originalX * 0.01 + time * 1.2) * intensity * 2 * spacingMultiplier
    
    // Tamanho dinâmico baseado na proximidade do mouse e intensidade da onda
    const baseSize = 1 + intensity * 3
    const mouseSizeInfluence = 1 + mouseInfluence * 2 // Pontos ficam maiores próximos ao mouse
    const finalSize = baseSize * mouseSizeInfluence
    const visible = intensity > 0.01
    
    return {
      x: point.originalX + distortionX,
      y: point.originalY + distortionY,
      intensity: intensity,
      visible: visible,
      size: finalSize,
      spacing: spacingMultiplier
    }
  }, [mousePos])

  // Função de renderização
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpar canvas
    ctx.fillStyle = '#000000FF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Renderizar pontos da onda de rádio
    wavePoints.forEach(point => {
      const calculated = calculateWaveProperties(point)
      
      if (!calculated.visible) return
      
      const alpha = calculated.intensity * 0.5
      
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#777777'
      
      // Desenhar ponto circular com tamanho dinâmico
      ctx.beginPath()
      ctx.arc(calculated.x, calculated.y, calculated.size, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.restore()
    })

    // Renderizar cursor com efeito de onda
    const time = Date.now() * 0.001
    const cursorWave = Math.sin(time * 2) * 2
    
    ctx.save()
    ctx.fillStyle = '#ffffff'
    ctx.globalAlpha = 0.9
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 4 + cursorWave, 0, Math.PI * 2)
    ctx.fill()
    
    // Círculo externo pulsante
    ctx.strokeStyle = '#ffffff'
    ctx.globalAlpha = 0.1
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 20 + cursorWave * 10, 0, Math.PI * 2)
    ctx.stroke()
    
    ctx.restore()

    // Continuar animação
    animationRef.current = requestAnimationFrame(render)
  }, [wavePoints, calculateWaveProperties, mousePos])

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
