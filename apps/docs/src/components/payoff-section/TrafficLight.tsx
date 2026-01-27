import { colors } from './colors';

export type LightState = 'red' | 'orange' | 'green' | 'none';

interface TrafficLightProps {
  activeLight?: LightState;
  scale?: number;
  showGlow?: boolean;
  glowIntensity?: number;
}

interface LightBulbProps {
  color: string;
  glowColor: string;
  isOn: boolean;
  showGlow: boolean;
  glowIntensity: number;
  cy: number;
}

function LightBulb({ color, glowColor, isOn, showGlow, glowIntensity, cy }: LightBulbProps) {
  const fillColor = isOn ? color : colors.lightOff;
  const fillOpacity = isOn ? 1 : 0.3;

  const glowFilter =
    showGlow && isOn && glowIntensity > 0
      ? `drop-shadow(0 0 ${8 * glowIntensity}px ${glowColor}) drop-shadow(0 0 ${16 * glowIntensity}px ${glowColor})`
      : undefined;

  return (
    <g style={{ filter: glowFilter }}>
      <circle cx={50} cy={cy} r={18} fill={fillColor} opacity={fillOpacity} />
      {isOn && <circle cx={50} cy={cy} r={12} fill={color} opacity={0.9} />}
      <circle cx={44} cy={cy - 6} r={4} fill="white" opacity={isOn ? 0.3 : 0.05} />
    </g>
  );
}

export function TrafficLight({
  activeLight = 'none',
  scale = 1,
  showGlow = true,
  glowIntensity = 0.6,
}: TrafficLightProps) {
  const width = 100;
  const height = 220;

  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Housing */}
      <rect
        x={10}
        y={10}
        width={80}
        height={200}
        rx={16}
        ry={16}
        fill={colors.surface}
        stroke={colors.surfaceBorder}
        strokeWidth={2}
      />

      {/* Inner dark area */}
      <rect
        x={20}
        y={20}
        width={60}
        height={180}
        rx={12}
        ry={12}
        fill={colors.background}
      />

      {/* Light visors */}
      <path d="M 25 45 Q 50 35 75 45" fill="none" stroke={colors.surfaceBorder} strokeWidth={3} strokeLinecap="round" />
      <path d="M 25 105 Q 50 95 75 105" fill="none" stroke={colors.surfaceBorder} strokeWidth={3} strokeLinecap="round" />
      <path d="M 25 165 Q 50 155 75 165" fill="none" stroke={colors.surfaceBorder} strokeWidth={3} strokeLinecap="round" />

      {/* Red light */}
      <LightBulb
        color={colors.red}
        glowColor={colors.redGlow}
        isOn={activeLight === 'red'}
        showGlow={showGlow}
        glowIntensity={glowIntensity}
        cy={60}
      />

      {/* Orange light */}
      <LightBulb
        color={colors.orange}
        glowColor={colors.orangeGlow}
        isOn={activeLight === 'orange'}
        showGlow={showGlow}
        glowIntensity={glowIntensity}
        cy={110}
      />

      {/* Green light */}
      <LightBulb
        color={colors.green}
        glowColor={colors.greenGlow}
        isOn={activeLight === 'green'}
        showGlow={showGlow}
        glowIntensity={glowIntensity}
        cy={160}
      />

      {/* Pole */}
      <rect x={40} y={200} width={20} height={20} fill={colors.surface} />
    </svg>
  );
}
