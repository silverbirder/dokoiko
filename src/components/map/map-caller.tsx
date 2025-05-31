"use client";

import dynamic from "next/dynamic";
import type { Map } from "./map";

const LazyMap = dynamic(
  () => import("./map").then((mod) => ({ default: mod.Map })),
  {
    ssr: false,
    loading: () => <p>地図を読み込み中...</p>,
  },
);

type Props = React.ComponentProps<typeof Map>;

export const MapCaller = (props: Props) => {
  return <LazyMap {...props} />;
};
