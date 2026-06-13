import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Issue } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface Props { issues: Issue[]; }

export default function IssueMap({ issues }: Props) {
  const center: [number, number] = issues.length > 0
    ? [issues[0].latitude, issues[0].longitude]
    : [28.6139, 77.2090];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '500px', borderRadius: '12px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {issues.map(issue => (
        <Marker key={issue.id} position={[issue.latitude, issue.longitude]}>
          <Popup>
            <strong>{issue.title}</strong><br />
            {issue.description}<br />
            <span>Status: {issue.status}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}