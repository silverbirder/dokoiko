import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import axios from "axios";
import { getLatLngFromAddress, radius } from "./util";

const YAHOO_API_KEY = process.env.YAHOO_API_KEY ?? "";

const GENRE_CODES = [
  "01", // グルメ
];

type YahooLocalSearchResponse = {
  ResultInfo: {
    Count: number;
    Total: number;
    Start: number;
    Latency: number;
    Status: number;
  };
  Feature: Feature[];
};

type Feature = {
  Id: string;
  Gid: string;
  Name: string;
  Geometry: {
    Type: string;
    Coordinates: string;
  };
  Property: Property;
};

type Property = {
  Uid: string;
  CassetteId: string;
  Yomi?: string;
  Country?: {
    Code: string;
    Name: string;
  };
  Address?: string;
  GovernmentCode?: string;
  Station?: Station[];
  PlaceInfo?: {
    FloorName?: string;
  };
  MapType?: string;
  MapScale?: string;
  Tel1?: string;
  Genre?: Genre[];
  Building?: {
    Id?: string;
    Name?: string;
    Floor?: string;
  };
  CatchCopy?: string;
  Coupon?: string;
  ReviewCount?: string;
  Detail?: {
    ZipCode?: string;
    Fax1?: string;
    Access1?: string;
    PcUrl1?: string;
    MobileUrl1?: string;
    ReviewUrl?: string;
    Image1?: string;
  };
  Style?: StyleType;
};

type Station = {
  Id: string;
  Name: string;
  Railway: string;
  Exit?: string;
  ExitId?: string;
  Distance?: string;
  Time?: string;
};

type Genre = {
  Code: string;
  Name: string;
};

type IconStyle = {
  Type: "icon";
  Id?: string;
  Target?: string[];
  Image?: string;
  Anchor?: string;
  Size?: string;
};

type LineStyle = {
  Type: "line";
  Id?: string;
  Target?: string[];
  Size?: string;
  Color?: string;
  Opacity?: string;
  StartLine?: "arrow";
  EndLine?: "arrow";
};

type FillStyle = {
  Type: "fill";
  Id?: string;
  Target?: string[];
  Color?: string;
  Opacity?: string;
};

type StyleType = IconStyle | LineStyle | FillStyle;

export const yahooRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { address } = input;
      if (!address) return null;
      const location = await getLatLngFromAddress(address);
      if (!location) {
        return null;
      }
      const { lat, lng } = location;
      const results = await getYahooLocalSearch(lat, lng);
      return {
        lat,
        lng,
        results,
      };
    }),
});

const getYahooLocalSearch = async (lat: number, lng: number) => {
  const url = "https://map.yahooapis.jp/search/local/V1/localSearch";
  const params = {
    appid: YAHOO_API_KEY,
    lon: lng,
    lat: lat,
    output: "json",
    gc: GENRE_CODES.join(","),
    results: 20,
    sort: "hybrid",
    detail: "standard",
    dist: radius / 1000,
  };
  const response = await axios.get(url, { params });
  const data = response.data as YahooLocalSearchResponse;
  const features = data.Feature ?? [];
  return features.map((item) => ({
    name: item.Name,
    url: item.Property?.Detail?.PcUrl1 ?? item.Property?.Detail?.MobileUrl1,
    image: item.Property?.Detail?.Image1,
    address: item.Property?.Address,
  }));
};
