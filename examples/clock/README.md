# Clock Example

This example demonstrates prehydration using a clock with a **factory function** for dynamic initial state.

## The Problem

With traditional SSR, clocks are notoriously difficult:

1. **SSR renders** at server time (e.g., 12:00:00)
2. **Client receives** the HTML seconds later
3. **React hydrates** and the clock jumps to the current time
4. Users see a visible "jump" - a hydration mismatch

## The Solution

Prehydration solves this by:

1. **SSR renders** the clock with the server time
2. **Inline script runs** immediately with `initialState: () => new Date()` - the factory function evaluates the *current* time
3. **DOM updates** to show the correct time before React loads
4. **React hydrates** and smoothly takes over - no jump!

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Key Concept: Factory Functions

The clock uses a **factory function** for `initialState`:

```tsx
const { Prehydrate, bind } = prehydrate({
  key: "clock",
  initialState: () => new Date(), // Factory function
});
```

This is different from passing a static value:

- **Static value**: Evaluated once during SSR, then serialized
- **Factory function**: Serialized as code, evaluated when the inline script runs

This means the clock gets the correct time at the moment the page loads, not when the server rendered it.

## Learn more

See the [prehydrate documentation](https://prehydrate.gruckion.com) for more information.
