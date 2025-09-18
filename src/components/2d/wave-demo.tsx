'use client'

import { WaveAscii } from './wave-ascii'

export function WaveDemo() {
  return (
    <div className="relative w-full h-screen bg-black">
      <WaveAscii />
      
      {/* Overlay com instruções */}
      <div className="controls-container">
        <div className="glass-panel p-4 max-w-xs">
          <h2 className="text-sm font-mono text-white/90 tracking-wide mb-2">WAVE ASCII</h2>
          <p className="text-xs text-white/70">Mova o mouse pela tela para ver o efeito de onda</p>
        </div>
      </div>
    </div>
  )
} 