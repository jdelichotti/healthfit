import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2a78d6",
          color: "white",
          fontSize: 256,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 88,
        }}
      >
        HF
      </div>
    ),
    { width: 512, height: 512 }
  );
}
