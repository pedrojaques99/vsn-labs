'use client'

import React, { useState } from 'react'
import { Palette } from 'lucide-react'
import ThemeControls from './ThemeControls'

export default function ThemeToggle() {
  const [showThemeControls, setShowThemeControls] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowThemeControls(true)}
        className="glass-toggle"
        title="Open Theme Settings"
      >
        <Palette size={18} />
      </button>

      <ThemeControls
        isOpen={showThemeControls}
        onClose={() => setShowThemeControls(false)}
      />
    </>
  )
}