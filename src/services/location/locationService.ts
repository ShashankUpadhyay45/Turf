// ============================================================================
// PLAYO LOCATION SERVICE ADAPTER (FRONTEND CLIENT-SIDE IMPLEMENTATION)
// ============================================================================
// NOTE: Uses browser navigator.geolocation and static turf GPS coordinates.
// No backend network requests are made in this adapter.
//
// Future Backend Integration:
// Endpoint: GET /api/v1/turfs/nearby?lat={lat}&lng={lng}&radius={radiusKm}
// Headers: Authorization: Bearer <token>
// Response: { success: true, data: Turf[], meta: { userCoordinates: { lat, lng } } }
// ============================================================================

import type { Turf } from '@/types';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
}

// Default center fallback (Dehradun Clock Tower)
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 30.3165,
  longitude: 78.0322,
};

export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Noida: { lat: 28.5355, lng: 77.3910 },
  Gurugram: { lat: 28.4595, lng: 77.0266 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
};

/**
 * Finds the nearest supported Indian metro city for the given GPS coordinates.
 */
export function getNearestCity(coords: Coordinates): string {
  let closestCity = 'Dehradun';
  let minDistance = Infinity;

  for (const [city, cityCoords] of Object.entries(CITY_COORDINATES)) {
    const dist = calculateDistance(coords.latitude, coords.longitude, cityCoords.lat, cityCoords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return closestCity;
}

/**
 * Requests the user's current GPS position via browser navigator.geolocation.
 * Returns a Promise that resolves to Coordinates.
 */
export async function requestCurrentLocation(): Promise<Coordinates> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser environment.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMsg = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission was denied. Using city default.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'The request to obtain location timed out.';
            break;
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute cached position
      }
    );
  });
}

/**
 * Calculates Great-Circle distance between two points using the Haversine formula (in kilometers).
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  // Return rounded to 1 decimal place
  return Math.round(d * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Returns a new array of turfs with their distance property calculated
 * from the user's coordinates, sorted by distance ascending.
 */
export function sortByDistance(turfsList: Turf[], userCoords: Coordinates): Turf[] {
  return [...turfsList]
    .map((turf) => {
      const dist = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        turf.latitude,
        turf.longitude
      );
      return {
        ...turf,
        distance: dist,
      };
    })
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
}

/**
 * Checks whether a turf is within a specific radius (in kilometers) from coordinates.
 */
export function isWithinRadius(
  turf: Turf,
  userCoords: Coordinates,
  radiusKm: number = 15
): boolean {
  const dist = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    turf.latitude,
    turf.longitude
  );
  return dist <= radiusKm;
}
