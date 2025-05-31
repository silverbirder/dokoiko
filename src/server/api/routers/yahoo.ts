import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import axios from "axios";
import { getLatLngFromAddress } from "./util";

const YAHOO_API_KEY = process.env.YAHOO_API_KEY ?? "";

const GENRE_CODES = [
  "01", // グルメ
];

export const yahooRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      if (!address) return null;

      const result = await getLatLngFromAddress(address);
      if (!result) {
        return null;
      }
      const { lat, lng } = result;
      const url = "https://map.yahooapis.jp/search/local/V1/localSearch";
      const params = {
        appid: YAHOO_API_KEY,
        lon: lng,
        lat: lat,
        output: "json",
        gc: GENRE_CODES.join(","),
        results: 20,
        sort: "hybrid",
        detail: "standard",
        dist: 3,
      };
      const response = await axios.get(url, { params });
      const data = response.data as {
        Feature?: {
          Name: string;
          Property?: {
            Address?: string;
            Genre?: { Name: string }[];
            Tel1?: string;
          };
        }[];
      };
      const features = data.Feature ?? [];
      const results = features.map((item) => ({
        name: item.Name,
        address: item.Property?.Address,
        genre: item.Property?.Genre?.[0]?.Name,
        tel: item.Property?.Tel1,
      }));

      return {
        lat,
        lng,
        results,
      };
    }),
});
