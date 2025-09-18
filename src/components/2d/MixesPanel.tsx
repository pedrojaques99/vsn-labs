'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Save, Heart, Share2, Trash2, Edit2, Check, X } from 'lucide-react'
import { Mix } from '@/lib/supabase'

interface MixesPanelProps {
  user: unknown
  userMixes: Mix[]
  mixesCollapsed: boolean
  onSetMixesCollapsed: (collapsed: boolean) => void
  onLoadMix: (mix: Mix) => void
  onHandleShareMix: (mix: Mix) => void
  onHandleLikeMix: (mixId: string) => void
  onHandleDeleteMix: (mixId: string) => void
  onHandleRenameMix: (mixId: string, newName: string) => void
}

export default function MixesPanel({
  user,
  userMixes,
  mixesCollapsed,
  onSetMixesCollapsed,
  onLoadMix,
  onHandleShareMix,
  onHandleLikeMix,
  onHandleDeleteMix,
  onHandleRenameMix
}: MixesPanelProps) {
  const [editingMixId, setEditingMixId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleStartEdit = (mix: Mix) => {
    setEditingMixId(mix.id)
    setEditName(mix.name)
  }

  const handleSaveEdit = () => {
    if (editingMixId && editName.trim()) {
      onHandleRenameMix(editingMixId, editName.trim())
      setEditingMixId(null)
      setEditName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingMixId(null)
    setEditName('')
  }
  return (
    <div className="mb-6 border border-theme rounded-sm glass-theme overflow-hidden">
      {/* Header with Collapse Toggle */}
      <div 
        className="p-4 cursor-pointer hover:bg-theme-glass-hover transition-colors"
        onClick={() => onSetMixesCollapsed(!mixesCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-mono text-theme tracking-wide">YOUR MIXES</h3>
            {!!user && userMixes && userMixes.length > 0 && (
              <div className="flex gap-2">
                {userMixes.filter(mix => !mix.config.isSlotPreset).length > 0 && (
                  <span className="text-xs glass-theme text-theme-secondary px-2 py-1 rounded-sm">
                    {userMixes.filter(mix => !mix.config.isSlotPreset).length} MIXES
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-secondary font-mono">
              {mixesCollapsed ? 'EXPAND' : 'COLLAPSE'}
            </span>
            {mixesCollapsed ? <ChevronDown size={16} className="text-theme-secondary" /> : <ChevronUp size={16} className="text-theme-secondary" />}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out ${mixesCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'} overflow-y-auto`}>
        <div className="px-4 pb-4">
          {/* User Mixes */}
          {!!user && userMixes && userMixes.filter(mix => !mix.config.isSlotPreset).length > 0 ? (
            <div className="mb-6">
              <h4 className="text-xs text-accent mb-3 font-mono flex items-center gap-2">
                <Save size={12} />
                SAVED MIXES:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {userMixes.filter(mix => !mix.config.isSlotPreset).map((mix) => (
                  <div key={mix.id} className="flex items-center gap-2 p-3 glass-theme rounded-sm hover:bg-theme-glass-hover transition-colors">
                    {editingMixId === mix.id ? (
                      // Edit mode
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit()
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                          className="flex-1 px-2 py-1 text-xs glass-input text-theme placeholder-theme-secondary focus:border-accent focus:outline-none"
                          autoFocus
                          maxLength={100}
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 cursor-pointer"
                          title="Save"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 cursor-pointer"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <button
                          onClick={() => onLoadMix(mix)}
                          className="flex-1 text-left min-w-0 cursor-pointer"
                        >
                          <div className="text-xs text-theme font-medium truncate">{mix.name}</div>
                          {mix.description && (
                            <div className="text-[10px] text-theme-secondary truncate mt-0.5">{mix.description}</div>
                          )}
                        </button>
                        {mix.is_owned && (
                          <button
                            onClick={() => handleStartEdit(mix)}
                            className="text-theme-secondary hover:text-yellow-400 transition-colors p-1 cursor-pointer"
                            title="Rename"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => onHandleShareMix(mix)}
                            className="text-theme-secondary hover:text-accent transition-colors p-1 cursor-pointer"
                          title="Share"
                        >
                          <Share2 size={12} />
                        </button>
                        {mix.is_owned ? (
                          <button
                            onClick={() => onHandleDeleteMix(mix.id)}
                            className="text-theme-secondary hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onHandleLikeMix(mix.id)}
                            className={`transition-colors p-1 cursor-pointer ${mix.is_liked ? 'text-red-400' : 'text-theme-secondary hover:text-red-400'}`}
                            title={mix.is_liked ? 'Unlike' : 'Like'}
                          >
                            <Heart size={12} className={mix.is_liked ? 'fill-current' : ''} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-theme-secondary text-sm mb-2">No saved mixes yet</div>
              <div className="text-theme-secondary text-xs opacity-50">Create and save your first mix!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
