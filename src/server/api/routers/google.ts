import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Client, Language } from "@googlemaps/google-maps-services-js";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";
const client = new Client({});

export const googleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      const location = await getLatLng(address);
      if (!location) {
        return null;
      }
      const { lat, lng } = location;
      console.log(`Address: ${address}, Latitude: ${lat}, Longitude: ${lng}`);
      const allResults = await getPlacesNearby(lat, lng, [
        "restaurant",
        "shopping_mall",
      ]);
      console.log(`Found ${allResults.length} nearby places`);
      return {
        lat,
        lng,
        results: allResults,
      };
    }),
});

const getLatLng = async (address: string) => {
  const res = await client.geocode({
    params: {
      address,
      key: GOOGLE_API_KEY,
    },
  });

  if (!res.data.results.length) {
    throw new Error("ジオコーディング結果が見つかりませんでした");
  }

  return res.data.results[0]?.geometry.location;
};

const getPlacesNearby = async (lat: number, lng: number, types: string[]) => {
  const allResults: any[] = [];
  for (const type of types) {
    const res = await client.placesNearby({
      params: {
        location: { lat, lng },
        language: Language.ja,
        radius: 3000,
        type,
        key: GOOGLE_API_KEY,
      },
    });

    const results = res.data.results.map((r) => ({
      name: r.name,
      vicinity: r.vicinity,
      type,
    }));

    allResults.push(...results);
  }

  return allResults;
};
