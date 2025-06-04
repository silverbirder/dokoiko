import path from "path";
import fs from "fs";

export const getLatLngFromAddress = async (address: string) => {
  const gsiUrl = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(address)}`;
  const response = await fetch(gsiUrl);
  const data = (await response.json()) as {
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

export const saveResultsToFile = (
  prefix: string,
  type: string,
  results: Array<Record<string, unknown>>,
) => {
  try {
    const filePath = path.join(process.cwd(), `${prefix}_results_${type}.json`);
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`${prefix} results for ${type} saved to ${filePath}`);
  } catch (error) {
    console.error(
      `Error writing ${prefix} results to file for ${type}:`,
      error,
    );
  }
};
