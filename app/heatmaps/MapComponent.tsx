'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { Report } from '@/lib/supabase';
import L from 'leaflet';
import ReportDetailsDialog from './ReportDetailsDialog';

// Fix for default markers in React-Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  reports: Report[];
}

// Component to update map bounds when reports change
function MapUpdater({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(r => r.latitude && r.longitude);
      
      if (validReports.length > 0) {
        const bounds = L.latLngBounds(
          validReports.map(report => [report.latitude, report.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else {
      // Default to India if no reports
      map.setView([20.5937, 78.9629], 5);
    }
  }, [reports, map]);

  return null;
}

// Heatmap layer component
function HeatmapLayer({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length === 0) return;

    // Haversine distance (meters)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const points = reports.filter(r => r.latitude && r.longitude);

    // Cluster points by 500m radius
    const visited: boolean[] = new Array(points.length).fill(false);
    type Cluster = { lat: number; lng: number; count: number; members: Report[] };
    const clusters: Cluster[] = [];

    for (let i = 0; i < points.length; i++) {
      if (visited[i]) continue;
      const center = points[i];
      let latSum = center.latitude;
      let lngSum = center.longitude;
      let count = 1;
      const members: Report[] = [center];
      visited[i] = true;

      for (let j = i + 1; j < points.length; j++) {
        if (visited[j]) continue;
        const p = points[j];
        const d = distanceMeters(center.latitude, center.longitude, p.latitude, p.longitude);
        if (d <= 500) {
          visited[j] = true;
          latSum += p.latitude;
          lngSum += p.longitude;
          count += 1;
          members.push(p);
        }
      }

      const clusterCenterLat = latSum / count;
      const clusterCenterLng = lngSum / count;
      clusters.push({ lat: clusterCenterLat, lng: clusterCenterLng, count, members });
    }

    // Draw translucent circles of 500m radius with color thresholds
    const layer = L.layerGroup();
    clusters.forEach(c => {
      // thresholds based on count
      let fill = '#22c55e'; // green
      if (c.count >= 9) fill = '#ef4444'; // red
      else if (c.count >= 4) fill = '#f59e0b'; // yellow/orange
      else if (c.count >= 2) fill = '#22c55e'; // green
      else fill = '#3b82f6'; // blue for isolated

      const circle = L.circle([c.lat, c.lng], {
        radius: 500,
        color: fill,
        fillColor: fill,
        weight: 2,
        opacity: 0.5,
        fillOpacity: 0.2 // translucent
      });

      circle.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">Cluster</h3>
          <p class="text-xs">Reports in 500m: <span class="font-semibold">${c.count}</span></p>
        </div>
      `);

      layer.addLayer(circle);
    });

    layer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(layer);
    };
  }, [reports, map]);

  return null;
}

export default function MapComponent({ reports }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-white/80">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[20.5937, 78.9629]} // Center on India
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater reports={reports} />
        <HeatmapLayer reports={reports} />
        
        {/* Individual Report Markers */}
        {reports.map((report) => {
          if (!report.latitude || !report.longitude) return null;
          
          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-2 text-gray-800">
                    {report.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {report.address}
                    </span>
                    <button
                      onClick={() => handleReportClick(report)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition-colors"
                    >
                      See Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Report Details Dialog */}
      <ReportDetailsDialog
        report={selectedReport}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
}
