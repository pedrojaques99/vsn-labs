'use client'

import React from 'react'
import { X, Coffee, ExternalLink } from 'lucide-react'
import { TextButton } from '@/components/shared'
import Link from 'next/link'

interface ChangelogDialogProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangelogDialog({ isOpen, onClose }: ChangelogDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto glass-theme-static rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 glass-theme-static backdrop-blur-sm border-b border-[var(--theme-glass-border)] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-mono font-bold text-[var(--theme-text)]">CHANGELOG</h2>
            <p className="text-sm text-[var(--theme-text-secondary)] mt-1">YouTube Mixer v0.2.0</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors p-2 hover:bg-white/5 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Version 0.2.0 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <h3 className="text-lg font-mono font-bold text-purple-400">v0.2.0 - Dynamic Theme System</h3>
              <span className="text-xs text-[var(--theme-text-secondary)] glass-theme px-2 py-1 rounded">LATEST</span>
            </div>
            
            <div className="ml-5 space-y-3">
              <div>
                <h4 className="text-sm font-mono font-semibold text-[var(--theme-text)] mb-2">🎨 Complete Theme Overhaul</h4>
                <ul className="text-sm text-[var(--theme-text)] space-y-1 ml-4 opacity-90">
                  <li>• Dynamic theme system with CSS variables</li>
                  <li>• Custom color picker for background and accent colors</li>
                  <li>• Automatic text color adjustment based on contrast</li>
                  <li>• Light/Dark mode toggle functionality</li>
                  <li>• Real-time theme application across all components</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-[var(--theme-text)] mb-2">🔧 UI Improvements</h4>
                <ul className="text-sm text-[var(--theme-text)] space-y-1 ml-4 opacity-90">
                  <li>• All components now use theme-aware styling</li>
                  <li>• Volume sliders respond to custom accent colors</li>
                  <li>• Master Controls Bar spacing optimized</li>
                  <li>• Grid layout button redesigned with theme integration</li>
                  <li>• Glass effect maintained without unwanted hover effects</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-[var(--theme-text)] mb-2">⚡ Technical Enhancements</h4>
                <ul className="text-sm text-[var(--theme-text)] space-y-1 ml-4 opacity-90">
                  <li>• ThemeContext with React Context API</li>
                  <li>• localStorage persistence for theme preferences</li>
                  <li>• CSS custom properties for dynamic theming</li>
                  <li>• Optimized build process and performance</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 0.1.1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <h3 className="text-lg font-mono font-bold text-green-400">v0.1.1 - Play Count Tracking</h3>
            </div>
            
            <div className="ml-5 space-y-3">
              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">📊 Analytics & Tracking</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• Play count tracking for public mixes</li>
                  <li>• Automatic play count increment on mix load</li>
                  <li>• Play count display in explore panel</li>
                  <li>• Sort mixes by play count (most popular)</li>
                  <li>• Real-time analytics for creators</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">🎵 Enhanced Discovery</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• Popular mixes sorting option</li>
                  <li>• Play count indicators (❤️ likes • ▶️ plays)</li>
                  <li>• Better mix discovery through popularity</li>
                  <li>• Community engagement metrics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Version 0.1.0 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <h3 className="text-lg font-mono font-bold text-cyan-400">v0.1.0 - Initial Release</h3>
            </div>
            
            <div className="ml-5 space-y-3">
              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">🎵 Core Features</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• 4-slot YouTube mixer with real-time audio mixing</li>
                  <li>• Support for YouTube videos and playlists</li>
                  <li>• MP3 file upload and playback</li>
                  <li>• Individual volume controls per slot</li>
                  <li>• Global volume control</li>
                  <li>• Play/pause controls for each slot</li>
                  <li>• Loop functionality for individual tracks</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">🎛️ Advanced Controls</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• Playback rate adjustment (0.5x - 2x)</li>
                  <li>• Seek to specific time positions</li>
                  <li>• Auto-play functionality</li>
                  <li>• Video thumbnail visibility toggle</li>
                  <li>• Dynamic grid layouts (1, 2, 4 columns)</li>
                  <li>• Responsive design for all screen sizes</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">💾 Save & Share</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• Save mixes to personal library</li>
                  <li>• Create slot presets for quick loading</li>
                  <li>• Share mixes via public links</li>
                  <li>• Explore community-created mixes</li>
                  <li>• Like and favorite mixes</li>
                  <li>• Random mix generator</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">🎨 User Experience</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• Drag & drop presets between slots</li>
                  <li>• Recent URLs with auto-complete</li>
                  <li>• Toast notifications for user feedback</li>
                  <li>• Keyboard shortcuts and accessibility</li>
                  <li>• Modern, clean interface design</li>
                  <li>• Real-time visual feedback</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono font-semibold text-white/90 mb-2">🔧 Technical Features</h4>
                <ul className="text-sm text-white/70 space-y-1 ml-4">
                  <li>• YouTube API integration</li>
                  <li>• Supabase backend for data persistence</li>
                  <li>• Google OAuth authentication</li>
                  <li>• Real-time audio processing</li>
                  <li>• Cross-browser compatibility</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-mono font-bold text-white mb-4">🔄 Recent Updates</h3>
            
            <div className="space-y-3">
              <div className="glass-theme p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span className="text-sm font-mono text-purple-400">Latest</span>
                </div>
                <p className="text-sm text-[var(--theme-text)] opacity-90">Complete theme system overhaul with custom colors and real-time updates</p>
              </div>

              <div className="glass-theme p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-mono text-green-400">Recent</span>
                </div>
                <p className="text-sm text-[var(--theme-text)] opacity-90">Added play count tracking and analytics for public mixes</p>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span className="text-sm font-mono text-blue-400">Recent</span>
                </div>
                <p className="text-sm text-white/80">Enhanced volume slider with scroll control and editable input fields</p>
              </div>

              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span className="text-sm font-mono text-purple-400">Recent</span>
                </div>
                <p className="text-sm text-white/80">Added playlist navigation controls with hover overlays</p>
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-mono font-bold text-white mb-4">💝 Support the Project</h3>
            <p className="text-sm text-white/70 mb-4">
              This is an experimental tool created as part of Visant Labs. 
              Your support helps us continue developing creative tools and experiences.
            </p>
            
            <div className="flex gap-3">
              <Link href="/donate" target="_blank" rel="noopener noreferrer">
                <TextButton
                  onClick={() => {}}
                  icon={<Coffee size={16} />}
                  variant="primary"
                  size="medium"
                >
                  DONATE
                </TextButton>
              </Link>
              
              <Link href="/jaques-profile" target="_blank" rel="noopener noreferrer">
                <TextButton
                  onClick={() => {}}
                  icon={<ExternalLink size={16} />}
                  variant="secondary"
                  size="medium"
                >
                  CREATOR
                </TextButton>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-white/40 text-center">
              © 2025 VISANT LABS • EXPERIMENTAL TOOLS
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
