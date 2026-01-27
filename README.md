# prehydrate

Run JavaScript before React hydrates. Eliminate hydration mismatches forever.

[![npm version](https://img.shields.io/npm/v/prehydrate)](https://www.npmjs.com/package/prehydrate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/prehydrate)](https://bundlephobia.com/package/prehydrate)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/npm/l/prehydrate)](./LICENSE)

## The Problem

When your server renders HTML and React hydrates on the client, they often disagree about what the content should be. This causes:

- **Hydration mismatch warnings** in your console
- **Visual flicker** as content jumps from server state to client state
- **Poor user experience** with flash of wrong content

Common scenarios where this happens:

| Scenario | Server Renders | Client Expects | Result |
|----------|---------------|----------------|--------|
| Current time | `10:00:00` | `10:00:05` | Clock jumps 5 seconds |
| Auth state | "Sign In" button | "Welcome, User" | UI flickers |
| Theme | Light mode | Dark mode (from localStorage) | Flash of light theme |
| Locale | English | Spanish (from browser) | Text changes language |

## The Solution

**prehydrate** runs your code _after_ the HTML loads but _before_ React hydrates. This lets you update the DOM with fresh data (from cookies, localStorage, current time, etc.) so React finds exactly what it expects.

```
Timeline:
─────────────────────────────────────────────────────────────────────►

[0ms]          [~50ms]                    [~200ms]
HTML loads     Prehydration runs          React hydrates
(stale data)   (fresh data applied)       (DOM already correct!)
               ▲                          ▲
               │                          │
               └── Your code runs here    └── No mismatch!
```

## Installation

```bash
npm install prehydrate
```

```bash
pnpm add prehydrate
```

```bash
bun add prehydrate
```

## Quick Start

```tsx
import { prehydrate } from 'prehydrate';

// 1. Create prehydration config at module level
const { Prehydrate, bind } = prehydrate({
  key: 'greeting',
  initialState: () => {
    // This runs in the browser BEFORE React hydrates
    return document.cookie.includes('user=') ? 'Welcome back!' : 'Hello, guest!';
  },
});

// 2. Create your component using bind() to get initial state
function Greeting({ bind }: { bind: (key: string) => Record<string, any> }) {
  const [message] = useState(() => {
    const { message } = bind('message') as { message?: string };
    return message || 'Hello!';
  });

  return <h1>{message}</h1>;
}

// 3. Wrap with Prehydrate
export function PrehydratedGreeting() {
  return (
    <Prehydrate>
      <Greeting bind={bind} />
    </Prehydrate>
  );
}
```

## How It Works

prehydrate operates in three phases:

### Phase 1: Server-Side Rendering

1. Your component renders on the server
2. `prehydrate()` analyzes the React element tree
3. It generates vanilla JavaScript code that can recreate the component
4. An inline `<script>` is embedded in the HTML response

### Phase 2: Prehydration (Browser, Before React)

1. Browser receives HTML and parses it
2. The inline script executes immediately
3. Your `initialState` function runs (reading cookies, localStorage, etc.)
4. The DOM is updated with fresh data
5. All this happens before React even loads!

### Phase 3: React Hydration

1. React loads and calls `hydrateRoot()`
2. It finds the DOM already matches the expected state
3. No hydration warnings, no flicker
4. Your app becomes fully interactive

## API Reference

### `prehydrate(options)`

Creates a prehydration context for a component.

```typescript
interface PrehydrateOptions<T = any> {
  key: string;                    // Unique identifier
  initialState?: T | (() => T);   // Value or factory function
  deps?: Record<string, any>;     // Functions/values for inline script
}
```

**Parameters:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `key` | `string` | Yes | Unique identifier for this prehydration instance |
| `initialState` | `T \| () => T` | No | Static value or factory function. Factory functions run at prehydration time in the browser |
| `deps` | `Record<string, any>` | No | Functions and values to serialize into the inline script |

**Returns:**

```typescript
interface PrehydrateResult {
  Prehydrate: React.ComponentType<{ children: React.ReactNode }>;
  bind: (key: string) => Record<string, any>;
}
```

| Property | Description |
|----------|-------------|
| `Prehydrate` | Wrapper component that handles SSR and inline script injection |
| `bind` | Function that returns `initialState` during code generation, empty object otherwise |

## Examples

### Real-Time Clock

A clock that shows the correct time from the first paint, with no jump when React hydrates.

```tsx
import { prehydrate } from 'prehydrate';
import { useState, useEffect } from 'react';

const { Prehydrate, bind } = prehydrate({
  key: 'clock',
  initialState: () => new Date(), // Evaluated fresh in browser
});

function Clock({ bind }: { bind: (key: string) => Record<string, any> }) {
  const [time, setTime] = useState(() => {
    const { time } = bind('time') as { time?: Date };
    return time || new Date();
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time.toLocaleTimeString()}</span>;
}

export function PrehydratedClock() {
  return (
    <Prehydrate>
      <Clock bind={bind} />
    </Prehydrate>
  );
}
```

### Authentication State

Read auth state from cookies before React loads.

```tsx
const { Prehydrate, bind } = prehydrate({
  key: 'auth',
  initialState: () => {
    const cookies = document.cookie.split(';').reduce((acc, c) => {
      const [key, value] = c.trim().split('=');
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {} as Record<string, string>);

    return {
      isAuthenticated: !!cookies['session_token'],
      userName: cookies['user_name'] || null,
    };
  },
});

function AuthMenu({ bind }: { bind: (key: string) => Record<string, any> }) {
  const [auth] = useState(() => {
    const { auth } = bind('auth') as { auth?: { isAuthenticated: boolean; userName: string | null } };
    return auth || { isAuthenticated: false, userName: null };
  });

  if (auth.isAuthenticated) {
    return <span>Welcome, {auth.userName}!</span>;
  }

  return <a href="/login">Sign In</a>;
}

export function PrehydratedAuthMenu() {
  return (
    <Prehydrate>
      <AuthMenu bind={bind} />
    </Prehydrate>
  );
}
```

### Theme from localStorage

Prevent flash of wrong theme.

```tsx
const { Prehydrate, bind } = prehydrate({
  key: 'theme',
  initialState: () => {
    return localStorage.getItem('theme') || 'light';
  },
});

function ThemeWrapper({ bind, children }: { bind: (key: string) => Record<string, any>; children: React.ReactNode }) {
  const [theme] = useState(() => {
    const { theme } = bind('theme') as { theme?: string };
    return theme || 'light';
  });

  return <div data-theme={theme}>{children}</div>;
}
```

### Traffic Light with Dependencies

Use `deps` to include helper functions in the inline script.

```tsx
type TrafficLightState = 'red' | 'orange' | 'green';

function getLights(state: TrafficLightState) {
  return [
    { color: 'red', active: state === 'red' },
    { color: 'orange', active: state === 'orange' },
    { color: 'green', active: state === 'green' },
  ];
}

const { Prehydrate, bind } = prehydrate({
  key: 'traffic-light',
  initialState: 'orange' as TrafficLightState,
  deps: { getLights }, // Available in the inline script
});

function TrafficLight({ bind }: { bind: (key: string) => Record<string, any> }) {
  const [state, setState] = useState<TrafficLightState>(() => {
    const { state } = bind('state') as { state?: TrafficLightState };
    return state || 'red';
  });

  useEffect(() => {
    // Transition to green after hydration
    setState('green');
  }, []);

  const lights = getLights(state);

  return (
    <svg width="50" height="120">
      <rect x="5" y="5" width="40" height="110" fill="#333" rx="5" />
      {lights.map(({ color, active }, index) => (
        <circle
          key={color}
          cx="25"
          cy={25 + index * 35}
          r="13"
          fill={active ? color : '#555'}
          opacity={active ? 1 : 0.3}
        />
      ))}
    </svg>
  );
}

export function PrehydratedTrafficLight() {
  return (
    <Prehydrate>
      <TrafficLight bind={bind} />
    </Prehydrate>
  );
}
```

## Performance Best Practices

### Call `prehydrate()` at Module Level

For optimal performance, always call `prehydrate()` at the module level, not inside your component.

```tsx
// ✅ CORRECT: Called once at module load
const { Prehydrate, bind } = prehydrate({
  key: 'clock',
  initialState: () => new Date(),
});

export function PrehydratedClock() {
  return (
    <Prehydrate>
      <Clock bind={bind} />
    </Prehydrate>
  );
}
```

```tsx
// ❌ WRONG: Called on every render!
export function PrehydratedClock() {
  const { Prehydrate, bind } = prehydrate({
    key: 'clock',
    initialState: () => new Date(),
  });

  return (
    <Prehydrate>
      <Clock bind={bind} />
    </Prehydrate>
  );
}
```

**Why this matters:**

| Pattern | `prehydrate()` Calls | Performance Impact |
|---------|---------------------|-------------------|
| Module level | 1 total | Zero overhead |
| Inside render | 100+/second | Severe performance degradation |

For components that update frequently (like animated clocks), calling `prehydrate()` inside render creates new function references on every render, causing unnecessary re-renders and memory allocation.

### Use Lazy State Initialization

Always use the function form of `useState` to ensure `bind()` is only called once:

```tsx
// ✅ CORRECT: bind() called once during initialization
const [time, setTime] = useState(() => {
  const { time } = bind('time') as { time?: Date };
  return time || new Date();
});
```

```tsx
// ❌ WRONG: bind() called on every render
const { time } = bind('time') as { time?: Date };
const [timeState, setTime] = useState(time || new Date());
```

## Framework Integration

### Next.js App Router

```tsx
// app/components/PrehydratedClock.tsx
'use client';

import { prehydrate } from 'prehydrate';
import { useState, useEffect } from 'react';

const { Prehydrate, bind } = prehydrate({
  key: 'clock',
  initialState: () => new Date(),
});

function Clock({ bind }: { bind: (key: string) => Record<string, any> }) {
  const [time, setTime] = useState(() => {
    const { time } = bind('time') as { time?: Date };
    return time || new Date();
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time.toLocaleTimeString()}</span>;
}

export function PrehydratedClock() {
  return (
    <Prehydrate>
      <Clock bind={bind} />
    </Prehydrate>
  );
}
```

### Vite SSR

prehydrate works with any Vite SSR setup. See the [examples/vite-ssr](./examples/vite-ssr) directory for a complete implementation.

## How the Three Phases Work Together

Here's a visual representation of what happens with a traffic light component:

```
┌─────────────────────────────────────────────────────────────────────┐
│ Phase 1: Server-Side Rendering                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Server executes:                                                   │
│  - prehydrate({ key: "traffic", initialState: "orange" })           │
│  - Generates DOM code for the component                             │
│  - Embeds inline <script> in HTML                                   │
│                                                                     │
│  HTML sent to browser:                                              │
│  ┌─────────────────────────────────────────┐                        │
│  │ <div id="prehydrate-traffic">           │                        │
│  │   <svg>  🔴 (red - SSR default)         │                        │
│  │ </div>                                  │                        │
│  │ <script>/* prehydration code */</script>│                        │
│  └─────────────────────────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Phase 2: Prehydration (Before React Loads)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Inline script executes:                                            │
│  - Evaluates initialState → "orange"                                │
│  - Generates DOM elements with orange light active                  │
│  - Replaces SSR content                                             │
│                                                                     │
│  DOM now shows:                                                     │
│  ┌─────────────────────────────────────────┐                        │
│  │ <div id="prehydrate-traffic">           │                        │
│  │   <svg>  🟠 (orange - prehydrated!)     │                        │
│  │ </div>                                  │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Phase 3: React Hydration                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  React calls hydrateRoot():                                         │
│  - Component renders with initial state from bind()                 │
│  - DOM already matches → no hydration mismatch!                     │
│  - useEffect runs → setState("green")                               │
│                                                                     │
│  DOM now shows:                                                     │
│  ┌─────────────────────────────────────────┐                        │
│  │ <div id="prehydrate-traffic">           │                        │
│  │   <svg>  🟢 (green - React controlled)  │                        │
│  │ </div>                                  │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Hydration mismatch still occurring

**Cause:** `bind()` not being used correctly in `useState` initializer.

**Solution:** Use the function form of `useState`:

```tsx
// ✅ Correct
const [state] = useState(() => {
  const { value } = bind('key');
  return value || defaultValue;
});

// ❌ Wrong - bind() called on every render
const { value } = bind('key');
const [state] = useState(value);
```

### Performance issues with frequent updates

**Cause:** `prehydrate()` called inside component render.

**Solution:** Move to module level:

```tsx
// ✅ Module level
const { Prehydrate, bind } = prehydrate({ key: 'my-key', initialState: () => getData() });

export function MyComponent() {
  return <Prehydrate>...</Prehydrate>;
}
```

### Inline script not executing

**Cause:** Content Security Policy (CSP) blocking inline scripts.

**Solution:** Add a nonce to your CSP and pass it to the script. This requires modifying the library to support nonces (coming soon).

### Function serialization errors

**Cause:** Using closures or non-serializable values in `deps`.

**Solution:** Only use self-contained functions and JSON-serializable values:

```tsx
// ✅ Works - self-contained function
const { Prehydrate, bind } = prehydrate({
  key: 'example',
  initialState: 'value',
  deps: {
    helper: (x: number) => x * 2, // No external references
  },
});

// ❌ Fails - closure over external variable
const multiplier = 2;
const { Prehydrate, bind } = prehydrate({
  key: 'example',
  initialState: 'value',
  deps: {
    helper: (x: number) => x * multiplier, // References external variable!
  },
});
```

## Comparison with Alternatives

| Approach | Hydration Mismatch | Performance | User Experience |
|----------|-------------------|-------------|-----------------|
| `suppressHydrationWarning` | Hidden, not fixed | Normal | Still flickers |
| Loading skeletons | Avoided | Delayed content | Loading state visible |
| Client-only rendering | Avoided | No SSR benefits | Slow initial load |
| **prehydrate** | Actually fixed | Optimal | Instant correct content |

## TypeScript

prehydrate is written in TypeScript and provides full type definitions:

```typescript
import { prehydrate } from 'prehydrate';

interface AuthState {
  isAuthenticated: boolean;
  userName: string | null;
}

const { Prehydrate, bind } = prehydrate<AuthState>({
  key: 'auth',
  initialState: () => ({
    isAuthenticated: false,
    userName: null,
  }),
});
```

## Contributing

```bash
git clone https://github.com/gruckion/prehydrate
cd prehydrate
npm install
npm run dev
```

## License

MIT
