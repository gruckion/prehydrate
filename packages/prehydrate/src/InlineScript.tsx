const problematicPatterns = [
  '_this',
  '_super',
] as const;

export interface InlineScriptProps extends React.ScriptHTMLAttributes<HTMLScriptElement> {
  script?: () => void;
  code?: string;
}

/**
 * InlineScript - Injects and immediately executes a JavaScript function in the browser.
 *
 * This component converts a function to a string and executes it as an inline script.
 * Useful for critical scripts that must run before React hydration, such as theme
 * initialization or preventing flash of unstyled content (FOUC).
 *
 * @param props - Component props
 * @param props.script - A self-contained function with no parameters or return value.
 *                       Must not rely on closures or external variables.
 * @param props.code - Raw JavaScript code string to inject (alternative to script)
 *
 * @returns A script element with inlined function, or null if neither script nor code provided
 */
export function InlineScript({ script, code, ...props }: InlineScriptProps) {
  let scriptString: string;

  if (code) {
    scriptString = code;
  } else if (script) {
    scriptString = script.toString();

    // Check for transpiled code patterns that may cause issues (silent check)
    if (problematicPatterns.some(pattern => scriptString.includes(pattern))) {
      // Transpiled code detected - may not work as expected
    }

    scriptString = `(${scriptString})()`;
  } else {
    return null;
  }

  return (
    <script
      {...props}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: scriptString }}
    />
  );
}
