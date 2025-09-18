'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Settings } from 'lucide-react'

const DEFAULT_ASCII_CHARS = '!@#$%^&*()XO|ALWA'

interface WavePoint {
  x: number
  y: number
  originalX: number
  originalY: number
  char: string
  opacity: number
  scale: number
}

interface ImageMask {
  width: number
  height: number
  data: Uint8ClampedArray
}

export function WaveAsciiVortex() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [wavePoints, setWavePoints] = useState<WavePoint[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [imageMask, setImageMask] = useState<ImageMask | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasImage, setHasImage] = useState(false)
  
  // Controles de parâmetros
  const [charSize, setCharSize] = useState(16)
  const [shapeScale, setShapeScale] = useState(1.0)
  const [charSpacing, setCharSpacing] = useState(12)
  const [vortexIntensity, setVortexIntensity] = useState(0.8)
  const [charOpacity, setCharOpacity] = useState(0.8)
  const [showOpacity, setShowOpacity] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [cursorRadius, setCursorRadius] = useState(200) // Novo controle para raio do cursor
  const [asciiChars, setAsciiChars] = useState(DEFAULT_ASCII_CHARS) // Caracteres ASCII personalizáveis

  // Função para processar imagem e criar máscara
  const processImage = useCallback((file: File) => {
    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = imageCanvasRef.current
        if (!canvas) return
        
        // Configurar canvas temporário para processar imagem
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Desenhar imagem
        ctx.drawImage(img, 0, 0)
        
        // Obter dados da imagem
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // Criar máscara baseada na luminosidade
        const maskData = new Uint8ClampedArray(data.length / 4)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]
          
          // Calcular luminosidade e criar máscara
          const luminance = (r * 0.299 + g * 0.587 + b * 0.114) * (a / 255)
          // Usar threshold mais baixo para capturar mais detalhes
          maskData[i / 4] = luminance > 30 ? 255 : 0
        }
        
        const newImageMask = {
          width: canvas.width,
          height: canvas.height,
          data: maskData
        }
        
        setImageMask(newImageMask)
        setHasImage(true)
        setIsLoading(false)
        
        // Aguardar o estado ser atualizado antes de gerar pontos
        setTimeout(() => {
          generatePointsFromMask(newImageMask)
        }, 0)
      }
      
      img.src = e.target?.result as string
    }
    
    reader.readAsDataURL(file)
  }, [])

  // Função para gerar pontos baseados na máscara da imagem
  const generatePointsFromMask = useCallback((mask?: ImageMask) => {
    const currentMask = mask || imageMask
    if (!currentMask || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const points: WavePoint[] = []
    
    // Escalar máscara para o tamanho do canvas com controle de escala e zoom
    const scaleX = (canvas.width / currentMask.width) * shapeScale * zoom
    const scaleY = (canvas.height / currentMask.height) * shapeScale * zoom
    const scale = Math.min(scaleX, scaleY)
    
    const offsetX = (canvas.width - currentMask.width * scale) / 2
    const offsetY = (canvas.height - currentMask.height * scale) / 2
    
    // Usar o espaçamento para controlar a densidade dos pontos
    // Espaçamento maior = menos pontos = mais espaço vazio
    const spacing = Math.max(1, charSpacing)
    
    for (let y = 0; y < currentMask.height; y += spacing) {
      for (let x = 0; x < currentMask.width; x += spacing) {
        const maskIndex = y * currentMask.width + x
        const maskValue = currentMask.data[maskIndex]
        
        // Só criar pontos onde a máscara é clara
        if (maskValue > 128) {
          const canvasX = offsetX + x * scale
          const canvasY = offsetY + y * scale
          
          const charIndex = (x + y) % asciiChars.length
          const char = asciiChars[charIndex]
          
          points.push({
            x: canvasX,
            y: canvasY,
            originalX: canvasX,
            originalY: canvasY,
            char,
            opacity: 0.8,
            scale: 1
        })
        }
      }
    }
    
    setWavePoints(points)
    setIsInitialized(true)
  }, [imageMask, shapeScale, charSpacing, zoom, asciiChars])

  // Função para gerar pontos padrão (grade circular)
  const generateDefaultPoints = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
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
          const charIndex = (row + col) % asciiChars.length
          const char = asciiChars[charIndex]
          
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
  }, [asciiChars])

  // Inicializar canvas e pontos
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isInitialized) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    if (!hasImage) {
      generateDefaultPoints()
    }
  }, [isInitialized, hasImage, generateDefaultPoints])

  // Gerenciar movimento do mouse e scroll
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY
      })
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(prevZoom => {
        const newZoom = prevZoom * delta
        return Math.max(0.1, Math.min(5.0, newZoom))
      })
    }

    const handleResize = () => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        if (hasImage && imageMask) {
          generatePointsFromMask()
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)
    }
  }, [hasImage, imageMask, generatePointsFromMask])

  // Função para calcular posição com efeito vórtice
  const calculatePointPosition = useCallback((point: WavePoint) => {
    const dx = point.originalX - mousePos.x
    const dy = point.originalY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    let newX = point.originalX
    let newY = point.originalY
    let newChar = point.char
    
    // Usar o raio do cursor para controlar a área de influência
    if (distance <= cursorRadius) {
      // Normalizar direção do mouse para o ponto
      const dirX = dx / distance
      const dirY = dy / distance
      
      // Vetor tangencial (perpendicular à direção)
      const tangX = -dirY
      const tangY = dirX
      
      // Parâmetros do vórtice
      const omega = vortexIntensity // Velocidade angular controlada
      const falloff = Math.max(0, 1 - distance / cursorRadius) // Decaimento com distância
      const attract = 0.3 // Força de atração
      
      // Aplicar força tangencial (rotação) e atração
      const tangentialForce = omega * falloff
      const attractionForce = attract * falloff
      
      // Calcular nova posição
      newX = point.originalX + tangX * tangentialForce * 20 - dirX * attractionForce * 15
      newY = point.originalY + tangY * tangentialForce * 20 - dirY * attractionForce * 15
      
      // Adicionar movimento sutil baseado no tempo
      const timeOffset = Date.now() * 0.001
      const subtleX = Math.sin(timeOffset + point.originalX * 0.01) * 0.5
      const subtleY = Math.cos(timeOffset + point.originalY * 0.01) * 0.5
      
      newX += subtleX
      newY += subtleY
      
      // Mudança de caractere baseada na rotação
      if (Math.random() > 0.98) {
        const rotationIndex = Math.floor((Math.atan2(tangY, tangX) + Math.PI) / (2 * Math.PI) * asciiChars.length)
        newChar = asciiChars[rotationIndex % asciiChars.length]
      }
    }
    
    // Efeitos visuais baseados na distância - SEM MOVIMENTO DE OPACIDADE
    const baseOpacity = showOpacity ? charOpacity : 0.8
    const opacity = baseOpacity
    const scale = 1 + Math.sin(Date.now() * 0.001 + point.originalX * 0.005) * 0.03
    
    return {
      x: newX,
      y: newY,
      char: newChar,
      opacity,
      scale
    }
  }, [mousePos, vortexIntensity, showOpacity, charOpacity, cursorRadius, asciiChars])

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
    ctx.font = `${charSize}px "Courier New", monospace`
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

    // Renderizar cursor (buraco negro)
    ctx.save()
    ctx.fillStyle = '#000000'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    
    // Círculo externo
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // Anel interno
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI * 2)
    ctx.stroke()
    
    // Ponto central
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, 1, 0, Math.PI * 2)
    ctx.fill()
    
    // Visualizar área de influência do cursor (raio)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.arc(mousePos.x, mousePos.y, cursorRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    
    ctx.restore()

    // Continuar animação
    animationRef.current = requestAnimationFrame(render)
  }, [wavePoints, calculatePointPosition, mousePos, charSize, showOpacity, charOpacity, cursorRadius])

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

  // Regenerar pontos quando parâmetros mudarem
  useEffect(() => {
    if (hasImage && imageMask) {
      generatePointsFromMask()
    } else if (!hasImage && isInitialized) {
      generateDefaultPoints()
    }
  }, [shapeScale, charSpacing, zoom, hasImage, imageMask, generatePointsFromMask, asciiChars, isInitialized, generateDefaultPoints])

  // Função para resetar para pontos padrão
  const resetToDefault = () => {
    setImageMask(null)
    setHasImage(false)
    setIsInitialized(false)
    setWavePoints([])
    
    // Aguardar o estado ser atualizado antes de gerar pontos padrão
    setTimeout(() => {
      generateDefaultPoints()
    }, 0)
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Canvas principal */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-none"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Canvas oculto para processar imagem */}
      <canvas
        ref={imageCanvasRef}
        className="hidden"
      />
      
      {/* Controles de upload - respeitando margem do navbar (pt-20 = 80px) */}
      <div className="absolute top-20 left-4 z-20 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processImage(file)
          }}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-md transition-all duration-200 hover:scale-105"
        >
          {isLoading ? 'Processando...' : hasImage ? 'Trocar Imagem' : 'Upload Imagem'}
        </button>
        
        {hasImage && (
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-md transition-all duration-200 hover:scale-105"
          >
            Reset
          </button>
        )}
        
        {/* Botão para mostrar/ocultar controles */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-md transition-all duration-200 hover:scale-105"
          title={showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
        >
          <Settings size={20} />
        </button>
      </div>
      
      {/* Console de Controle - respeitando margem do navbar */}
      {showControls && (
        <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-80">
          <h3 className="text-white font-bold mb-4 text-lg">🎛️ Console de Controle</h3>
          
          <div className="space-y-4">
            {/* Tamanho dos caracteres */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Tamanho dos Caracteres: {charSize}px
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={charSize}
                onChange={(e) => setCharSize(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Escala do shape */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Tamanho do Shape: {(shapeScale * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={shapeScale}
                onChange={(e) => setShapeScale(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Espaçamento dos caracteres */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Espaçamento: {charSpacing}px
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={charSpacing}
                onChange={(e) => setCharSpacing(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Menor = mais denso, Maior = mais espaçado
              </div>
            </div>
            
            {/* Intensidade do vórtice */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Intensidade do Vórtice: {(vortexIntensity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={vortexIntensity}
                onChange={(e) => setVortexIntensity(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Raio do cursor - NOVO CONTROLE */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Raio do Cursor: {cursorRadius}px
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={cursorRadius}
                onChange={(e) => setCursorRadius(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla o diâmetro da área interativa do cursor
              </div>
            </div>
            
            {/* Controle de opacidade */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/80 text-sm">
                  Opacidade dos Caracteres
                </label>
                <button
                  onClick={() => setShowOpacity(!showOpacity)}
                  className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                    showOpacity 
                      ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                      : 'bg-gray-500/30 text-gray-300 border border-gray-500/50'
                  }`}
                >
                  {showOpacity ? 'ON' : 'OFF'}
                </button>
              </div>
              {showOpacity && (
                <>
                  <label className="block text-white/80 text-xs mb-2">
                    Valor: {(charOpacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={charOpacity}
                    onChange={(e) => setCharOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </>
              )}
            </div>
            
            {/* Controle de zoom */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Zoom: {(zoom * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Scroll do mouse também controla o zoom
              </div>
            </div>
            
            {/* Controle de caracteres ASCII */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Caracteres ASCII Personalizados
              </label>
              <input
                type="text"
                value={asciiChars}
                onChange={(e) => {
                  const value = e.target.value
                  // Permitir apenas caracteres únicos e limitar a 50 caracteres
                  if (value.length <= 50) {
                    const uniqueChars = Array.from(new Set(value)).join('')
                    setAsciiChars(uniqueChars || DEFAULT_ASCII_CHARS)
                  }
                }}
                placeholder="Digite seus caracteres..."
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white text-sm font-mono focus:border-white/50 focus:outline-none transition-colors"
              />
              <div className="text-xs text-white/60 mt-1">
                Total: {asciiChars.length} caracteres únicos
              </div>
            </div>
            
            {/* Presets de caracteres ASCII */}
            <div className="pt-2 border-t border-white/20">
              <label className="block text-white/80 text-sm mb-2">
                Presets de Caracteres
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => setAsciiChars('!@#$%^&*()XO|ALWA')}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded text-xs transition-all duration-200"
                >
                  Padrão
                </button>
                <button
                  onClick={() => setAsciiChars('01')}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-xs transition-all duration-200"
                >
                  Binário
                </button>
                <button
                  onClick={() => setAsciiChars('.:-=+*#%@')}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded text-xs transition-all duration-200"
                >
                  Densidade
                </button>
                <button
                  onClick={() => setAsciiChars('MATRIX')}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded text-xs transition-all duration-200"
                >
                  Matrix
                </button>
                <button
                  onClick={() => setAsciiChars('░▒▓█')}
                  className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 rounded text-xs transition-all duration-200"
                >
                  Blocos
                </button>
                <button
                  onClick={() => setAsciiChars('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}
                  className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded text-xs transition-all duration-200"
                >
                  Alfabeto
                </button>
              </div>
              
              <label className="block text-white/80 text-sm mb-2">
                Presets Visuais
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCharSize(12)
                    setShapeScale(0.8)
                    setCharSpacing(2)
                    setVortexIntensity(0.5)
                    setCharOpacity(0.9)
                    setShowOpacity(true)
                    setZoom(1.0)
                    setCursorRadius(150)
                  }}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-xs transition-all duration-200"
                >
                  Fino
                </button>
                <button
                  onClick={() => {
                    setCharSize(24)
                    setShapeScale(1.5)
                    setCharSpacing(15)
                    setVortexIntensity(1.2)
                    setCharOpacity(0.6)
                    setShowOpacity(true)
                    setZoom(1.2)
                    setCursorRadius(300)
                  }}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded text-xs transition-all duration-200"
                >
                  Grosso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Instruções - respeitando margem do navbar */}
      {!hasImage && (
        <div className="absolute bottom-4 left-4 z-20 text-white/60 text-sm max-w-xs">
          <p>Upload uma imagem para criar caracteres ASCII apenas na máscara da imagem</p>
        </div>
      )}
    </div>
  )
}
