'use client'

import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'

// Types
export interface MediaPlayer {
  id: string
  url: string
  title: string
  volume: number
  isPlaying: boolean
  isLooping: boolean
  videoId: string
  type: 'youtube' | 'audio'
  fileName?: string
  videoTitle?: string
  playbackRate?: number
  currentTime?: number
  duration?: number
  // Playlist properties
  isPlaylist?: boolean
  playlistId?: string
  playlistTitle?: string
  playlistVideos?: Array<{id: string, title: string}>
  currentPlaylistIndex?: number
}

interface YouTubePlayer {
  setVolume(volume: number): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number): void
  getPlayerState(): number
  getCurrentTime(): number
  getDuration(): number
  destroy(): void
}

interface MixerContextType {
  // State
  players: MediaPlayer[]
  isGlobalPlaying: boolean
  globalVolume: number
  isYouTubeAPILoaded: boolean
  
  // Actions
  setPlayers: (players: MediaPlayer[] | ((prev: MediaPlayer[]) => MediaPlayer[])) => void
  setIsGlobalPlaying: (playing: boolean) => void
  setGlobalVolume: (volume: number) => void
  toggleGlobalPlay: () => void
  toggleLoop: (playerId: string) => void
  reloadPlayer: (playerId: string) => void
  
  // Refs
  playerRefs: React.MutableRefObject<{ [key: string]: YouTubePlayer }>
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement }>
  
  // Utils
  loadYouTubeAPI: () => void
  getActivePlayers: () => MediaPlayer[]
  hasActiveContent: () => boolean
}

const MixerContext = createContext<MixerContextType | undefined>(undefined)

export function MixerProvider({ children }: { children: React.ReactNode }) {
  const getDefaultSlots = (): MediaPlayer[] => [
    { id: 'slot-1', url: '', title: 'Slot 1', volume: 50, isPlaying: false, isLooping: false, videoId: '', type: 'youtube' },
    { id: 'slot-2', url: '', title: 'Slot 2', volume: 50, isPlaying: false, isLooping: false, videoId: '', type: 'youtube' },
    { id: 'slot-3', url: '', title: 'Slot 3', volume: 50, isPlaying: false, isLooping: false, videoId: '', type: 'youtube' },
    { id: 'slot-4', url: '', title: 'Slot 4', volume: 50, isPlaying: false, isLooping: false, videoId: '', type: 'youtube' }
  ]

  const [players, setPlayers] = useState<MediaPlayer[]>(getDefaultSlots)
  const [isGlobalPlaying, setIsGlobalPlaying] = useState(false)
  const [globalVolume, setGlobalVolume] = useState(100)
  const [isYouTubeAPILoaded, setIsYouTubeAPILoaded] = useState(false)
  
  const playerRefs = useRef<{ [key: string]: YouTubePlayer }>({})
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  // Load YouTube IFrame API
  const loadYouTubeAPI = useCallback(() => {
    if (typeof window === 'undefined') return

    if (window.YT && window.YT.Player) {
      setIsYouTubeAPILoaded(true)
      return
    }

    // Check if script already exists
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeAPILoaded(true)
    }
  }, [])

  // Get active players (those with content)
  const getActivePlayers = useCallback(() => {
    return players.filter(player => player.url || player.fileName)
  }, [players])

  // Check if there's any active content
  const hasActiveContent = useCallback(() => {
    return players.some(player => player.url || player.fileName)
  }, [players])

  // Global play/pause toggle
  const toggleGlobalPlay = useCallback(() => {
    const newPlayingState = !isGlobalPlaying
    setIsGlobalPlaying(newPlayingState)
    
    players.forEach(player => {
      if (!player.url && !player.fileName) return
      
      if (player.type === 'youtube' && playerRefs.current[player.id]) {
        if (newPlayingState) {
          playerRefs.current[player.id].playVideo()
        } else {
          playerRefs.current[player.id].pauseVideo()
        }
      } else if (player.type === 'audio' && audioRefs.current[player.id]) {
        if (newPlayingState) {
          audioRefs.current[player.id].play()
        } else {
          audioRefs.current[player.id].pause()
        }
      }
    })
  }, [isGlobalPlaying, players])

  // Toggle loop for specific player
  const toggleLoop = useCallback((playerId: string) => {
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? { ...p, isLooping: !p.isLooping } : p
      )
    )
  }, [setPlayers])

  // Reload player (restart from beginning and resume playing)
  const reloadPlayer = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return

    const wasPlaying = player.isPlaying

    // Pause if playing
    if (wasPlaying) {
      if (player.type === 'youtube' && playerRefs.current[playerId]) {
        playerRefs.current[playerId].pauseVideo()
      } else if (player.type === 'audio' && audioRefs.current[playerId]) {
        audioRefs.current[playerId].pause()
      }
    }

    // Seek to beginning
    if (player.type === 'youtube' && playerRefs.current[playerId]) {
      playerRefs.current[playerId].seekTo(0)
    } else if (player.type === 'audio' && audioRefs.current[playerId]) {
      audioRefs.current[playerId].currentTime = 0
    }

    // Resume playing if it was playing before
    if (wasPlaying) {
      setTimeout(() => {
        if (player.type === 'youtube' && playerRefs.current[playerId]) {
          playerRefs.current[playerId].playVideo()
        } else if (player.type === 'audio' && audioRefs.current[playerId]) {
          audioRefs.current[playerId].play()
        }
      }, 100) // Small delay to ensure seek completes
    }

    // Update player state - keep playing state if it was playing
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? { ...p, isPlaying: wasPlaying, currentTime: 0 } : p
      )
    )
  }, [players, setPlayers])

  // Apply global volume changes
  const applyGlobalVolume = useCallback((volume: number) => {
    players.forEach(player => {
      if (!player.url && !player.fileName) return
      
      const finalVolume = (volume / 100) * (player.volume / 100) * 100
      
      if (player.type === 'youtube' && playerRefs.current[player.id]) {
        playerRefs.current[player.id].setVolume(finalVolume)
      } else if (player.type === 'audio' && audioRefs.current[player.id]) {
        audioRefs.current[player.id].volume = finalVolume / 100
      }
    })
  }, [players])

  // Set global volume with immediate application
  const setGlobalVolumeValue = useCallback((volume: number) => {
    setGlobalVolume(volume)
    applyGlobalVolume(volume)
  }, [applyGlobalVolume])


  // Load YouTube API on mount
  useEffect(() => {
    loadYouTubeAPI()
  }, [loadYouTubeAPI])

  // Apply volume changes when players or global volume change
  useEffect(() => {
    applyGlobalVolume(globalVolume)
  }, [players, globalVolume, applyGlobalVolume])

  const value: MixerContextType = {
    // State
    players,
    isGlobalPlaying,
    globalVolume,
    isYouTubeAPILoaded,
    
    // Actions
    setPlayers,
    setIsGlobalPlaying,
    setGlobalVolume: setGlobalVolumeValue,
    toggleGlobalPlay,
    toggleLoop,
    reloadPlayer,
    
    // Refs
    playerRefs,
    audioRefs,
    
    // Utils
    loadYouTubeAPI,
    getActivePlayers,
    hasActiveContent
  }

  return (
    <MixerContext.Provider value={value}>
      {children}
    </MixerContext.Provider>
  )
}

export function useMixer() {
  const context = useContext(MixerContext)
  if (context === undefined) {
    throw new Error('useMixer must be used within a MixerProvider')
  }
  return context
}

// Global YouTube API types
declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: Record<string, unknown>) => YouTubePlayer
      PlayerState: {
        PLAYING: number
        ENDED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}
