"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type MarkerData = {
  position: [number, number];
  popupText: string;
};

type Props = {
  position?: [number, number];
  markers?: MarkerData[];
};

const MapCenterUpdater = ({ position }: { position?: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

export const Map = ({ position, markers }: Props) => {
  return (
    <MapContainer
      className="h-full w-full"
      center={position ?? [51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <MapCenterUpdater position={position} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers?.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup>{marker.popupText}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
