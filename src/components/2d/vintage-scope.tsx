'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface VintageScopeProps {
  audioElement?: HTMLAudioElement | null
  width?: number
  height?: number
}

export default function VintageScope({ 
  audioElement, 
  width = 60, 
  height = 15 
}: VintageScopeProps) {
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [grid, setGrid] = useState<string[][]>([])
  const [signal, setSignal] = useState<boolean>(false)

  // Initialize grid
  useEffect(() => {
    const newGrid = Array(height).fill(null).map(() => Array(width).fill(' '))
    setGrid(newGrid)
  }, [width, height])

  const setupAudio = useCallback(() => {
    if (!audioElement) return

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyzer = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioElement)
      
      analyzer.fftSize = 256
      analyzer.smoothingTimeConstant = 0.1
      
      source.connect(analyzer)
      analyzer.connect(audioContext.destination)
      
      analyzerRef.current = analyzer
      setSignal(true)
    } catch (error) {
      console.error('Audio error:', error)
      setSignal(false)
    }
  }, [audioElement])

  const animate = useCallback(() => {
    if (!analyzerRef.current) return

    const analyzer = analyzerRef.current
    const dataArray = new Uint8Array(analyzer.frequencyBinCount)
    analyzer.getByteTimeDomainData(dataArray) // Time domain for oscilloscope effect

    // Clear grid
    const newGrid = Array(height).fill(null).map(() => Array(width).fill(' '))

    // Draw grid lines (retro scope style)
    const midY = Math.floor(height / 2)
    for (let x = 0; x < width; x++) {
      if (x % 10 === 0) {
        // Vertical grid lines
        for (let y = 0; y < height; y++) {
          newGrid[y][x] = y === midY ? '+' : '|'
        }
      }
      // Horizontal center line
      if (newGrid[midY][x] === ' ') {
        newGrid[midY][x] = '-'
      }
    }

    // Draw waveform
    for (let x = 0; x < width - 1; x++) {
      const sampleIndex = Math.floor((x / width) * dataArray.length)
      const sample = dataArray[sampleIndex]
      
      // Convert sample to Y position
      const normalizedSample = (sample - 128) / 128 // -1 to 1
      const y = Math.floor(midY - (normalizedSample * (height / 3)))
      const clampedY = Math.max(0, Math.min(height - 1, y))

      // Draw waveform with different characters based on intensity
      const intensity = Math.abs(normalizedSample)
      let char = '·'
      if (intensity > 0.7) char = '█'
      else if (intensity > 0.4) char = '▓'
      else if (intensity > 0.2) char = '▒'
      else if (intensity > 0.1) char = '░'

      newGrid[clampedY][x] = char
    }

    setGrid(newGrid)
    animationRef.current = requestAnimationFrame(animate)
  }, [width, height])

  useEffect(() => {
    if (audioElement && !audioElement.paused) {
      setupAudio()
      animate()
    } else {
      setSignal(false)
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

  return (
    <div className="font-mono text-xs">
      {/* CRT-style header */}
      <div className="text-green-400/70 mb-1 flex justify-between">
        <span>OSCILLOSCOPE CRT-1</span>
        <span className={`${signal ? 'text-green-400' : 'text-red-400'}`}>
          {signal ? '● SIGNAL' : '○ NO SIG'}
        </span>
      </div>

      {/* Screen bezel */}
      <div className="bg-gray-800 p-1 rounded border-2 border-gray-700">
        {/* CRT screen */}
        <div className="bg-black border border-green-400/20 p-2 rounded-sm">
          {/* Scope display */}
          <div className="text-green-400 leading-none" style={{ fontSize: '8px' }}>
            {grid.map((row, y) => (
              <div key={y} className="whitespace-pre">
                {row.join('')}
              </div>
            ))}
          </div>
        </div>

        {/* Control panel */}
        <div className="mt-1 flex justify-between text-[8px] text-gray-400">
          <span>VOLT/DIV: 1V</span>
          <span>TIME/DIV: 1ms</span>
          <span>TRIG: AUTO</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-green-400/40 text-[8px] mt-1 text-center">
        {audioElement && !audioElement.paused ? 'SAMPLING @ 44.1kHz' : 'STANDBY MODE'}
      </div>
    </div>
  )
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
