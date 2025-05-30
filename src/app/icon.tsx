import { ImageResponse } from "next/og";

export const iconSizes = [48, 72, 96, 144, 192, 512];

export function generateImageMetadata() {
  return iconSizes.map((size) => ({
    id: size,
    contentType: "image/png",
    size: { width: size, height: size },
  }));
}

export const contentType = "image/png";

export default function Icon({ id }: { id: number }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: id,
        }}
      >
        🌍
      </div>
    ),
    {
      width: id,
      height: id,
    },
  );
}
