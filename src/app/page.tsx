import Link from 'next/link'
import { ParticleGlitch } from '@/components/particle-glitch'

const effects = [
  { path: '/ascii-wave', label: 'ASCII' },
  { path: '/elliptical-lines', label: 'ELIPSE' },
  { path: '/bitmap-radio-wave', label: 'HALFTONE' },
  { path: '/particle-glitch', label: 'GLITCH' },
  { path: '/topographic', label: 'TOPO' },
  { path: '/particle-3d-globe', label: 'GLOBE' },
  { path: '/frequency-wave', label: 'FREQ' }
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
          
          <menu className="space-y-1 flex flex-col items-center justify-center w-full">
            {effects.map((effect, i) => (
              <Link 
                key={effect.path}
                href={effect.path}
                className="block text-white/70 hover:text-white hover:border-white border-b-2 border-transparent transition-all duration-300 hover:scale-105 mb-5 flex items-center justify-between w-full max-w-md"
              >
                <span>{String(i + 1).padStart(2, '0')} {effect.label}</span>
                <span className="text-white/50">→</span>
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