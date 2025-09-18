'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface RetroAudioVisualizerProps {
  audioElement?: HTMLAudioElement | null
  width?: number
  height?: number
  barCount?: number
  minHeight?: number
  maxHeight?: number
  characters?: string[]
  showFrequencyLabels?: boolean
}

export default function RetroAudioVisualizer({
  audioElement,
  barCount = 16,
  minHeight = 1,
  maxHeight = 18,
  characters = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'],
  showFrequencyLabels = true
}: RetroAudioVisualizerProps) {
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [frequencies, setFrequencies] = useState<number[]>(new Array(barCount).fill(0))
  const [isActive, setIsActive] = useState(false)

  // Create audio context and analyzer
  const setupAudioAnalyzer = useCallback(() => {
    if (!audioElement) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyzer = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioElement)
      
      analyzer.fftSize = 512
      analyzer.smoothingTimeConstant = 0.8
      
      source.connect(analyzer)
      analyzer.connect(audioContext.destination)
      
      analyzerRef.current = analyzer
      setIsActive(true)
    } catch (error) {
      console.error('Erro ao configurar analisador de áudio:', error)
    }
  }, [audioElement])

  // Animation loop
  const animate = useCallback(() => {
    if (!analyzerRef.current) return

    const analyzer = analyzerRef.current
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    analyzer.getByteFrequencyData(dataArray)
    
    // Group frequencies into bars
    const barsData: number[] = []
    const samplesPerBar = Math.floor(bufferLength / barCount)
    
    for (let i = 0; i < barCount; i++) {
      let sum = 0
      const startIndex = i * samplesPerBar
      const endIndex = Math.min(startIndex + samplesPerBar, bufferLength)
      
      for (let j = startIndex; j < endIndex; j++) {
        sum += dataArray[j]
      }
      
      const average = sum / (endIndex - startIndex)
      const normalizedHeight = Math.floor((average / 255) * maxHeight)
      barsData.push(Math.max(minHeight, normalizedHeight))
    }
    
    setFrequencies(barsData)
    animationRef.current = requestAnimationFrame(animate)
  }, [barCount, maxHeight, minHeight])

  // Start/stop animation
  useEffect(() => {
    if (audioElement && !audioElement.paused) {
      setupAudioAnalyzer()
      animate()
    } else {
      setIsActive(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, setupAudioAnalyzer, animate])

  // Listen to audio play/pause events
  useEffect(() => {
    if (!audioElement) return

    const handlePlay = () => {
      setupAudioAnalyzer()
      animate()
    }

    const handlePause = () => {
      setIsActive(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)

    return () => {
      audioElement.removeEventListener('play', handlePlay)
      audioElement.removeEventListener('pause', handlePause)
    }
  }, [audioElement, setupAudioAnalyzer, animate])

  // Get character for height
  const getCharForHeight = (height: number): string => {
    if (height <= 0) return ' '
    const charIndex = Math.min(Math.floor((height / maxHeight) * characters.length), characters.length - 1)
    return characters[charIndex] || ' '
  }

  // Frequency labels for retro feel
  const frequencyLabels = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz']

  return (
    <div className="font-mono text-xs leading-none">
      {/* Frequency labels */}
      {showFrequencyLabels && (
        <div className="flex justify-between text-green-400/60 mb-1 px-1">
          {frequencyLabels.slice(0, Math.min(9, barCount)).map((label, i) => (
            <span key={i} className="text-[8px]">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ASCII Visualizer */}
      <div className="bg-black border border-green-400/30 p-2 rounded">
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${barCount}, 1fr)` }}>
          {frequencies.map((freq, i) => (
            <div key={i} className="flex flex-col-reverse items-center">
              {/* Create vertical bars */}
              {Array.from({ length: maxHeight }, (_, j) => (
                <div
                  key={j}
                  className={`transition-all duration-75 ${
                    j < freq 
                      ? `text-green-400 ${j > maxHeight * 0.8 ? 'text-red-400' : j > maxHeight * 0.6 ? 'text-yellow-400' : 'text-green-400'}`
                      : 'text-green-900/30'
                  }`}
                  style={{ 
                    height: '8px',
                    lineHeight: '8px',
                    fontSize: '8px'
                  }}
                >
                  {getCharForHeight(j < freq ? maxHeight : 0)}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between mt-2 text-green-400/60 text-[8px]">
          <span>SPECTRUM ANALYZER v1.0</span>
          <span className={`${isActive ? 'text-green-400' : 'text-red-400'}`}>
            {isActive ? '● REC' : '○ STOP'}
          </span>
        </div>

        {/* Retro-style VU meter */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-green-400/60 text-[8px]">VU:</span>
          <div className="flex gap-0">
            {Array.from({ length: 20 }, (_, i) => {
              const avgFreq = frequencies.reduce((a, b) => a + b, 0) / frequencies.length
              const isActive = i < (avgFreq / maxHeight) * 20
              return (
                <span 
                  key={i} 
                  className={`text-[8px] ${
                    isActive 
                      ? i > 16 ? 'text-red-400' : i > 12 ? 'text-yellow-400' : 'text-green-400'
                      : 'text-green-900/30'
                  }`}
                >
                  ▌
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Retro terminal info */}
      <div className="text-green-400/40 text-[8px] mt-1">
        <div>FFT: 512 | SAMPLE: 44.1kHz | BITS: 16</div>
        <div>FREQ RANGE: 20Hz - 20kHz | BARS: {barCount}</div>
      </div>
    </div>
  )
}

// Global types for Web Audio API
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
