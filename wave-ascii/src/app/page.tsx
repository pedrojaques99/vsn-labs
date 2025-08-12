import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8 font-mono">
          Wave Effects
        </h1>
        
        <div className="space-y-4">
          <Link 
            href="/ascii-wave"
            className="block w-64 px-6 py-3 bg-white text-black font-mono font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            ASCII Wave
          </Link>
          
          <Link 
            href="/elliptical-lines"
            className="block w-64 px-6 py-3 bg-white text-black font-mono font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Elliptical Lines
          </Link>
        </div>
        
        <p className="text-white/60 mt-8 font-mono text-sm">
          Escolha um efeito para começar
        </p>
      </div>
    </div>
  )
}
