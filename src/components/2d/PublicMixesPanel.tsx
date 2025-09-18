'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Share2, Heart, Search, X } from 'lucide-react'
import { Mix } from '@/lib/supabase'

interface PublicMixesPanelProps {
  publicMixes: Mix[]
  loadingMixes: boolean
  exploreCollapsed: boolean
  mixSortBy: 'recent' | 'likes' | 'plays'
  onSetExploreCollapsed: (collapsed: boolean) => void
  onLoadExploreMix: (mix: Mix) => void
  onHandleShareMix: (mix: Mix) => void
  onHandleLikeMix: (mixId: string) => void
  onLoadPublicMixes: (sortBy: 'recent' | 'likes' | 'plays') => void
}

export default function PublicMixesPanel({
  publicMixes,
  loadingMixes,
  exploreCollapsed,
  mixSortBy,
  onSetExploreCollapsed,
  onLoadExploreMix,
  onHandleShareMix,
  onHandleLikeMix,
  onLoadPublicMixes
}: PublicMixesPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter mixes based on search query
  const filteredMixes = useMemo(() => {
    if (!searchQuery.trim()) return publicMixes.filter(mix => !mix.config.isSlotPreset)
    
    const query = searchQuery.toLowerCase()
    return publicMixes.filter(mix => 
      !mix.config.isSlotPreset && 
      (mix.name.toLowerCase().includes(query) || 
       (mix.description && mix.description.toLowerCase().includes(query)))
    )
  }, [publicMixes, searchQuery])
  return (
    <div className="mb-6 border border-theme rounded-sm glass-theme overflow-hidden">
      {/* Header with Collapse Toggle */}
      <div 
        className="p-4 cursor-pointer hover:bg-theme-glass-hover transition-colors"
        onClick={() => {
          onSetExploreCollapsed(!exploreCollapsed)
          if (exploreCollapsed) onLoadPublicMixes(mixSortBy)
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-mono text-theme tracking-wide">EXPLORE COMMUNITY MIXES</h3>
            <div className="w-2 h-2 rounded-sm bg-gradient-to-r from-white/50 to-white/10 animate-pulse"></div>
            {publicMixes && publicMixes.filter(mix => !mix.config.isSlotPreset).length > 0 && (
              <div className="flex gap-2">
                <span className="text-xs glass-theme text-theme-secondary px-2 py-1 rounded-sm">
                  {searchQuery ? `${filteredMixes.length} of ${publicMixes.filter(mix => !mix.config.isSlotPreset).length}` : publicMixes.filter(mix => !mix.config.isSlotPreset).length} MIXES
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-secondary font-mono">
              {exploreCollapsed ? 'EXPAND' : 'COLLAPSE'}
            </span>
            {exploreCollapsed ? <ChevronDown size={16} className="text-theme-secondary" /> : <ChevronUp size={16} className="text-theme-secondary" />}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out ${exploreCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'} overflow-y-auto`}>
        <div className="px-4 pb-4">
          {/* Sort Options and Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            {/* Sort Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onLoadPublicMixes('recent')
                }}
                className={`text-xs px-3 py-1 rounded-sm transition-colors cursor-pointer ${
                  mixSortBy === 'recent' 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'glass-theme text-theme-secondary hover:bg-theme-glass-hover'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => {
                  onLoadPublicMixes('likes')
                }}
                className={`text-xs px-3 py-1 rounded-sm transition-colors cursor-pointer ${
                  mixSortBy === 'likes' 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'glass-theme text-theme-secondary hover:bg-theme-glass-hover'
                }`}
              >
                Popular
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={12} className="absolute top-1/3 left-3 transform -translate-y-1/2 text-theme-secondary" />
              <input
                type="text"
                placeholder="Search mixes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 glass-input text-theme placeholder-theme-secondary focus:outline-none focus:border-accent focus:bg-theme-glass-hover transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/3 right-2 transform -translate-y-1/2 text-theme-secondary hover:text-theme transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Public Mixes */}
          {loadingMixes ? (
            <div className="text-center py-8 text-theme-secondary">
              <p>Loading public mixes...</p>
            </div>
          ) : filteredMixes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredMixes.map((mix) => (
                <div key={mix.id} className="flex items-center gap-2 p-3 glass-theme rounded-sm hover:bg-theme-glass-hover transition-colors">
                  <button
                    onClick={() => onLoadExploreMix(mix)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                    <div className="text-xs text-theme font-medium truncate">{mix.name}</div>
                    {mix.description && (
                      <div className="text-[10px] text-theme-secondary truncate mt-0.5">{mix.description}</div>
                    )}
                    <div className="text-[10px] text-theme-secondary mt-1">
                      🌍 Public • {mix.likes_count} ❤️ • {mix.plays_count || 0} ▶️
                      <span className="ml-2">👤 {mix.profiles?.name || 'admin'}</span>
                    </div>
                  </button>
                  <button
                    onClick={() => onHandleShareMix(mix)}
                    className="text-theme-secondary hover:text-accent transition-colors p-1 cursor-pointer"
                    title="Share"
                  >
                    <Share2 size={12} />
                  </button>
                  <button
                    onClick={() => onHandleLikeMix(mix.id)}
                    className={`transition-colors p-1 cursor-pointer ${
                      mix.is_liked 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-theme-secondary hover:text-red-400'
                    }`}
                    title={mix.is_liked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={12} fill={mix.is_liked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-theme-secondary">
              <p>{searchQuery ? 'No mixes found matching your search' : 'No public mixes found'}</p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try a different search term' : 'Be the first to share a public mix!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
