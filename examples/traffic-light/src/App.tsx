import { PrehydratedTrafficLight } from './TrafficLight';

function App() {
  return (
    <div>
      <h1>Traffic Light Demo</h1>
      <p>
        Watch the 3-phase flow: <strong>Red</strong> (SSR) → <strong>Orange</strong> (Prehydration) → <strong>Green</strong> (React hydrated)
      </p>
      <div className="traffic-light-container">
        <div>
          <h3>Prehydrated Traffic Light</h3>
          <PrehydratedTrafficLight />
        </div>
      </div>
    </div>
  );
}

export default App;
