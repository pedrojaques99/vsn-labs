'use client'

import { TextButton } from '@/components/shared'

interface SaveMixDialogProps {
  isOpen: boolean
  newMixName: string
  newMixDescription: string
  isPublicMix: boolean
  loadingMixes: boolean
  onSetNewMixName: (name: string) => void
  onSetNewMixDescription: (description: string) => void
  onSetIsPublicMix: (isPublic: boolean) => void
  onHandleSaveMix: () => void
  onClose: () => void
}

export default function SaveMixDialog({
  isOpen,
  newMixName,
  newMixDescription,
  isPublicMix,
  loadingMixes,
  onSetNewMixName,
  onSetNewMixDescription,
  onSetIsPublicMix,
  onHandleSaveMix,
  onClose
}: SaveMixDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-theme-static rounded-sm p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-mono mb-4 text-center text-[var(--theme-text)]">+</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            value={newMixName}
            onChange={(e) => onSetNewMixName(e.target.value)}
            placeholder="Mix name..."
            className="w-full px-3 py-2 glass-input text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] focus:border-[var(--theme-accent)] focus:outline-none"
            autoFocus
            maxLength={100}
          />
          
          <textarea
            value={newMixDescription}
            onChange={(e) => onSetNewMixDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full px-3 py-2 glass-input text-[var(--theme-text)] placeholder-[var(--theme-text-secondary)] focus:border-[var(--theme-accent)] focus:outline-none resize-none h-20"
            maxLength={500}
          />
          
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublicMix}
              onChange={(e) => onSetIsPublicMix(e.target.checked)}
              className="rounded-sm"
            />
            <span className="text-[var(--theme-text)] opacity-90">Make public (others can see and like)</span>
          </label>
        </div>
        
        <div className="flex gap-2 mt-6">
          <TextButton
            onClick={onHandleSaveMix}
            disabled={!newMixName.trim() || loadingMixes}
            variant="success"
            size="medium"
            fullWidth
          >
            {loadingMixes ? 'Saving...' : 'Save'}
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
