import { api } from "@/trpc/server";
import type { LatLng, GoogleData, YahooData } from "@/types/common";

type Props = {
  address: string;
  category: string;
  googleTypes: string[];
  yahooGenres: string[];
  radius: number;
  keyword?: string;
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
  radius,
  keyword,
}: Props): Promise<PageHookResult> {
  let geocodeResult: LatLng | null = null;

  if (address) {
    const latLngPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (latLngPattern.test(address)) {
      const [latStr, lngStr] = address.split(",");
      const lat = Number(latStr);
      const lng = Number(lngStr);
      if (!isNaN(lat) && !isNaN(lng)) {
        geocodeResult = { lat, lng };
      }
    } else {
      geocodeResult = await api.google.geocode({ address }).catch(() => null);
    }
  }

  const googleData = geocodeResult
    ? await api.google
        .searchNearby({
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          selectedTypes:
            googleTypes.length > 0
              ? googleTypes.map((type) => ({ name: type }))
              : undefined,
          category,
          radius,
          keyword,
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
          radius,
          keyword,
        })
        .catch(() => null)
    : null;

  return {
    geocodeResult,
    googleData,
    yahooData,
  };
}
