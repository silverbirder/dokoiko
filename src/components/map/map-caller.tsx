"use client";

import dynamic from "next/dynamic";
import type { Position, MarkerData } from "@/types/common";

const LazyMap = dynamic(
  () => import("./map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => <p>地図を読み込み中...</p>,
  },
);

type Props = {
  position?: Position;
  addressPosition?: Position;
  markers?: MarkerData[];
  selectedMarkerId?: number;
};

export const MapCaller = (props: Props) => {
  return <LazyMap {...props} />;
};
