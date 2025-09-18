'use client'

import { useState, useRef } from 'react'
import { RetroAudioVisualizer, TerminalVisualizer, VintageScope } from '@/components/2d'
import { Play, Pause, Upload } from 'lucide-react'

export default function RetroVisualizersPage() {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      alert('Por favor, selecione um arquivo de áudio')
      return
    }

    const url = URL.createObjectURL(file)
    
    if (audioRef.current) {
      audioRef.current.src = url
      setCurrentAudio(audioRef.current)
      setCurrentTrack(file.name)
    }
  }

  const togglePlay = () => {
    if (!currentAudio) return

    if (isPlaying) {
      currentAudio.pause()
    } else {
      currentAudio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleAudioEvents = () => {
    if (!audioRef.current) return
    
    audioRef.current.addEventListener('play', () => setIsPlaying(true))
    audioRef.current.addEventListener('pause', () => setIsPlaying(false))
    audioRef.current.addEventListener('ended', () => setIsPlaying(false))
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2 tracking-wider">
            [RETRO AUDIO VISUALIZERS]
          </h1>
          <div className="w-48 h-px bg-green-400 mx-auto opacity-60" />
          <p className="text-green-400/60 text-sm mt-4">
            Visualizadores de áudio com estética de computador antigo
          </p>
        </div>

        {/* Audio Controls */}
        <div className="mb-8 p-4 border border-green-400/30 rounded bg-black/20">
          <h2 className="text-lg font-semibold mb-4">Controles de Áudio</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-900/20 border border-green-400/30 rounded hover:bg-green-900/40 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Upload MP3
            </button>

            {currentAudio && (
              <button
                onClick={togglePlay}
                className="px-4 py-2 bg-green-900/20 border border-green-400/30 rounded hover:bg-green-900/40 transition-colors flex items-center gap-2"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? 'Pausar' : 'Reproduzir'}
              </button>
            )}
          </div>

          {currentTrack && (
            <div className="text-sm text-green-400/60">
              📀 {currentTrack}
            </div>
          )}

          <audio
            ref={audioRef}
            onLoadedData={handleAudioEvents}
            className="hidden"
          />
        </div>

        {/* Visualizers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spectrum Analyzer */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Spectrum Analyzer</h3>
            <RetroAudioVisualizer 
              audioElement={currentAudio}
              barCount={16}
              showFrequencyLabels={true}
            />
          </div>

          {/* Terminal Visualizer - Bars */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Terminal Bars</h3>
            <TerminalVisualizer 
              audioElement={currentAudio}
              style="bars"
            />
          </div>

          {/* Terminal Visualizer - Wave */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Terminal Wave</h3>
            <TerminalVisualizer 
              audioElement={currentAudio}
              style="wave"
            />
          </div>

          {/* Terminal Visualizer - Minimal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Minimal Display</h3>
            <TerminalVisualizer 
              audioElement={currentAudio}
              style="minimal"
            />
          </div>

          {/* Terminal Visualizer - Matrix */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Matrix Style</h3>
            <TerminalVisualizer 
              audioElement={currentAudio}
              style="matrix"
            />
          </div>

          {/* Vintage Oscilloscope */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vintage Oscilloscope</h3>
            <VintageScope 
              audioElement={currentAudio}
              width={50}
              height={12}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-4 border border-green-400/20 rounded bg-black/10">
          <h3 className="text-lg font-semibold mb-4">Como usar:</h3>
          <ul className="text-sm text-green-400/70 space-y-2">
            <li>• Faça upload de um arquivo MP3 ou áudio</li>
            <li>• Pressione play para ver os visualizadores reagirem</li>
            <li>• Cada visualizador tem um estilo diferente de computador antigo</li>
            <li>• Spectrum Analyzer: barras de frequência ASCII</li>
            <li>• Terminal: diversos estilos de terminal retro</li>
            <li>• Oscilloscope: osciloscópio vintage com grade CRT</li>
          </ul>
        </div>

        {/* Tech Specs */}
        <div className="mt-8 text-center text-green-400/40 text-xs">
          <div>SYSTEM: Web Audio API | FFT: 64-512 | REFRESH: 60FPS</div>
          <div>COMPATIBLE: MP3, WAV, OGG, M4A | SAMPLE RATE: 44.1kHz</div>
        </div>
      </div>
    </div>
  )
}
