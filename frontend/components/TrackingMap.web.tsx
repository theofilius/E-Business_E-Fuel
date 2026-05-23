import React, { useEffect, useRef, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  destination: LatLng;
  driver?: LatLng | null;
  height?: number;
}

const LEAFLET_VERSION = '1.9.4';
let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Leaflet hanya tersedia di browser'));
  }
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error('Gagal memuat peta'));
    document.body.appendChild(script);
  });
  return leafletPromise;
}

const DEST_ICON_HTML =
  '<div style="background:#EF4444;width:34px;height:34px;border-radius:50% 50% 50% 0;' +
  'transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);' +
  'display:flex;align-items:center;justify-content:center;">' +
  '<span style="transform:rotate(45deg);font-size:16px;">📍</span></div>';

const DRIVER_ICON_HTML =
  '<div style="background:#00B4D8;width:34px;height:34px;border-radius:50%;' +
  'border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);' +
  'display:flex;align-items:center;justify-content:center;font-size:18px;">🚗</div>';

/**
 * Read-only map showing the delivery destination and (optionally) the driver's
 * live position. Marker auto-updates as `driver` changes.
 */
export default function TrackingMap({ destination, driver, height = 320 }: TrackingMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Initialise the map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        LRef.current = L;

        const map = L.map(containerRef.current).setView([destination.lat, destination.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const destIcon = L.divIcon({
          html: DEST_ICON_HTML,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          className: '',
        });
        destMarkerRef.current = L.marker([destination.lat, destination.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup('Tujuan Pengiriman');

        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 200);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        destMarkerRef.current = null;
        driverMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync the driver marker as new positions arrive
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    const L = LRef.current;

    if (!driver) {
      if (driverMarkerRef.current) {
        mapRef.current.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
      return;
    }

    if (!driverMarkerRef.current) {
      const driverIcon = L.divIcon({
        html: DRIVER_ICON_HTML,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        className: '',
      });
      driverMarkerRef.current = L.marker([driver.lat, driver.lng], { icon: driverIcon })
        .addTo(mapRef.current)
        .bindPopup('Lokasi Driver');
    } else {
      driverMarkerRef.current.setLatLng([driver.lat, driver.lng]);
    }

    // Keep both pins in view
    const bounds = L.latLngBounds([
      [destination.lat, destination.lng],
      [driver.lat, driver.lng],
    ]);
    mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [driver?.lat, driver?.lng, destination.lat, destination.lng, status]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={containerRef}
        style={{
          height,
          width: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#E2E8F0',
          zIndex: 0,
        }}
      />
      {status !== 'ready' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748B',
            fontFamily: 'sans-serif',
            fontSize: 14,
            pointerEvents: 'none',
          }}
        >
          {status === 'loading' ? 'Memuat peta…' : 'Peta gagal dimuat'}
        </div>
      )}
    </div>
  );
}
