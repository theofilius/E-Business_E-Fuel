import React, { useEffect, useRef, useState } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  value: LatLng;
  onChange: (loc: LatLng) => void;
  height?: number;
}

const LEAFLET_VERSION = '1.9.4';
let leafletPromise: Promise<any> | null = null;

/**
 * Loads Leaflet (CSS + JS) from CDN once. No API key, no bundler config needed.
 */
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

/**
 * Interactive location picker. Click the map or drag the marker to choose a
 * delivery point. `value` can also be updated externally (e.g. the GPS button).
 */
export default function MapPicker({ value, onChange, height = 280 }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const skipSyncRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // Initialise the map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current).setView([value.lat, value.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const icon = L.icon({
          iconUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon.png`,
          iconRetinaUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon-2x.png`,
          shadowUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-shadow.png`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        const marker = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(map);

        const emit = (lat: number, lng: number) => {
          skipSyncRef.current = true;
          onChangeRef.current({ lat, lng });
        };
        marker.on('dragend', () => {
          const p = marker.getLatLng();
          emit(p.lat, p.lng);
        });
        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          emit(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        markerRef.current = marker;
        // Nudge Leaflet to size correctly inside responsive flex layouts
        setTimeout(() => map.invalidateSize(), 200);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. the "use my location" button) to the map
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !markerRef.current) return;
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], 16);
  }, [value.lat, value.lng, status]);

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
