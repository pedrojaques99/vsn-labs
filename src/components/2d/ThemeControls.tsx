'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Palette, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeControlsProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemeControls({ isOpen, onClose }: ThemeControlsProps) {
  const { 
    currentTheme, 
    themes, 
    setTheme, 
    setCustomColors
  } = useTheme()
  
  const [customBackground, setCustomBackground] = useState(currentTheme.colors.background)
  const [customAccent, setCustomAccent] = useState(currentTheme.colors.accent)
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Apply custom colors immediately when changed
  const handleBackgroundChange = (color: string) => {
    setCustomBackground(color)
    setCustomColors(color, customAccent)
  }

  const handleAccentChange = (color: string) => {
    setCustomAccent(color)
    setCustomColors(customBackground, color)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div ref={modalRef} className="relative w-full max-w-md glass-theme-static rounded-lg shadow-2xl p-6 theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Palette size={20} className="text-accent" />
            <h2 className="text-lg font-mono font-bold text-theme">Theme</h2>
          </div>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset Themes */}
        <div className="mb-6">
          <h3 className="text-theme font-medium mb-3">Presets</h3>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentTheme.id === theme.id
                    ? 'border-accent bg-accent/10'
                    : 'border-theme hover:border-accent/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full border border-theme"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-theme"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="text-xs text-theme font-medium">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="mb-6">
          <h3 className="text-theme font-medium mb-3">Custom Colors</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-theme-secondary mb-2">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBackground}
                  onChange={(e) => handleBackgroundChange(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customBackground}
                  onChange={(e) => handleBackgroundChange(e.target.value)}
                  className="flex-1 glass-input text-xs"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-theme-secondary mb-2">
                Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={customAccent}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="flex-1 glass-input text-xs"
                  placeholder="#06b6d4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Current Preview */}
        <div className="p-3 glass-theme-static rounded-lg">
          <div className="text-xs text-theme-secondary mb-2">Current Theme</div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-theme"
              style={{ backgroundColor: currentTheme.colors.background }}
            />
            <div
              className="w-4 h-4 rounded border border-theme"
              style={{ backgroundColor: currentTheme.colors.accent }}
            />
            <span className="text-theme text-sm font-medium">{currentTheme.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}