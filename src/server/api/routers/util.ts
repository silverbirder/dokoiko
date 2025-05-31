import axios from "axios";

export const getLatLngFromAddress = async (address: string) => {
  const gsiUrl = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  const response = await axios.get(gsiUrl);
  const data = response.data as {
    geometry?: { coordinates?: [number, number] };
  }[];

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const feature = data[0];
  if (!feature) {
    return null;
  }

  const coordinates = feature.geometry?.coordinates;

  if (!coordinates || coordinates.length !== 2) {
    return null;
  }

  const [lng, lat] = coordinates;
  return { lat, lng };
};

export const radius = 3000;
