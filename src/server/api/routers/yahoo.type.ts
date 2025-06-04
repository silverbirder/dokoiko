export type YahooLocalSearchResponse = {
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
