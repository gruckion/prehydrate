import type { ReactElement } from 'react';

/**
 * Converts React elements to native DOM creation code (string)
 * Similar to rawact's approach but at runtime
 */

let varCounter = 0;
let isGeneratingDOMCode = false;

function generateVarName(): string {
  return `el${varCounter++}`;
}

/**
 * Returns true if we're currently generating DOM code
 * Used by bind() to determine if it should override props
 */
export function isGeneratingCode(): boolean {
  return isGeneratingDOMCode;
}

export function reactElementToDOMCode(element: unknown, parentVar?: string): string {
  const lines: string[] = [];

  // Handle text nodes
  if (typeof element === 'string' || typeof element === 'number') {
    const textVar = generateVarName();
    lines.push(`const ${textVar} = document.createTextNode(${JSON.stringify(String(element))});`);
    if (parentVar) {
      lines.push(`${parentVar}.appendChild(${textVar});`);
    }
    return lines.join('\n');
  }

  // Handle null/undefined/boolean
  if (!element || typeof element === 'boolean') {
    return '';
  }

  // Handle arrays
  if (Array.isArray(element)) {
    return element.map(child => reactElementToDOMCode(child, parentVar)).join('\n');
  }

  // Must be a React element at this point
  const reactElement = element as { type?: unknown; props?: Record<string, unknown> };
  if (!reactElement.type) {
    return '';
  }

  const { type, props } = reactElement as ReactElement<Record<string, unknown>>;
  const propsRecord = (props || {}) as Record<string, unknown>;

  // Handle component elements (not native DOM)
  if (typeof type !== 'string') {
    // Try to render the component by calling it
    try {
      const componentFn = type as (props: Record<string, unknown>) => ReactElement;
      const rendered = componentFn(propsRecord);
      return reactElementToDOMCode(rendered, parentVar);
    } catch {
      // Could not render component - this is expected for components with hooks
      console.warn('reactToDom: Could not render component', (type as { name?: string }).name || type);
      return '';
    }
  }

  // Generate code for native element
  const varName = generateVarName();
  const svgElements = ['svg', 'circle', 'rect', 'line', 'path', 'g', 'text', 'polygon', 'polyline', 'ellipse'];
  const isSVG = svgElements.includes(type);

  if (isSVG) {
    lines.push(`const ${varName} = document.createElementNS('http://www.w3.org/2000/svg', '${type}');`);
    // Add data attribute to root SVG for debugging
    if (type === 'svg') {
      lines.push(`${varName}.setAttribute('data-ssr-source', 'react-server');`);
    }
  } else {
    lines.push(`const ${varName} = document.createElement('${type}');`);
  }

  // Handle props
  if (propsRecord) {
    Object.keys(propsRecord).forEach(key => {
      if (key === 'children') return; // Handle separately

      const value = propsRecord[key];

      // Handle style object
      if (key === 'style' && typeof value === 'object' && value !== null) {
        const styleObj = value as Record<string, string | number>;
        Object.keys(styleObj).forEach(styleKey => {
          const styleValue = styleObj[styleKey];
          lines.push(`${varName}.style.${styleKey} = ${JSON.stringify(styleValue)};`);
        });
      }
      // Handle className
      else if (key === 'className') {
        lines.push(`${varName}.className = ${JSON.stringify(value)};`);
      }
      // Handle regular attributes
      else if (typeof value === 'string' || typeof value === 'number') {
        // Convert camelCase to kebab-case for SVG attributes
        const attrName = isSVG ? key.replace(/([A-Z])/g, '-$1').toLowerCase() : key;
        lines.push(`${varName}.setAttribute('${attrName}', ${JSON.stringify(String(value))});`);
      }
    });
  }

  // Handle children
  const childrenProp = propsRecord?.children;
  if (childrenProp) {
    const children = Array.isArray(childrenProp) ? childrenProp : [childrenProp];
    children.forEach((child: unknown) => {
      const childCode = reactElementToDOMCode(child, varName);
      if (childCode) {
        lines.push(childCode);
      }
    });
  }

  // Append to parent
  if (parentVar) {
    lines.push(`${parentVar}.appendChild(${varName});`);
  }

  return lines.join('\n');
}

/**
 * Generate DOM code with a clean counter state
 * Returns both the code and the root variable name
 */
export function generateDOMCode(element: unknown): { code: string; rootVar: string } {
  isGeneratingDOMCode = true; // Set flag so bind() knows to override
  varCounter = 0; // Reset counter
  const code = reactElementToDOMCode(element);
  isGeneratingDOMCode = false; // Clear flag
  const rootVar = 'el0'; // First variable created after reset
  return { code, rootVar };
}

/**
 * Generate a complete function that creates and returns a DOM element
 */
export function generateDOMFunction(element: unknown, containerId: string): () => void {
  const { code, rootVar } = generateDOMCode(element);

  const functionBody = `
    const container = document.getElementById('${containerId}');
    if (!container) return;
    container.innerHTML = '';
    ${code}
    container.appendChild(${rootVar});
  `;

  // Return a function that can be stringified
  return new Function(functionBody) as () => void;
}
