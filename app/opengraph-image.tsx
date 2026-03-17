import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(180deg, #ffffff 0%, #f7f4ef 100%)",
          padding: "60px",
          color: "#000000"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.55)"
            }}
          >
            AIAlberta
          </div>
          <div
            style={{
              maxWidth: "900px",
              fontSize: 76,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.05em"
            }}
          >
            AI Automation and AI Development in Alberta
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "rgba(0,0,0,0.7)"
            }}
          >
            AI apps, automation, consulting
          </div>
          <div
            style={{
              padding: "16px 28px",
              borderRadius: "999px",
              background: "#000000",
              color: "#ffffff",
              fontSize: 22,
              letterSpacing: "0.2em",
              textTransform: "uppercase"
            }}
          >
            Alberta
          </div>
        </div>
      </div>
    ),
    size
  );
}
