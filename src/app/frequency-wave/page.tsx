"use client";

import { useState } from "react";
import { FrequencyWave } from "@/components/2d";
import { Settings } from "lucide-react";

export default function FrequencyWavePage() {
  const [showControls, setShowControls] = useState(false);
  const [frequency, setFrequency] = useState(0.5);
  const [amplitude, setAmplitude] = useState(100);
  const [distortion, setDistortion] = useState(0.1);
  const [lineCount, setLineCount] = useState(35);
  const [cursorRadius, setCursorRadius] = useState(100);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Canvas principal */}
      <div className="w-full h-screen">
        <FrequencyWave
          frequency={frequency}
          amplitude={amplitude}
          distortion={distortion}
          lineCount={lineCount}
          cursorRadius={cursorRadius}
          className="w-full h-full"
        />
      </div>

      {/* Botão para mostrar/ocultar controles - respeitando margem do navbar */}
      <div className="absolute top-20 left-4 z-20">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 rounded-md transition-all duration-200 hover:scale-105"
          title={showControls ? 'Ocultar Controles' : 'Mostrar Controles'}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Console de Controle - respeitando margem do navbar */}
      {showControls && (
        <div className="absolute top-20 right-4 z-20 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-80">
          <h3 className="text-white font-bold mb-4 text-lg">🎛️ Console de Frequência</h3>
          
          <div className="space-y-4">
            {/* Frequência */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Frequência: {frequency.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla a velocidade das ondas
              </div>
            </div>

            {/* Amplitude */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Amplitude: {amplitude}px
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={amplitude}
                onChange={(e) => setAmplitude(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla a intensidade da distorção
              </div>
            </div>

            {/* Distorção */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Distorção: {distortion.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={distortion}
                onChange={(e) => setDistortion(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla o quanto as linhas se deformam
              </div>
            </div>

            {/* Número de Linhas */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Número de Linhas: {lineCount}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={lineCount}
                onChange={(e) => setLineCount(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Menor = mais espaçado, Maior = mais denso
              </div>
            </div>

            {/* Raio do Cursor */}
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Raio do Cursor: {cursorRadius}px
              </label>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={cursorRadius}
                onChange={(e) => setCursorRadius(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="text-xs text-white/60 mt-1">
                Controla a área de influência do mouse
              </div>
            </div>

            {/* Botões de preset */}
            <div className="pt-2 border-t border-white/20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setFrequency(0.3);
                    setAmplitude(50);
                    setDistortion(0.05);
                    setLineCount(25);
                    setCursorRadius(80);
                  }}
                  className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 rounded text-xs transition-all duration-200"
                >
                  Preset Suave
                </button>
                <button
                  onClick={() => {
                    setFrequency(1.2);
                    setAmplitude(150);
                    setDistortion(0.3);
                    setLineCount(50);
                    setCursorRadius(200);
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
        <p>Mova o mouse sobre o canvas para interagir com as ondas de frequência</p>
        <p className="mt-2">Use os controles para ajustar os parâmetros em tempo real</p>
      </div>
    </div>
  );
}
