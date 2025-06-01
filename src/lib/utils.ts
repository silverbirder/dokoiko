import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import fs from "fs";
import path from "path";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
