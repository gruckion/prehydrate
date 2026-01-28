import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Prehydrate - Render the correct UI from first paint";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: "80px",
        }}
      >
        {/* Traffic light visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "60px",
            marginBottom: "60px",
          }}
        >
          {/* Server-side render state */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                borderRadius: "16px",
                padding: "20px 16px",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
            </div>
            <span style={{ color: "#71717a", fontSize: "16px" }}>SSR</span>
          </div>

          {/* Arrow */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginTop: "-30px" }}
          >
            <path
              d="M5 12h14M13 5l7 7-7 7"
              stroke="#52525b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Prehydrate state */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                borderRadius: "16px",
                padding: "20px 16px",
                gap: "12px",
                border: "2px solid #22c55e",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#eab308",
                  boxShadow: "0 0 20px rgba(234, 179, 8, 0.5)",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
            </div>
            <span style={{ color: "#22c55e", fontSize: "16px", fontWeight: 600 }}>
              Prehydrate
            </span>
          </div>

          {/* Arrow */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginTop: "-30px" }}
          >
            <path
              d="M5 12h14M13 5l7 7-7 7"
              stroke="#52525b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Hydrate state */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#1a1a1a",
                borderRadius: "16px",
                padding: "20px 16px",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#3f3f46",
                }}
              />
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                }}
              />
            </div>
            <span style={{ color: "#71717a", fontSize: "16px" }}>Hydrate</span>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#fafafa",
              margin: 0,
              letterSpacing: "-2px",
            }}
          >
            prehydrate
          </h1>
          <p
            style={{
              fontSize: "28px",
              color: "#a1a1aa",
              margin: 0,
              maxWidth: "800px",
            }}
          >
            Render the correct UI from first paint. Avoid hydration mismatches.
          </p>
        </div>

        {/* Footer with tech stack */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "auto",
            color: "#52525b",
            fontSize: "18px",
          }}
        >
          <span>React</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>Next.js</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>Remix</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>Vite SSR</span>
          <span style={{ color: "#3f3f46" }}>|</span>
          <span>TypeScript</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
