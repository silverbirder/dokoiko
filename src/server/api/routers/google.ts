import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  Client,
  Language,
  type PlacesNearbyRequest,
} from "@googlemaps/google-maps-services-js";
import { radius, majorGoogleOptions } from "./data";
import type {
  LatLng,
  GoogleSearchResult,
  GoogleTypeSelection,
} from "@/types/common";

const GOOGLE_API_KEY = process.env.GOOGLE_MAP_API_KEY ?? "";
const client = new Client({});

const generateGoogleMapsUrl = (
  name?: string,
  latitude?: number,
  longitude?: number,
): string => {
  if (latitude && longitude) {
    const query = name ? encodeURIComponent(name) : `${latitude},${longitude}`;
    return `https://www.google.com/maps/search/${query}/@${latitude},${longitude},17z`;
  }
  return "";
};

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
        selectedTypes: z
          .array(
            z.object({
              name: z.string(),
              pageToken: z.string().optional(),
            }),
          )
          .max(3)
          .optional(),
        category: z.string().optional(),
        keyword: z.string().optional(),
        radius: z.number().min(100).max(50000).default(3000),
      }),
    )
    .query(async ({ input }) => {
      const { lat, lng, selectedTypes, category, keyword, radius } = input;
      let types =
        selectedTypes && selectedTypes.length > 0 ? selectedTypes : [];
      if (types.length === 0 && category) {
        const majorOptions =
          majorGoogleOptions[category as keyof typeof majorGoogleOptions];
        if (majorOptions) {
          types = majorOptions.map((type) => ({ name: type }));
        }
      }

      const { results, types: allTypes } = await getPlacesNearby(
        lat,
        lng,
        types,
        radius,
        keyword,
      );

      return {
        lat,
        lng,
        results,
        types: allTypes,
      };
    }),
});

const geocodeAddress = async (address: string): Promise<LatLng | null> => {
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
  } catch {
    throw new Error("Failed to geocode address");
  }
};

const getPlacesNearby = async (
  lat: number,
  lng: number,
  types: GoogleTypeSelection[],
  searchRadius = radius,
  keyword?: string,
) => {
  const now = new Date().getTime();
  const allResults: GoogleSearchResult[] = [];

  const allTypes: { name: string; nextPageToken: string }[] = [];

  if (types.length === 0) {
    const requestParams: PlacesNearbyRequest["params"] = {
      location: { lat, lng },
      language: Language.ja,
      radius: searchRadius,
      key: GOOGLE_API_KEY,
    };
    if (keyword) {
      requestParams.keyword = keyword;
    }

    console.log("[Google API] getPlacesNearby parameters:", requestParams);
    const res = await client.placesNearby({
      params: requestParams,
    });

    const results = res.data.results.map((r) => ({
      name: r.name,
      url:
        r.website ??
        r.url ??
        generateGoogleMapsUrl(
          r.name,
          r.geometry?.location.lat,
          r.geometry?.location.lng,
        ),
      image: r.photos?.[0]?.photo_reference,
      address: r.vicinity,
      latitude: r.geometry?.location.lat,
      longitude: r.geometry?.location.lng,
      type: "all",
      types: r.types,
      now,
    }));

    allResults.push(...results);
    if (res.data.next_page_token) {
      allTypes.push({ name: "all", nextPageToken: res.data.next_page_token });
    }
  } else {
    for (const type of types) {
      const requestParams: PlacesNearbyRequest["params"] = {
        location: { lat, lng },
        language: Language.ja,
        radius: searchRadius,
        key: GOOGLE_API_KEY,
      };
      if (type.pageToken) {
        requestParams.pagetoken = type.pageToken;
      }
      if (type.name !== "all") {
        requestParams.type = type.name;
      }
      if (keyword) {
        requestParams.keyword = keyword;
      }

      console.log("[Google API] getPlacesNearby parameters:", requestParams);
      const res = await client.placesNearby({
        params: requestParams,
      });

      const results = res.data.results.map((r) => ({
        name: r.name,
        url:
          r.website ??
          r.url ??
          generateGoogleMapsUrl(
            r.name,
            r.geometry?.location.lat,
            r.geometry?.location.lng,
          ),
        image: r.photos?.[0]?.photo_reference,
        address: r.vicinity,
        latitude: r.geometry?.location.lat,
        longitude: r.geometry?.location.lng,
        type: type.name,
        types: r.types,
        now,
      }));

      allResults.push(...results);
      if (res.data.next_page_token) {
        allTypes.push({
          name: type.name,
          nextPageToken: res.data.next_page_token,
        });
      }
    }
  }

  return { results: allResults, types: allTypes };
};
