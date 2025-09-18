'use client'

import { TextButton } from '@/components/shared'
import { MediaPlayer } from '@/contexts/MixerContext'

interface SlotPresetDialogProps {
  isOpen: boolean
  player: MediaPlayer | null
  slotPresetName: string
  loadingMixes: boolean
  onSetSlotPresetName: (name: string) => void
  onHandleSaveSlotPreset: () => void
  onClose: () => void
}

export default function SlotPresetDialog({
  isOpen,
  player,
  slotPresetName,
  loadingMixes,
  onSetSlotPresetName,
  onHandleSaveSlotPreset,
  onClose
}: SlotPresetDialogProps) {
  if (!isOpen || !player) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-white/20 rounded-sm p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-mono mb-4 text-center">Save Slot as Preset</h3>
        
        <div className="space-y-4">
          {/* Mostrar preview do slot */}
          <div className="p-3 bg-white/5 border border-white/10 rounded-sm">
            <div className="text-xs text-white/60 mb-1">Preview:</div>
            <div className="text-sm text-white/90">
              {player.videoTitle || player.fileName || 'Audio/Video'}
            </div>
            <div className="text-xs text-white/40 mt-1">
              {player.type === 'youtube' ? '📹 YouTube' : '🎵 Audio'} • Volume: {player.volume}%
              {player.isLooping && ' • Loop'}
            </div>
          </div>

          <input
            type="text"
            value={slotPresetName}
            onChange={(e) => onSetSlotPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none"
            autoFocus
            maxLength={100}
          />
          
          <div className="text-xs text-white/50">
            💡 This will save this slot configuration as a reusable preset
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <TextButton
            onClick={onHandleSaveSlotPreset}
            disabled={!slotPresetName.trim() || loadingMixes}
            variant="warning"
            size="medium"
            fullWidth
          >
            {loadingMixes ? 'Saving...' : '💾 Save Preset'}
          </TextButton>
          <TextButton
            onClick={onClose}
            variant="secondary"
            size="medium"
          >
            Cancel
          </TextButton>
        </div>
      </div>
    </div>
  )
}
