import { api } from "@/trpc/server";

export async function getPageHook(address: string) {
  const geocodeResult = address
    ? await api.google.geocode({ address }).catch(() => null)
    : null;

  const yahooData = geocodeResult
    ? await api.yahoo
        .searchLocal({ lat: geocodeResult.lat, lng: geocodeResult.lng })
        .catch(() => null)
    : null;

  const googleData = geocodeResult
    ? await api.google
        .searchNearby({ lat: geocodeResult.lat, lng: geocodeResult.lng })
        .catch(() => null)
    : null;

  const typedGoogleResults =
    googleData?.results?.map((item) => ({ ...item, type: "google" })) ?? [];
  const typedYahooResults =
    yahooData?.results?.map((item) => ({ ...item, type: "yahoo" })) ?? [];

  const results = [...typedYahooResults, ...typedGoogleResults];

  const markers = results
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      position: [item.latitude!, item.longitude!] as [number, number],
      popupText: item.name ?? item.address ?? "",
    }));

  const initialPosition: [number, number] | undefined =
    yahooData?.lat && yahooData?.lng
      ? [yahooData.lat, yahooData.lng]
      : googleData?.lat && googleData?.lng
        ? [googleData.lat, googleData.lng]
        : undefined;

  return { results, markers, initialPosition };
}
