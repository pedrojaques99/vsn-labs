import Particle3DGlobe from "@/components/particle-3d-globe";

export default function Particle3DGlobePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">        
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 text-center">Repel Mode</h3>
            <div className="h-80 rounded-2xl overflow-hidden">
              <Particle3DGlobe className="h-full w-80%" interactionType="repel" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 text-center">Attract Mode</h3>
            <div className="h-80 rounded-2xl overflow-hidden">
              <Particle3DGlobe className="h-full" interactionType="attract" />
            </div>
          </div>
          </div>
      </div>
    </div>
  );
}
