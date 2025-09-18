import Link from 'next/link'
import { ParticleGlitch } from '@/components/2d'

const effects = [
  { path: '/ascii-wave', label: 'ASCII', icon: 'ascii' },
  { path: '/ascii-vortex', label: 'IMAGE ASCII', icon: 'vortex' },
  { path: '/elliptical-lines', label: 'ELIPSE', icon: 'ellipse' },
  { path: '/bitmap-radio-wave', label: 'HALFTONE', icon: 'halftone' },
  { path: '/particle-glitch', label: 'GLITCH', icon: 'glitch' },
  { path: '/particle-3d-globe', label: 'GLOBE', icon: 'globe' },
  { path: '/frequency-wave', label: 'FREQ', icon: 'frequency' },
  { path: '/audio-frequency-wave', label: 'AUDIO FREQ', icon: 'audio' },
  { path: '/elipse-audio-freq', label: 'ELIPSE AUDIO', icon: 'ellipse-audio' },
  { path: '/wave-polar-grid-alpha', label: 'POLAR GRID', icon: 'polar' },
  { path: '/grid-paint', label: 'GRID PAINT', icon: 'grid-paint' },
  { path: '/youtube-mixer', label: 'YOUTUBE MIXER', icon: 'youtube' },
  { path: '/retro-visualizers', label: 'RETRO VISUAL', icon: 'retro' }
]

// Icon component for effects
const EffectIcon = ({ type, size = 32 }: { type: string, size?: number }) => {
  const commonProps = { width: size, height: size, viewBox: '0 0 32 32', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 1 }
  
  switch (type) {
    case 'ascii':
      return (
        <svg {...commonProps}>
          <rect x="4" y="8" width="2" height="2" />
          <rect x="8" y="8" width="2" height="2" />
          <rect x="12" y="8" width="2" height="2" />
          <rect x="16" y="8" width="2" height="2" />
          <rect x="20" y="8" width="2" height="2" />
          <rect x="24" y="8" width="2" height="2" />
          <rect x="6" y="12" width="2" height="2" />
          <rect x="10" y="12" width="2" height="2" />
          <rect x="14" y="12" width="2" height="2" />
          <rect x="18" y="12" width="2" height="2" />
          <rect x="22" y="12" width="2" height="2" />
          <rect x="8" y="16" width="2" height="2" />
          <rect x="12" y="16" width="2" height="2" />
          <rect x="16" y="16" width="2" height="2" />
          <rect x="20" y="16" width="2" height="2" />
          <rect x="10" y="20" width="2" height="2" />
          <rect x="14" y="20" width="2" height="2" />
          <rect x="18" y="20" width="2" height="2" />
        </svg>
      )
    case 'vortex':
      return (
        <svg {...commonProps}>
          <path d="M16 4 C8 4, 4 8, 4 16 C4 24, 8 28, 16 28 C24 28, 28 24, 28 16 C28 8, 24 4, 16 4 Z" fill="none" />
          <path d="M16 8 C12 8, 8 12, 8 16 C8 20, 12 24, 16 24 C20 24, 24 20, 24 16 C24 12, 20 8, 16 8 Z" fill="none" />
          <circle cx="16" cy="16" r="4" fill="none" />
          <circle cx="16" cy="16" r="1" />
        </svg>
      )
    case 'ellipse':
      return (
        <svg {...commonProps}>
          <ellipse cx="16" cy="16" rx="12" ry="8" fill="none" />
          <ellipse cx="16" cy="16" rx="8" ry="12" fill="none" />
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" />
        </svg>
      )
    case 'halftone':
      return (
        <svg {...commonProps}>
          <circle cx="6" cy="6" r="2" />
          <circle cx="14" cy="6" r="1.5" />
          <circle cx="22" cy="6" r="1" />
          <circle cx="26" cy="6" r="0.5" />
          <circle cx="6" cy="14" r="1.5" />
          <circle cx="14" cy="14" r="2.5" />
          <circle cx="22" cy="14" r="2" />
          <circle cx="26" cy="14" r="1" />
          <circle cx="6" cy="22" r="1" />
          <circle cx="14" cy="22" r="2" />
          <circle cx="22" cy="22" r="3" />
          <circle cx="26" cy="22" r="1.5" />
          <circle cx="6" cy="26" r="0.5" />
          <circle cx="14" cy="26" r="1" />
          <circle cx="22" cy="26" r="1.5" />
          <circle cx="26" cy="26" r="2" />
        </svg>
      )
    case 'glitch':
      return (
        <svg {...commonProps}>
          <rect x="4" y="8" width="24" height="2" />
          <rect x="6" y="12" width="20" height="2" />
          <rect x="2" y="16" width="18" height="2" />
          <rect x="8" y="20" width="22" height="2" />
          <rect x="4" y="24" width="16" height="2" />
          <rect x="22" y="10" width="2" height="4" fill="red" />
          <rect x="2" y="18" width="2" height="4" fill="cyan" />
          <rect x="26" y="14" width="2" height="6" fill="green" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...commonProps}>
          <circle cx="16" cy="16" r="12" fill="none" />
          <path d="M4 16 C4 16, 8 8, 16 8 C24 8, 28 16, 28 16" fill="none" />
          <path d="M4 16 C4 16, 8 24, 16 24 C24 24, 28 16, 28 16" fill="none" />
          <line x1="16" y1="4" x2="16" y2="28" />
          <line x1="4" y1="16" x2="28" y2="16" />
        </svg>
      )
    case 'frequency':
      return (
        <svg {...commonProps}>
          <rect x="4" y="12" width="2" height="8" />
          <rect x="8" y="8" width="2" height="16" />
          <rect x="12" y="6" width="2" height="20" />
          <rect x="16" y="4" width="2" height="24" />
          <rect x="20" y="6" width="2" height="20" />
          <rect x="24" y="10" width="2" height="12" />
          <rect x="28" y="14" width="2" height="4" />
        </svg>
      )
    case 'audio':
      return (
        <svg {...commonProps}>
          <path d="M8 12 L8 20 L12 20 L16 24 L16 8 L12 12 Z" />
          <path d="M20 12 C22 14, 22 18, 20 20" fill="none" />
          <path d="M22 10 C25 13, 25 19, 22 22" fill="none" />
          <path d="M24 8 C28 12, 28 20, 24 24" fill="none" />
        </svg>
      )
    case 'ellipse-audio':
      return (
        <svg {...commonProps}>
          <ellipse cx="16" cy="16" rx="10" ry="6" fill="none" />
          <ellipse cx="16" cy="16" rx="6" ry="10" fill="none" />
          <circle cx="16" cy="16" r="2" />
          <rect x="22" y="14" width="1" height="4" />
          <rect x="24" y="12" width="1" height="8" />
          <rect x="26" y="10" width="1" height="12" />
        </svg>
      )
    case 'polar':
      return (
        <svg {...commonProps}>
          <circle cx="16" cy="16" r="4" fill="none" />
          <circle cx="16" cy="16" r="8" fill="none" />
          <circle cx="16" cy="16" r="12" fill="none" />
          <line x1="16" y1="4" x2="16" y2="28" />
          <line x1="4" y1="16" x2="28" y2="16" />
          <line x1="7.5" y1="7.5" x2="24.5" y2="24.5" />
          <line x1="24.5" y1="7.5" x2="7.5" y2="24.5" />
        </svg>
      )
    case 'grid-paint':
      return (
        <svg {...commonProps}>
          <rect x="6" y="6" width="6" height="6" rx="2" />
          <rect x="14" y="6" width="6" height="6" rx="2" />
          <rect x="22" y="6" width="6" height="6" rx="2" />
          <rect x="6" y="14" width="6" height="6" rx="2" />
          <rect x="22" y="14" width="6" height="6" rx="2" />
          <rect x="6" y="22" width="6" height="6" rx="2" />
          <rect x="14" y="22" width="6" height="6" rx="2" />
          <rect x="22" y="22" width="6" height="6" rx="2" />
          <line x1="12" y1="9" x2="14" y2="9" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="9" x2="22" y2="9" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="12" x2="9" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="25" y1="12" x2="25" y2="14" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="20" x2="9" y2="22" strokeWidth="2" strokeLinecap="round" />
          <line x1="17" y1="20" x2="17" y2="22" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="25" x2="14" y2="25" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="25" x2="22" y2="25" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'youtube':
      return (
        <svg {...commonProps}>
          <rect x="4" y="8" width="24" height="16" rx="2" fill="none" />
          <polygon points="12,12 12,20 18,16" />
          <rect x="20" y="10" width="2" height="4" />
          <rect x="23" y="12" width="2" height="2" />
          <rect x="20" y="18" width="2" height="4" />
          <rect x="23" y="18" width="2" height="2" />
        </svg>
      )
    case 'retro':
      return (
        <svg {...commonProps}>
          <rect x="6" y="8" width="20" height="16" rx="1" fill="none" />
          <rect x="8" y="10" width="16" height="12" fill="none" />
          <rect x="10" y="12" width="2" height="2" />
          <rect x="14" y="12" width="2" height="2" />
          <rect x="18" y="12" width="2" height="2" />
          <rect x="22" y="12" width="2" height="2" />
          <rect x="10" y="16" width="2" height="4" />
          <rect x="14" y="14" width="2" height="6" />
          <rect x="18" y="16" width="2" height="4" />
          <rect x="22" y="18" width="2" height="2" />
          <line x1="12" y1="26" x2="20" y2="26" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg {...commonProps}>
          <rect x="8" y="8" width="16" height="16" rx="2" fill="none" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      )
  }
}

export default function VisantLabs() {
  return (
    <div className="relative h-screen bg-black overflow-hidden font-mono">
      <ParticleGlitch 
        numParticles={20} 
        showCursor={true} 
        interactive={true} 
      />
      
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="mb-12">
            <h1 className="text-2xl font-bold text-white tracking-widest mb-2">
              [VISANT®] LABS
            </h1>
            <div className="w-100 h-px bg-white mx-auto opacity-60" />
          </div>
          
          <menu className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto px-4">
            {effects.map((effect, i) => (
              <Link 
                key={effect.path}
                href={effect.path}
                className="group text-center transition-all duration-300 hover:scale-105"
              >
                <div className="mb-2 mx-auto w-16 h-16 border border-white/20 rounded-lg flex items-center justify-center bg-black/20 backdrop-blur-sm group-hover:border-white/60 group-hover:bg-black/40 transition-all duration-300">
                  <div className="text-white/60 group-hover:text-white transition-colors duration-300">
                    <EffectIcon type={effect.icon} size={24} />
                  </div>
                </div>
                
                <div className="text-xs text-white/30 mb-1">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-xs font-light text-white/60 group-hover:text-white transition-colors duration-300">
                  {effect.label}
                </div>
              </Link>
            ))}
          </menu>  
          
          <div className="mt-12 text-white/40 text-xs tracking-[0.2em]">
            EXPERIMENTAL INTERACTIVE EFFECTS
          </div>
        </div>
      </div>
    </div>
  )
}
