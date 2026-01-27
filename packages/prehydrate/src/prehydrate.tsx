/**
 * Prehydrate - Run JavaScript before React hydrates
 *
 * This module enables "prehydration" - executing JavaScript to update the DOM
 * between SSR and React hydration. This eliminates hydration mismatches for
 * dynamic values like timestamps, user preferences, or computed state.
 *
 * CRITICAL NOTE: This code runs outside of the React lifecycle.
 * It must NEVER use React hooks or any other React runtime code.
 */
import type { ReactElement } from 'react';
import { InlineScript } from './InlineScript';
import { generateDOMCode, isGeneratingCode } from './reactToDom';
import type {
  DependencyMap,
  PrehydrateOptions,
  PrehydrateProps,
  PrehydrateResult,
} from './types';

/**
 * Serializes dependencies (functions and constants) into JavaScript source code
 * that can be injected into an inline script
 */
function serializeDeps(deps: DependencyMap): string {
  let source = "";
  for (const [name, value] of Object.entries(deps)) {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
      throw new Error(`Invalid dep name: ${name}`);
    }
    source += typeof value === "function"
      ? `const ${name} = ${value.toString()};\n`
      : `const ${name} = ${JSON.stringify(value)};\n`;
  }
  return source;
}

/**
 * Creates a prehydration wrapper for React components
 *
 * @param options - Configuration options
 * @param options.key - Unique key identifying this prehydration instance
 * @param options.initialState - Initial state value or factory function
 * @param options.deps - Dependencies to inject into the inline script
 *
 * @returns Object containing Prehydrate component and bind function
 *
 * @example
 * ```tsx
 * const { Prehydrate, bind } = prehydrate({
 *   key: 'clock',
 *   initialState: () => new Date(),
 * });
 *
 * function Clock({ bind }) {
 *   const [time, setTime] = useState(() => {
 *     const boundProps = bind('time');
 *     return boundProps.time || new Date();
 *   });
 *   // ...
 * }
 *
 * <Prehydrate><Clock bind={bind} /></Prehydrate>
 * ```
 */
export function prehydrate<T = unknown>(
  options: PrehydrateOptions<T>
): PrehydrateResult<T> {
  const { deps = {}, key } = options;

  // Cache to store generated script per component instance (only used on server)
  let cachedScript: string | null = null;

  function Prehydrate({ children }: PrehydrateProps) {
    const containerId = `prehydrate-${key}`;

    // Use children directly - it's already a ReactElement from React's render
    const staticElement = children as ReactElement;

    // Detect if we're running on the server (SSR) or client
    const isServer = typeof window === 'undefined';

    // CRITICAL: Only generate the script during SSR
    // On the client during hydration, we skip generateDOMCode() entirely to avoid
    // the "hooks inside hooks" error (generateDOMCode renders components that use hooks)
    if (isServer && !cachedScript) {
      // IMPORTANT: Generate DOM code FIRST, during which bind() will be called
      // This happens during the SSR render, so the inline script will have the correct state
      const { code: domCode, rootVar } = generateDOMCode(staticElement);

      // Serialize dependencies so they can be used in the inline script
      const serializedDeps = serializeDeps(deps);

      // Determine if initialState is a factory function and serialize it
      const isFactory = typeof options.initialState === 'function';
      const initialStateCode = isFactory
        ? `const __initialState = (${(options.initialState as () => T).toString()})();`
        : `const __initialState = ${JSON.stringify(options.initialState)};`;

      // Wrap the generated code in an IIFE that targets our container
      // Execute immediately - no delay for production use
      cachedScript = `
      (function() {
        const container = document.getElementById('${containerId}');
        if (!container) {
          return;
        }

        // Evaluate initialState (either factory function or static value)
        ${initialStateCode}

        // Inject serialized dependencies
        ${serializedDeps}

        ${domCode}

        // Add marker attribute for debugging
        ${rootVar}.setAttribute('data-prehydrate-source', 'inline-script');

        // Replace SSR content with prehydrated version
        container.replaceChild(${rootVar}, container.firstChild);

        // Dispatch event to signal prehydration is complete
        window.dispatchEvent(new CustomEvent('prehydration-complete'));
      })();
    `;
    }

    return (
      <>
        <div id={containerId}>{children}</div>
        {isServer && cachedScript && <InlineScript code={cachedScript} />}
      </>
    );
  }

  return {
    Prehydrate,
    bind: (bindKey: string): Record<string, T | undefined> => {
      // During generateDOMCode execution: return initialState for inline script
      // During normal renders: return empty object so component controls its own state
      if (isGeneratingCode()) {
        // Evaluate factory function if it is one, otherwise use value as-is
        const value = typeof options.initialState === 'function'
          ? (options.initialState as () => T)()
          : options.initialState;
        return { [bindKey]: value };
      }
      return {};
    }
  };
}
