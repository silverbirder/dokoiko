import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { radius } from "./data";
import { categoryMapping } from "./data";
import type { YahooLocalSearchResponse } from "./yahoo.type";
import type { YahooSearchResult } from "@/types/common";

const YAHOO_API_KEY = process.env.YAHOO_API_KEY ?? "";

export const yahooRouter = createTRPCRouter({
  searchLocal: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        category: z.string(),
        page: z.number().default(1),
        selectedGenres: z.array(z.string()).max(3).optional(),
        keyword: z.string().optional(),
        radius: z.number().min(100).max(50000).default(3000),
      }),
    )
    .query(async ({ input }) => {
      const { lat, lng, category, page, selectedGenres, keyword, radius } =
        input;
      const { results, hasNextPage } = await getYahooLocalSearch(
        lat,
        lng,
        category,
        page,
        selectedGenres,
        radius,
        keyword,
      );
      return {
        lat,
        lng,
        results,
        hasNextPage,
      };
    }),
});

const getYahooLocalSearch = async (
  lat: number,
  lng: number,
  category: string,
  page = 1,
  selectedGenres?: string[],
  searchRadius = radius,
  keyword?: string,
) => {
  const now = new Date().getTime();

  const url = "https://map.yahooapis.jp/search/local/V1/localSearch";
  const categoryConfig =
    categoryMapping[category as keyof typeof categoryMapping];

  let genreCodes = selectedGenres;
  if (!genreCodes || genreCodes.length === 0) {
    genreCodes = categoryConfig?.yahoo;
  }

  const requestParams: {
    appid: string;
    lon: string;
    lat: string;
    output: string;
    results: string;
    start: string;
    sort: string;
    detail: string;
    dist: string;
    gc?: string;
    query?: string;
  } = {
    appid: YAHOO_API_KEY,
    lon: lng.toString(),
    lat: lat.toString(),
    output: "json",
    results: "20",
    start: ((page - 1) * 20 + 1).toString(),
    sort: "hybrid",
    detail: "full",
    dist: (searchRadius / 1000).toString(),
    // image: "true",
  };

  if (category && genreCodes && genreCodes.length > 0) {
    requestParams.gc = genreCodes.join(",");
  }
  if (keyword) {
    requestParams.query = keyword;
  }

  const params = new URLSearchParams(requestParams);
  console.log("[Yahoo API] getYahooLocalSearch parameters:", requestParams);
  const response = await fetch(`${url}?${params.toString()}`);
  const data = (await response.json()) as YahooLocalSearchResponse;
  const features = data.Feature ?? [];
  const total = data.ResultInfo?.Total ?? 0;

  const results: YahooSearchResult[] = features.map((item) => {
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
      url: item.Property?.Detail?.YUrl,
      image: imageUrl,
      address: item.Property?.Address,
      latitude: lat,
      longitude: lng,
      genres: item.Property?.Genre,
      now,
    };
  });

  const currentStart = (page - 1) * 20 + 1;
  const currentEnd = currentStart + results.length - 1;

  const hasNextPage = currentEnd < total;

  return { results, hasNextPage };
};
