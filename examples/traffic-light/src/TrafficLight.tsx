import { ReactElement, useState, useEffect } from "react";
import { prehydrate } from "prehydrate";

export type TrafficLightState = "red" | "orange" | "green";

function getLights(state: TrafficLightState) {
  return [
    { color: "red", active: state === "red" },
    { color: "orange", active: state === "orange" },
    { color: "green", active: state === "green" },
  ];
}

export function TrafficLightSVG({ state }: { state: TrafficLightState }): ReactElement {
  const lights = getLights(state);

  return (
    <svg width="50" height="120" style={{ display: "block", margin: "0 auto" }} key={state}>
      {/* Traffic light body */}
      <rect x="5" y="5" width="40" height="110" fill="#333" stroke="#000" strokeWidth="1.5" rx="5" />

      {/* Light circles */}
      {lights.map(({ color, active }, index) => {
        const cy = 25 + index * 35;
        return (
          <circle
            key={color}
            cx="25"
            cy={cy}
            r="13"
            fill={active ? color : "#555"}
            opacity={active ? 1 : 0.3}
            stroke="#222"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

interface TrafficLightProps {
  bind: (key: string) => Record<string, TrafficLightState | undefined>;
}

export function TrafficLight({ bind }: TrafficLightProps): ReactElement {
  // Use lazy initializer to only call bind() once on mount, not on every render
  const [state, setState] = useState<TrafficLightState>(() => {
    // Get state from bind (available during generateDOMCode)
    const boundProps = bind("state");

    // Priority: bind result > default
    // - During generateDOMCode: bind returns {state: "orange"}
    // - During SSR/client: bind returns {}, use "red"
    return boundProps.state || "red";
  });

  useEffect(() => {
    // After hydration, update to the final state (green)
    setState("green");
  }, []);

  return <TrafficLightSVG state={state} />;
}

export function PrehydratedTrafficLight(): ReactElement {
  const { Prehydrate, bind } = prehydrate<TrafficLightState>({
    key: "traffic-light",
    initialState: "orange", // This is what the inline script will render
    deps: {
      getLights,
    },
  });

  return (
    <Prehydrate>
      <TrafficLight bind={bind} />
    </Prehydrate>
  );
}
