'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface TerminalVisualizerProps {
  audioElement?: HTMLAudioElement | null
  style?: 'bars' | 'wave' | 'minimal' | 'matrix'
}

export default function TerminalVisualizer({ 
  audioElement, 
  style = 'bars' 
}: TerminalVisualizerProps) {
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [display, setDisplay] = useState<string>('')
  const [vuLevel, setVuLevel] = useState<number>(0)

  const setupAudio = useCallback(() => {
    if (!audioElement) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyzer = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioElement)
      
      analyzer.fftSize = 64
      analyzer.smoothingTimeConstant = 0.3
      
      source.connect(analyzer)
      analyzer.connect(audioContext.destination)
      
      analyzerRef.current = analyzer
    } catch (error) {
      console.error('Audio setup error:', error)
    }
  }, [audioElement])

  const animate = useCallback(() => {
    if (!analyzerRef.current) return

    const analyzer = analyzerRef.current
    const dataArray = new Uint8Array(analyzer.frequencyBinCount)
    analyzer.getByteFrequencyData(dataArray)

    let output = ''
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

    switch (style) {
      case 'bars':
        // ASCII bar visualizer
        for (let i = 0; i < 16; i++) {
          const value = dataArray[i * 2] || 0
          const height = Math.floor((value / 255) * 8)
          const chars = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
          output += chars[height] || ' '
        }
        break

      case 'wave':
        // Sine wave ASCII
        const waveChars = ['_', '-', '~', '^', '*', '#']
        for (let i = 0; i < 32; i++) {
          const value = dataArray[i] || 0
          const charIndex = Math.floor((value / 255) * waveChars.length)
          output += waveChars[charIndex] || '_'
        }
        break

      case 'minimal':
        // Super minimal - just moving dots
        const dots = Math.floor((average / 255) * 20)
        output = '●'.repeat(dots) + '○'.repeat(20 - dots)
        break

      case 'matrix':
        // Matrix-style falling characters
        const matrixChars = '01'
        for (let i = 0; i < 40; i++) {
          const intensity = dataArray[i % dataArray.length] || 0
          if (intensity > 100) {
            output += matrixChars[Math.floor(Math.random() * matrixChars.length)]
          } else {
            output += ' '
          }
        }
        break
    }

    setDisplay(output)
    setVuLevel(Math.floor((average / 255) * 100))
    animationRef.current = requestAnimationFrame(animate)
  }, [style])

  useEffect(() => {
    if (audioElement && !audioElement.paused) {
      setupAudio()
      animate()
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, setupAudio, animate])

  const getVuMeter = () => {
    const bars = Math.floor(vuLevel / 5)
    return '|'.repeat(bars) + '-'.repeat(20 - bars)
  }

  return (
    <div className="font-mono text-green-400 bg-black p-3 border border-green-400/30 text-xs leading-tight">
      {/* Header */}
      <div className="text-green-400/60 mb-2">
        AUDIO ANALYZER v0.1 [{style.toUpperCase()}]
      </div>

      {/* Main display */}
      <div className="bg-black border border-green-400/20 p-2 min-h-[60px] flex items-center justify-center">
        <span className="letter-spacing-wide">
          {display || (style === 'bars' ? '████████████████' : 
                      style === 'wave' ? '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~' :
                      style === 'minimal' ? '○○○○○○○○○○○○○○○○○○○○' :
                      '01010101010101010101010101010101010101')}
        </span>
      </div>

      {/* VU Meter */}
      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <span>VU:</span>
        <span className="font-mono">{getVuMeter()}</span>
        <span>{vuLevel.toString().padStart(3, '0')}%</span>
      </div>

      {/* Status */}
      <div className="mt-1 text-green-400/40 text-[8px]">
        STATUS: {audioElement && !audioElement.paused ? 'ANALYZING' : 'STANDBY'} | 
        FFT: 64 | REFRESH: 60FPS
      </div>
    </div>
  )
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
