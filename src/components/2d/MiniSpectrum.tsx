'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface MiniSpectrumProps {
  audioElement?: HTMLAudioElement
  youtubePlayer?: unknown
  isPlaying: boolean
  barCount?: number
}

export default function MiniSpectrum({ audioElement, youtubePlayer, isPlaying, barCount = 8 }: MiniSpectrumProps) {
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [frequencies, setFrequencies] = useState<number[]>(new Array(barCount).fill(0))

  const setupAudioAnalyzer = useCallback(() => {
    if (!audioElement || analyzerRef.current) return

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      
      // Resume audio context if it's suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume()
      }
      
      const analyzer = audioContext.createAnalyser()
      const source = audioContext.createMediaElementSource(audioElement)
      
      analyzer.fftSize = 512 // Mais resolução
      analyzer.smoothingTimeConstant = 0.6 // Menos suavização para mais reatividade
      
      source.connect(analyzer)
      analyzer.connect(audioContext.destination)
      
      analyzerRef.current = analyzer
    } catch (error) {
      console.error('Audio analyzer setup error:', error)
      // Fallback to simulated data if audio analysis fails
    }
  }, [audioElement])

  const animate = useCallback(() => {
    if (!analyzerRef.current) return

    const analyzer = analyzerRef.current
    const bufferLength = analyzer.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    analyzer.getByteFrequencyData(dataArray)
    
    // Group frequencies into bars com mais intensidade
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
      // Aumentar intensidade: elevar ao quadrado e amplificar
      const intensity = Math.pow(average / 255, 0.7) * 15 // 0-15 scale com mais reatividade
      barsData.push(Math.max(0, Math.floor(intensity)))
    }
    
    setFrequencies(barsData)
    animationRef.current = requestAnimationFrame(animate)
  }, [barCount])

  // Generate simulated data when no audio
  const generateSimulatedData = useCallback(() => {
    const time = Date.now() * 0.004
    return Array.from({ length: barCount }, (_, i) => {
      const wave = Math.sin(time + i * 0.7) * 4 + 3
      const bass = i < 3 ? Math.sin(time * 1.2) * 2 : 0
      const treble = i > 6 ? Math.sin(time * 2.5) * 1.5 : 0
      return Math.max(0, Math.min(15, wave + bass + treble)) // Mesma escala 0-15
    })
  }, [barCount])

  useEffect(() => {
    // Reset analyzer when audio element changes
    analyzerRef.current = null
    
    if (audioElement && isPlaying) {
      setupAudioAnalyzer()
      animate()
    } else if (isPlaying) {
      // Show simulated data for YouTube videos
      const simulateAnimate = () => {
        setFrequencies(generateSimulatedData())
        animationRef.current = requestAnimationFrame(simulateAnimate)
      }
      simulateAnimate()
    } else {
      // Stop animation and reset
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setFrequencies(new Array(barCount).fill(0))
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, isPlaying, setupAudioAnalyzer, animate, generateSimulatedData, barCount])

  const getBarHeight = (freq: number) => {
    return Math.max(1, (freq / 15) * 32) // Min 1px, max 32px - ajustado para escala 0-15
  }

  // Não renderizar se não há áudio ou não está tocando
  const hasAudio = audioElement || youtubePlayer
  if (!hasAudio || !isPlaying) {
    return null
  }

  return (
    <div className="flex items-end justify-center gap-0.5 h-8 px-1">
      {frequencies.map((freq, i) => (
        <div
          key={i}
          className="bg-[var(--theme-accent)] rounded-t transition-all duration-50"
          style={{
            height: `${getBarHeight(freq)}px`,
            width: '1.5px' // Metade da largura anterior
          }}
        />
      ))}
    </div>
  )
}
