import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

export interface LatLng {
  lat: number;
  lng: number;
}

interface MapPickerProps {
  value: LatLng;
  onChange: (loc: LatLng) => void;
  height?: number;
}

/**
 * Native fallback. The interactive Leaflet map lives in MapPicker.web.tsx —
 * Metro automatically picks the .web version when running on web.
 */
export default function MapPicker({ value, height = 280 }: MapPickerProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.text}>Peta interaktif tersedia di versi web.</Text>
      <Text style={styles.coords}>
        {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
      </Text>
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
  coords: { color: Colors.text, fontWeight: '700' },
});
