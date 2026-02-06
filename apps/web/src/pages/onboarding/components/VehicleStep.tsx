interface VehicleStepProps {
  selectedVehicle: string;
  onChange: (vehicle: string) => void;
}

export default function VehicleStep({ selectedVehicle, onChange }: VehicleStepProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <button
        onClick={() => onChange('corvette')}
        className={`p-6 border-2 border-black text-center transition-all ${
          selectedVehicle === 'corvette' ? 'bg-retro-red text-white' : 'hover:bg-gray-50'
        }`}
      >
        <div className="text-6xl mb-4">{'\uD83C\uDFCE\uFE0F'}</div>
        <p className="font-heading text-xl uppercase">Corvette Mode</p>
        <p className="text-sm mt-2 opacity-80">Sports car & performance focus</p>
      </button>
      <button
        onClick={() => onChange('jeep')}
        className={`p-6 border-2 border-black text-center transition-all ${
          selectedVehicle === 'jeep' ? 'bg-retro-teal text-white' : 'hover:bg-gray-50'
        }`}
      >
        <div className="text-6xl mb-4">{'\uD83D\uDE99'}</div>
        <p className="font-heading text-xl uppercase">Jeep Mode</p>
        <p className="text-sm mt-2 opacity-80">Family & adventure focus</p>
      </button>
    </div>
  );
}
