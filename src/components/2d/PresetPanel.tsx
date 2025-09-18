'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Heart, CloudRain, Snowflake, Bird, Disc, Flame, Edit2, Check, X, Bug, Radio, Cog, Shuffle } from 'lucide-react'
import { PresetButton } from '@/components/shared'
import { Mix } from '@/lib/supabase'


interface PresetPanelProps {
  user: unknown
  userMixes: Mix[]
  favoritosCollapsed: boolean
  onSetFavoritosCollapsed: (collapsed: boolean) => void
  onLoadPresetToAvailableSlot: (url: string) => void
  onHandleRenameMix: (mixId: string, newName: string) => void
  onLoadRandomMix?: () => void
  activePlayers?: Array<{ url: string; isPlaying: boolean }>
}

export default function PresetPanel({
  user,
  userMixes,
  favoritosCollapsed,
  onSetFavoritosCollapsed,
  onLoadPresetToAvailableSlot,
  onHandleRenameMix,
  onLoadRandomMix,
  activePlayers = []
}: PresetPanelProps) {
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleStartEdit = (preset: Mix) => {
    setEditingPresetId(preset.id)
    setEditName(preset.name)
  }

  const handleSaveEdit = () => {
    if (editingPresetId && editName.trim()) {
      onHandleRenameMix(editingPresetId, editName.trim())
      setEditingPresetId(null)
      setEditName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingPresetId(null)
    setEditName('')
  }

  // Check if a preset is currently playing
  const isPresetPlaying = (url: string) => {
    return activePlayers.some(player => player.url === url && player.isPlaying)
  }

  // Randomize function to load random mix (replaces all slots)
  const handleRandomize = () => {
    if (onLoadRandomMix) {
      onLoadRandomMix()
    } else {
      // Fallback to single preset if no mix function provided
      const allPresets = [
        ...weatherPresets,
        ...environmentPresets,
        ...(userMixes?.filter(mix => mix.config.isSlotPreset).map(mix => ({
          name: mix.name,
          url: mix.config.players[0]?.url || ''
        })) || [])
      ]

      if (allPresets.length > 0) {
        const randomIndex = Math.floor(Math.random() * allPresets.length)
        const randomPreset = allPresets[randomIndex]
        onLoadPresetToAvailableSlot(randomPreset.url)
      }
    }
  }
  // Weather presets - separated for visual emphasis
  const weatherPresets = [
    { name: 'Rain', url: 'https://www.youtube.com/watch?v=M-Q2Extc6z8', icon: CloudRain },
    { name: 'Snow', url: 'https://www.youtube.com/watch?v=WoFKSR6ed2Q&t', icon: Snowflake },
    { name: 'Birds', url: 'https://www.youtube.com/watch?v=EwgVwlcWn4Y', icon: Bird },
    { name: 'Storm', url: 'https://www.youtube.com/watch?v=FfVaHQXI-TQ&t', icon: CloudRain },	
    { name: 'Vinyl', url: 'https://www.youtube.com/watch?v=DUhdSWsapuA', icon: Disc },
    { name: 'Fire', url: 'https://www.youtube.com/watch?v=mSX3OyW9Rao', icon: Flame },
    { name: 'Makita', url: 'https://www.youtube.com/watch?v=BFl_AvhXsOE&ab', icon: Cog },
    { name: 'Cricket', url: 'https://www.youtube.com/watch?v=3u2FkPfIwBc', icon: Bug },
    { name: 'Radio', url: 'https://www.youtube.com/watch?v=gm7z_27oraI&t', icon: Radio }
  ]

  // Other preset links
  const environmentPresets = [
    { name: 'Oregon', url: 'https://www.youtube.com/watch?v=nZ3wV6Z68Vk' },
    { name: 'Deep', url: 'https://www.youtube.com/watch?v=rmOzpR0AchA&t', },
    { name: 'Swamp', url: 'https://www.youtube.com/watch?v=2pv3g5SVcfc&t', },
    { name: 'Brazil', url: 'https://www.youtube.com/watch?v=9ScVvOI32yE' },
    { name: 'Afternoon', url: 'https://www.youtube.com/watch?v=jtjB_Ucn8_k' },
    { name: 'Desert', url: 'https://www.youtube.com/watch?v=v4M6kLRGGCo' },
    { name: 'Morning', url: 'https://www.youtube.com/watch?v=zGs8ykoH_2Q&' },
    { name: 'Alien', url: 'https://www.youtube.com/watch?v=u9a1EQS_9Wo&list=PLVovUzLdR8iNvRVPUEZ5jd0ibKdKlSZab' },
    { name: 'Mount Shrine', url: 'https://www.youtube.com/watch?v=nVRbAL03GIs&t=5973s' },
    { name: 'Cosmic City', url: 'https://youtu.be/7rgG3sboipg' },
    { name: 'Nuketown', url: 'https://youtu.be/JTVtlfKr8qU' }
  ]

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, url: string) => {
    e.dataTransfer.setData('text/plain', url)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragEnd = () => {
    // Optional: Add visual feedback when drag ends
  }

  return (
    <div className="mb-6 border border-theme rounded-sm glass-theme overflow-hidden">
      {/* Header with Collapse Toggle */}
      <div 
        className="p-4 cursor-pointer hover:bg-theme-glass-hover transition-colors"
        onClick={() => onSetFavoritosCollapsed(!favoritosCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-mono text-theme tracking-wide">PRESETS</h3>
            {!!user && userMixes && userMixes.filter(mix => mix.config.isSlotPreset).length > 0 && (
              <div className="flex gap-2">
                <span className="text-xs glass-theme text-theme-secondary px-2 py-1 rounded-sm">
                  {userMixes.filter(mix => mix.config.isSlotPreset).length} PRESETS
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Randomize Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRandomize()
              }}
              className="flex items-center gap-1 px-2 py-1 glass-theme hover:bg-theme-glass-hover rounded-sm transition-colors text-xs text-theme hover:text-theme cursor-pointer"
              title="Load random preset"
            >
              <Shuffle size={12} />
              <span className="font-mono">RANDOM</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-theme-secondary font-mono">
                {favoritosCollapsed ? 'EXPAND' : 'COLLAPSE'}
              </span>
              {favoritosCollapsed ? <ChevronDown size={16} className="text-theme-secondary" /> : <ChevronUp size={16} className="text-theme-secondary" />}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out ${favoritosCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'} overflow-y-auto`}>
        <div className="px-4 pb-4">
          {/* Default Presets */}
          <div className="mb-4">
            {/* Two Column Layout */}
            <div className="flex gap-4">
              {/* Weather Presets Column - Hug Content */}
              <div className="flex-shrink-0">
                <h5 className="text-xs text-accent mb-2 font-mono flex items-center gap-2">
                  TEXTURES:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {weatherPresets.map((preset) => {
                    const IconComponent = preset.icon
                    const isPlaying = isPresetPlaying(preset.url)
                    return (
                      <PresetButton
                        key={preset.name}
                        onClick={() => onLoadPresetToAvailableSlot(preset.url)}
                        icon={<IconComponent size={20} />}
                        variant="icon"
                        size="medium"
                        className={`w-16 h-16 whitespace-nowrap ${
                          isPlaying 
                            ? 'ring-2 ring-accent/80 shadow-lg shadow-accent/30 bg-accent/10' 
                            : ''
                        }`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, preset.url)}
                        onDragEnd={handleDragEnd}
                      >
                        {preset.name}
                      </PresetButton>
                    )
                  })}
                </div>
              </div>
              
              {/* Environment Presets Column - Fill Container */}
              <div className="flex-1">
                <h5 className="text-xs text-green-400 mb-2 font-mono flex items-center gap-2">
                  AMBIENTS:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                  {/* Default Environment Presets */}
                  {environmentPresets.map((preset) => {
                    const isPlaying = isPresetPlaying(preset.url)
                    return (
                      <PresetButton
                        key={preset.name}
                        onClick={() => onLoadPresetToAvailableSlot(preset.url)}
                        variant="text"
                        size="medium"
                        className={`whitespace-nowrap ${
                          isPlaying 
                            ? 'ring-2 ring-accent/80 shadow-lg shadow-accent/30 bg-accent/10' 
                            : ''
                        }`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, preset.url)}
                        onDragEnd={handleDragEnd}
                      >
                        {preset.name}
                      </PresetButton>
                    )
                  })}
                  
                  {/* User Presets - Appear after defaults */}
                  {!!user && userMixes && userMixes.filter(mix => mix.config.isSlotPreset).map((preset) => {
                    const presetUrl = preset.config.players[0]?.url || ''
                    const isPlaying = isPresetPlaying(presetUrl)
                    return (
                      <div key={preset.id} className="relative group">
                        {editingPresetId === preset.id ? (
                          // Edit mode
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit()
                                if (e.key === 'Escape') handleCancelEdit()
                              }}
                              className="px-2 py-1 text-xs glass-input text-theme placeholder-theme-secondary focus:border-accent focus:outline-none w-full"
                              autoFocus
                              maxLength={100}
                            />
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-400 hover:text-green-300 transition-colors p-1 cursor-pointer"
                              title="Save"
                            >
                              <Check size={10} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                              title="Cancel"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <PresetButton
                              onClick={() => onLoadPresetToAvailableSlot(presetUrl)}
                              variant="text"
                              size="medium"
                              className={`whitespace-nowrap w-full ${
                                isPlaying 
                                  ? 'ring-2 ring-accent/80 shadow-lg shadow-accent/30 bg-accent/10' 
                                  : ''
                              }`}
                              draggable={true}
                              onDragStart={(e) => handleDragStart(e, presetUrl)}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="flex items-center gap-1">
                                <Heart size={12} className="text-pink-400" />
                                <span className="whitespace-nowrap">
                                  {preset.name}
                                </span>
                              </div>
                            </PresetButton>
                            <button
                              onClick={() => handleStartEdit(preset)}
                              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-theme-secondary hover:text-yellow-400 p-1 glass-theme rounded-full cursor-pointer"
                              title="Rename"
                            >
                              <Edit2 size={8} />
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-theme-secondary text-center">
            Click or drag to load sample
          </div>
        </div>
      </div>
    </div>
  )
}
