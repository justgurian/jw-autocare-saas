import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Fake progress psychology hook.
 *
 * Moves a progress value on a timer independent of real API progress.
 * The curve is tuned so real results typically arrive while the bar
 * shows 60-75%, creating a "faster than expected" perception.
 *
 * Timeline (with default 12s estimate):
 *   0-2s:  → 30%  (fast, creates momentum)
 *   2-7s:  → 55%  (steady cruise)
 *   7-15s: → 75%  (crawling, building tension)
 *   15-30s:→ 85%  (nearly stalled)
 *   30s+:  → 88%  (hard ceiling — never hits 90 without real data)
 *
 * When complete() is called, snaps to 100% with smooth animation.
 */

export interface UseFakeProgressOptions {
  /** Expected duration in ms. Adjusts curve speed. Default: 12000 */
  estimatedDuration?: number;
  /** Called when fake progress crosses a phase boundary (0→1→2→3) */
  onPhaseChange?: (phase: number) => void;
}

export interface UseFakeProgressReturn {
  /** Current progress 0-100 */
  progress: number;
  /** Current phase 0-3 */
  phase: number;
  /** Start the fake progress timer */
  start: () => void;
  /** Signal real completion — animates smoothly to 100% */
  complete: () => void;
  /** Reset to 0 */
  reset: () => void;
  /** Whether complete() has been called */
  isComplete: boolean;
  /** Whether currently running */
  isRunning: boolean;
}

function computeProgress(elapsed: number, estimated: number): number {
  const t = elapsed / estimated;
  if (t < 0.15) return (t / 0.15) * 30;                       // 0→30% in first 15% of time
  if (t < 0.5)  return 30 + ((t - 0.15) / 0.35) * 25;        // 30→55%
  if (t < 1.0)  return 55 + ((t - 0.5) / 0.5) * 20;          // 55→75%
  if (t < 2.0)  return 75 + ((t - 1.0) / 1.0) * 13;          // 75→88% (overtime)
  return 88;                                                    // Hard ceiling
}

function getPhase(progress: number): number {
  if (progress < 30) return 0;
  if (progress < 55) return 1;
  if (progress < 75) return 2;
  return 3;
}

// Smooth ease-out for the completion snap
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function useFakeProgress(options: UseFakeProgressOptions = {}): UseFakeProgressReturn {
  const { estimatedDuration = 12000, onPhaseChange } = options;

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completingRef = useRef(false);
  const completeStartRef = useRef<number | null>(null);
  const completeFromRef = useRef(0);
  const lastPhaseRef = useRef(0);
  const onPhaseChangeRef = useRef(onPhaseChange);

  // Keep callback ref fresh
  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
  }, [onPhaseChange]);

  const tick = useCallback(() => {
    if (completingRef.current && completeStartRef.current !== null) {
      // Completing animation: ease from current to 100% over 500ms
      const elapsed = performance.now() - completeStartRef.current;
      const t = Math.min(elapsed / 500, 1);
      const eased = easeOutCubic(t);
      const from = completeFromRef.current;
      const value = from + (100 - from) * eased;

      setProgress(value);
      setPhase(3);

      if (t >= 1) {
        setProgress(100);
        setIsComplete(true);
        setIsRunning(false);
        return; // Stop the animation loop
      }
    } else if (startTimeRef.current !== null) {
      // Normal fake progress
      const elapsed = performance.now() - startTimeRef.current;
      const value = computeProgress(elapsed, estimatedDuration);
      const newPhase = getPhase(value);

      setProgress(value);
      setPhase(newPhase);

      if (newPhase !== lastPhaseRef.current) {
        lastPhaseRef.current = newPhase;
        onPhaseChangeRef.current?.(newPhase);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [estimatedDuration]);

  const start = useCallback(() => {
    // Reset everything
    completingRef.current = false;
    completeStartRef.current = null;
    startTimeRef.current = performance.now();
    lastPhaseRef.current = 0;
    setProgress(0);
    setPhase(0);
    setIsComplete(false);
    setIsRunning(true);

    // Start the rAF loop
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const complete = useCallback(() => {
    if (completingRef.current) return; // Already completing
    completingRef.current = true;
    completeFromRef.current = progress;
    completeStartRef.current = performance.now();
  }, [progress]);

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startTimeRef.current = null;
    completingRef.current = false;
    completeStartRef.current = null;
    lastPhaseRef.current = 0;
    setProgress(0);
    setPhase(0);
    setIsComplete(false);
    setIsRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { progress, phase, start, complete, reset, isComplete, isRunning };
}
