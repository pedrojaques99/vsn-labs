'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { User, LogOut, Home, Coffee, UserCheck, Eye, X } from 'lucide-react'
import { mixService, authService, useAuth, type Mix } from '@/lib/supabase'
import { useMixer, type MediaPlayer } from '@/contexts/MixerContext'
import { useTheme } from '@/contexts/ThemeContext'
import { TextButton, ASCIIFooter } from '@/components/shared'
import ThemeToggle from './ThemeToggle'
import Link from 'next/link'

// Import new components
import MasterControlsBar from './MasterControlsBar'
import MixerSlot from './MixerSlot'
import MixesPanel from './MixesPanel'
import PresetPanel from './PresetPanel'
import PublicMixesPanel from './PublicMixesPanel'
import SaveMixDialog from './SaveMixDialog'
import AuthDialog from './AuthDialog'
import SlotPresetDialog from './SlotPresetDialog'
import ToastNotification from './ToastNotification'
import ChangelogDialog from './ChangelogDialog'
import SlotSkeleton from './SlotSkeleton'

// YouTube API types
interface YouTubePlayerEvent {
  target: {
    setVolume: (volume: number) => void
    playVideo: () => void
    pauseVideo: () => void
    seekTo: (seconds: number) => void
    getPlayerState: () => number
    destroy: () => void
  }
}

interface YouTubeStateChangeEvent {
  data: number
  target: {
    seekTo: (seconds: number) => void
    playVideo: () => void
  }
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Helper function to detect if URL is a YouTube playlist
const isYouTubePlaylist = (url: string): boolean => {
  // Check for playlist patterns
  const playlistPatterns = [
    /youtube\.com\/playlist\?list=/,
    /youtube\.com\/watch\?.*list=/,
    /youtu\.be\/.*\?list=/,
    /youtube\.com\/embed\/videoseries\?list=/
  ]
  
  return playlistPatterns.some(pattern => pattern.test(url))
}

// Helper function to extract YouTube playlist ID from URL
const getYouTubePlaylistId = (url: string): string | null => {
  const playlistMatch = url.match(/[?&]list=([^#&?]*)/)
  return playlistMatch ? playlistMatch[1] : null
}

// Helper function to validate if URL is a valid YouTube URL (video or playlist)
const isValidYouTubeUrl = (url: string): boolean => {
  const youtubePatterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    /^https?:\/\/youtube\.com\/embed\/.+/,
    /^https?:\/\/youtube\.com\/v\/.+/,
    /^https?:\/\/youtube\.com\/watch\?.*v=.+/,
    /^https?:\/\/youtube\.com\/playlist\?list=.+/
  ]
  
  return youtubePatterns.some(pattern => pattern.test(url))
}

// Function to fetch playlist information from YouTube API
const fetchPlaylistInfo = async (playlistId: string): Promise<{title: string, videoCount: number, videos: Array<{id: string, title: string}>}> => {
  try {
    // Using oEmbed API for playlist info (limited but works without API key)
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`)
    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title || `Playlist ${playlistId.substring(0, 8)}...`,
        videoCount: 0, // oEmbed doesn't provide video count
        videos: [] // Would need YouTube Data API for full video list
      }
    }
  } catch (error) {
    console.error('Error fetching playlist info:', error)
  }
  return {
    title: `Playlist ${playlistId.substring(0, 8)}...`,
    videoCount: 0,
    videos: []
  }
}

// Function to extract video IDs from playlist URL using YouTube's embed API
const extractPlaylistVideos = async (playlistId: string): Promise<Array<{id: string, title: string}>> => {
  try {
    // This is a workaround - we'll create a temporary iframe to extract video IDs
    // In a real implementation, you'd use YouTube Data API v3
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=0&controls=0&showinfo=0&rel=0&modestbranding=1`
      
      iframe.onload = () => {
        // This is a simplified approach - in reality you'd need the YouTube Data API
        // For now, we'll return a placeholder that indicates it's a playlist
        resolve([
          { id: 'playlist_placeholder', title: 'Playlist videos (API key needed for full list)' }
        ])
        document.body.removeChild(iframe)
      }
      
      iframe.onerror = () => {
        resolve([{ id: 'playlist_error', title: 'Error loading playlist' }])
        document.body.removeChild(iframe)
      }
      
      document.body.appendChild(iframe)
    })
  } catch (error) {
    console.error('Error extracting playlist videos:', error)
    return [{ id: 'playlist_error', title: 'Error loading playlist' }]
  }
}

// Function to fetch video title from YouTube API
const fetchVideoTitle = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    if (response.ok) {
      const data = await response.json()
      return data.title || `Video ${videoId.substring(0, 8)}...`
    }
  } catch (error) {
    console.error('Error fetching video title:', error)
  }
  return `Video ${videoId.substring(0, 8)}...`
}

export default function YouTubeMixer() {
  // Use global mixer context
  const {
    players,
    setPlayers,
    isYouTubeAPILoaded,
    globalVolume,
    setGlobalVolume,
    isGlobalPlaying,
    setIsGlobalPlaying,
    toggleGlobalPlay,
    toggleLoop,
    reloadPlayer,
    playerRefs,
    audioRefs
  } = useMixer()

  // Use theme context
  const { currentTheme, isLightMode } = useTheme()

  // Utility functions
  const getDefaultSlots = useCallback((): MediaPlayer[] => [
    { id: 'slot-1', url: '', title: 'Slot 1', volume: 50, isPlaying: true, isLooping: false, videoId: '', type: 'youtube' as const, fileName: undefined, videoTitle: undefined },
    { id: 'slot-2', url: '', title: 'Slot 2', volume: 50, isPlaying: true, isLooping: false, videoId: '', type: 'youtube' as const, fileName: undefined, videoTitle: undefined },
    { id: 'slot-3', url: '', title: 'Slot 3', volume: 50, isPlaying: true, isLooping: false, videoId: '', type: 'youtube' as const, fileName: undefined, videoTitle: undefined },
    { id: 'slot-4', url: '', title: 'Slot 4', volume: 50, isPlaying: true, isLooping: false, videoId: '', type: 'youtube' as const, fileName: undefined, videoTitle: undefined }
  ], [])

  // Grid layout utility
  const getGridClasses = useCallback((layout: 1 | 2 | 4): string => {
    switch (layout) {
      case 1:
        return 'grid grid-cols-1 gap-4 grid-rows-1'
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 gap-4 grid-rows-1'
      case 4:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 grid-rows-1'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 grid-rows-1'
    }
  }, [])

  const clearPlayerRefs = useCallback((slotId?: string) => {
    if (slotId) {
      // Clear specific slot
      if (playerRefs.current[slotId]) {
        try {
          playerRefs.current[slotId].destroy()
        } catch (error) {
          console.log('Player already destroyed or not ready:', error)
        }
        delete playerRefs.current[slotId]
      }
      if (audioRefs.current[slotId]) {
        try {
          audioRefs.current[slotId].pause()
          audioRefs.current[slotId].currentTime = 0
        } catch (error) {
          console.log('Audio element error:', error)
        }
        delete audioRefs.current[slotId]
      }
    } else {
      // Clear all slots
      Object.entries(playerRefs.current).forEach(([id, player]) => {
        try {
          player.destroy()
        } catch (error) {
          console.log(`Player ${id} destroy error:`, error)
        }
      })
      Object.entries(audioRefs.current).forEach(([id, audio]) => {
        try {
          audio.pause()
          audio.currentTime = 0
        } catch (error) {
          console.log(`Audio ${id} error:`, error)
        }
      })
      playerRefs.current = {}
      audioRefs.current = {}
    }
  }, [playerRefs, audioRefs])

  // Local state
  const [recentUrls, setRecentUrls] = useState<{url: string, title: string}[]>([])
  const [showSuggestions, setShowSuggestions] = useState<{ [key: string]: boolean }>({})
  const [autoPlay, setAutoPlay] = useState(true)
  const [hideAllVideos, setHideAllVideos] = useState(false)
  const [favoritosCollapsed, setFavoritosCollapsed] = useState(false)
  const [mixesCollapsed, setMixesCollapsed] = useState(false)
  const [exploreCollapsed, setExploreCollapsed] = useState(true)
  const [gridLayout, setGridLayout] = useState<1 | 2 | 4>(4)
  
  // Dialog states
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showSlotPresetDialog, setShowSlotPresetDialog] = useState<{ slotId: string; player: MediaPlayer } | null>(null)
  const [showChangelogDialog, setShowChangelogDialog] = useState(false)
  
  // Form states
  const [newMixName, setNewMixName] = useState('')
  const [newMixDescription, setNewMixDescription] = useState('')
  const [isPublicMix, setIsPublicMix] = useState(true)
  const [slotPresetName, setSlotPresetName] = useState('')

  // Update current time for all playing videos
  useEffect(() => {
    const interval = setInterval(() => {
      players.forEach(player => {
        if (player.isPlaying && playerRefs.current[player.id]) {
          const currentTime = (playerRefs.current[player.id] as { getCurrentTime: () => number }).getCurrentTime()
          setPlayers(prev => 
            prev.map(p => 
              p.id === player.id ? { ...p, currentTime } : p
            )
          )
        }
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [players, setPlayers])
  
  // Data states
  const [userMixes, setUserMixes] = useState<Mix[]>([])
  const [publicMixes, setPublicMixes] = useState<Mix[]>([])
  const [loadingMixes, setLoadingMixes] = useState(false)
  const [mixSortBy, setMixSortBy] = useState<'recent' | 'likes' | 'plays'>('recent')
  const [isInitializing, setIsInitializing] = useState(true)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  
  // Toast states
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    timeout?: NodeJS.Timeout
  }>>([])
  
  // Current mix state
  const [currentMixName, setCurrentMixName] = useState<string>('')
  const [currentMixId, setCurrentMixId] = useState<string>('')
  const [isCurrentMixLiked, setIsCurrentMixLiked] = useState(false)
  
  // Auth hook
  const { user, loading: authLoading, signOut } = useAuth()

  // Utility function for auth checks
  const requireAuth = useCallback(() => {
    if (!user) {
      setShowAuthDialog(true)
      return false
    }
    return true
  }, [user])

  // Toast functions
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000) // 3 seconds

    setToasts(prev => [...prev, { id, message, type, timeout }])
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toasts.forEach(toast => {
        if (toast.timeout) {
          clearTimeout(toast.timeout)
        }
      })
    }
  }, [toasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.timeout) {
        clearTimeout(toast.timeout)
      }
      return prev.filter(toast => toast.id !== id)
    })
  }, [])

  // Load user mixes
  const loadUserMixes = useCallback(async () => {
    if (!user) {
      setUserMixes([])
      return
    }
    
    try {
      setLoadingMixes(true)
      const mixes = await mixService.getUserMixes()
      setUserMixes(mixes)
    } catch (error) {
      console.error('Error loading user mixes:', error)
    } finally {
      setLoadingMixes(false)
    }
  }, [user])

  // Load public mixes
  const loadPublicMixes = useCallback(async (sortBy: 'recent' | 'likes' | 'plays' = 'recent') => {
    try {
      setLoadingMixes(true)
      setMixSortBy(sortBy) // Update the sort state
      const mixes = await mixService.getPublicMixes(50, sortBy)
      setPublicMixes(mixes)
    } catch (error) {
      console.error('Error loading public mixes:', error)
      showToast('Error loading public mixes', 'error')
    } finally {
      setLoadingMixes(false)
    }
  }, [showToast])

  // Get current mix config
  const getCurrentMixConfig = useCallback(() => {
    const activePlayers = players.filter(p => p.url || p.fileName)
    return {
      players: activePlayers.map(p => ({
        id: p.id,
        url: p.url,
        volume: p.volume,
        isLooping: p.isLooping,
        type: p.type,
        fileName: p.fileName,
        videoId: p.videoId,
        // Playlist properties
        isPlaylist: p.isPlaylist,
        playlistId: p.playlistId,
        playlistTitle: p.playlistTitle,
        playlistVideos: p.playlistVideos,
        currentPlaylistIndex: p.currentPlaylistIndex
      })),
      globalVolume
    }
  }, [players, globalVolume])

  // Save mix
  const handleSaveMix = useCallback(async () => {
    if (!requireAuth()) return

    if (!newMixName.trim()) {
      showToast('Please enter a name for the mix', 'error')
      return
    }

    const config = getCurrentMixConfig()
    if (config.players.length === 0) {
      showToast('Add at least one video or audio before saving', 'error')
      return
    }

    // Check if there are any MP3 files loaded
    const hasMp3Files = config.players.some(player => player.type === 'audio' && player.fileName)
    if (hasMp3Files) {
      showToast('Cannot save mix with MP3 files. Only YouTube URLs will be saved. Please remove MP3 files before saving.', 'error')
      return
    }

    try {
      setLoadingMixes(true)
      await mixService.saveMix(
        newMixName.trim(), 
        config, 
        isPublicMix,
        newMixDescription.trim() || undefined
      )
      
      setNewMixName('')
      setNewMixDescription('')
      setShowSaveDialog(false)
      await loadUserMixes()
      showToast('Mix saved successfully! 🎵', 'success')
    } catch (error) {
      console.error('Error saving mix:', error)
      showToast('Error saving mix. Please try again.', 'error')
    } finally {
      setLoadingMixes(false)
    }
  }, [requireAuth, newMixName, newMixDescription, isPublicMix, getCurrentMixConfig, loadUserMixes, showToast])

  // Save slot preset
  const handleSaveSlotPreset = useCallback(async () => {
    if (!requireAuth()) return

    if (!slotPresetName.trim()) {
      showToast('Please enter a name for the preset', 'error')
      return
    }

    if (!showSlotPresetDialog) return

    const { player } = showSlotPresetDialog

    if (!player.url && !player.fileName) {
      showToast('This slot is empty', 'error')
      return
    }

    // Check if this slot has an MP3 file
    if (player.type === 'audio' && player.fileName) {
      showToast('Cannot save MP3 files as presets. Only YouTube URLs can be saved.', 'error')
      return
    }

    try {
      setLoadingMixes(true)
      
      const slotConfig = {
        players: [{
          id: player.id,
          url: player.url,
          volume: player.volume,
          isLooping: player.isLooping,
          type: player.type,
          fileName: player.fileName,
          videoId: player.videoId
        }],
        globalVolume: 100,
        isSlotPreset: true
      }

      await mixService.saveMix(
        slotPresetName.trim(),
        slotConfig,
        false,
        `Preset saved from ${player.videoTitle || player.fileName || player.url}`
      )

      setSlotPresetName('')
      setShowSlotPresetDialog(null)
      await loadUserMixes()
      showToast(`Slot preset "${slotPresetName.trim()}" saved! 🎵`, 'success')
    } catch (error) {
      console.error('Error saving slot preset:', error)
      showToast('Error saving slot preset. Try again.', 'error')
    } finally {
      setLoadingMixes(false)
    }
  }, [requireAuth, slotPresetName, showSlotPresetDialog, loadUserMixes, showToast])

  // Create YouTube player
  const createYouTubePlayer = useCallback((player: MediaPlayer, retryCount = 0) => {
    if (!isYouTubeAPILoaded || !window.YT || !window.YT.Player) {
      if (retryCount < 10) { // Max 10 retries (5 seconds)
        console.log(`YouTube API not ready, retrying in 500ms... (attempt ${retryCount + 1}/10)`, {
          isYouTubeAPILoaded,
          hasYT: !!window.YT,
          hasPlayer: !!(window.YT && window.YT.Player)
        })
        // Retry after API is ready
        setTimeout(() => createYouTubePlayer(player, retryCount + 1), 500)
        return
      } else {
        console.error('YouTube API failed to load after 10 attempts')
        showToast('Failed to load YouTube API. Please refresh the page.', 'error')
        return
      }
    }

    // Check if DOM element exists
    const element = document.getElementById(player.id)
    if (!element) {
      console.log(`DOM element ${player.id} not found, retrying in 200ms...`)
      setTimeout(() => createYouTubePlayer(player), 200)
      return
    }

    try {
      new window.YT.Player(player.id, {
      height: '128',
      width: '100%',
      videoId: player.videoId,
      playerVars: {
        autoplay: autoPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        cc_load_policy: 0,
        playsinline: 1
      },
      events: {
        onStateChange: (event: YouTubeStateChangeEvent) => {
          const isPlaying = event.data === window.YT.PlayerState.PLAYING
          const isEnded = event.data === window.YT.PlayerState.ENDED
          
          setPlayers(prev => 
            prev.map(p => 
              p.id === player.id ? { ...p, isPlaying } : p
            )
          )

          if (isEnded) {
            setPlayers(prev => {
              const currentPlayer = prev.find(p => p.id === player.id)
              if (currentPlayer?.isLooping) {
                setTimeout(() => {
                  event.target.seekTo(0)
                  event.target.playVideo()
                }, 100)
                // Keep isPlaying true for looped videos
                return prev.map(p => 
                  p.id === player.id ? { ...p, isPlaying: true } : p
                )
              }
              return prev.map(p => 
                p.id === player.id ? { ...p, isPlaying: false } : p
              )
            })
          }
        },
        onReady: (event: YouTubePlayerEvent) => {
          playerRefs.current[player.id] = event.target as { setVolume: (volume: number) => void; playVideo: () => void; pauseVideo: () => void; seekTo: (seconds: number) => void; getPlayerState: () => number; getCurrentTime: () => number; getDuration: () => number; destroy: () => void }
          event.target.setVolume(player.volume)
          
          // Get video duration when ready
          const duration = (event.target as unknown as { getDuration: () => number }).getDuration()
          if (duration && duration > 0) {
            setPlayers(prev => 
              prev.map(p => 
                p.id === player.id ? { ...p, duration } : p
              )
            )
          }
          
          if (autoPlay) {
            event.target.playVideo()
          }
        }
      }
    })
    } catch (error) {
      console.error('Error creating YouTube player:', error)
    }
  }, [isYouTubeAPILoaded, players, autoPlay, setPlayers])

  // Create playlist player using YouTube API
  const createPlaylistPlayer = useCallback((player: MediaPlayer) => {
    if (!player.playlistId || !isYouTubeAPILoaded) return

    const container = document.getElementById(player.id)
    if (!container) return

    // Clear existing player
    container.innerHTML = ''

    try {
      const youtubePlayer = new window.YT.Player(player.id, {
        height: '128',
        width: '100%',
        playerVars: {
          list: player.playlistId,
          listType: 'playlist',
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1
        },
        events: {
          onStateChange: (event: YouTubeStateChangeEvent) => {
            const isPlaying = event.data === window.YT.PlayerState.PLAYING
            const isEnded = event.data === window.YT.PlayerState.ENDED
            
            setPlayers(prev => 
              prev.map(p => 
                p.id === player.id ? { ...p, isPlaying } : p
              )
            )

            if (isEnded) {
              setPlayers(prev => {
                const currentPlayer = prev.find(p => p.id === player.id)
                if (currentPlayer?.isLooping) {
                  setTimeout(() => {
                    event.target.seekTo(0)
                    event.target.playVideo()
                  }, 100)
                  return prev.map(p => 
                    p.id === player.id ? { ...p, isPlaying: true } : p
                  )
                }
                return prev.map(p => 
                  p.id === player.id ? { ...p, isPlaying: false } : p
                )
              })
            }
          },
          onReady: (event: YouTubePlayerEvent) => {
            playerRefs.current[player.id] = event.target as { 
              setVolume: (volume: number) => void
              playVideo: () => void
              pauseVideo: () => void
              seekTo: (seconds: number) => void
              getPlayerState: () => number
              getCurrentTime: () => number
              getDuration: () => number
              destroy: () => void
              playVideoAt: (index: number) => void
              getPlaylistIndex: () => number
              getPlaylist: () => string[]
            }
            event.target.setVolume(player.volume)
            
            // Get video duration when ready
            const duration = (event.target as unknown as { getDuration: () => number }).getDuration()
            if (duration && duration > 0) {
              setPlayers(prev => 
                prev.map(p => 
                  p.id === player.id ? { ...p, duration } : p
                )
              )
            }
          }
        }
      })
    } catch (error) {
      console.error('Error creating playlist player:', error)
    }
  }, [isYouTubeAPILoaded, players, setPlayers])

  // Load mix (for saved mixes - adds to panel)
  const loadMix = useCallback(async (mix: Mix) => {
    try {
      // Ensure YouTube API is loaded before proceeding
      if (!isYouTubeAPILoaded) {
        showToast('Loading YouTube API, please wait...', 'info')
        return
      }

      // Stop all current players
      clearPlayerRefs()

      // Reset to empty slots
      const emptyPlayers = getDefaultSlots()
      
      // Set current mix info
      setCurrentMixName(mix.name)
      setCurrentMixId(mix.id)
      setIsCurrentMixLiked(mix.is_liked || false)

      // Load mix configuration
      if (mix.config.isSlotPreset && mix.config.players.length === 1) {
        const savedPlayer = mix.config.players[0]
        const emptySlotIndex = emptyPlayers.findIndex(p => !p.url && !p.fileName)
        const targetIndex = emptySlotIndex >= 0 ? emptySlotIndex : 0

        emptyPlayers[targetIndex] = {
          ...emptyPlayers[targetIndex],
          url: savedPlayer.url,
          volume: savedPlayer.volume,
          isLooping: savedPlayer.isLooping,
          type: savedPlayer.type,
          fileName: savedPlayer.fileName,
          videoId: savedPlayer.videoId || (savedPlayer.type === 'youtube' ? getYouTubeVideoId(savedPlayer.url) || '' : ''),
          // Restore playlist properties
          isPlaylist: savedPlayer.isPlaylist || false,
          playlistId: savedPlayer.playlistId,
          playlistTitle: savedPlayer.playlistTitle,
          playlistVideos: savedPlayer.playlistVideos || [],
          currentPlaylistIndex: savedPlayer.currentPlaylistIndex || 0
        }
      } else {
        mix.config.players.forEach((savedPlayer, index) => {
          if (index < emptyPlayers.length) {
            emptyPlayers[index] = {
              ...emptyPlayers[index],
              url: savedPlayer.url,
              volume: savedPlayer.volume,
              isLooping: savedPlayer.isLooping,
              type: savedPlayer.type,
              fileName: savedPlayer.fileName,
              videoId: savedPlayer.videoId || (savedPlayer.type === 'youtube' ? getYouTubeVideoId(savedPlayer.url) || '' : ''),
              // Restore playlist properties
              isPlaylist: savedPlayer.isPlaylist || false,
              playlistId: savedPlayer.playlistId,
              playlistTitle: savedPlayer.playlistTitle,
              playlistVideos: savedPlayer.playlistVideos || [],
              currentPlaylistIndex: savedPlayer.currentPlaylistIndex || 0
            }
          }
        })
      }

      setPlayers(emptyPlayers)
      setGlobalVolume(mix.config.globalVolume)

      // Create YouTube players for loaded content (similar to updateSlot behavior)
      setTimeout(() => {
        emptyPlayers.forEach((player, index) => {
          if (player.url && player.type === 'youtube') {
            // Stagger player creation to avoid conflicts
            setTimeout(() => {
              if (player.isPlaylist) {
                createPlaylistPlayer(player)
              } else {
                createYouTubePlayer(player)
              }
            }, index * 150)
          }
        })
        
        // Activate global play state for loaded mixes
        setTimeout(() => {
          setIsGlobalPlaying(true)
          // Also trigger play for audio files if autoplay is enabled
          if (autoPlay) {
            emptyPlayers.forEach(player => {
              if (player.fileName && audioRefs.current[player.id]) {
                audioRefs.current[player.id].play().catch(error => {
                  console.log('Autoplay prevented by browser:', error)
                })
              }
            })
          }
        }, 1000) // Longer delay to ensure players are ready
      }, 300)

      const itemType = mix.config.isSlotPreset ? 'Preset' : 'Mix'
      showToast(`${itemType} "${mix.name}" loaded! 🎵`, 'success')
    } catch (error) {
      console.error('Error loading mix:', error)
      showToast('Error loading mix', 'error')
    }
  }, [clearPlayerRefs, getDefaultSlots, setPlayers, setGlobalVolume, showToast, createYouTubePlayer, autoPlay, setIsGlobalPlaying, isYouTubeAPILoaded])
  
  // Load random mix (replaces all slots)
  const loadRandomMix = useCallback(async () => {
    try {
      // Ensure YouTube API is loaded before proceeding
      if (!isYouTubeAPILoaded) {
        showToast('Loading YouTube API, please wait...', 'info')
        return
      }

      // Stop all current players
      clearPlayerRefs()

      // Reset to empty slots
      const emptyPlayers = getDefaultSlots()
      
      // Combine all available presets
      const weatherPresets = [
        { name: 'Rain', url: 'https://www.youtube.com/watch?v=M-Q2Extc6z8' },
        { name: 'Snow', url: 'https://www.youtube.com/watch?v=WoFKSR6ed2Q&t' },
        { name: 'Birds', url: 'https://www.youtube.com/watch?v=EwgVwlcWn4Y' },
        { name: 'Storm', url: 'https://www.youtube.com/watch?v=FfVaHQXI-TQ&t' },
        { name: 'Vinyl', url: 'https://www.youtube.com/watch?v=DUhdSWsapuA' },
        { name: 'Fire', url: 'https://www.youtube.com/watch?v=mSX3OyW9Rao' },
        { name: 'Makita', url: 'https://www.youtube.com/watch?v=BFl_AvhXsOE&ab' },
        { name: 'Cricket', url: 'https://www.youtube.com/watch?v=3u2FkPfIwBc' },
        { name: 'Radio', url: 'https://www.youtube.com/watch?v=gm7z_27oraI&t' }
      ]

      const environmentPresets = [
        { name: 'Oregon', url: 'https://www.youtube.com/watch?v=nZ3wV6Z68Vk' },
        { name: 'Deep', url: 'https://www.youtube.com/watch?v=rmOzpR0AchA&t' },
        { name: 'Swamp', url: 'https://www.youtube.com/watch?v=2pv3g5SVcfc&t' },
        { name: 'Brazil', url: 'https://www.youtube.com/watch?v=9ScVvOI32yE' },
        { name: 'Afternoon', url: 'https://www.youtube.com/watch?v=jtjB_Ucn8_k' },
        { name: 'Desert', url: 'https://www.youtube.com/watch?v=v4M6kLRGGCo' },
        { name: 'Morning', url: 'https://www.youtube.com/watch?v=zGs8ykoH_2Q&' },
        { name: 'Relaxing', url: 'https://www.youtube.com/watch?v=u9a1EQS_9Wo&list=PLVovUzLdR8iNvRVPUEZ5jd0ibKdKlSZab' },
        { name: 'Mount Shrine', url: 'https://www.youtube.com/watch?v=nVRbAL03GIs&t=5973s' },
        { name: 'Cosmic City', url: 'https://youtu.be/7rgG3sboipg' },
        { name: 'Nuketown', url: 'https://youtu.be/JTVtlfKr8qU' }
      ]

      const allPresets = [
        ...weatherPresets,
        ...environmentPresets,
        ...(userMixes?.filter(mix => mix.config.isSlotPreset).map(mix => ({
          name: mix.name,
          url: mix.config.players[0]?.url || ''
        })) || [])
      ]

      if (allPresets.length === 0) {
        showToast('No presets available', 'error')
        return
      }

      // Select exactly 4 random presets
      const selectedPresets = []
      
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * allPresets.length)
        selectedPresets.push(allPresets[randomIndex])
      }

      // Load selected presets into slots
      selectedPresets.forEach((preset, index) => {
        if (index < emptyPlayers.length) {
          emptyPlayers[index] = {
            ...emptyPlayers[index],
            url: preset.url,
            title: preset.name,
            videoId: getYouTubeVideoId(preset.url) || '',
            type: 'youtube' as const,
            volume: 50,
            isPlaying: false,
            isLooping: false
          }
        }
      })

      setPlayers(emptyPlayers)
      setCurrentMixName('Random Mix')
      setCurrentMixId('')
      setIsCurrentMixLiked(false)

      // Create YouTube players for loaded content
      setTimeout(() => {
        emptyPlayers.forEach((player, index) => {
          if (player.url && player.type === 'youtube') {
            // Stagger player creation to avoid conflicts
            setTimeout(() => {
              createYouTubePlayer(player)
            }, index * 100)
          }
        })
        
        // Activate global play state with longer delay for first load
        setTimeout(() => {
          setIsGlobalPlaying(true)
        }, 800)
      }, 300)

      showToast(`Random mix loaded! 🎲 (4 presets)`, 'success')
    } catch (error) {
      console.error('Error loading random mix:', error)
      showToast('Error loading random mix', 'error')
    }
  }, [clearPlayerRefs, getDefaultSlots, setPlayers, setCurrentMixName, setCurrentMixId, setIsCurrentMixLiked, userMixes, showToast, getYouTubeVideoId, createYouTubePlayer, setIsGlobalPlaying, isYouTubeAPILoaded])
  
  // Load mix from explore (only loads to control bar, doesn't save to panel)
  const loadExploreMix = useCallback(async (mix: Mix) => {
    try {
      // Ensure YouTube API is loaded before proceeding
      if (!isYouTubeAPILoaded) {
        showToast('Loading YouTube API, please wait...', 'info')
        return
      }

      // Stop all current players
      clearPlayerRefs()

      // Reset to empty slots
      const emptyPlayers = getDefaultSlots()
      
      // Set current mix info (but don't save to user mixes)
      setCurrentMixName(mix.name)
      setCurrentMixId(mix.id)
      setIsCurrentMixLiked(mix.is_liked || false)

      // Increment play count for public mixes
      if (mix.is_public) {
        try {
          await mixService.incrementPlays(mix.id)
        } catch (error) {
          console.log('Could not increment play count:', error)
          // Don't show error to user, just log it
        }
      }

      // Load mix configuration
      if (mix.config.isSlotPreset && mix.config.players.length === 1) {
        const savedPlayer = mix.config.players[0]
        const emptySlotIndex = emptyPlayers.findIndex(p => !p.url && !p.fileName)
        
        if (emptySlotIndex !== -1) {
          emptyPlayers[emptySlotIndex] = {
            ...savedPlayer,
            id: `slot-${emptySlotIndex + 1}`,
            isPlaying: false,
            title: (savedPlayer as MediaPlayer).title || '',
            videoId: savedPlayer.videoId || getYouTubeVideoId(savedPlayer.url) || ''
          }
        }
      } else {
        // Load all players from mix
        mix.config.players.forEach((savedPlayer, index) => {
          if (index < emptyPlayers.length) {
            emptyPlayers[index] = {
              ...savedPlayer,
              id: `slot-${index + 1}`,
              isPlaying: false,
              title: (savedPlayer as MediaPlayer).title || '',
              videoId: savedPlayer.videoId || getYouTubeVideoId(savedPlayer.url) || ''
            }
          }
        })
      }

      setPlayers(emptyPlayers)
      setGlobalVolume(mix.config.globalVolume || 50)
      
      // Create YouTube players for loaded content
      setTimeout(() => {
        emptyPlayers.forEach((player, index) => {
          if (player.url && player.type === 'youtube') {
            // Stagger player creation to avoid conflicts
            setTimeout(() => {
              createYouTubePlayer(player)
            }, index * 150)
          }
        })
      }, 200)
      
      // CRITICAL: Activate global play state for shared links
      setTimeout(() => {
        setIsGlobalPlaying(true)
        // Also trigger play for audio files if autoplay is enabled
        if (autoPlay) {
          emptyPlayers.forEach(player => {
            if (player.fileName && audioRefs.current[player.id]) {
              audioRefs.current[player.id].play().catch(error => {
                console.log('Autoplay prevented by browser:', error)
              })
            }
          })
        }
      }, 1000) // Longer delay to ensure players are ready
      
      showToast(`🎵 "${mix.name}" loaded from explore!`, 'success')
    } catch (error) {
      console.error('Error loading explore mix:', error)
      showToast('Error loading mix', 'error')
    }
  }, [clearPlayerRefs, getDefaultSlots, setPlayers, setGlobalVolume, showToast, createYouTubePlayer, autoPlay, setIsGlobalPlaying, isYouTubeAPILoaded])

  // Save recent URL with title
  const saveRecentUrl = useCallback(async (url: string) => {
    if (!url || !isValidYouTubeUrl(url)) return
    
    let title = ''
    
    if (isYouTubePlaylist(url)) {
      const playlistId = getYouTubePlaylistId(url)
      if (playlistId) {
        const playlistInfo = await fetchPlaylistInfo(playlistId)
        title = `🎵 ${playlistInfo.title}`
      }
    } else {
      const videoId = getYouTubeVideoId(url)
      if (videoId) {
        title = await fetchVideoTitle(videoId)
      }
    }
    
    if (title) {
      setRecentUrls(prev => {
        const filtered = prev.filter(u => u.url !== url)
        const updated = [{url, title}, ...filtered].slice(0, 5)
        localStorage.setItem('youtube-mixer-recent-urls', JSON.stringify(updated))
        return updated
      })
    }
  }, [])

  // Update slot
  const updateSlot = useCallback(async (slotId: string, url: string) => {
    if (!url.trim()) {
      // Clear only the specific slot without affecting others
      clearPlayerRefs(slotId)
      setPlayers(prev => 
        prev.map(p => 
          p.id === slotId ? { ...p, url: '', videoId: '', isPlaying: false, type: 'youtube', fileName: undefined, videoTitle: undefined, currentTime: undefined, duration: undefined } : p
        )
      )
      return
    }

    // Check if YouTube API is loaded before proceeding
    if (!isYouTubeAPILoaded) {
      showToast('Loading YouTube API, please wait...', 'info')
      // Wait for API to load and retry
      const checkAPI = () => {
        if (isYouTubeAPILoaded) {
          updateSlot(slotId, url)
        } else {
          setTimeout(checkAPI, 500)
        }
      }
      setTimeout(checkAPI, 500)
      return
    }

    // Validate if it's a valid YouTube URL first
    if (!isValidYouTubeUrl(url)) {
      showToast('Please enter a valid YouTube URL or playlist', 'error')
      return
    }

    // Check if it's a playlist URL
    if (isYouTubePlaylist(url)) {
      const playlistId = getYouTubePlaylistId(url)
      if (!playlistId) {
        showToast('Please enter a valid YouTube playlist URL', 'error')
        return
      }
      
      // Handle playlist - load first video
      const playlistInfo = await fetchPlaylistInfo(playlistId)
      showToast(`🎵 Playing playlist: "${playlistInfo.title}"`, 'success')
      
      // Create playlist player
      const updatedPlayer = { 
        id: slotId, 
        url, 
        videoId: '', // Will be set by iframe
        videoTitle: playlistInfo.title,
        isPlaying: false, 
        type: 'youtube' as const, 
        fileName: undefined,
        title: `Slot ${slotId.split('-')[1]}`,
        volume: 50,
        isLooping: false,
        isPlaylist: true,
        playlistId,
        playlistTitle: playlistInfo.title,
        playlistVideos: [],
        currentPlaylistIndex: 0
      }

      setPlayers(prev => 
        prev.map(p => 
          p.id === slotId ? { ...p, ...updatedPlayer, isPlaying: true } : p
        )
      )

      // Create playlist iframe
      setTimeout(() => {
        createPlaylistPlayer(updatedPlayer)
      }, 200)
      return
    }

    const videoId = getYouTubeVideoId(url)
    if (!videoId) {
      showToast('Please enter a valid YouTube video URL', 'error')
      return
    }

    // Check if URL is already being used in another slot
    const existingPlayer = players.find(p => p.id !== slotId && (p.url === url || p.videoId === videoId))
    if (existingPlayer) {
      showToast('This URL is already playing in another slot', 'error')
      return
    }

    await saveRecentUrl(url)
    clearPlayerRefs(slotId)

    const videoTitle = await fetchVideoTitle(videoId)

    const updatedPlayer = { 
      id: slotId, 
      url, 
      videoId, 
      videoTitle, 
      isPlaying: false, 
      type: 'youtube' as const, 
      fileName: undefined,
      title: `Slot ${slotId.split('-')[1]}`,
      volume: 50,
      isLooping: false
    }

    setPlayers(prev => 
      prev.map(p => 
        p.id === slotId ? { ...p, url, videoId, isPlaying: false, type: 'youtube', fileName: undefined, videoTitle } : p
      )
    )

    setTimeout(() => {
      createYouTubePlayer(updatedPlayer)
    }, 200)
  }, [players, saveRecentUrl, showToast, clearPlayerRefs, isYouTubeAPILoaded])

  // Load preset to available slot (simplified)
  const loadPresetToAvailableSlot = useCallback((url: string) => {
    // Check if URL is already being used
    const videoId = getYouTubeVideoId(url)
    const existingPlayer = players.find(p => 
      p.url === url || (videoId && p.videoId === videoId)
    )
    if (existingPlayer) {
      showToast('This URL is already playing in another slot', 'error')
      return
    }

    const emptySlot = players.find(p => !p.url && !p.fileName)
    if (!emptySlot) {
      showToast('The slots are full.', 'error')
      return
    }

    updateSlot(emptySlot.id, url)
  }, [players, updateSlot])

  // Playlist shuffle state
  const [playlistShuffle, setPlaylistShuffle] = useState<{ [key: string]: boolean }>({})

  // Toggle shuffle for specific playlist
  const togglePlaylistShuffle = useCallback((playerId: string) => {
    setPlaylistShuffle(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }))
  }, [])


  // Playlist navigation functions
  const handlePlaylistNext = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId)
    if (!player || !player.isPlaylist) return

    const youtubePlayer = playerRefs.current[playerId] as {
      playVideoAt?: (index: number) => void
      getPlaylistIndex?: () => number
      getPlaylist?: () => string[]
    }
    if (youtubePlayer && typeof youtubePlayer.playVideoAt === 'function') {
      try {
        const currentIndex = youtubePlayer.getPlaylistIndex ? youtubePlayer.getPlaylistIndex() : 0
        const playlist = youtubePlayer.getPlaylist ? youtubePlayer.getPlaylist() : []
        const isShuffled = playlistShuffle[playerId] || false
        
        let nextIndex: number
        if (isShuffled) {
          // Random selection for shuffle mode
          nextIndex = Math.floor(Math.random() * playlist.length)
          // Avoid playing the same video if possible
          if (playlist.length > 1 && nextIndex === currentIndex) {
            nextIndex = (nextIndex + 1) % playlist.length
          }
        } else {
          // Sequential navigation
          nextIndex = Math.min(currentIndex + 1, playlist.length - 1)
        }
        
        if (nextIndex !== currentIndex) {
          youtubePlayer.playVideoAt(nextIndex)
          const shuffleText = isShuffled ? '🔀 Shuffled' : '⏭️ Next'
          showToast(`${shuffleText} video in playlist`, 'info')
        } else {
          const shuffleText = isShuffled ? '🔀 Shuffled' : '⏭️ Already at last'
          showToast(`${shuffleText} video`, 'info')
        }
      } catch (error) {
        showToast('Playlist navigation error', 'error')
      }
    } else {
      showToast('Playlist navigation not available', 'error')
    }
  }, [players, showToast, playlistShuffle])

  const handlePlaylistPrevious = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId)
    if (!player || !player.isPlaylist) return

    const youtubePlayer = playerRefs.current[playerId] as {
      playVideoAt?: (index: number) => void
      getPlaylistIndex?: () => number
      getPlaylist?: () => string[]
    }
    if (youtubePlayer && typeof youtubePlayer.playVideoAt === 'function') {
      try {
        const currentIndex = youtubePlayer.getPlaylistIndex ? youtubePlayer.getPlaylistIndex() : 0
        const playlist = youtubePlayer.getPlaylist ? youtubePlayer.getPlaylist() : []
        const isShuffled = playlistShuffle[playerId] || false
        
        let previousIndex: number
        if (isShuffled) {
          // Random selection for shuffle mode
          previousIndex = Math.floor(Math.random() * playlist.length)
          // Avoid playing the same video if possible
          if (playlist.length > 1 && previousIndex === currentIndex) {
            previousIndex = (previousIndex - 1 + playlist.length) % playlist.length
          }
        } else {
          // Sequential navigation
          previousIndex = Math.max(currentIndex - 1, 0)
        }
        
        if (previousIndex !== currentIndex) {
          youtubePlayer.playVideoAt(previousIndex)
          const shuffleText = isShuffled ? '🔀 Shuffled' : '⏮️ Previous'
          showToast(`${shuffleText} video in playlist`, 'info')
        } else {
          const shuffleText = isShuffled ? '🔀 Shuffled' : '⏮️ Already at first'
          showToast(`${shuffleText} video`, 'info')
        }
      } catch (error) {
        showToast('Playlist navigation error', 'error')
      }
    } else {
      showToast('Playlist navigation not available', 'error')
    }
  }, [players, showToast, playlistShuffle])

  // Clear slot
  const clearSlot = useCallback((slotId: string) => {
    // Stop the specific player before clearing
    const currentPlayer = players.find(p => p.id === slotId)
    if (currentPlayer?.isPlaying) {
      if (currentPlayer.type === 'youtube' && playerRefs.current[slotId]) {
        playerRefs.current[slotId].pauseVideo()
      } else if (currentPlayer.type === 'audio' && audioRefs.current[slotId]) {
        audioRefs.current[slotId].pause()
      }
    }
    
    updateSlot(slotId, '')
    
    // Check if any other players are still playing after clearing this slot
    setTimeout(() => {
      const remainingPlayers = players.filter(p => p.id !== slotId)
      const hasPlayingPlayers = remainingPlayers.some(p => p.isPlaying && (p.url || p.fileName))
      if (!hasPlayingPlayers) {
        setIsGlobalPlaying(false)
      }
    }, 200)
  }, [updateSlot, players, setIsGlobalPlaying, playerRefs, audioRefs])


  // Load preset to specific slot (for drag and drop) - alias for updateSlot
  const loadPresetToSpecificSlot = updateSlot

  // Clear all slots (including vinyl slot)
  const clearAllSlots = useCallback(() => {
    clearPlayerRefs()
    setPlayers(getDefaultSlots())
    setIsGlobalPlaying(false)
    
    // Clear current mix info
    setCurrentMixName('')
    setCurrentMixId('')
    setIsCurrentMixLiked(false)
  }, [clearPlayerRefs, getDefaultSlots, setPlayers, setIsGlobalPlaying])

  // Toggle play
  const togglePlay = useCallback((playerId: string) => {
    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    if (currentPlayer.type === 'youtube' && playerRefs.current[playerId]) {
      const player = playerRefs.current[playerId]
      if (currentPlayer.isPlaying) {
        player.pauseVideo()
      } else {
        player.playVideo()
      }
    } else if (currentPlayer.type === 'audio' && audioRefs.current[playerId]) {
      const audio = audioRefs.current[playerId]
      if (currentPlayer.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }
  }, [players])

  // Vinyl toggle - controls global play state
  const toggleVinyl = useCallback(() => {
    toggleGlobalPlay()
  }, [toggleGlobalPlay])

  // Set volume
  const setVolume = useCallback((playerId: string, volume: number) => {
    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    const finalVolume = (globalVolume / 100) * (volume / 100) * 100

    if (currentPlayer.type === 'youtube' && playerRefs.current[playerId]) {
      playerRefs.current[playerId].setVolume(finalVolume)
    } else if (currentPlayer.type === 'audio' && audioRefs.current[playerId]) {
      audioRefs.current[playerId].volume = finalVolume / 100
    }
    
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? { ...p, volume } : p
      )
    )
  }, [globalVolume, players, setPlayers])


  // Set playback rate
  const setPlaybackRate = useCallback((playerId: string, rate: number) => {
    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    if (currentPlayer.type === 'youtube' && playerRefs.current[playerId]) {
      const player = playerRefs.current[playerId] as { setPlaybackRate?: (rate: number) => void }
      if (player.setPlaybackRate) {
        player.setPlaybackRate(rate)
      }
    } else if (currentPlayer.type === 'audio' && audioRefs.current[playerId]) {
      audioRefs.current[playerId].playbackRate = rate
    }
    
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? { ...p, playbackRate: rate } : p
      )
    )
  }, [players, setPlayers])

  // Seek to time
  const seekTo = useCallback((playerId: string, time: number) => {
    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    if (currentPlayer.type === 'youtube' && playerRefs.current[playerId]) {
      const player = playerRefs.current[playerId] as { seekTo?: (time: number, allowSeekAhead: boolean) => void }
      if (player.seekTo) {
        player.seekTo(time, true)
      }
    } else if (currentPlayer.type === 'audio' && audioRefs.current[playerId]) {
      audioRefs.current[playerId].currentTime = time
    }
    
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? { ...p, currentTime: time } : p
      )
    )
  }, [players, setPlayers])

  // File upload
  const handleFileUpload = useCallback((slotId: string, file: File) => {
    if (!file.type.startsWith('audio/')) {
      showToast('Please select only audio files', 'error')
      return
    }

    const fileName = file.name
    
    // Check if file is already being used in another slot
    const existingPlayer = players.find(p => p.id !== slotId && p.fileName === fileName)
    if (existingPlayer) {
      showToast('This file is already playing in another slot', 'error')
      return
    }

    // Check if the target slot is already occupied (for drag & drop)
    const targetPlayer = players.find(p => p.id === slotId)
    if (targetPlayer && (targetPlayer.url || targetPlayer.fileName)) {
      showToast('This slot is already occupied. Clear it first.', 'error')
      return
    }

    const url = URL.createObjectURL(file)

    clearPlayerRefs(slotId)

    setPlayers(prev => 
      prev.map(p => 
        p.id === slotId ? { 
          ...p, 
          url, 
          videoId: '', 
          type: 'audio', 
          fileName,
          isPlaying: false 
        } : p
      )
    )

    const audio = new Audio(url)
    audio.volume = (players.find(p => p.id === slotId)?.volume || 50) / 100
    audio.crossOrigin = 'anonymous'
    audio.addEventListener('ended', () => {
      setPlayers(prev => {
        const currentPlayer = prev.find(p => p.id === slotId)
        if (currentPlayer?.isLooping) {
          audio.currentTime = 0
          audio.play()
          return prev // Keep current state
        } else {
          return prev.map(p => 
            p.id === slotId ? { ...p, isPlaying: false } : p
          )
        }
      })
    })
    audio.addEventListener('play', () => {
      setPlayers(prev => 
        prev.map(p => 
          p.id === slotId ? { ...p, isPlaying: true } : p
        )
      )
    })
    audio.addEventListener('pause', () => {
      setPlayers(prev => 
        prev.map(p => 
          p.id === slotId ? { ...p, isPlaying: false } : p
        )
      )
    })
    audioRefs.current[slotId] = audio

    if (autoPlay) {
      audio.play().catch(error => {
        console.log('Autoplay prevented by browser:', error)
      })
    }
    
    // Update player state to reflect playing status
    if (autoPlay) {
      setPlayers(prev => 
        prev.map(p => 
          p.id === slotId ? { ...p, isPlaying: true } : p
        )
      )
    }
  }, [players, autoPlay, showToast, setPlayers, clearPlayerRefs])

  // Handle login
  const handleLogin = useCallback(async () => {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    
    if (isLocalhost) {
      showToast('🚀 Login with Google is only available in production. Deploy your app to test authentication.', 'info')
      return
    }

    try {
      await authService.signInWithGoogle()
    } catch (error) {
      console.error('Error logging in:', error)
      showToast('Error logging in. Please try again.', 'error')
    }
  }, [showToast])

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut()
      setUserMixes([])
      showToast('Logged out successfully!', 'info')
    } catch (error) {
      console.error('Error logging out:', error)
      showToast('Error logging out', 'error')
    }
  }, [signOut, showToast])

  // Handle share mix
  const handleShareMix = useCallback(async (mix: Mix) => {
    const shareUrl = `${window.location.origin}/youtube-mixer?mix=${mix.id}&autoplay=1`
    
    try {
      // Simple clipboard copy
      await navigator.clipboard.writeText(shareUrl)
      showToast('🎵 Mix link copied!', 'success')
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showToast('Link copied to clipboard!', 'success')
    }
  }, [showToast])

  // Handle like mix
  const handleLikeMix = useCallback(async (mixId: string) => {
    if (!requireAuth()) return

    try {
      const isLiked = await mixService.toggleLike(mixId)
      
      setPublicMixes(prev => 
        prev.map(mix => 
          mix.id === mixId 
            ? { 
                ...mix, 
                likes_count: mix.likes_count + (isLiked ? 1 : -1),
                is_liked: isLiked
              }
            : mix
        )
      )
      
      // Update current mix like status if it's the same mix
      if (currentMixId === mixId) {
        setIsCurrentMixLiked(isLiked)
      }
      
      // Reload user mixes to show liked mixes in panel
      await loadUserMixes()
      
      if (isLiked) {
        showToast('❤️ Mix liked and saved to your panel!', 'success')
      } else {
        showToast('Mix unliked and removed from panel', 'info')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      showToast('Error liking mix', 'error')
    }
  }, [requireAuth, showToast, loadUserMixes, currentMixId])
  
  // Handle like current mix (for MasterControlsBar)
  const handleLikeCurrentMix = useCallback(async () => {
    if (!currentMixId) return
    await handleLikeMix(currentMixId)
  }, [currentMixId, handleLikeMix])
  
  // Auto-detect mix name from loaded content
  const detectMixName = useCallback(() => {
    // Check if we have any active players with content
    const activePlayers = players.filter(p => p.url || p.fileName)
    
    if (activePlayers.length === 0) {
      // No active content, clear mix info
      setCurrentMixName('')
      setCurrentMixId('')
      setIsCurrentMixLiked(false)
      return
    }
    
    // If we have active content but no current mix name, show a generic name
    if (!currentMixName && activePlayers.length > 0) {
      const hasYouTube = activePlayers.some(p => p.url && p.type === 'youtube')
      const hasAudio = activePlayers.some(p => p.fileName && p.type === 'audio')
      
      if (hasYouTube && hasAudio) {
        setCurrentMixName('Custom Mix')
      } else if (hasYouTube) {
        setCurrentMixName('YouTube Mix')
      } else if (hasAudio) {
        setCurrentMixName('Audio Mix')
      } else {
        setCurrentMixName('Custom Mix')
      }
    }
  }, [players, currentMixName])
  
  // Monitor players to auto-detect mix name
  useEffect(() => {
    detectMixName()
  }, [detectMixName])
  
  // Auto-load mix from URL parameter
  useEffect(() => {
    const loadMixFromURL = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const mixId = urlParams.get('mix')
        
        if (mixId && mixId !== currentMixId) {
          // Always enable autoplay for shared links (rule absolute)
          const originalAutoplay = autoPlay
          setAutoPlay(true)
          
          // Load public mix by ID
          const mix = await mixService.getMixById(mixId)
          if (mix && mix.is_public) {
            // Increment play count for shared links
            try {
              await mixService.incrementPlays(mix.id)
            } catch (error) {
              console.log('Could not increment play count:', error)
            }
            
            await loadExploreMix(mix)
            showToast(`🎵 "${mix.name}" loaded from share link!`, 'success')
            
            // Clean URL after loading to avoid conflicts
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('mix')
            newUrl.searchParams.delete('autoplay')
            window.history.replaceState({}, '', newUrl.toString())
          } else {
            showToast('Mix not found or not public', 'error')
          }
          
          // Restore original autoplay setting after a longer delay to ensure mix plays
          setTimeout(() => {
            setAutoPlay(originalAutoplay)
          }, 5000) // Increased delay to ensure shared mix plays completely
        }
      } catch (error) {
        console.error('Error loading mix from URL:', error)
        showToast('Error loading shared mix', 'error')
      }
    }
    
    // Only run on client side and after YouTube API is loaded
    if (typeof window !== 'undefined' && isYouTubeAPILoaded) {
      loadMixFromURL()
    }
  }, [isYouTubeAPILoaded, currentMixId, loadExploreMix, showToast, autoPlay, setAutoPlay])

  // Handle delete mix
  const handleDeleteMix = useCallback(async (mixId: string) => {
    if (!requireAuth()) return
    
    if (!confirm('Are you sure you want to delete this mix?')) return

    try {
      setLoadingMixes(true)
      await mixService.deleteMix(mixId)
      await loadUserMixes()
      showToast('Mix deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting mix:', error)
      showToast('Error deleting mix', 'error')
    } finally {
      setLoadingMixes(false)
    }
  }, [requireAuth, loadUserMixes, showToast])

  // Handle rename mix
  const handleRenameMix = useCallback(async (mixId: string, newName: string) => {
    if (!requireAuth()) return
    
    if (!newName.trim()) {
      showToast('Mix name cannot be empty', 'error')
      return
    }

    try {
      setLoadingMixes(true)
      await mixService.updateMix(mixId, { name: newName.trim() })
      await loadUserMixes()
      showToast('Mix renamed successfully!', 'success')
    } catch (error) {
      console.error('Error renaming mix:', error)
      showToast('Error renaming mix', 'error')
    } finally {
      setLoadingMixes(false)
    }
  }, [requireAuth, loadUserMixes, showToast])

  // Handle open slot preset dialog
  const handleOpenSlotPresetDialog = useCallback((slotId: string) => {
    const player = players.find(p => p.id === slotId)
    if (!player) return

    if (!requireAuth()) return

    if (!player.url && !player.fileName) {
      showToast('This slot is empty', 'error')
      return
    }

    const suggestedName = player.videoTitle || player.fileName || `Slot ${slotId.split('-')[1]}`
    setSlotPresetName(suggestedName.substring(0, 50))
    setShowSlotPresetDialog({ slotId, player })
  }, [players, requireAuth, showToast])

  // Effects
  useEffect(() => {
    if (user) {
      loadUserMixes()
    } else {
      setUserMixes([])
    }
  }, [user, loadUserMixes])

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      // Wait for YouTube API to load
      if (isYouTubeAPILoaded) {
        setIsInitializing(false)
      }
    }
    
    initializeApp()
  }, [isYouTubeAPILoaded])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault()
          toggleGlobalPlay()
          showToast(isGlobalPlaying ? '⏸️ Paused' : '▶️ Playing', 'info')
          break
        case 'KeyH':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setHideAllVideos(prev => !prev)
            showToast(hideAllVideos ? '👁️ Videos shown' : '🙈 Videos hidden', 'info')
          }
          break
        case 'KeyA':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            setAutoPlay(prev => !prev)
            showToast(autoPlay ? '🔄 AutoPlay OFF' : '🔄 AutoPlay ON', 'info')
          }
          break
        case 'KeyC':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            clearAllSlots()
            showToast('🗑️ All slots cleared', 'info')
          }
          break
        case 'KeyS':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (user) {
              setShowSaveDialog(true)
            } else {
              setShowAuthDialog(true)
            }
          }
          break
        case 'Escape':
          // Close any open dialogs
          setShowSaveDialog(false)
          setShowAuthDialog(false)
          setShowSlotPresetDialog(null)
          setShowChangelogDialog(false)
          setShowKeyboardHelp(false)
          break
        case 'F1':
          event.preventDefault()
          setShowKeyboardHelp(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggleGlobalPlay, isGlobalPlaying, hideAllVideos, autoPlay, clearAllSlots, user, showToast])

  // Reload public mixes when user changes to update like status
  useEffect(() => {
    if (publicMixes.length > 0) {
      loadPublicMixes(mixSortBy)
    }
  }, [user, loadPublicMixes, mixSortBy])

  // Load public mixes when explore panel is first expanded
  useEffect(() => {
    if (!exploreCollapsed && publicMixes.length === 0) {
      loadPublicMixes(mixSortBy)
    }
  }, [exploreCollapsed, publicMixes.length, loadPublicMixes, mixSortBy])

  useEffect(() => {
    const saved = localStorage.getItem('youtube-mixer-recent-urls')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Handle both old format (string[]) and new format ({url, title}[])
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // Old format - convert to new format
            const converted = parsed.map((url: string) => ({url, title: `Video ${getYouTubeVideoId(url)?.substring(0, 8) || 'Unknown'}...`}))
            setRecentUrls(converted)
          } else {
            // New format
            setRecentUrls(parsed)
          }
        }
      } catch (e) {
        console.error('Error loading recent URLs:', e)
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Only close suggestions if clicking outside of suggestion dropdowns
      const target = e.target as Element
      if (!target.closest('[data-suggestions]')) {
        setShowSuggestions({})
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      toasts.forEach(toast => {
        if (toast.timeout) clearTimeout(toast.timeout)
      })
    }
  }, [toasts])

  return (
    <div className="min-h-screen bg-theme text-theme font-mono p-4 pb-20 theme-transition">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Authentication */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl tracking-wider text-theme">
              [YOUTUBE MIXER] <button 
                onClick={() => setShowChangelogDialog(true)}
                className="text-xs text-theme-secondary hover:text-accent transition-all duration-200 cursor-pointer underline decoration-dotted underline-offset-2 hover:scale-105"
                title="View changelog"
              >
                        v0.2.0
              </button>
            </h1>
            <div className="flex items-center gap-2 text-xs text-theme-secondary">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 glass-theme border-theme rounded text-[10px] font-mono">F1</kbd>
              <span>for shortcuts</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Controls */}
            <ThemeToggle />
            
            {user ? (
              <>
                <TextButton
                  onClick={() => setShowSaveDialog(true)}
                  disabled={loadingMixes}
                  icon={<div>💾</div>}
                  variant="success"
                  size="medium"
                >
                  SAVE
                </TextButton>
                
                <TextButton
                  onClick={() => {
                    setExploreCollapsed(!exploreCollapsed)
                    if (exploreCollapsed) loadPublicMixes(mixSortBy)
                  }}
                  disabled={loadingMixes}
                  icon={<Eye size={16} />}
                  variant="secondary"
                  size="medium"
                >
                  EXPLORE
                </TextButton>

                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-theme-secondary" />
                  <span className="text-theme max-w-32 truncate" title={user.user_metadata?.name || user.email}>
                    {user.user_metadata?.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-theme-secondary hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <TextButton
                onClick={handleLogin}
                disabled={authLoading}
                icon={<User size={16} />}
                variant="primary"
                size="medium"
              >
                {authLoading ? 'LOADING...' : 'LOGIN'}
              </TextButton>
            )}
          </div>
        </div>

        {/* Public Mixes Panel */}
        <PublicMixesPanel
          publicMixes={publicMixes}
          loadingMixes={loadingMixes}
          exploreCollapsed={exploreCollapsed}
          mixSortBy={mixSortBy}
          onSetExploreCollapsed={setExploreCollapsed}
          onLoadExploreMix={loadExploreMix}
          onHandleShareMix={handleShareMix}
          onHandleLikeMix={handleLikeMix}
          onLoadPublicMixes={loadPublicMixes}
        />

        {/* Mixes Panel */}
        <MixesPanel
          user={user}
          userMixes={userMixes}
          mixesCollapsed={mixesCollapsed}
          onSetMixesCollapsed={setMixesCollapsed}
          onLoadMix={loadMix}
          onHandleShareMix={handleShareMix}
          onHandleLikeMix={handleLikeMix}
          onHandleDeleteMix={handleDeleteMix}
          onHandleRenameMix={handleRenameMix}
        />

        {/* Preset Panel */}
        <PresetPanel
          user={user}
          userMixes={userMixes}
          favoritosCollapsed={favoritosCollapsed}
          onSetFavoritosCollapsed={setFavoritosCollapsed}
          onLoadPresetToAvailableSlot={loadPresetToAvailableSlot}
          onHandleRenameMix={handleRenameMix}
          onLoadRandomMix={loadRandomMix}
          activePlayers={players.filter(p => p.url || p.fileName).map(p => ({
            url: p.url,
            isPlaying: p.isPlaying
          }))}
        />

        {/* Players Grid - Dynamic columns */}
        <div className="relative">
          {/* Floating Grid Layout Button - Inside container with animations */}
          <div className="absolute -right-15 top-0 z-10">
            <button
              onClick={() => {
                const nextLayout = gridLayout === 1 ? 2 : gridLayout === 2 ? 4 : 1
                setGridLayout(nextLayout)
              }}
              className="group relative px-2 py-2 text-xs text-[var(--theme-text-secondary)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-glass-hover)] border border-transparent hover:border-[var(--theme-accent)] rounded-lg transition-all duration-300 font-mono cursor-pointer overflow-hidden"
              title={`Grid: ${gridLayout} col${gridLayout > 1 ? 's' : ''} - Click to cycle`}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent)]/0 to-[var(--theme-accent)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon with rotation animation */}
              <div className="relative flex items-center justify-center">
                <div className="transform transition-transform duration-300 group-hover:scale-110">
                  {gridLayout === 1 ? '◻' : gridLayout === 2 ? '◫' : '▥'}
                </div>
              </div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-lg bg-[var(--theme-accent)]/20 scale-0 group-active:scale-100 transition-transform duration-150"></div>
            </button>
          </div>
          
          <div className={`${getGridClasses(gridLayout)} transition-all duration-500 ease-in-out`}>
            {isInitializing ? (
              // Show skeleton loaders while initializing
              Array.from({ length: 4 }).map((_, index) => (
                <SlotSkeleton key={`skeleton-${index}`} gridLayout={gridLayout} />
              ))
            ) : (
              players.map((player, index) => {
                const allSlotsOccupied = players.every(p => p.url || p.fileName)
                return (
                  <div
                    key={player.id}
                    className="transform transition-all duration-500 ease-in-out"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards'
                    }}
                  >
                    <MixerSlot
                      player={player}
                      hideAllVideos={hideAllVideos}
                      recentUrls={recentUrls}
                      showSuggestions={showSuggestions}
                      onUpdateSlot={updateSlot}
                      onClearSlot={clearSlot}
                      onTogglePlay={togglePlay}
                      onSetVolume={setVolume}
                      onToggleLoop={toggleLoop}
                      onSetPlaybackRate={setPlaybackRate}
                      onSeekTo={seekTo}
                      onReloadPlayer={reloadPlayer}
                      onFileUpload={handleFileUpload}
                      onOpenSlotPresetDialog={handleOpenSlotPresetDialog}
                      onSetShowSuggestions={setShowSuggestions}
                      onLoadPresetToSpecificSlot={loadPresetToSpecificSlot}
                      onPlaylistNext={handlePlaylistNext}
                      onPlaylistPrevious={handlePlaylistPrevious}
                      onTogglePlaylistShuffle={togglePlaylistShuffle}
                      playlistShuffle={playlistShuffle[player.id] || false}
                      getYouTubeVideoId={getYouTubeVideoId}
                      audioRefs={audioRefs}
                      playerRefs={playerRefs}
                      allSlotsOccupied={allSlotsOccupied}
                      gridLayout={gridLayout}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Center Button - Only show when playing */}
        {isGlobalPlaying && players.some(player => player.isPlaying && (player.url || player.fileName)) && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 text-white/30 border border-white/20 rounded-sm hover:text-white/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-mono text-sm"
            >
              <div className="text-sm">💾</div>
              SAVE THE MIX
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-6 border-t border-theme">
          <div className="mb-4">
          <div className="text-center space-y-4">
            <div className="text-sm text-theme">VISANT LABS®</div>
              <div className="text-xs text-theme-secondary mt-2">
                YouTube Mixer - Experimental tool created by <span className="text-accent"><a href="/jaques-profile" target="_blank" rel="noopener noreferrer">Pedro Jaques</a></span>
              </div>
              <div className="text-xs text-theme-secondary max-w-md mx-auto leading-relaxed">
                Part of Visant Labs - Brazilian independent studio exploring interactive design, 
                creative technology and digital experiences
              </div>
            </div>

            <div className="flex justify-center items-center mt-4 gap-6 text-xs">
              <Link 
                href="/" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-theme-secondary hover:text-accent transition-colors font-mono cursor-pointer"
                title="Home (New Tab)"
              >
                <Home size={14} />
                STUDIO
              </Link>
              <Link 
                href="/donate" 
                target="_blank"
                rel="noopener noreferrer"
                title="Donate (New Tab)"
              >
                <TextButton
                  onClick={() => {}}
                  icon={<Coffee size={14} />}
                  variant="primary"
                  size="medium"
                >
                DONATE
                </TextButton>
              </Link>
              <Link 
                href="/jaques-profile" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-theme-secondary hover:text-accent transition-colors font-mono cursor-pointer"
                title="Creator Profile (New Tab)"
              >
                <UserCheck size={14} />
                CREATOR
              </Link>
            </div>

            <div className="text-xs text-theme-secondary justify-center font-mono pt-4">
              © 2025 VISANT LABS • EXPERIMENTAL TOOLS
            </div>
          
          </div>
        </footer>

        {/* Master Controls Bar */}
        <MasterControlsBar
          isGlobalPlaying={isGlobalPlaying}
          onToggleGlobalPlay={toggleGlobalPlay}
          hideAllVideos={hideAllVideos}
          onToggleAllVideosVisibility={() => setHideAllVideos(prev => !prev)}
          autoPlay={autoPlay}
          onToggleAutoPlay={setAutoPlay}
          globalVolume={globalVolume}
          onGlobalVolumeChange={setGlobalVolume}
          onClearAllSlots={clearAllSlots}
          onToggleVinyl={toggleVinyl}
          currentMixName={currentMixName}
          onLikeMix={currentMixId ? handleLikeCurrentMix : undefined}
          isMixLiked={isCurrentMixLiked}
        />

        {/* Dialogs */}
        <SaveMixDialog
          isOpen={showSaveDialog}
          newMixName={newMixName}
          newMixDescription={newMixDescription}
          isPublicMix={isPublicMix}
          loadingMixes={loadingMixes}
          onSetNewMixName={setNewMixName}
          onSetNewMixDescription={setNewMixDescription}
          onSetIsPublicMix={setIsPublicMix}
          onHandleSaveMix={handleSaveMix}
          onClose={() => {
            setShowSaveDialog(false)
            setNewMixName('')
            setNewMixDescription('')
          }}
        />

        <AuthDialog
          isOpen={showAuthDialog}
          onHandleLogin={handleLogin}
          onClose={() => setShowAuthDialog(false)}
        />

        <SlotPresetDialog
          isOpen={!!showSlotPresetDialog}
          player={showSlotPresetDialog?.player || null}
          slotPresetName={slotPresetName}
          loadingMixes={loadingMixes}
          onSetSlotPresetName={setSlotPresetName}
          onHandleSaveSlotPreset={handleSaveSlotPreset}
          onClose={() => {
            setShowSlotPresetDialog(null)
            setSlotPresetName('')
          }}
        />

        {/* Toast Notifications */}
        <ToastNotification
          toasts={toasts}
          onRemoveToast={removeToast}
        />

        {/* Changelog Dialog */}
        <ChangelogDialog
          isOpen={showChangelogDialog}
          onClose={() => setShowChangelogDialog(false)}
        />

        {/* Keyboard Help Dialog */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md glass-theme rounded-lg shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-mono font-bold text-theme">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="text-theme-secondary hover:text-theme transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-theme">Play/Pause</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Space</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme">Toggle Videos</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Ctrl+H</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme">Toggle AutoPlay</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Ctrl+A</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme">Clear All</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Ctrl+C</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme">Save Mix</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Ctrl+S</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme">Close Dialogs</span>
                  <kbd className="px-2 py-1 glass-theme border-theme rounded text-xs font-mono">Esc</kbd>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-theme">
                <p className="text-xs text-theme-secondary text-center">
                  Press <kbd className="px-1 py-0.5 glass-theme border-theme rounded text-[10px] font-mono">F1</kbd> to toggle this help
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
