import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

// Favicon dinámico: inicial de la barbería sobre el degradado neón de la marca.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const settings = await getSettings();
  const initial = (settings.name?.charAt(0) || "B").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 900,
          color: "#05060a",
          borderRadius: 8,
          overflow: "hidden",
          background: "linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)",
        }}
      >
        {settings.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logo_url}
            width={32}
            height={32}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt=""
          />
        ) : (
          initial
        )}
      </div>
    ),
    size
  );
}
