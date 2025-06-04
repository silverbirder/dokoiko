import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Client, Language } from "@googlemaps/google-maps-services-js";
import { radius } from "./util";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";
const client = new Client({});

export const googleRouter = createTRPCRouter({
  geocode: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      if (!address) return null;
      return geocodeAddress(address);
    }),
  searchNearby: publicProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
        selectedTypes: z.array(z.string()).max(3).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { lat, lng, selectedTypes } = input;
      const types =
        selectedTypes && selectedTypes.length > 0 ? selectedTypes : [];
      const allResults = await getPlacesNearby(lat, lng, types);
      return {
        lat,
        lng,
        results: allResults,
      };
    }),
});

const geocodeAddress = async (
  address: string,
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: GOOGLE_API_KEY,
        language: Language.ja,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      if (firstResult?.geometry) {
        const location = firstResult.geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
    }
    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    throw new Error("Failed to geocode address");
  }
};

const getPlacesNearby = async (lat: number, lng: number, types: string[]) => {
  const allResults: {
    name?: string;
    url?: string;
    image?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    type: string;
  }[] = [];

  if (types.length === 0) {
    const res = await client.placesNearby({
      params: {
        location: { lat, lng },
        language: Language.ja,
        radius,
        key: GOOGLE_API_KEY,
      },
    });

    const results = res.data.results.map((r) => ({
      name: r.name,
      url: r.website ?? r.url,
      image: r.photos?.[0]?.photo_reference,
      address: r.vicinity,
      latitude: r.geometry?.location.lat,
      longitude: r.geometry?.location.lng,
      type: "all",
    }));

    allResults.push(...results);
  } else {
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
        image: r.photos?.[0]?.photo_reference,
        address: r.vicinity,
        latitude: r.geometry?.location.lat,
        longitude: r.geometry?.location.lng,
        type,
      }));

      allResults.push(...results);
    }
  }

  return allResults;
};
