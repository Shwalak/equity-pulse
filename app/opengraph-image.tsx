import { ImageResponse } from "next/og";

export const alt = "Equity Pulse: see what your home could unlock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6F1E7",
          color: "#0F1B2D",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 700 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#0F1B2D", display: "flex" }} />
          Equity Pulse
        </div>
        <div style={{ fontSize: 96, lineHeight: 1.02, fontWeight: 700, maxWidth: 900, display: "flex" }}>
          See what your home could unlock.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ background: "#FF6B4A", color: "#0F1B2D", padding: "16px 32px", borderRadius: 999, fontSize: 32, fontWeight: 700, display: "flex" }}>
            $190,000 estimated
          </div>
          <div style={{ fontSize: 28, display: "flex" }}>Illustrative concept. Not an offer.</div>
        </div>
      </div>
    ),
    size,
  );
}
