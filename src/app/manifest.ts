import type { MetadataRoute } from "next";
import { iconSizes } from "./icon";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "どこいこ",
    short_name: "どこいこ",
    description: "あなたの行きたい場所を見つけるためのアプリです。",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#34a85a",
    icons: iconSizes.map((size) => ({
      src: `/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
  };
}
