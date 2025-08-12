'use client'

import { WaveAscii } from './wave-ascii'

export function WaveDemo() {
  return (
    <div className="relative w-full h-screen bg-black">
      <WaveAscii />
      
      {/* Overlay com instruções */}
      <div className="absolute top-4 left-4 z-20 text-white font-mono text-sm bg-black/50 p-4 rounded">
        <h2 className="text-lg font-bold mb-2">Wave ASCII</h2>
        <p>Mova o mouse pela tela para ver o efeito de onda</p>
      </div>
    </div>
  )
} 