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
      if (!address) {
        return null;
      }
      // const location = await getLatLng(address);
      // if (!location) {
      //   return null;
      // }
      // const { lat, lng } = location;
      // console.log(`Address: ${address}, Latitude: ${lat}, Longitude: ${lng}`);
      // const allResults = await getPlacesNearby(lat, lng, [
      //   "restaurant",
      //   "shopping_mall",
      // ]);
      // console.log(`Found ${allResults.length} nearby places`);
      const lat = 1;
      const lng = 1;
      const allResults = [
        { name: "Restaurant A", vicinity: "Location A", type: "restaurant" },
        {
          name: "Shopping Mall B",
          vicinity: "Location B",
          type: "shopping_mall",
        },
        { name: "Restaurant C", vicinity: "Location C", type: "restaurant" },
        {
          name: "Shopping Mall D",
          vicinity: "Location D",
          type: "shopping_mall",
        },
        { name: "Restaurant E", vicinity: "Location E", type: "restaurant" },
        {
          name: "Shopping Mall F",
          vicinity: "Location F",
          type: "shopping_mall",
        },
        { name: "Restaurant G", vicinity: "Location G", type: "restaurant" },
        {
          name: "Shopping Mall H",
          vicinity: "Location H",
          type: "shopping_mall",
        },
        { name: "Restaurant I", vicinity: "Location I", type: "restaurant" },
      ];
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
