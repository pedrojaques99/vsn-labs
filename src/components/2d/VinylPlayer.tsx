'use client'

import { Disc3 } from 'lucide-react'
import { useMixer } from '@/contexts/MixerContext'

interface VinylPlayerProps {
  isGlobalPlaying: boolean
  onToggle: () => void
  className?: string
}

export default function VinylPlayer({ 
  isGlobalPlaying,
  onToggle, 
  className = '' 
}: VinylPlayerProps) {
  const { players } = useMixer()

  // Check if any slot has content and is actually playing
  const hasPlayingContent = players.some(player => 
    (player.url || player.fileName) && player.isPlaying
  )

  // Check if any slot has content but is paused
  const hasPausedContent = players.some(player => 
    (player.url || player.fileName) && !player.isPlaying
  )

  // Determine the visual state and tooltip
  const getVinylState = () => {
    if (hasPlayingContent) {
      return {
        spinning: true,
        color: 'text-[var(--theme-accent)]',
        tooltip: 'Pause All'
      }
    } else if (hasPausedContent) {
      return {
        spinning: false,
        color: 'text-[var(--theme-text)] opacity-90',
        tooltip: 'Play All'
      }
    } else {
      return {
        spinning: false,
        color: 'text-[var(--theme-text-secondary)]',
        tooltip: 'No content loaded'
      }
    }
  }

  const vinylState = getVinylState()

  return (
    <div className={`flex items-center justify-center cursor-pointer rounded p-1 transition-colors duration-200 ${className}`}>
      {/* Vinyl icon - intelligent visual indicator */}
      <div 
        onClick={onToggle}
        title={vinylState.tooltip}
      >
        <Disc3 
          size={33} 
          className={`transition-all duration-300 hover:text-[var(--theme-accent)] ${
            vinylState.spinning ? 'animate-spin' : ''
          } ${vinylState.color}`}
          style={{ animationDuration: '2s' }}
        />
      </div>
    </div>
  )
}
