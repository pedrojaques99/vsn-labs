'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Play, Pause, Volume2, Music, FileAudio, Loader2 } from 'lucide-react'

export default function EllipseAudioFreq() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  
  // Controles de efeito
  const [showControls, setShowControls] = useState(false)
  const [amplitude, setAmplitude] = useState(150)
  const [waveSpeed, setWaveSpeed] = useState(8)
  const [particleDensity, setParticleDensity] = useState(40)
  const [ellipseSize, setEllipseSize] = useState(0.6)
  
  // Controles visuais
  const [lineColor, setLineColor] = useState('#ffffff')
  const [lineWidth, setLineWidth] = useState(2)
  const [lineType, setLineType] = useState('solid') // solid, dashed, dotted
  const [glowEffect, setGlowEffect] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [distortionIntensity, setDistortionIntensity] = useState(1.0)
  


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Efeito para manter renderização contínua em tempo real
  useEffect(() => {
    const animate = () => {
      if (!canvasRef.current) return
      
      let dataArray: Uint8Array
      
      if (analyserRef.current && isPlaying) {
        // Usar dados reais do áudio quando tocando
        const bufferLength = analyserRef.current.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)
      } else {
        // Usar dados simulados quando não há áudio
        dataArray = generateSimulatedData()
      }
      
      drawEllipseWaveform(dataArray)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [amplitude, waveSpeed, particleDensity, ellipseSize, lineColor, lineWidth, lineType, glowEffect, backgroundColor, distortionIntensity, isPlaying]) // Reagir a mudanças nos controles

  // Função para gerar dados simulados para preview
  const generateSimulatedData = (): Uint8Array => {
    const data = new Uint8Array(256)
    const time = Date.now() * 0.002
    
    for (let i = 0; i < data.length; i++) {
      // Simular diferentes faixas de frequência
      const bassFreq = i < 32 ? Math.sin(time * 1.5 + i * 0.3) * 100 + 50 : 0
      const midFreq = i >= 32 && i < 128 ? Math.sin(time * 2.5 + i * 0.1) * 80 + 40 : 0
      const highFreq = i >= 128 ? Math.sin(time * 4 + i * 0.05) * 60 + 30 : 0
      
      // Adicionar variação aleatória sutil
      const noise = (Math.random() - 0.5) * 20
      
      // Combinar frequências com atenuação por faixa
      const combined = (bassFreq + midFreq + highFreq + noise) * (0.3 + Math.sin(time) * 0.2)
      
      data[i] = Math.max(0, Math.min(255, combined))
    }
    
    return data
  }

  const setupAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.current!)
      
      // Configurações para análise de frequência
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.3
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
    } catch (error) {
      console.error('Erro ao configurar áudio:', error)
    }
  }

  const drawEllipseWaveform = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Limpar canvas com cor personalizada
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    
    // Desenhar partículas de fundo sutis
    drawBackgroundParticles(ctx, width, height, dataArray)
    
    // Centro da elipse
    const centerX = width / 2
    const centerY = height / 2
    
    // Raios da elipse baseados no tamanho da tela e controle de tamanho
    const baseRadiusX = (width * ellipseSize) / 4
    const baseRadiusY = (height * ellipseSize) / 4
    
    // Configurar linha da elipse com customizações
    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Configurar tipo de linha
    if (lineType === 'dashed') {
      ctx.setLineDash([10, 5])
    } else if (lineType === 'dotted') {
      ctx.setLineDash([2, 8])
    } else {
      ctx.setLineDash([])
    }
    
    // Efeito de brilho (glow)
    if (glowEffect) {
      ctx.shadowColor = lineColor
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    } else {
      ctx.shadowBlur = 0
    }
    
    // Desenhar elipse distorcida com efeito de waveform
    ctx.beginPath()
    
    const segments = 360 // Um ponto por grau para suavidade
    let firstPoint = true
    let firstX = 0, firstY = 0 // Armazenar primeiro ponto para suavização
    
    for (let i = 0; i < segments; i++) { // Remover <= para evitar repetição do primeiro ponto
      const angle = (i / segments) * Math.PI * 2 // Ângulo em radianos
      const progress = i / segments
      
      // Mapear uniformemente toda a circunferência para os dados de frequência
      // Usar interpolação cíclica para garantir continuidade
      const frequencyRange = Math.min(dataArray.length, 128) // Usar mais frequências
      const dataIndex = Math.floor(progress * frequencyRange)
      const nextDataIndex = (dataIndex + 1) % frequencyRange // Usar módulo para loop
      
      // Interpolação entre pontos de dados com loop
      const currentFreq = dataArray[dataIndex] / 255
      const nextFreq = dataArray[nextDataIndex] / 255
      const interpolationFactor = (progress * frequencyRange) % 1
      const interpolatedFreq = currentFreq + (nextFreq - currentFreq) * interpolationFactor
      
      // Adicionar frequências de diferentes faixas para mais variação
      const lowFreqIndex = Math.floor(progress * Math.min(32, dataArray.length))
      const midFreqIndex = (Math.floor(progress * Math.min(64, dataArray.length)) + 32) % dataArray.length
      const highFreqIndex = (Math.floor(progress * Math.min(32, dataArray.length)) + 96) % dataArray.length
      
      const lowFreq = (dataArray[lowFreqIndex] || 0) / 255
      const midFreq = (dataArray[midFreqIndex] || 0) / 255
      const highFreq = (dataArray[highFreqIndex] || 0) / 255
      
      // Combinar diferentes faixas de frequência
      const combinedFreq = (lowFreq * 0.4 + midFreq * 0.4 + highFreq * 0.2 + interpolatedFreq) / 2
      
      // Aplicar múltiplas distorções para efeito mais rico e intenso
      const baseAmplitude = amplitude * distortionIntensity
      const distortion1 = combinedFreq * baseAmplitude // Base principal
      const distortion2 = combinedFreq * (baseAmplitude * 0.7) * Math.sin(angle * 4)
      const distortion3 = combinedFreq * (baseAmplitude * 0.5) * Math.cos(angle * 8)
      const distortion4 = combinedFreq * (baseAmplitude * 0.3) * Math.sin(angle * waveSpeed + Date.now() * 0.002)
      const distortion5 = combinedFreq * (baseAmplitude * 0.4) * Math.sin(angle * 12) // Nova camada
      const distortion6 = combinedFreq * (baseAmplitude * 0.2) * Math.cos(angle * 16) // Detalhes finos
      
      // Adicionar variação temporal para movimento mais dinâmico
      const timeVariation = Math.sin(Date.now() * 0.003 + angle * 2) * combinedFreq * baseAmplitude * 0.2
      const pulseEffect = Math.sin(Date.now() * 0.005) * combinedFreq * baseAmplitude * 0.15 // Efeito de pulso
      
      // Combinar todas as distorções com mais intensidade
      const totalDistortion = distortion1 + distortion2 + distortion3 + distortion4 + distortion5 + distortion6 + timeVariation + pulseEffect
      
      // Calcular posição da elipse com distorção radial mais intensa
      const distortionFactor = 1 + (totalDistortion / (baseRadiusX + baseRadiusY)) * 0.8
      const radiusX = baseRadiusX * distortionFactor
      const radiusY = baseRadiusY * distortionFactor
      
      const x = centerX + radiusX * Math.cos(angle)
      const y = centerY + radiusY * Math.sin(angle)
      
      if (firstPoint) {
        ctx.moveTo(x, y)
        firstX = x
        firstY = y
        firstPoint = false
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.closePath()
    ctx.stroke()
    
    // Resetar configurações para elementos de fundo
    ctx.shadowBlur = 0
    ctx.setLineDash([])
    
    // Adicionar elipse de fundo sutil (guia) com cor baseada na linha principal
    const bgColor = lineColor === '#ffffff' ? 'rgba(255, 255, 255, 0.1)' : `${lineColor}20`
    ctx.strokeStyle = bgColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, baseRadiusX, baseRadiusY, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    // Adicionar ponto central
    ctx.fillStyle = bgColor.replace('20', '50')
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // Adicionar linhas radiais sutis para mostrar a estrutura
    ctx.strokeStyle = bgColor.replace('20', '10')
    ctx.lineWidth = 0.5
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + baseRadiusX * Math.cos(angle),
        centerY + baseRadiusY * Math.sin(angle)
      )
      ctx.stroke()
    }
  }

  const drawBackgroundParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    // Calcular intensidade média da música
    const averageIntensity = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255
    
    // Desenhar partículas baseadas na intensidade e densidade configurável
    const particleCount = Math.floor(averageIntensity * particleDensity) + 15
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 2 + 0.5
      const opacity = Math.random() * 0.4 + 0.1
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setIsLoading(true)
      setAudioFile(file)
      setFileName(file.name)
      
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file)
        setupAudio().finally(() => setIsLoading(false))
      }
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Controles de áudio minimizados */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex items-center gap-4">
          {/* Upload de arquivo */}
          <div className="relative">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-upload"
            />
            <label 
              htmlFor="audio-upload"
              className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors cursor-pointer hover:scale-105"
              title="Selecionar arquivo de áudio"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            </label>
          </div>
          
          {/* Nome do arquivo */}
          {fileName && (
            <div className="text-white/80 text-sm max-w-32 truncate" title={fileName}>
              <FileAudio className="w-4 h-4 inline mr-2" />
              {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
            </div>
          )}
          
          {/* Controles de reprodução */}
          {audioFile && !isLoading && (
            <>
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors hover:scale-105"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              {/* Controle de volume */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-white/80" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>
            </>
          )}
          
          {/* Instruções */}
          {!audioFile && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Music className="w-4 h-4" />
              <span>Selecione um arquivo</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Controles de efeito - Redesenhado */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
          {/* Header dos controles */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-white/80 text-sm font-medium">Controles de Áudio</span>
            </div>
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center justify-center w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-105"
              title={showControls ? 'Minimizar' : 'Expandir'}
            >
              <svg className={`w-4 h-4 transition-transform duration-200 ${showControls ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Controles expandidos */}
          {showControls && (
            <div className="p-6 space-y-6">
              {/* Seção 1: Efeitos de Áudio */}
              <div className="space-y-4">
                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wide border-b border-white/10 pb-2">
                  Efeitos de Áudio
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  {/* Amplitude */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white/70 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Amplitude
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={amplitude}
                      onChange={(e) => setAmplitude(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white/50 text-xs">{amplitude}</span>
                  </div>
                  
                  {/* Velocidade */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white/70 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Velocidade
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={waveSpeed}
                      onChange={(e) => setWaveSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white/50 text-xs">{waveSpeed}</span>
                  </div>
                  
                  {/* Distorção */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-white/70 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Distorção
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={distortionIntensity}
                      onChange={(e) => setDistortionIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-white/50 text-xs">{distortionIntensity}x</span>
                  </div>
                </div>
              </div>

              {/* Seção 2: Aparência Visual */}
              <div className="space-y-4">
                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wide border-b border-white/10 pb-2">
                  Aparência Visual
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Primeira coluna */}
                  <div className="space-y-4">
                    {/* Cor da linha */}
                    <div className="flex items-center gap-3">
                      <label className="text-white/70 text-xs min-w-fit">Cor da Linha</label>
                      <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="w-12 h-8 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                      />
                    </div>
                    
                    {/* Largura da linha */}
                    <div className="space-y-2">
                      <label className="text-white/70 text-xs">Largura da Linha</label>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-white/50 text-xs">{lineWidth}px</span>
                    </div>
                    
                    {/* Tipo de linha */}
                    <div className="space-y-2">
                      <label className="text-white/70 text-xs">Tipo de Linha</label>
                      <select
                        value={lineType}
                        onChange={(e) => setLineType(e.target.value)}
                        className="w-full bg-white/10 text-white text-sm px-3 py-2 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      >
                        <option value="solid" style={{backgroundColor: '#333'}}>Sólida</option>
                        <option value="dashed" style={{backgroundColor: '#333'}}>Tracejada</option>
                        <option value="dotted" style={{backgroundColor: '#333'}}>Pontilhada</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Segunda coluna */}
                  <div className="space-y-4">
                    {/* Cor de fundo */}
                    <div className="flex items-center gap-3">
                      <label className="text-white/70 text-xs min-w-fit">Cor de Fundo</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-8 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                      />
                    </div>
                    
                    {/* Efeito brilho */}
                    <div className="flex items-center gap-3">
                      <label className="text-white/70 text-xs">Efeito Brilho</label>
                      <button
                        onClick={() => setGlowEffect(!glowEffect)}
                        className={`w-12 h-6 rounded-full border-2 transition-colors ${
                          glowEffect 
                            ? 'bg-blue-500 border-blue-400' 
                            : 'bg-white/10 border-white/30'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          glowEffect ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                    
                    {/* Densidade de partículas */}
                    <div className="space-y-2">
                      <label className="text-white/70 text-xs">Partículas</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={particleDensity}
                        onChange={(e) => setParticleDensity(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-white/50 text-xs">{particleDensity}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Geometria */}
              <div className="space-y-4">
                <h3 className="text-white/90 text-xs font-semibold uppercase tracking-wide border-b border-white/10 pb-2">
                  Geometria
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/70 text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tamanho da Elipse
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="1.2"
                    step="0.1"
                    value={ellipseSize}
                    onChange={(e) => setEllipseSize(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white/50 text-xs">{Math.round(ellipseSize * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Áudio oculto */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
      {/* Estilos customizados */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #e5e5e5);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        
        .slider::-webkit-slider-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #e5e5e5);
          border: 2px solid rgba(255, 255, 255, 0.8);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-track {
          height: 6px;
          border-radius: 3px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3));
          border: none;
        }
      `}</style>
    </div>
  )
}
