import { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#C53030', // retro-red
  '#319795', // retro-teal
  '#D69E2E', // retro-mustard
  '#1A365D', // retro-navy
  '#FFD700', // gold
  '#FF6B6B', // coral
  '#4ECDC4', // turquoise
  '#9B59B6', // purple
];

export default function Confetti({ isActive, duration = 3000, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 100; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          delay: Math.random() * 500,
          rotation: Math.random() * 360,
          size: 8 + Math.random() * 8,
        });
      }
      setPieces(newPieces);
      setVisible(true);

      // Hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${2000 + Math.random() * 1500}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall ease-out forwards;
        }
      `}</style>
    </div>
  );
}
