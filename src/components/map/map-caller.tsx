"use client";

import dynamic from "next/dynamic";
import type { Position, MarkerData } from "@/types/common";

const LazyMap = dynamic(
  () => import("./map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    ),
  },
);

type Props = {
  position?: Position;
  addressPosition?: Position;
  markers?: MarkerData[];
  selectedMarkerId?: number;
  onMapMove?: (center: Position) => void;
  onMarkerClick?: (index: number) => void;
};

export const MapCaller = (props: Props) => {
  return <LazyMap {...props} />;
};
