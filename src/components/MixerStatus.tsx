'use client'

import { useMixer } from '@/contexts/MixerContext'
import { Music, Play, Pause, Volume2 } from 'lucide-react'

export default function MixerStatus() {
  const { hasActiveContent, getActivePlayers, isGlobalPlaying, globalVolume } = useMixer()

  if (!hasActiveContent()) {
    return (
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <Music size={16} />
        <span>No mixer content</span>
      </div>
    )
  }

  const activePlayers = getActivePlayers()
  const playingCount = activePlayers.filter(p => p.isPlaying).length

  return (
    <div className="flex items-center gap-3 text-white/80 text-sm font-mono">
      <div className="flex items-center gap-2">
        <Music size={16} className="text-cyan-400" />
        <span>MIXER</span>
      </div>
      
      <div className="flex items-center gap-1">
        {isGlobalPlaying ? <Play size={14} className="text-green-400" /> : <Pause size={14} className="text-white/60" />}
        <span className="text-xs">
          {playingCount}/{activePlayers.length}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <Volume2 size={14} className="text-white/60" />
        <span className="text-xs">{globalVolume}%</span>
      </div>
    </div>
  )
}
