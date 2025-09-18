'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useTheme, Theme } from '../../contexts/ThemeContext'
import ToastNotification from './ToastNotification'

interface ThemeControlsProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemeControls({ isOpen, onClose }: ThemeControlsProps) {
  const { currentTheme, themes, setTheme, setCustomColors, saveThemeToSupabase } = useTheme()
  const [customBackground, setCustomBackground] = useState(currentTheme.colors.background)
  const [customAccent, setCustomAccent] = useState(currentTheme.colors.accent)
  const [isSaving, setIsSaving] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Toast states
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info'
    timeout?: NodeJS.Timeout
  }>>([])

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

  const handleSaveTheme = async () => {
    setIsSaving(true)
    try {
      await saveThemeToSupabase()
      // Show success feedback (you could add a toast here)
    } catch (error) {
      console.error('Error saving theme:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-lg">
      <div 
        ref={modalRef} 
        className="relative w-full max-w-2xl glass-theme rounded-xl shadow-2xl p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-mono font-bold text-theme">Theme</h2>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme transition-colors p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Theme Presets */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-theme font-medium mb-3 text-sm">Presets</h3>
          <div className="grid grid-cols-5 gap-2">
            {themes.map((theme: Theme) => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  currentTheme.id === theme.id
                    ? 'border-accent bg-accent/10'
                    : 'border-theme hover:border-accent/50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div
                    className="w-2 h-2 rounded-full border border-theme"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <div
                    className="w-2 h-2 rounded-full border border-theme"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="text-xs text-theme font-medium truncate text-center">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-theme font-medium mb-3 text-sm">Custom Colors</h3>
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
                  className="w-8 h-8 rounded border border-theme cursor-pointer"
                />
                <input
                  type="text"
                  value={customBackground}
                  onChange={(e) => handleBackgroundChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-transparent border border-theme rounded text-theme placeholder-theme-secondary"
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
                  className="w-8 h-8 rounded border border-theme cursor-pointer"
                />
                <input
                  type="text"
                  value={customAccent}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-transparent border border-theme rounded text-theme placeholder-theme-secondary"
                  placeholder="#06b6d4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Theme Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="w-full px-4 py-2 glass-theme border border-[var(--theme-glass-border)] rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-glass-hover)] hover:border-[var(--theme-accent)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Theme to Cloud'}
          </button>
        </div>

        {/* Current Theme Display */}
        <div className="mt-4 sm:mt-6 p-3 glass-theme rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-theme"
              style={{ backgroundColor: currentTheme.colors.background }}
            />
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-theme"
              style={{ backgroundColor: currentTheme.colors.accent }}
            />
            <span className="text-theme text-sm font-medium">{currentTheme.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}