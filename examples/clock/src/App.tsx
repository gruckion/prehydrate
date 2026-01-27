import { PrehydratedClock } from './Clock';

function App() {
  return (
    <div>
      <h1>Clock Demo</h1>
      <p>
        This clock demonstrates prehydration with a <strong>factory function</strong> for dynamic initial state.
      </p>
      <p>
        The clock shows the correct time immediately because the inline script evaluates <code>new Date()</code> at execution time.
      </p>
      <div className="clock-container">
        <div>
          <h3>Prehydrated Clock</h3>
          <PrehydratedClock />
        </div>
      </div>
    </div>
  );
}

export default App;
