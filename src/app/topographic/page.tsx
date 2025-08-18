import { Topographic } from "@/components/2d";

export default function TopographicPage() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Topographic Effect</h1>
          <p className="text-gray-400 text-lg">
            Contour lines visualization with fractal noise terrain
          </p>
        </div>

        <Topographic className="w-full h-[70vh] rounded-2xl overflow-hidden" />
      </div>
    </div>
  );
}
