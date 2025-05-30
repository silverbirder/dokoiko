import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Client, Language } from "@googlemaps/google-maps-services-js";
import { getLatLngFromAddress, radius } from "./util";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";
const client = new Client({});

export const googleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      if (!address) return null;
      const location = await getLatLngFromAddress(address);
      if (!location) {
        return null;
      }
      const { lat, lng } = location;
      const allResults = await getPlacesNearby(lat, lng, [
        "restaurant",
        "shopping_mall",
      ]);
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
    url?: string;
    image?: string;
    address?: string;
    type: string;
  }[] = [];
  for (const type of types) {
    const res = await client.placesNearby({
      params: {
        location: { lat, lng },
        language: Language.ja,
        radius,
        type,
        key: GOOGLE_API_KEY,
      },
    });

    const results = res.data.results.map((r) => ({
      name: r.name,
      url: r.website ?? r.url,
      image: r.photos?.[0]?.photo_reference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${r.photos[0].photo_reference}`
        : undefined,
      address: r.vicinity,
      type,
    }));

    allResults.push(...results);
  }

  return allResults;
};
