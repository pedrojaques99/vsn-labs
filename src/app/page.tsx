import Link from 'next/link'

const effects = [
  { path: '/ascii-wave', label: 'ASCII' },
  { path: '/elliptical-lines', label: 'ELLIPSE' },
  { path: '/bitmap-radio-wave', label: 'RADIO' }
]

export default function Home() {
  return (
    <div className="h-screen bg-black flex items-center justify-center font-mono">
      <div className="text-center">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-white tracking-widest mb-2">
            [VSN®] LABS
          </h1>
          <div className="w-100 h-px bg-white mx-auto opacity-60" />
        </div>
        
        <nav className="space-y-1">
          {effects.map((effect, i) => (
            <Link 
              key={effect.path}
              href={effect.path}
              className="block text-white/70 hover:text-white hover:border-white border-b-2 border-transparent transition-all duration-300 hover:scale-105 mb-5"
            >
              {String(i + 1).padStart(2, '0')} {effect.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-12 text-white/40 text-xs tracking-[0.2em]">
          EXPERIMENTAL
        </div>
      </div>
    </div>
  )
}
