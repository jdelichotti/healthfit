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
        }}
      >
        <div
          style={{
            display: "flex",
            width: "80%",
            height: "80%",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 200,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          HF
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
