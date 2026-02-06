import { useMemo } from 'react';

/**
 * CSS-only exhaust smoke particle effect.
 *
 * Renders translucent circles that float upward and fade out,
 * simulating exhaust smoke from an engine. Intensity increases
 * as the loading progresses through phases.
 */

interface ExhaustParticlesProps {
  isActive: boolean;
  intensity?: 'idle' | 'revving' | 'redline';
  className?: string;
}

interface Particle {
  id: number;
  size: number;        // px
  offsetX: number;     // px from center
  delay: number;       // animation-delay in seconds
  duration: number;    // animation-duration in seconds
  color: string;       // tailwind-compatible rgba color
  startY: number;      // starting Y offset
}

const INTENSITY_CONFIG = {
  idle:    { count: 6,  durationBase: 2.4, spread: 20, colors: ['rgba(160,174,192,0.25)', 'rgba(160,174,192,0.2)'] },
  revving: { count: 10, durationBase: 1.8, spread: 28, colors: ['rgba(160,174,192,0.3)', 'rgba(160,174,192,0.25)', 'rgba(214,158,46,0.2)'] },
  redline: { count: 12, durationBase: 1.3, spread: 35, colors: ['rgba(160,174,192,0.3)', 'rgba(197,48,48,0.25)', 'rgba(214,158,46,0.2)', 'rgba(197,48,48,0.15)'] },
};

// Simple seeded-ish random for stable particles
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function ExhaustParticles({
  isActive,
  intensity = 'idle',
  className = '',
}: ExhaustParticlesProps) {
  const config = INTENSITY_CONFIG[intensity];

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: config.count }, (_, i) => {
      const r = (seed: number) => seededRandom(i * 7 + seed);
      return {
        id: i,
        size: 4 + r(1) * 7,
        offsetX: (r(2) - 0.5) * config.spread * 2,
        delay: r(3) * config.durationBase,
        duration: config.durationBase + r(4) * 0.8,
        color: config.colors[Math.floor(r(5) * config.colors.length)],
        startY: r(6) * 6,
      };
    });
  }, [config.count, config.durationBase, config.spread, config.colors]);

  if (!isActive) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-exhaust-rise"
          style={{
            width: p.size,
            height: p.size,
            left: `calc(50% + ${p.offsetX}px)`,
            bottom: `${8 + p.startY}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
