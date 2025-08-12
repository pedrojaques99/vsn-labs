import { ParticleGlitch } from '@/components/particle-glitch'

export default function ParticleGlitchPage() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <ParticleGlitch 
        numParticles={150} 
        showCursor={true} 
        interactive={true} 
      />
    </div>
  )
}
