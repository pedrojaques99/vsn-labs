'use client'

import React, { useState } from 'react'
import { Play, Pause, RotateCcw, X, Upload, Heart, RotateCw, SkipBack, SkipForward, Shuffle } from 'lucide-react'
import { MasterButton, VolumeSlider } from '@/components/shared'
import MiniSpectrum from '@/components/2d/MiniSpectrum'

import { MediaPlayer } from '@/contexts/MixerContext'

interface MixerSlotProps {
  player: MediaPlayer
  hideAllVideos: boolean
  recentUrls: {url: string, title: string}[]
  showSuggestions: { [key: string]: boolean }
  onUpdateSlot: (slotId: string, url: string) => void
  onClearSlot: (slotId: string) => void
  onTogglePlay: (playerId: string) => void
  onSetVolume: (playerId: string, volume: number) => void
  onToggleLoop: (playerId: string) => void
  onSetPlaybackRate: (playerId: string, rate: number) => void
  onSeekTo: (playerId: string, time: number) => void
  onReloadPlayer: (playerId: string) => void
  onFileUpload: (slotId: string, file: File) => void
  onOpenSlotPresetDialog: (slotId: string) => void
  onSetShowSuggestions: (suggestions: { [key: string]: boolean }) => void
  onLoadPresetToSpecificSlot: (slotId: string, url: string) => void
  onPlaylistNext: (playerId: string) => void
  onPlaylistPrevious: (playerId: string) => void
  onTogglePlaylistShuffle: (playerId: string) => void
  playlistShuffle: boolean
  getYouTubeVideoId: (url: string) => string | null
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement }>
  playerRefs: React.MutableRefObject<{ [key: string]: unknown }>
  allSlotsOccupied: boolean
  gridLayout: 1 | 2 | 4
}

// Helper function to format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function MixerSlot({
  player,
  hideAllVideos,
  recentUrls,
  showSuggestions,
  onUpdateSlot,
  onClearSlot,
  onTogglePlay,
  onSetVolume,
  onToggleLoop,
  onSetPlaybackRate,
  onSeekTo,
  onReloadPlayer,
  onFileUpload,
  onOpenSlotPresetDialog,
  onSetShowSuggestions,
  onLoadPresetToSpecificSlot,
  onPlaylistNext,
  onPlaylistPrevious,
  onTogglePlaylistShuffle,
  playlistShuffle,
  getYouTubeVideoId,
  audioRefs,
  playerRefs,
  allSlotsOccupied,
  gridLayout
}: MixerSlotProps) {
  // Drop state for visual feedback
  const [isDragOver, setIsDragOver] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // Button size based on grid layout
  const buttonSize = gridLayout === 4 ? 'small' : 'small'
  const iconSize = gridLayout === 4 ? 10 : 14
  const buttonPadding = gridLayout === 4 ? 'px-0.5 py-0.5' : 'px-2 py-1'

  // Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const url = e.dataTransfer.getData('text/plain')
    if (url) {
      // Check if this slot is already occupied
      if (player.url || player.fileName) {
        return // Don't drop on occupied slot
      }
      // Stop current player before loading new content
      if (player.isPlaying) {
        onTogglePlay(player.id)
      }
      // Small delay to ensure player stops before loading new content
      setTimeout(() => {
        onLoadPresetToSpecificSlot(player.id, url)
      }, 100)
    }
  }


  return (
    <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border rounded-sm backdrop-blur-sm overflow-hidden transition-all duration-200
          h-full flex flex-col
          ${isDragOver 
            ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 scale-105 shadow-lg shadow-[var(--theme-accent)]/20' 
            : player.isPlaying
            ? 'border-[var(--theme-accent)]/60 bg-[var(--theme-accent)]/10 shadow-lg shadow-[var(--theme-accent)]/20'
            : 'border-[var(--theme-glass-border)] bg-[var(--theme-glass-bg)] hover:border-[var(--theme-accent)]/40'
          }
          hover:border-[var(--theme-accent)]/40 hover:bg-[var(--theme-accent)]/5
        `}
      >
      {/* Drop Indicator Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--theme-accent)]/20 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📥</div>
            <div className="text-[var(--theme-accent)] font-mono text-sm font-bold">
              DROP HERE
            </div>
            <div className="text-[var(--theme-accent)] text-xs opacity-80">
              Load preset into this slot
            </div>
          </div>
        </div>
      )}

      {/* URL Input Header */}
      <div className={`p-3 border-b transition-colors duration-200 ${
        player.isPlaying 
          ? 'border-[var(--theme-accent)]/20 bg-[var(--theme-accent)]/1' 
          : 'border-[var(--theme-glass-border)]'
      }`}>
        
        <div className="space-y-2">

          {/* YouTube URL Input */}
          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <input
                type="text"
                value={player.type === 'youtube' ? player.url : ''}
                onChange={(e) => onUpdateSlot(player.id, e.target.value)}
                onFocus={(e) => {
                  e.stopPropagation()
                  onSetShowSuggestions({ [player.id]: true })
                }}
                placeholder={allSlotsOccupied && !player.url && !player.fileName ? "All slots occupied" : "YouTube URL or Playlist..."}
                className={`w-full px-3 py-2 text-xs glass-input text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] focus:border-[var(--theme-accent)] focus:outline-none ${
                  allSlotsOccupied && !player.url && !player.fileName ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={player.type === 'audio' || (allSlotsOccupied && !player.url && !player.fileName)}
                data-suggestions
              />
              
              {/* Recent URLs Suggestions */}
              {showSuggestions[player.id] && recentUrls.length > 0 && (
                <div 
                  data-suggestions
                  className="absolute top-full left-0 right-0 mt-1 glass-theme-static rounded-sm backdrop-blur-sm z-10 max-h-40 overflow-y-auto"
                >
                  <div className="p-2 text-xs text-[var(--theme-text-secondary)] border-b border-[var(--theme-glass-border)]">
                    Recent URLs:
                  </div>
                  {recentUrls.map((recentItem, index) => {
                    const isPlaylist = recentItem.title.startsWith('🎵')
                    return (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateSlot(player.id, recentItem.url)
                          onSetShowSuggestions({})
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-[var(--theme-text)] hover:bg-[var(--theme-glass-hover)] transition-colors border-b border-[var(--theme-glass-border)] last:border-b-0"
                      >
                        <div className="truncate font-medium flex items-center gap-1" title={recentItem.title}>
                          {isPlaylist ? (
                            <>
                              <span className="text-[var(--theme-accent)]">🎵</span>
                              <span className="text-[var(--theme-accent)] opacity-80">{recentItem.title.replace('🎵 ', '')}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[var(--theme-text-secondary)]">📹</span>
                              <span>{recentItem.title}</span>
                            </>
                          )}
                        </div>
                        <div className="text-[var(--theme-text-secondary)] text-[10px] truncate mt-0.5" title={recentItem.url}>
                          {recentItem.url}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex gap-1">
              {/* Save Slot as Preset Button - Always show when there's content */}
              {(player.url || player.fileName) && (
                <MasterButton
                  onClick={() => onOpenSlotPresetDialog(player.id)}
                  icon={<Heart size={14} />}
                  title="Save as preset"
                  variant="default"
                  size="small"
                  className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)]"
                />
              )}


              {/* MP3 Upload - Only show when no audio file is loaded AND not playing */}
              {!player.fileName && !player.isPlaying && (
                <>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFileUpload(player.id, file)
                    }}
                    className="hidden"
                    id={`file-${player.id}`}
                  />
                  <label
                    htmlFor={`file-${player.id}`}
                    className="text-[var(--theme-text-secondary)] hover:text-[var(--theme-accent)] transition-colors p-2 cursor-pointer"
                    title="Upload Audio"
                  >
                    <Upload size={14} />
                  </label>
                </>
              )}
              
              {(player.url || player.fileName) && (
                <MasterButton
                  onClick={() => onClearSlot(player.id)}
                  icon={<X size={14} />}
                  title="Clear slot"
                  variant="danger"
                  size="small"
                />
              )}
            </div>
          </div>
          
          {/* File Type Indicator and Video Title */}
          {(player.url || player.fileName) && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[var(--theme-text-secondary)]">
                  {player.isPlaylist ? '🎵 Playlist' : player.type === 'youtube' ? '📹 YouTube' : '🎵 Audio'}
                </div>
                {/* Reload Button and Playlist Navigation */}
                <div className="flex items-center gap-1">
                  {/* Reload Button - Only show when playing */}
                  {player.isPlaying && (
                    <button
                      onClick={() => onReloadPlayer(player.id)}
                      className="flex items-center justify-center w-6 h-6 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-glass-hover)] rounded transition-all duration-200"
                      title="Reload video/audio from beginning"
                    >
                      <RotateCw size={12} />
                    </button>
                  )}
                  {/* Playlist Navigation - Only show for playlists */}
                  {player.isPlaylist && (
                    <>
                      <MasterButton
                        onClick={() => onPlaylistPrevious(player.id)}
                        icon={<SkipBack size={10} />}
                        title="Previous video in playlist"
                        variant="default"
                        size="small"
                        className="text-[var(--theme-accent)] hover:text-[var(--theme-accent)] opacity-80 px-1 py-1 border-[var(--theme-glass-border)] hover:border-[var(--theme-accent)]/30"
                      />
                      <MasterButton
                        onClick={() => onPlaylistNext(player.id)}
                        icon={<SkipForward size={10} />}
                        title="Next video in playlist"
                        variant="default"
                        size="small"
                        className="text-[var(--theme-accent)] hover:text-[var(--theme-accent)] opacity-80 px-1 py-1 border-[var(--theme-glass-border)] hover:border-[var(--theme-accent)]/30"
                      />
                      <MasterButton
                        onClick={() => onTogglePlaylistShuffle(player.id)}
                        icon={<Shuffle size={10} />}
                        title={playlistShuffle ? "Shuffle ON - Click to disable" : "Shuffle OFF - Click to enable"}
                        variant={playlistShuffle ? "success" : "default"}
                        size="small"
                        className={`px-1 py-1 ${playlistShuffle ? 'ring-2 ring-[var(--theme-accent)]/50 shadow-lg shadow-[var(--theme-accent)]/20' : 'border-[var(--theme-glass-border)] hover:border-[var(--theme-accent)]/30'}`}
                      />
                    </>
                  )}
                </div>
              </div>
              {player.videoTitle && (
                <div className="text-xs text-[var(--theme-text)] truncate font-medium opacity-90" title={player.videoTitle}>
                  {player.isPlaylist ? `${player.videoTitle}` : player.videoTitle}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className={`${hideAllVideos ? 'h-0 overflow-hidden' : 'h-32'} transition-all duration-300 bg-black relative`}>
        <div id={player.id} className="w-full h-full" />
        
        {/* Playlist Navigation Overlay - Only show for playlists on hover */}
        {player.isPlaylist && isHovered && !hideAllVideos && (
          <div className="absolute inset-0 flex items-center justify-between px-2 pb-3 transition-all duration-200 pointer-events-none">
            <MasterButton
              onClick={() => onPlaylistPrevious(player.id)}
              icon={<SkipBack size={12} />}
              title="Previous video in playlist"
              variant="default"
              size="small"
              className="text-[var(--theme-accent)] hover:text-[var(--theme-accent)] opacity-80 bg-transparent hover:bg-[var(--theme-accent)]/10 border-[var(--theme-accent)]/40 hover:border-[var(--theme-accent)]/60 shadow-lg pointer-events-auto"
            />
            <MasterButton
              onClick={() => onPlaylistNext(player.id)}
              icon={<SkipForward size={12} />}
              title="Next video in playlist"
              variant="default"
              size="small"
              className="text-[var(--theme-accent)] hover:text-[var(--theme-accent)] opacity-80 bg-transparent hover:bg-[var(--theme-accent)]/10 border-[var(--theme-accent)]/40 hover:border-[var(--theme-accent)]/60 shadow-lg pointer-events-auto"
            />
          </div>
        )}
        
        {/* Spectrum Visualizer Overlay */}
        {(player.url || player.fileName) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm">
            <MiniSpectrum 
              audioElement={player.type === 'audio' ? audioRefs.current[player.id] : undefined}
              youtubePlayer={player.type === 'youtube' ? playerRefs.current[player.id] : undefined}
              isPlaying={player.isPlaying}
              barCount={15}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 space-y-3 flex-1 flex flex-col justify-end">
        {/* Timecode Bar */}
        {(player.url || player.fileName) && player.duration && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary)]">
              <span>{formatTime(player.currentTime || 0)}</span>
              <span>{formatTime(player.duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={player.duration}
              value={player.currentTime || 0}
              onChange={(e) => onSeekTo(player.id, parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600/30 rounded-sm appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #808080 0%, #808080 ${((player.currentTime || 0) / player.duration) * 100}%, rgba(128,128,128,0.3) ${((player.currentTime || 0) / player.duration) * 100}%, rgba(128,128,128,0.3) 100%)`
              }}
            />
          </div>
        )}

        {/* Control Buttons */}
        <div className={`flex items-center w-full ${gridLayout === 4 ? 'gap-0.5' : 'gap-1'}`}>
          <MasterButton
            onClick={() => onTogglePlay(player.id)}
            icon={player.isPlaying ? <Pause size={iconSize} /> : <Play size={iconSize} />}
            title={player.isPlaying ? 'Pause' : 'Play'}
            variant="default"
            size={buttonSize}
            className={gridLayout === 4 ? buttonPadding : ''}
          />
          
          
          <MasterButton
            onClick={() => onToggleLoop(player.id)}
            icon={<RotateCcw size={iconSize} />}
            title={player.isLooping ? "Loop ON - Click to disable" : "Loop OFF - Click to enable"}
            variant={player.isLooping ? "success" : "default"}
            size={buttonSize}
            className={`${player.isLooping ? 'ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-400/20' : ''} ${gridLayout === 4 ? buttonPadding : ''}`}
          />

          {/* Playback Speed Control - Single Button */}
          <MasterButton
            onClick={() => {
              const currentRate = player.playbackRate || 1
              const nextRate = currentRate === 0.75 ? 1 : currentRate === 1 ? 1.25 : 0.75
              onSetPlaybackRate(player.id, nextRate)
            }}
            icon={<span className={`${gridLayout === 4 ? 'text-[8px]' : 'text-xs'} font-mono font-bold`}>{(player.playbackRate || 1)}x</span>}
            title={`Speed: ${player.playbackRate || 1}x - Click to cycle`}
            variant="default"
            size={buttonSize}
            className={gridLayout === 4 ? buttonPadding : 'px-2'}
          />

          {/* Volume Control - Minimal Old Computer Style */}
          <VolumeSlider
            value={player.volume}
            onChange={(value) => onSetVolume(player.id, value)}
            size={gridLayout === 4 ? "small" : "small"}
            className="flex-1 min-w-0 ml-auto"
          />
        </div>
      </div>
    </div>
  )
}
