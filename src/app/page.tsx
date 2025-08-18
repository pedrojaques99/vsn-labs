import Link from 'next/link'
import { ParticleGlitch } from '@/components/2d'

const effects = [
  { path: '/ascii-wave', label: 'ASCII' },
  { path: '/ascii-vortex', label: 'IMAGE ASCII' },
  { path: '/ascii-3d', label: '3D' },
  { path: '/elliptical-lines', label: 'ELIPSE' },
  { path: '/bitmap-radio-wave', label: 'HALFTONE' },
  { path: '/particle-glitch', label: 'GLITCH' },
  { path: '/particle-3d-globe', label: 'GLOBE' },
  { path: '/frequency-wave', label: 'FREQ' },
  { path: '/audio-frequency-wave', label: 'AUDIO FREQ' },
  { path: '/elipse-audio-freq', label: 'ELIPSE AUDIO' },
  { path: '/wave-polar-grid-alpha', label: 'POLAR GRID ALPHA' },
  { path: '/wave-polar-grid', label: 'POLAR GRID' }
]

export default function Home() {
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
              [VSN®] LABS
            </h1>
            <div className="w-100 h-px bg-white mx-auto opacity-60" />
          </div>
          
          <menu className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {effects.map((effect, i) => (
              <Link 
                key={effect.path}
                href={effect.path}
                className="text-center text-white/60 hover:text-white transition-colors duration-200"
              >
                <div className="text-xs text-white/30 mb-1">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-sm font-light">
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