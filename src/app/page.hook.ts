import { api } from "@/trpc/server";

export async function getPageHook({
  address,
  category,
  googleTypes,
}: {
  address: string;
  category: string;
  googleTypes: string[];
}) {
  const geocodeResult = address
    ? await api.google.geocode({ address }).catch(() => null)
    : null;

  const yahooData = geocodeResult
    ? await api.yahoo
        .searchLocal({
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          category,
        })
        .catch(() => null)
    : null;

  const googleData = geocodeResult
    ? await api.google
        .searchNearby({
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          selectedTypes: googleTypes.length > 0 ? googleTypes : undefined,
        })
        .catch(() => null)
    : null;

  return { 
    geocodeResult,
    yahooData,
    googleData,
   };
}
