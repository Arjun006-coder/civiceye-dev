'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Report } from '@/lib/supabase';
import L from 'leaflet';

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

    // Create heatmap data
    const heatmapData = reports
      .filter(report => report.latitude && report.longitude)
      .map(report => ({
        lat: report.latitude,
        lng: report.longitude,
        weight: (report.final_confidence_score || 0.5) * 100, // Convert to 0-100 scale
        report: report
      }));

    // Create custom heatmap layer
    const heatmapLayer = L.layerGroup();

    heatmapData.forEach(point => {
      const intensity = point.weight / 100;
      let color = '#00ff00'; // Green
      
      if (intensity >= 0.8) color = '#ff0000'; // Red
      else if (intensity >= 0.6) color = '#ff8000'; // Orange
      else if (intensity >= 0.4) color = '#ffff00'; // Yellow
      else if (intensity >= 0.2) color = '#80ff00'; // Light Green

      const marker = L.circleMarker([point.lat, point.lng], {
        radius: Math.max(5, intensity * 15),
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6
      });

      // Add popup with report details
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-bold text-sm mb-1">${point.report.title}</h3>
          <p class="text-xs text-gray-600 mb-1">${point.report.address}</p>
          <p class="text-xs mb-1">Status: <span class="font-semibold">${point.report.verification_status}</span></p>
          <p class="text-xs">Confidence: <span class="font-semibold">${Math.round(point.weight)}%</span></p>
        </div>
      `);

      heatmapLayer.addLayer(marker);
    });

    // Add heatmap layer to map
    heatmapLayer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatmapLayer);
    };
  }, [reports, map]);

  return null;
}

export default function MapComponent({ reports }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className="h-full w-full">
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
      </MapContainer>
    </div>
  );
}
