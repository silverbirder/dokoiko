import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { radius } from "./util";
import { categoryMapping } from "./data";
import type { YahooLocalSearchResponse } from "./yahoo.type";

const YAHOO_API_KEY = process.env.YAHOO_API_KEY ?? "";

export const yahooRouter = createTRPCRouter({
  searchLocal: publicProcedure
    .input(z.object({ lat: z.number(), lng: z.number(), category: z.string() }))
    .query(async ({ input }) => {
      const { lat, lng, category } = input;
      const results = await getYahooLocalSearch(lat, lng, category);
      return {
        lat,
        lng,
        results,
      };
    }),
});

const getYahooLocalSearch = async (
  lat: number,
  lng: number,
  category: string,
) => {
  const url = "https://map.yahooapis.jp/search/local/V1/localSearch";
  const categoryConfig =
    categoryMapping[category as keyof typeof categoryMapping];
  const genreCodes = categoryConfig?.yahoo;

  const baseParams = {
    appid: YAHOO_API_KEY,
    lon: lng.toString(),
    lat: lat.toString(),
    output: "json",
    results: "20",
    sort: "hybrid",
    detail: "full",
    dist: (radius / 1000).toString(),
  };

  const params = new URLSearchParams(baseParams);
  if (category && genreCodes && genreCodes.length > 0) {
    params.set("gc", genreCodes.join(","));
  }

  const response = await fetch(`${url}?${params.toString()}`);
  const data = (await response.json()) as YahooLocalSearchResponse;
  const features = data.Feature ?? [];

  return features.map((item) => {
    const [lng, lat] = item.Geometry.Coordinates.split(",").map(Number);
    let imageUrl: string | undefined;
    if (item.Property?.Detail) {
      for (let i = 1; i <= 9; i++) {
        const key = `Image${i}` as keyof typeof item.Property.Detail;
        if (item.Property.Detail[key]) {
          imageUrl = item.Property.Detail[key];
          break;
        }
      }
    }
    return {
      name: item.Name,
      url: item.Property?.Detail?.PcUrl1 ?? item.Property?.Detail?.MobileUrl1,
      image: imageUrl,
      address: item.Property?.Address,
      latitude: lat,
      longitude: lng,
    };
  });
};
