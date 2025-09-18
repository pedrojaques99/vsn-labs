'use client'

interface PixelModeToggleProps {
  isDarkMode: boolean
  onClick: () => void
  className?: string
}

export default function PixelModeToggle({ isDarkMode, onClick, className = '' }: PixelModeToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 border border-white/20 rounded hover:bg-white/10 transition-colors ${className}`}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="w-4 h-4 relative">
        {isDarkMode ? (
          // Light Mode Icon (Sun) - Simple Black & White
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
            className="text-current"
          >
            {/* Sun rays - simple pixelated */}
            <rect x="7" y="1" width="2" height="1" />
            <rect x="7" y="14" width="2" height="1" />
            <rect x="1" y="7" width="1" height="2" />
            <rect x="14" y="7" width="1" height="2" />
            <rect x="3" y="3" width="1" height="1" />
            <rect x="12" y="3" width="1" height="1" />
            <rect x="3" y="12" width="1" height="1" />
            <rect x="12" y="12" width="1" height="1" />
            
            {/* Center circle - simple */}
            <rect x="6" y="6" width="4" height="4" />
          </svg>
        ) : (
          // Dark Mode Icon (Moon) - Simple Black & White
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
            className="text-current"
          >
            {/* Moon shape - simple crescent */}
            <rect x="4" y="2" width="6" height="1" />
            <rect x="3" y="3" width="7" height="1" />
            <rect x="2" y="4" width="8" height="1" />
            <rect x="2" y="5" width="8" height="1" />
            <rect x="3" y="6" width="7" height="1" />
            <rect x="4" y="7" width="6" height="1" />
            <rect x="5" y="8" width="5" height="1" />
            <rect x="6" y="9" width="4" height="1" />
            <rect x="7" y="10" width="3" height="1" />
            <rect x="8" y="11" width="2" height="1" />
            <rect x="9" y="12" width="1" height="1" />
            
            {/* Crescent cutout - simple */}
            <rect x="6" y="3" width="1" height="1" fill="none" />
            <rect x="7" y="4" width="1" height="1" fill="none" />
            <rect x="8" y="5" width="1" height="1" fill="none" />
            <rect x="8" y="6" width="1" height="1" fill="none" />
            <rect x="7" y="7" width="1" height="1" fill="none" />
            <rect x="6" y="8" width="1" height="1" fill="none" />
          </svg>
        )}
      </div>
    </button>
  )
}
