'use client'

import { useEffect, useRef, useState } from 'react'
import { Upload, Play, Pause, Volume2, Music, FileAudio, Loader2 } from 'lucide-react'

export default function AudioFrequencyWave() {
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
  const [amplitude, setAmplitude] = useState(120)
  const [waveSpeed, setWaveSpeed] = useState(10)
  const [particleDensity, setParticleDensity] = useState(50)
  const [lineWidth, setLineWidth] = useState(0.8)

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
        ;(analyserRef.current.getByteFrequencyData as (data: Uint8Array) => void)(dataArray)
      } else {
        // Usar dados simulados quando não há áudio
        dataArray = generateSimulatedData()
      }
      
      drawWaveform(dataArray)
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [amplitude, waveSpeed, particleDensity, lineWidth, isPlaying]) // Reagir a mudanças nos controles

  // Função para gerar dados simulados para preview
  const generateSimulatedData = (): Uint8Array => {
    const data = new Uint8Array(256)
    const time = Date.now() * 0.002
    
    for (let i = 0; i < data.length; i++) {
      // Simular diferentes faixas de frequência
      const bassFreq = i < 32 ? Math.sin(time * 1.5 + i * 0.3) * 80 + 40 : 0
      const midFreq = i >= 32 && i < 128 ? Math.sin(time * 2.5 + i * 0.1) * 60 + 30 : 0
      const highFreq = i >= 128 ? Math.sin(time * 4 + i * 0.05) * 40 + 20 : 0
      
      // Adicionar variação aleatória sutil
      const noise = (Math.random() - 0.5) * 15
      
      // Combinar frequências com atenuação por faixa
      const combined = (bassFreq + midFreq + highFreq + noise) * (0.4 + Math.sin(time) * 0.3)
      
      data[i] = Math.max(0, Math.min(255, combined))
    }
    
    return data
  }

  const setupAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.current!)
      
      // Configurações mais sensíveis para o analisador
      analyser.fftSize = 512 // Aumentar para mais resolução
      analyser.smoothingTimeConstant = 0.3 // Suavizar transições
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

  const drawWaveform = (dataArray: Uint8Array) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Limpar canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)
    
    // Desenhar partículas de fundo sutis
    drawBackgroundParticles(ctx, width, height, dataArray)
    
    // Configurar linha
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    // Calcular dimensões da linha (80% da largura para mais área)
    const calculatedLineWidth = width * lineWidth
    const startX = (width - calculatedLineWidth) / 2
    const centerY = height / 2
    
    // Desenhar linha distorcida com efeito de waveform
    ctx.beginPath()
    
    // Primeiro ponto
    const firstFrequency = dataArray[0] / 255
    const firstDistortion = firstFrequency * (amplitude * 0.7)
    ctx.moveTo(startX, centerY + Math.sin(0) * firstDistortion)
    
    // Pontos intermediários com interpolação suave
    const segments = 300 // Mais segmentos para suavidade
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments
      const dataIndex = Math.floor(progress * dataArray.length)
      const nextDataIndex = Math.min(dataIndex + 1, dataArray.length - 1)
      
      // Interpolação entre pontos de dados
      const currentFreq = dataArray[dataIndex] / 255
      const nextFreq = dataArray[nextDataIndex] / 255
      const interpolatedFreq = currentFreq + (nextFreq - currentFreq) * (progress * dataArray.length - dataIndex)
      
      const x = startX + (progress * calculatedLineWidth)
      
      // Aplicar múltiplas frequências para efeito mais rico e distribuído
      const distortion1 = interpolatedFreq * amplitude // Base principal
      const distortion2 = interpolatedFreq * (amplitude * 0.7) * Math.sin(progress * Math.PI * 6)
      const distortion3 = interpolatedFreq * (amplitude * 0.5) * Math.cos(progress * Math.PI * 3)
      const distortion4 = interpolatedFreq * (amplitude * 0.3) * Math.sin(progress * Math.PI * 12)
      
      // Combinar distorções com pesos diferentes para distribuição uniforme
      const totalDistortion = distortion1 + distortion2 + distortion3 + distortion4
      
      // Aplicar distorção de forma mais uniforme ao longo da linha
      const waveEffect = Math.sin(progress * Math.PI * waveSpeed) * totalDistortion
      const y = centerY + waveEffect
      
      ctx.lineTo(x, y)
    }
    
    ctx.stroke()
    
    // Adicionar linha de fundo sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(startX, centerY)
    ctx.lineTo(startX + calculatedLineWidth, centerY)
    ctx.stroke()
  }

  const drawBackgroundParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, dataArray: Uint8Array) => {
    // Calcular intensidade média da música
    const averageIntensity = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255
    
    // Desenhar partículas baseadas na intensidade e densidade configurável
    const particleCount = Math.floor(averageIntensity * particleDensity) + 10
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 2 + 1
      const opacity = Math.random() * 0.3 + 0.1
      
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
          
          {/* Nome do arquivo (tooltip) */}
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
          
          {/* Instruções (apenas quando não há arquivo) */}
          {!audioFile && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Music className="w-4 h-4" />
              <span>Selecione um arquivo</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Sistema de controles unificado */}
      <div className="controls-container">
        {/* Toggle button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className={`glass-toggle liquid-animate ${showControls ? 'active' : ''}`}
          title={showControls ? 'Ocultar controles' : 'Mostrar controles'}
        >
          ⚙️
        </button>
        
        {/* Painel de controles */}
        {showControls && (
          <div className="controls-panel glass-panel">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-white/90 tracking-wide">AUDIO CONTROLS</h3>
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 glow-pulse"></div>
              </div>
              
              {/* Controles de efeito */}
              <div className="space-y-4">
                {/* Amplitude */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-white/70 font-mono">
                    <span>AMPLITUDE</span>
                    <span>{amplitude}</span>
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={amplitude}
                    onChange={(e) => setAmplitude(Number(e.target.value))}
                    className="glass-slider w-full"
                  />
                </div>
                
                {/* Velocidade */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-white/70 font-mono">
                    <span>VELOCITY</span>
                    <span>{waveSpeed}</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={waveSpeed}
                    onChange={(e) => setWaveSpeed(Number(e.target.value))}
                    className="glass-slider w-full"
                  />
                </div>
                
                {/* Densidade */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-white/70 font-mono">
                    <span>DENSITY</span>
                    <span>{particleDensity}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={particleDensity}
                    onChange={(e) => setParticleDensity(Number(e.target.value))}
                    className="glass-slider w-full"
                  />
                </div>
                
                {/* Espessura */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between text-xs text-white/70 font-mono">
                    <span>THICKNESS</span>
                    <span>{(lineWidth * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    min="0.4"
                    max="1.0"
                    step="0.1"
                    value={lineWidth}
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="glass-slider w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Áudio oculto */}
      <audio
        ref={audioRef}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      
    </div>
  )
}
