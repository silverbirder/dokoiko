"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { radius as defaultRadius } from "@/server/api/routers/data";
import type { Position, MarkerData } from "@/types/common";

L.Icon.Default.mergeOptions({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

// お気に入りマーカー用のアイコン（CSSで色を変更）
const favoriteIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "favorite-marker",
});

const defaultIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  position?: Position;
  addressPosition?: Position;
  markers?: MarkerData[];
  selectedMarkerId?: number;
  radius?: number;
  onMapMove?: (center: Position) => void;
  onMarkerClick?: (index: number) => void;
};

const CENTER_POSITION: Position = [34.70262392204351, 135.49587252721363];

const MapCenterUpdater = ({ position }: { position?: Position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
};

const MarkersBoundsUpdater = ({ markers }: { markers?: MarkerData[] }) => {
  const map = useMap();

  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((marker) => marker.position));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [markers, map]);

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

const MapEventsHandler = ({
  onMapMove,
}: {
  onMapMove?: (center: Position) => void;
}) => {
  useMapEvents({
    dragend: (e: L.LeafletEvent) => {
      if (onMapMove) {
        const map = e.target as L.Map;
        const center = map.getCenter();
        onMapMove([center.lat, center.lng]);
      }
    },
    zoomend: (e: L.LeafletEvent) => {
      if (onMapMove) {
        const map = e.target as L.Map;
        const center = map.getCenter();
        onMapMove([center.lat, center.lng]);
      }
    },
  });
  return null;
};

export const Map = ({
  position,
  addressPosition,
  markers,
  selectedMarkerId,
  radius = defaultRadius,
  onMapMove,
  onMarkerClick,
}: Props) => {
  return (
    <MapContainer
      className="z-0 h-full w-full"
      center={position ?? CENTER_POSITION}
      zoom={14}
      zoomControl={false}
    >
      <MapCenterUpdater position={position} />
      <MarkersBoundsUpdater markers={markers} />
      <PopupController selectedMarkerId={selectedMarkerId} markers={markers} />
      <MapEventsHandler onMapMove={onMapMove} />
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
        <Marker
          key={index}
          position={marker.position}
          icon={marker.isFavorite ? favoriteIcon : defaultIcon}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(index);
              }
            },
          }}
        >
          <Popup autoClose={false} closeOnClick={false} autoPan={true}>
            {marker.popupText}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
