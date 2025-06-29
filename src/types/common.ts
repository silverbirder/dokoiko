export type LatLng = {
  lat: number;
  lng: number;
};

export type Position = [number, number];

export type BaseSearchResult = {
  name?: string;
  url?: string;
  image?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  now: number;
};

export type GoogleSearchResult = BaseSearchResult & {
  type: string;
  types?: string[];
};

export type YahooSearchResult = BaseSearchResult & {
  name: string;
  genres?: Array<{
    Code: string;
    Name: string;
  }>;
};

export type UnifiedSearchResult = BaseSearchResult & {
  type: "google" | "yahoo";
  position?: Position;
  types?: string[];
  genres?: Array<{
    Code: string;
    Name: string;
  }>;
};

export type GoogleData = {
  lat: number;
  lng: number;
  results: GoogleSearchResult[];
  types: Array<{
    name: string;
    nextPageToken: string;
  }>;
};

export type YahooData = {
  lat: number;
  lng: number;
  results: YahooSearchResult[];
  hasNextPage: boolean;
};

export type InitialValues = {
  address?: string;
  keyword?: string;
  category?: string;
  googleTypes?: string[];
  yahooGenres?: string[];
  radius?: number;
};

export type MarkerData = {
  position: Position;
  popupText: string;
};

export type GoogleTypeSelection = {
  name: string;
  pageToken?: string;
};

export type ComponentPropsBase = {
  className?: string;
};
