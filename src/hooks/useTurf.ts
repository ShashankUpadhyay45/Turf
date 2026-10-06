import { turfs } from '@/data/turfs';
import { useMemo } from 'react';

export function useTurf(turfId?: string) {
  const turf = useMemo(() => {
    if (!turfId) return null;
    return turfs.find((t) => t.id === turfId) ?? null;
  }, [turfId]);

  return turf;
}

export function useTurfs(filters?: {
  sport?: string;
  area?: string;
  query?: string;
  ownerId?: string;
}) {
  return useMemo(() => {
    let filtered = [...turfs];

    if (filters?.sport && filters.sport !== 'All sports') {
      const sportLower = filters.sport.toLowerCase();
      filtered = filtered.filter((t) =>
        t.sports.some((s) => s.toLowerCase() === sportLower)
      );
    }

    if (filters?.area) {
      filtered = filtered.filter((t) =>
        t.area.toLowerCase().includes(filters.area!.toLowerCase()) ||
        t.city.toLowerCase().includes(filters.area!.toLowerCase())
      );
    }

    if (filters?.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.area.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.sports.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters?.ownerId) {
      filtered = filtered.filter((t) => t.ownerId === filters.ownerId);
    }

    return filtered;
  }, [filters?.sport, filters?.area, filters?.query, filters?.ownerId]);
}

export function getGoogleMapsDirectionsUrl(turf: { latitude: number; longitude: number; address: string; name: string }) {
  const destination = `${turf.latitude},${turf.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&destination_place_id=&travelmode=driving`;
}
