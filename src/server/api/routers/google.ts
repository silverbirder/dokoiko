import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Client, Language } from "@googlemaps/google-maps-services-js";
import { getLatLngFromAddress } from "./util";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";
const client = new Client({});

export const googleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      if (!address) {
        return null;
      }
      const location = await getLatLngFromAddress(address);
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

const getPlacesNearby = async (lat: number, lng: number, types: string[]) => {
  const allResults: {
    name?: string;
    vicinity?: string;
    type: string;
  }[] = [];
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
