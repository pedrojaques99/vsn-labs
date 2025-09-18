'use client'

import { Eye, EyeOff, Play, Pause, ListX, Heart } from 'lucide-react'
import { MasterButton } from '@/components/shared'
import { VolumeSlider } from '@/components/shared'
import VinylPlayer from './VinylPlayer'

interface MasterControlsBarProps {
  isGlobalPlaying: boolean
  onToggleGlobalPlay: () => void
  hideAllVideos: boolean
  onToggleAllVideosVisibility: () => void
  autoPlay: boolean
  onToggleAutoPlay: (checked: boolean) => void
  globalVolume: number
  onGlobalVolumeChange: (volume: number) => void
  onClearAllSlots: () => void
  onToggleVinyl: () => void
  currentMixName?: string
  onLikeMix?: () => void
  isMixLiked?: boolean
}

export default function MasterControlsBar({
  isGlobalPlaying,
  onToggleGlobalPlay,
  hideAllVideos,
  onToggleAllVideosVisibility,
  autoPlay,
  onToggleAutoPlay,
  globalVolume,
  onGlobalVolumeChange,
  onClearAllSlots,
  onToggleVinyl,
  currentMixName,
  onLikeMix,
  isMixLiked
}: MasterControlsBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-theme-static border-t border-[var(--theme-glass-border)] master-controls-bar">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 pb-4">
        <div className="flex items-center w-full">
          {/* Left Section - Play Button + Mix Info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Play/Pause Button */}
            <MasterButton
              onClick={onToggleGlobalPlay}
              icon={isGlobalPlaying ? <Pause size={20} className="sm:w-6 sm:h-6" /> : <Play size={20} className="sm:w-6 sm:h-6" />}
              title={isGlobalPlaying ? 'Pause All' : 'Play All'}
              variant="default"
              size="medium"
            />
            
            {/* Mix Name and Creator */}
            {currentMixName && (
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs sm:text-sm text-[var(--theme-text)] font-mono truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">
                  🎵 {currentMixName}
                </div>
                {/* Like Button */}
                {onLikeMix && (
                  <MasterButton
                    onClick={onLikeMix}
                    icon={
                      <Heart 
                        size={14} 
                        className={`${isMixLiked ? 'fill-current' : ''}`}
                      />
                    }
                    title={isMixLiked ? 'Unlike mix' : 'Like mix'}
                    variant={isMixLiked ? "danger" : "default"}
                    size="small"
                    className={isMixLiked ? 'ring-2 ring-red-400/50 shadow-lg shadow-red-400/20' : ''}
                  />
                )}
              </div>
            )}
          </div>

          {/* Center Section - Vinyl Animation */}
          <div className="flex items-center justify-center flex-shrink-0 px-4 scale-150">
            <VinylPlayer 
              isGlobalPlaying={isGlobalPlaying}
              onToggle={onToggleVinyl}
            />
          </div>

          {/* Right Section - Controls + Volume */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1 justify-end">
            {/* Hide All Videos Toggle */}
            <MasterButton
              onClick={onToggleAllVideosVisibility}
              icon={hideAllVideos ? <EyeOff size={20} className="sm:w-6 sm:h-6" /> : <Eye size={20} className="sm:w-6 sm:h-6" />}
              title={hideAllVideos ? 'Show All Videos' : 'Hide All Videos'}
              variant="default"
              size="medium"
            />

            {/* Clear All Button */}
            <MasterButton
              onClick={onClearAllSlots}
              icon={<ListX size={16} className="sm:w-5 sm:h-5" />}
              title="Clear all slots"
              variant="danger"
              size="medium"
            />

            {/* AutoPlay Toggle */}
            <div className="flex items-center gap-1 sm:gap-2">
              <MasterButton
                onClick={() => onToggleAutoPlay(!autoPlay)}
                icon={
                  <div className={`w-1 h-1 sm:w-2 sm:h-2 rounded-sm transition-colors ${
                    autoPlay ? 'bg-green-400' : 'bg-white/60'
                  }`} />
                }
                title={autoPlay ? 'AutoPlay ON - Click to disable' : 'AutoPlay OFF - Click to enable'}
                variant={autoPlay ? "success" : "default"}
                size="medium"
                className={autoPlay ? 'ring-2 ring-green-400/50 shadow-lg shadow-green-400/20' : ''}
              />
              <span className="text-[10px] sm:text-xs text-[var(--theme-text-secondary)] font-mono">AUTO-PLAY</span>
            </div>

            {/* Volume */}
            <div className="w-28 sm:w-32 md:w-44 flex-shrink-0">
              <VolumeSlider
                value={globalVolume}
                onChange={onGlobalVolumeChange}
                size="medium"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
