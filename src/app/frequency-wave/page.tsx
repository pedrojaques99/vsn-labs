import FrequencyWave from "@/components/frequency-wave";

export default function FrequencyWavePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="w-full h-full">
            <div className="h-full w-full rounded-2xl overflow-hidden">
              <FrequencyWave/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
