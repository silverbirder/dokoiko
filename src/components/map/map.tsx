"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { radius } from "@/server/api/routers/data";
import type { Position, MarkerData } from "@/types/common";

L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type Props = {
  position?: Position;
  addressPosition?: Position;
  markers?: MarkerData[];
  selectedMarkerId?: number;
};

const MapCenterUpdater = ({ position }: { position?: Position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const PopupController = ({
  selectedMarkerId,
  markers,
}: {
  selectedMarkerId?: number;
  markers?: MarkerData[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedMarkerId !== undefined && markers?.[selectedMarkerId]) {
      const marker = markers[selectedMarkerId];
      map.openPopup(marker.popupText, marker.position);
    }
  }, [selectedMarkerId, markers, map]);

  return null;
};

export const Map = ({
  position,
  addressPosition,
  markers,
  selectedMarkerId,
}: Props) => {
  return (
    <MapContainer
      className="h-full w-full"
      center={position ?? [51.505, -0.09]}
      zoom={14}
    >
      <MapCenterUpdater position={position} />
      <PopupController selectedMarkerId={selectedMarkerId} markers={markers} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {addressPosition && (
        <Circle
          center={addressPosition}
          radius={radius}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
            weight: 2,
          }}
        />
      )}
      {markers?.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          <Popup autoClose={false} closeOnClick={false} autoPan={true}>
            {marker.popupText}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
