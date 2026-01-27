import { colors } from './colors';

interface CheckmarkProps {
  size?: number;
  color?: string;
  showGlow?: boolean;
  glowIntensity?: number;
}

export function Checkmark({
  size = 28,
  color = colors.green,
  showGlow = true,
  glowIntensity = 0.7,
}: CheckmarkProps) {
  const p1 = { x: size * 0.2, y: size * 0.5 };
  const p2 = { x: size * 0.4, y: size * 0.7 };
  const p3 = { x: size * 0.8, y: size * 0.3 };

  const glowFilter =
    showGlow && glowIntensity > 0
      ? `drop-shadow(0 0 ${8 * glowIntensity}px ${color}) drop-shadow(0 0 ${16 * glowIntensity}px ${color})`
      : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: glowFilter, overflow: 'visible' }}
    >
      <path
        d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y}`}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
