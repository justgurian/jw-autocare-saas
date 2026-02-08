import { useMemo } from 'react';

/**
 * Premium SVG Tachometer / RPM Gauge.
 *
 * A chrome-ringed automotive tachometer with a sweeping red needle,
 * glass lens overlay, animated chrome shine, and digital readout.
 * The dial spans 270 degrees from 7 o'clock (0%) to 5 o'clock (100%).
 * The "redline zone" starts at 80% — needle glows and gauge pulses.
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
const SWEEP_START_DEG = 135;   // Start angle (7 o'clock)
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

function arcPath(startAngle: number, endAngle: number, radius: number): string {
  const start = angleToXY(startAngle, radius);
  const end = angleToXY(endAngle, radius);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const SIZE_CLASSES = {
  sm: 'w-32 h-32',
  md: 'w-44 h-44',
  lg: 'w-56 h-56',
};

export default function RetroTachometer({
  progress,
  size = 'md',
  glowOnRedline = true,
}: RetroTachometerProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const needleAngle = valueToAngle(clampedProgress);
  const inRedline = clampedProgress > 80;
  const displayRPM = Math.round(clampedProgress * 80); // 0-8000 RPM

  const { majorTicks, minorTicks, numbers, redlineArc, progressArc } = useMemo(() => {
    const major: Array<{ x1: number; y1: number; x2: number; y2: number; isRedline: boolean }> = [];
    const minor: Array<{ x1: number; y1: number; x2: number; y2: number; isRedline: boolean }> = [];
    const nums: Array<{ x: number; y: number; label: string; isRedline: boolean }> = [];

    // Major ticks at 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    for (let v = 0; v <= 100; v += 10) {
      const angle = valueToAngle(v);
      const outer = angleToXY(angle, 86);
      const inner = angleToXY(angle, 74);
      const numPos = angleToXY(angle, 63);
      major.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isRedline: v >= 80 });
      if (v % 20 === 0) {
        nums.push({ x: numPos.x, y: numPos.y, label: String(v / 10), isRedline: v >= 80 });
      }
    }

    // Minor ticks every 5 (not on major positions)
    for (let v = 5; v <= 95; v += 10) {
      const angle = valueToAngle(v);
      const outer = angleToXY(angle, 86);
      const inner = angleToXY(angle, 80);
      minor.push({ x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, isRedline: v >= 80 });
    }

    // Redline arc
    const rlStart = valueToAngle(80);
    const rlEnd = valueToAngle(100);
    const rl = arcPath(rlStart, rlEnd, 70);

    // Swept progress arc
    const pStart = valueToAngle(0);
    const pEnd = valueToAngle(Math.min(clampedProgress, 100));
    const pa = clampedProgress > 0.5 ? arcPath(pStart, pEnd, 70) : '';

    return { majorTicks: major, minorTicks: minor, numbers: nums, redlineArc: rl, progressArc: pa };
  }, [clampedProgress]);

  return (
    <div
      className={`${SIZE_CLASSES[size]} relative ${inRedline && glowOnRedline ? 'tach-redline' : ''}`}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        <defs>
          {/* Chrome ring gradient — deeper, more realistic */}
          <linearGradient id="tachChromeRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="25%" stopColor="#9ca3af" />
            <stop offset="50%" stopColor="#e5e7eb" />
            <stop offset="75%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>

          {/* Inner chrome bevel */}
          <linearGradient id="tachChromeBevel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>

          {/* Face gradient — deeper, richer blue */}
          <radialGradient id="tachFaceGrad" cx="50%" cy="42%" r="52%">
            <stop offset="0%" stopColor="#1a365d" />
            <stop offset="60%" stopColor="#0f2440" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>

          {/* Glass lens reflection */}
          <radialGradient id="tachGlassGrad" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Needle glow filter — enhanced */}
          <filter id="tachNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.9" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#ef4444" floodOpacity="0.4" />
          </filter>

          {/* Ambient glow for redline */}
          <filter id="tachAmbientGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.3" />
          </filter>

          {/* Hub gradient — polished chrome */}
          <radialGradient id="tachHubGrad" cx="38%" cy="32%" r="60%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#6b7280" />
          </radialGradient>

          {/* Needle metallic gradient */}
          <linearGradient id="tachNeedleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Progress arc glow */}
          <linearGradient id="tachProgressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="80%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Chrome shine animation path */}
          <linearGradient id="tachShineGrad" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Clip path for shine rotation */}
          <clipPath id="tachFaceClip">
            <circle cx={CX} cy={CY} r={90} />
          </clipPath>
        </defs>

        {/* Outer chrome ring — thicker, more dimensional */}
        <circle cx={CX} cy={CY} r={97} fill="url(#tachChromeRing)" />
        <circle cx={CX} cy={CY} r={97} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={0.5} />

        {/* Chrome inner bevel */}
        <circle cx={CX} cy={CY} r={92} fill="none" stroke="url(#tachChromeBevel)" strokeWidth={1.5} />

        {/* Black rim inset */}
        <circle cx={CX} cy={CY} r={91} fill="none" stroke="#111827" strokeWidth={1} />

        {/* Gauge face */}
        <circle cx={CX} cy={CY} r={90} fill="url(#tachFaceGrad)" />

        {/* Subtle inner ring groove */}
        <circle cx={CX} cy={CY} r={88} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />

        {/* Progress arc (teal sweep showing how far along) */}
        {progressArc && (
          <path
            d={progressArc}
            fill="none"
            stroke={inRedline ? '#ef4444' : '#2dd4bf'}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.5}
          />
        )}

        {/* Redline arc band */}
        <path
          d={redlineArc}
          fill="none"
          stroke="#dc2626"
          strokeWidth={5}
          strokeLinecap="round"
          opacity={inRedline ? 0.9 : 0.5}
          filter={inRedline ? 'url(#tachAmbientGlow)' : undefined}
        />

        {/* Major tick marks */}
        {majorTicks.map((t, i) => (
          <line
            key={`maj-${i}`}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isRedline ? '#dc2626' : '#d1d5db'}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}

        {/* Minor tick marks */}
        {minorTicks.map((t, i) => (
          <line
            key={`min-${i}`}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.isRedline ? '#dc2626' : '#6b7280'}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}

        {/* Numbers */}
        {numbers.map((n, i) => (
          <text
            key={`num-${i}`}
            x={n.x} y={n.y}
            fill={n.isRedline ? '#ef4444' : '#e5e7eb'}
            fontSize="12"
            fontFamily="'Oswald', 'Franklin Gothic Medium', Impact, sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="600"
            letterSpacing="0.5"
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
          {/* Needle shadow */}
          <polygon
            points={`${CX + 1},32 ${CX - 2},${CY + 1} ${CX + 4},${CY + 1}`}
            fill="rgba(0,0,0,0.3)"
          />
          {/* Needle body — tapered with gradient */}
          <polygon
            points={`${CX},28 ${CX - 2.5},${CY - 5} ${CX + 2.5},${CY - 5}`}
            fill="url(#tachNeedleGrad)"
          />
          <polygon
            points={`${CX - 2.5},${CY - 5} ${CX + 2.5},${CY - 5} ${CX + 3},${CY} ${CX - 3},${CY}`}
            fill="url(#tachNeedleGrad)"
          />
          {/* Counterweight */}
          <polygon
            points={`${CX - 2},${CY} ${CX + 2},${CY} ${CX + 1.5},${CY + 10} ${CX - 1.5},${CY + 10}`}
            fill="#991b1b"
            opacity={0.8}
          />
          {/* Needle highlight edge */}
          <line
            x1={CX} y1={28} x2={CX + 0.5} y2={CY - 5}
            stroke="rgba(255,255,255,0.3)" strokeWidth={0.5}
          />
        </g>

        {/* Center hub — layered for depth */}
        <circle cx={CX} cy={CY} r={10} fill="#1f2937" />
        <circle cx={CX} cy={CY} r={8} fill="#dc2626" />
        <circle cx={CX} cy={CY} r={5.5} fill="url(#tachHubGrad)" />
        <circle cx={CX} cy={CY} r={2} fill="rgba(255,255,255,0.4)" />

        {/* Digital RPM readout */}
        <rect
          x={CX - 22} y={CY + 22}
          width={44} height={16}
          rx={3} ry={3}
          fill="#0a1628"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={0.5}
        />
        <text
          x={CX} y={CY + 32}
          fill={inRedline ? '#ef4444' : '#2dd4bf'}
          fontSize="10"
          fontFamily="'Courier New', 'SF Mono', monospace"
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
          letterSpacing="1"
        >
          {displayRPM}
        </text>

        {/* Label */}
        <text
          x={CX} y={CY + 46}
          fill="#6b7280"
          fontSize="7"
          fontFamily="'Oswald', 'Franklin Gothic Medium', sans-serif"
          textAnchor="middle"
          letterSpacing="3"
          fontWeight="300"
        >
          RPM
        </text>

        {/* Glass lens overlay — subtle reflection */}
        <circle
          cx={CX} cy={CY} r={90}
          fill="url(#tachGlassGrad)"
          clipPath="url(#tachFaceClip)"
        />

        {/* Animated shine sweep (CSS-driven) */}
        <g className="tach-shine" clipPath="url(#tachFaceClip)">
          <rect
            x={-40} y={-20}
            width={80} height={240}
            fill="url(#tachShineGrad)"
            transform={`rotate(-30 ${CX} ${CY})`}
            opacity={0.15}
          />
        </g>
      </svg>
    </div>
  );
}
