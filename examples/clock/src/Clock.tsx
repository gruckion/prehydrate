import { useState, useEffect, ReactElement } from 'react';
import { prehydrate } from 'prehydrate';

// Constants
export const CLOCK_CENTER_X = 50;
export const CLOCK_CENTER_Y = 50;
export const MS_INTERVAL = 10;
export const DEGREES_PER_SECOND = 6;
export const DEGREES_PER_MILLISECOND = 0.006;

// Computation function for second hand rotation
export function computeSecondHandRotation(d: Date): number {
  return d.getSeconds() * DEGREES_PER_SECOND + d.getMilliseconds() * DEGREES_PER_MILLISECOND;
}

interface ClockProps {
  bind: (key: string) => Record<string, Date | undefined>;
}

export function Clock({ bind }: ClockProps) {
  // Use lazy initializer to only call bind() once on mount, not on every render
  const [time, setTime] = useState(() => {
    const boundProps = bind("time");
    return boundProps.time || new Date();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, MS_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const hands = [
    { type: 'second', angle: computeSecondHandRotation(time), length: 40, stroke: 'red', width: 1 },
  ];

  return (
    <svg width="100" height="100" style={{ borderRadius: '50%' }}>
      <circle cx={CLOCK_CENTER_X} cy={CLOCK_CENTER_Y} r="45" fill="white" stroke="black" strokeWidth="2" />
      {hands.map(({ type, angle, length, stroke, width }) => (
        <line
          key={`${type}-${angle}`}
          x1={CLOCK_CENTER_X}
          y1={CLOCK_CENTER_Y}
          x2={CLOCK_CENTER_X}
          y2={CLOCK_CENTER_Y - length}
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap="round"
          style={{ transition: "transform 0.1s linear" }}
          transform={`rotate(${angle}, ${CLOCK_CENTER_X}, ${CLOCK_CENTER_Y})`}
        />
      ))}
      <circle cx={CLOCK_CENTER_X} cy={CLOCK_CENTER_Y} r="3" fill="black" />
    </svg>
  );
}

export function PrehydratedClock(): ReactElement {
  const { Prehydrate, bind } = prehydrate<Date>({
    key: "clock",
    initialState: () => new Date(), // Factory function - evaluated at inline script execution time
  });

  return <Prehydrate><Clock bind={bind} /></Prehydrate>;
}
