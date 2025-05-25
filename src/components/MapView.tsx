import React, { FC } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { NodeData } from '../hooks/useGraphData';

// Fix default icon issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  nodes: NodeData[];
  onMarkerClick?: (node: NodeData) => void;
  selectedNodeId?: string;
}

const MapView: FC<MapViewProps> = ({ nodes, onMarkerClick, selectedNodeId }) => {
  // Center map on first node with geo, or fallback
  const withGeo = nodes.filter(n => n.geo);
  const center: [number, number] = withGeo.length > 0 ? withGeo[0].geo! : [0, 0];
  return (
    <MapContainer center={center} zoom={5} style={{ width: '100%', height: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {withGeo.map(n => (
        <React.Fragment key={n.id}>
          <Marker
            position={n.geo!}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(n) } : {}}
          >
            <Popup><strong>{n.label}</strong></Popup>
          </Marker>
          {n.id === selectedNodeId && (
            <CircleMarker
              center={n.geo!}
              pathOptions={{ color: 'red', weight: 3 }}
              radius={15}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapView; 