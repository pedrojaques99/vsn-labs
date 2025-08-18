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

  const setupAudio = async (file: File) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioRef.current!)
      
      // Configurações mais sensíveis para o analisador
      analyser.fftSize = 512 // Aumentar para mais resolução
      analyser.smoothingTimeConstant = 0.3 // Suavizar transições
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      
      const bufferLength = analyser.frequencyBinCount
      
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Configurar dados de frequência
      const dataArray = new Uint8Array(bufferLength)
      
      const animate = () => {
        if (!analyser || !canvasRef.current) return
        
        analyser.getByteFrequencyData(dataArray)
        drawWaveform(dataArray)
        animationRef.current = requestAnimationFrame(animate)
      }
      
      animate()
      
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
        setupAudio(file).finally(() => setIsLoading(false))
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
      
      {/* Controles de efeito minimalistas */}
      <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
        <div className="flex items-center gap-3">
          {/* Toggle controles */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors hover:scale-105"
            title={showControls ? 'Ocultar controles' : 'Mostrar controles'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          {/* Controles de efeito */}
          {showControls && (
            <div className="flex items-center gap-3">
              {/* Amplitude */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={amplitude}
                  onChange={(e) => setAmplitude(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Amplitude: ${amplitude}`}
                />
              </div>
              
              {/* Velocidade da onda */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={waveSpeed}
                  onChange={(e) => setWaveSpeed(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Velocidade: ${waveSpeed}`}
                />
              </div>
              
              {/* Densidade de partículas */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={particleDensity}
                  onChange={(e) => setParticleDensity(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Partículas: ${particleDensity}`}
                />
              </div>
              
              {/* Largura da linha */}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <input
                  type="range"
                  min="0.4"
                  max="1.0"
                  step="0.1"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  title={`Largura: ${lineWidth * 100}%`}
                />
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
      
      {/* Estilos para o slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          border: none;
        }
      `}</style>
    </div>
  )
}
