import { useMemo } from 'react';

/**
 * Retro SVG Tachometer / RPM Gauge.
 *
 * A chrome-ringed automotive tachometer with a sweeping red needle.
 * The dial spans 270 degrees from 7 o'clock (0%) to 5 o'clock (100%).
 * The "redline zone" starts at 80% — needle glows and gauge vibrates.
 */

interface RetroTachometerProps {
  /** 0-100 progress value */
  progress: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the redline glow effect when > 80% */
  glowOnRedline?: boolean;
}

// Geometry constants
const CX = 100;
const CY = 100;
const SWEEP_START_DEG = 135;   // Start angle in standard rotation (7 o'clock)
const SWEEP_RANGE_DEG = 270;   // Total sweep in degrees

function valueToAngle(value: number): number {
  return SWEEP_START_DEG + (value / 100) * SWEEP_RANGE_DEG;
}

function angleToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

// Generate an arc path from angle1 to angle2 at a given radius
function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const start = angleToXY(startAngle, radius);
  const end = angleToXY(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const SIZE_CLASSES = {
  sm: 'w-28 h-28',
  md: 'w-40 h-40',
  lg: 'w-52 h-52',
};

export default function RetroTachometer({
  progress,
  size = 'md',
  glowOnRedline = true,
}: RetroTachometerProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const needleAngle = valueToAngle(clampedProgress);
  const inRedline = clampedProgress > 80;

  // Pre-compute tick marks and numbers
  const { majorTicks, minorTicks, numbers, redlineArc } = useMemo(() => {
    const major: Array<{ x1: number; y1: number; x2: number; y2: number; isRedline: boolean }> = [];
    const minor: Array<{ x1: number; y1: number; x2: number; y2: number; isRedline: boolean }> = [];
    const nums: Array<{ x: number; y: number; label: string; isRedline: boolean }> = [];

    // Major ticks at 0, 20, 40, 60, 80, 100
    for (let v = 0; v <= 100; v += 20) {
      const angle = valueToAngle(v);
      const outer = angleToXY(angle, 88);
      const inner = angleToXY(angle, 76);
      const numPos = angleToXY(angle, 65);
      major.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isRedline: v >= 80 });
      nums.push({ x: numPos.x, y: numPos.y, label: String(v / 10), isRedline: v >= 80 });
    }

    // Minor ticks at 10, 30, 50, 70, 90
    for (let v = 10; v <= 90; v += 20) {
      const angle = valueToAngle(v);
      const outer = angleToXY(angle, 88);
      const inner = angleToXY(angle, 81);
      minor.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isRedline: v >= 80 });
    }

    // Redline arc from 80% to 100%
    const rlStart = valueToAngle(80);
    const rlEnd = valueToAngle(100);
    const rl = arcPath(rlStart, rlEnd, 72);

    return { majorTicks: major, minorTicks: minor, numbers: nums, redlineArc: rl };
  }, []);

  return (
    <div
      className={`${SIZE_CLASSES[size]} ${inRedline && glowOnRedline ? 'tach-redline' : ''}`}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          {/* Chrome gradient for outer ring */}
          <linearGradient id="tachChromeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="40%" stopColor="#a0aec0" />
            <stop offset="60%" stopColor="#cbd5e0" />
            <stop offset="100%" stopColor="#a0aec0" />
          </linearGradient>

          {/* Face depth gradient */}
          <radialGradient id="tachFaceGrad" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f2440" />
          </radialGradient>

          {/* Needle glow filter */}
          <filter id="tachNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#C53030" floodOpacity="0.8" />
          </filter>

          {/* Hub shine gradient */}
          <radialGradient id="tachHubGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#718096" />
          </radialGradient>
        </defs>

        {/* Outer chrome ring */}
        <circle cx={CX} cy={CY} r={96} fill="none" stroke="url(#tachChromeGrad)" strokeWidth={7} />

        {/* Black border inset */}
        <circle cx={CX} cy={CY} r={92} fill="none" stroke="#000" strokeWidth={1.5} />

        {/* Face */}
        <circle cx={CX} cy={CY} r={90} fill="url(#tachFaceGrad)" />

        {/* Redline arc band */}
        <path d={redlineArc} fill="none" stroke="#C53030" strokeWidth={4} strokeLinecap="round" opacity={0.7} />

        {/* Major tick marks */}
        {majorTicks.map((t, i) => (
          <line
            key={`maj-${i}`}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isRedline ? '#C53030' : '#A0AEC0'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {/* Minor tick marks */}
        {minorTicks.map((t, i) => (
          <line
            key={`min-${i}`}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isRedline ? '#C53030' : '#718096'}
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        ))}

        {/* Numbers */}
        {numbers.map((n, i) => (
          <text
            key={`num-${i}`}
            x={n.x} y={n.y}
            fill={n.isRedline ? '#C53030' : '#e2e8f0'}
            fontSize="13"
            fontFamily="'Bebas Neue', Impact, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            {n.label}
          </text>
        ))}

        {/* Needle assembly */}
        <g
          className="tach-needle"
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${CX}px ${CY}px`,
          }}
          filter={inRedline && glowOnRedline ? 'url(#tachNeedleGlow)' : undefined}
        >
          {/* Needle body — elongated triangle */}
          <polygon
            points={`${CX},30 ${CX - 3},${CY} ${CX + 3},${CY}`}
            fill="#C53030"
          />
          {/* Counterweight */}
          <polygon
            points={`${CX - 2},${CY} ${CX + 2},${CY} ${CX + 1.5},${CY + 12} ${CX - 1.5},${CY + 12}`}
            fill="#C53030"
            opacity={0.8}
          />
        </g>

        {/* Center hub */}
        <circle cx={CX} cy={CY} r={8} fill="#C53030" />
        <circle cx={CX} cy={CY} r={5} fill="url(#tachHubGrad)" />

        {/* Labels */}
        <text
          x={CX} y={CY + 30}
          fill="#A0AEC0"
          fontSize="10"
          fontFamily="'Oswald', 'Franklin Gothic Medium', sans-serif"
          textAnchor="middle"
          letterSpacing="2"
        >
          RPM
        </text>
        <text
          x={CX} y={CY + 40}
          fill="#718096"
          fontSize="7"
          fontFamily="'Source Sans Pro', 'Helvetica Neue', sans-serif"
          textAnchor="middle"
        >
          x1000
        </text>
      </svg>
    </div>
  );
}
