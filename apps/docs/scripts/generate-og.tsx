import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

// Standard OG image dimensions
const WIDTH = 1200;
const HEIGHT = 630;

// Layout constants
const LAYOUT = {
  // Main container
  containerPadding: { vertical: 40, horizontal: 60 },

  // Typography
  titleFontSize: 72,
  taglineFontSize: 32,
  secondaryFontSize: 24,
  ctaFontSize: 20,
  labelFontSize: 16,
  arrowFontSize: 32,
  letterSpacing: "-0.02em",

  // Spacing
  titleMarginBottom: 20,
  trafficLightsMarginBottom: 30,
  trafficLightsGap: 8,
  taglineMarginBottom: 12,
  secondaryGap: 8,
  ctaMarginTop: 24,
  labelMarginTop: 8,

  // CTA button
  ctaPadding: { vertical: 14, horizontal: 32 },
  ctaBorderRadius: 8,

  // Arrow
  arrowPadding: { vertical: 0, horizontal: 16 },
} as const;

// Traffic light dimensions
const TRAFFIC_LIGHT = {
  baseWidth: 60,
  baseHeight: 140,
  bulbRadius: 16,
  spacing: 40,
  startY: 28,
  borderRadius: 12,
  padding: 8,
  gap: 8,
  borderWidth: 2,
  glowSize: { inner: 20, outer: 40 },
  housingColor: "#1f2937",
  borderColor: "#374151",
} as const;

// Brand colors from prehydrate-video
const COLORS = {
  background: "#0a0a0a",
  surface: "#1a1a1a",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  ctaText: "#000000",
  red: "#ef4444",
  orange: "#f59e0b",
  green: "#22c55e",
  lightOff: "#374151",
} as const;

// Traffic Light SVG as a data URL (since we can't use complex SVG in Satori easily)
function TrafficLight({
  activeLight,
  scale = 1,
}: {
  activeLight: "red" | "orange" | "green";
  scale?: number;
}) {
  const width = TRAFFIC_LIGHT.baseWidth * scale;
  const height = TRAFFIC_LIGHT.baseHeight * scale;
  const bulbRadius = TRAFFIC_LIGHT.bulbRadius * scale;
  const spacing = TRAFFIC_LIGHT.spacing * scale;
  const startY = TRAFFIC_LIGHT.startY * scale;

  const lights = [
    { color: COLORS.red, active: activeLight === "red", y: startY },
    {
      color: COLORS.orange,
      active: activeLight === "orange",
      y: startY + spacing,
    },
    {
      color: COLORS.green,
      active: activeLight === "green",
      y: startY + spacing * 2,
    },
  ];

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width,
              height,
              backgroundColor: TRAFFIC_LIGHT.housingColor,
              borderRadius: TRAFFIC_LIGHT.borderRadius * scale,
              border: `${TRAFFIC_LIGHT.borderWidth}px solid ${TRAFFIC_LIGHT.borderColor}`,
              padding: TRAFFIC_LIGHT.padding * scale,
              gap: TRAFFIC_LIGHT.gap * scale,
            },
            children: lights.map((light) => ({
              type: "div",
              props: {
                style: {
                  width: bulbRadius * 2,
                  height: bulbRadius * 2,
                  borderRadius: "50%",
                  backgroundColor: light.active ? light.color : COLORS.lightOff,
                  boxShadow: light.active
                    ? `0 0 ${TRAFFIC_LIGHT.glowSize.inner}px ${light.color}, 0 0 ${TRAFFIC_LIGHT.glowSize.outer}px ${light.color}`
                    : "none",
                },
              },
            })),
          },
        },
      ],
    },
  };
}

function Arrow() {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        color: COLORS.textMuted,
        fontSize: LAYOUT.arrowFontSize,
        padding: `${LAYOUT.arrowPadding.vertical}px ${LAYOUT.arrowPadding.horizontal}px`,
      },
      children: "→",
    },
  };
}

async function generateOGImage() {
  const outputDir = join(process.cwd(), "public");
  const outputPath = join(outputDir, "og.png");

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  // Load font
  const fontPath = join(process.cwd(), "fonts", "Inter-SemiBold.ttf");
  const fontData = await readFile(fontPath);

  // Main OG image design
  const element = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
        padding: `${LAYOUT.containerPadding.vertical}px ${LAYOUT.containerPadding.horizontal}px`,
      },
      children: [
        // Logo/Title
        {
          type: "div",
          props: {
            style: {
              fontSize: LAYOUT.titleFontSize,
              fontWeight: 600,
              color: COLORS.text,
              marginBottom: LAYOUT.titleMarginBottom,
              letterSpacing: LAYOUT.letterSpacing,
            },
            children: "prehydrate",
          },
        },

        // Traffic lights row
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: LAYOUT.trafficLightsMarginBottom,
              gap: LAYOUT.trafficLightsGap,
            },
            children: [
              // SSR (Red)
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  },
                  children: [
                    TrafficLight({ activeLight: "red", scale: 0.7 }),
                    {
                      type: "div",
                      props: {
                        style: {
                          color: COLORS.textMuted,
                          fontSize: LAYOUT.labelFontSize,
                          marginTop: LAYOUT.labelMarginTop,
                        },
                        children: "SSR",
                      },
                    },
                  ],
                },
              },
              Arrow(),
              // Pre-hydrate (Orange)
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  },
                  children: [
                    TrafficLight({ activeLight: "orange", scale: 0.7 }),
                    {
                      type: "div",
                      props: {
                        style: {
                          color: COLORS.orange,
                          fontSize: LAYOUT.labelFontSize,
                          marginTop: LAYOUT.labelMarginTop,
                          fontWeight: 600,
                        },
                        children: "Pre-hydrate",
                      },
                    },
                  ],
                },
              },
              Arrow(),
              // Hydrate (Green)
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  },
                  children: [
                    TrafficLight({ activeLight: "green", scale: 0.7 }),
                    {
                      type: "div",
                      props: {
                        style: {
                          color: COLORS.textMuted,
                          fontSize: LAYOUT.labelFontSize,
                          marginTop: LAYOUT.labelMarginTop,
                        },
                        children: "Hydrate",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // Main tagline
        {
          type: "div",
          props: {
            style: {
              fontSize: LAYOUT.taglineFontSize,
              fontWeight: 600,
              color: COLORS.text,
              textAlign: "center",
              marginBottom: LAYOUT.taglineMarginBottom,
            },
            children: "Show users real content. Not loading states.",
          },
        },

        // Secondary tagline with checkmark
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: LAYOUT.secondaryGap,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    color: COLORS.green,
                    fontSize: LAYOUT.secondaryFontSize,
                  },
                  children: "✓",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: LAYOUT.secondaryFontSize,
                    color: COLORS.green,
                  },
                  children: "No hydration mismatch. No flicker.",
                },
              },
            ],
          },
        },

        // CTA
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: LAYOUT.ctaMarginTop,
              padding: `${LAYOUT.ctaPadding.vertical}px ${LAYOUT.ctaPadding.horizontal}px`,
              backgroundColor: COLORS.green,
              borderRadius: LAYOUT.ctaBorderRadius,
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: LAYOUT.ctaFontSize,
                    fontWeight: 600,
                    color: COLORS.ctaText,
                  },
                  children: "Get Started Free →",
                },
              },
            ],
          },
        },
      ],
    },
  };

  // Generate SVG with Satori
  const svg = await satori(element as React.ReactNode, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        weight: 600,
        style: "normal",
      },
    ],
  });

  // Convert SVG to PNG with Resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: WIDTH,
    },
  });
  const pngBuffer = resvg.render().asPng();

  await writeFile(outputPath, pngBuffer);

  // Check file size
  const stats = await import("node:fs").then((fs) =>
    fs.promises.stat(outputPath)
  );
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`✓ Generated OG image: ${outputPath}`);
  console.log(`  Dimensions: ${WIDTH}x${HEIGHT}px`);
  console.log(`  Size: ${sizeKB} KB`);

  return outputPath;
}

generateOGImage().catch(console.error);
