# Traffic Light Example

This example demonstrates prehydration using a traffic light that transitions through three phases:

1. **Red (SSR)** - The initial server-rendered state
2. **Orange (Prehydration)** - JavaScript runs before React hydrates, updating the DOM
3. **Green (Hydrated)** - React takes over with full interactivity

## What it demonstrates

- The 3-phase prehydration flow
- Using `prehydrate()` to wrap components
- The `bind()` function for state injection
- Dependency injection with the `deps` option

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## How it works

The traffic light uses `prehydrate()` to:

1. Render red during SSR
2. Inject an inline script that runs immediately and changes it to orange
3. When React hydrates, the `useEffect` changes it to green

This eliminates hydration mismatches because the DOM is already in the correct state when React takes over.

## Learn more

See the [prehydrate documentation](https://prehydrate.gruckion.com) for more information.
