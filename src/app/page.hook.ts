import { api } from "@/trpc/server";
import type { LatLng, GoogleData, YahooData } from "@/types/common";

type Props = {
  address: string;
  category: string;
  googleTypes: string[];
  yahooGenres: string[];
};

type PageHookResult = {
  geocodeResult: LatLng | null;
  googleData: GoogleData | null;
  yahooData: YahooData | null;
};

export async function getPageHook({
  address,
  category,
  googleTypes,
  yahooGenres,
}: Props): Promise<PageHookResult> {
  const geocodeResult = address
    ? await api.google.geocode({ address }).catch(() => null)
    : null;

  const googleData = geocodeResult
    ? await api.google
        .searchNearby({
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          selectedTypes:
            googleTypes.length > 0
              ? googleTypes.map((type) => ({ name: type }))
              : undefined,
        })
        .catch(() => null)
    : null;

  const yahooData = geocodeResult
    ? await api.yahoo
        .searchLocal({
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          category,
          selectedGenres: yahooGenres.length > 0 ? yahooGenres : undefined,
        })
        .catch(() => null)
    : null;

  return {
    geocodeResult,
    googleData,
    yahooData,
  };
}
