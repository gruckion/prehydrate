import { colors } from './colors';

interface ArrowProps {
  width?: number;
  color?: string;
}

export function Arrow({ width = 40, color = colors.textMuted }: ArrowProps) {
  const height = 20;
  const headSize = 12;
  const midY = height / 2;
  const strokeWidth = 2;

  return (
    <svg width={width} height={height}>
      {/* Arrow line */}
      <path
        d={`M 0 ${midY} L ${width - headSize} ${midY}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      {/* Arrow head */}
      <path
        d={`M ${width - headSize} ${midY - headSize / 2} L ${width} ${midY} L ${width - headSize} ${midY + headSize / 2}`}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
