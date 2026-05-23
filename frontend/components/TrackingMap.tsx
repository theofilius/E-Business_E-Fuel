import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

export interface LatLng {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  destination: LatLng;
  driver?: LatLng | null;
  height?: number;
}

/**
 * Native fallback. The live Leaflet map lives in TrackingMap.web.tsx —
 * Metro automatically picks the .web version when running on web.
 */
export default function TrackingMap({ destination, driver, height = 320 }: TrackingMapProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.text}>Peta tracking tersedia di versi web.</Text>
      <Text style={styles.coords}>
        Tujuan: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
      </Text>
      {driver ? (
        <Text style={styles.coords}>
          Driver: {driver.lat.toFixed(4)}, {driver.lng.toFixed(4)}
        </Text>
      ) : (
        <Text style={styles.muted}>Lokasi driver belum tersedia.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  text: { color: Colors.textMuted, fontSize: 13 },
  coords: { color: Colors.text, fontWeight: '700', fontSize: 13 },
  muted: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic' },
});
