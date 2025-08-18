"use client";

import { useState } from "react";
import { Particle3DGlobe } from "@/components/2d";
import { Settings } from "lucide-react";

export default function Particle3DGlobePage() {
  const [showControls, setShowControls] = useState(false);
  const [interactionType, setInteractionType] = useState<'repel' | 'attract'>('repel');
  const [numParticles, setNumParticles] = useState(300);
  const [rotationSpeed, setRotationSpeed] = useState(0.5);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Canvas principal - removed fixed positioning */}
      <div className="w-full h-screen">
        <Particle3DGlobe
          className="w-full h-full"
          interactionType={interactionType}
          numParticles={numParticles}
          rotationSpeed={rotationSpeed}
        />
      </div>

      {/* Botão para mostrar/ocultar controles */}
      <div className="absolute top-20 left-4 z-20">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-md transition-all duration-200 hover:scale-105"
          title={showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Console de Controle */}
      {showControls && (
        <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-80">
          <h3 className="text-white font-bold mb-4 text-lg">🎛️ Console do Globo 3D</h3>
          
          <div className="space-y-4">
            {/* Tipo de Interação */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={interactionType === 'attract'}
                  onChange={(e) => setInteractionType(e.target.checked ? 'attract' : 'repel')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-white/80 text-sm">
                  {interactionType === 'attract' ? 'Atrair Partículas' : 'Repelir Partículas'}
                </span>
              </label>
              <div className="text-xs text-white/60 mt-1">
                {interactionType === 'attract' 
                  ? 'As partículas são atraídas pelo cursor' 
                  : 'As partículas são repelidas pelo cursor'
                }
              </div>
            </div>

            {/* Número de Partículas */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Número de Partículas: {numParticles}
              </label>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={numParticles}
                onChange={(e) => setNumParticles(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Menor = mais rápido, Maior = mais denso
              </div>
            </div>

            {/* Velocidade de Rotação */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Velocidade de Rotação: {rotationSpeed.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={rotationSpeed}
                onChange={(e) => setRotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla a velocidade do movimento das partículas
              </div>
            </div>

            {/* Botões de preset */}
            <div className="pt-2 border-t border-white/20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setInteractionType('repel');
                    setNumParticles(200);
                    setRotationSpeed(0.3);
                  }}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-xs transition-all duration-200"
                >
                  Preset Suave
                </button>
                <button
                  onClick={() => {
                    setInteractionType('attract');
                    setNumParticles(500);
                    setRotationSpeed(1.2);
                  }}
                  className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded text-xs transition-all duration-200"
                >
                  Preset Intenso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="absolute bottom-4 left-4 z-20 text-white/60 text-sm max-w-xs">
        <p>Mova o mouse sobre o canvas para interagir com as partículas</p>
        <p className="mt-2">Use o checkbox para alternar entre atrair e repelir</p>
      </div>
    </div>
  );
}
