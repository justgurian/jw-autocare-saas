interface HiringInputsProps {
  position: string;
  onPositionChange: (v: string) => void;
  jobType: 'full-time' | 'part-time' | 'seasonal';
  onJobTypeChange: (v: 'full-time' | 'part-time' | 'seasonal') => void;
  payRange: string;
  onPayRangeChange: (v: string) => void;
  howToApply: 'call' | 'email' | 'visit' | 'online';
  onHowToApplyChange: (v: 'call' | 'email' | 'visit' | 'online') => void;
}

const COMMON_POSITIONS = [
  'Automotive Technician',
  'Oil Change Technician',
  'Service Advisor',
  'Shop Manager',
  'Tire Technician',
  'Brake Specialist',
  'Detailer',
  'Parts Counter',
];

export default function HiringInputs({
  position, onPositionChange,
  jobType, onJobTypeChange,
  payRange, onPayRangeChange,
  howToApply, onHowToApplyChange,
}: HiringInputsProps) {
  return (
    <div className="space-y-4">
      {/* Position */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">Position *</label>
        <select
          value={COMMON_POSITIONS.includes(position) ? position : '__custom'}
          onChange={e => {
            if (e.target.value === '__custom') {
              onPositionChange('');
            } else {
              onPositionChange(e.target.value);
            }
          }}
          className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
        >
          <option value="">Select a position...</option>
          {COMMON_POSITIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="__custom">Other (type your own)</option>
        </select>
        {!COMMON_POSITIONS.includes(position) && position !== '' && (
          <input
            type="text"
            placeholder="Enter position title..."
            value={position}
            onChange={e => onPositionChange(e.target.value)}
            className="mt-2 w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
          />
        )}
      </div>

      {/* Job Type */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">Job Type</label>
        <div className="flex gap-2">
          {(['full-time', 'part-time', 'seasonal'] as const).map(jt => (
            <button
              key={jt}
              type="button"
              onClick={() => onJobTypeChange(jt)}
              className={`flex-1 py-2 px-3 border-2 text-sm font-heading uppercase transition-all ${
                jobType === jt
                  ? 'border-retro-red bg-red-50 text-retro-red'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              {jt.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Pay Range */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">
          Pay Range <span className="text-gray-400 font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., $18-25/hr or $45k-55k"
          value={payRange}
          onChange={e => onPayRangeChange(e.target.value)}
          className="w-full border-2 border-gray-300 bg-white px-3 py-2 text-sm focus:border-retro-red focus:outline-none"
        />
      </div>

      {/* How to Apply */}
      <div>
        <label className="block font-heading uppercase text-sm mb-2">How to Apply</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'call' as const, label: 'Call Us' },
            { id: 'email' as const, label: 'Email' },
            { id: 'visit' as const, label: 'Visit Shop' },
            { id: 'online' as const, label: 'Apply Online' },
          ]).map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onHowToApplyChange(opt.id)}
              className={`py-2 px-3 border-2 text-sm font-heading uppercase transition-all ${
                howToApply === opt.id
                  ? 'border-retro-red bg-red-50 text-retro-red'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-gray-500'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
