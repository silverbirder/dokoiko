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

  const typedGoogleResults =
    googleData?.results?.map((item) => ({
      ...item,
      type: "google",
      position:
        item.latitude && item.longitude
          ? ([item.latitude, item.longitude] as [number, number])
          : undefined,
    })) ?? [];
  const typedYahooResults =
    yahooData?.results?.map((item) => ({
      ...item,
      type: "yahoo",
      position:
        item.latitude && item.longitude
          ? ([item.latitude, item.longitude] as [number, number])
          : undefined,
    })) ?? [];

  const results = [...typedGoogleResults, ...typedYahooResults];
  const isMore =
    (yahooData?.hasNextPage ?? false) ||
    (googleData?.results.some((item) => item.nextPageToken) ?? false);

  const markers = results
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      position: [item.latitude!, item.longitude!] as [number, number],
      popupText: item.name ?? item.address ?? "",
    }));

  const centerPosition: [number, number] | undefined =
    yahooData?.lat && yahooData?.lng
      ? [yahooData.lat, yahooData.lng]
      : googleData?.lat && googleData?.lng
        ? [googleData.lat, googleData.lng]
        : undefined;

  return { results, markers, centerPosition, isMore };
}
