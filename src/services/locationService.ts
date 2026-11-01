/**
 * Location Service for accurate real-time GPS detection and reverse geocoding
 */

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  locationName: string;
  accuracy?: number;
}

const geocodeCache = new Map<string, string>();

/**
 * Reverse geocodes latitude and longitude into a readable street/neighborhood/city name
 * using OpenStreetMap Nominatim with safe error handling and caching.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CivicEcho-App/1.0'
        },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.footway || addr.street;
        const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.residential;
        const locality = addr.city || addr.town || addr.village || addr.municipality || addr.county;

        const parts: string[] = [];
        if (street) parts.push(street);
        if (neighborhood && neighborhood !== street) parts.push(neighborhood);
        if (locality && !parts.includes(locality)) parts.push(locality);

        if (parts.length > 0) {
          const readable = parts.slice(0, 3).join(', ');
          geocodeCache.set(cacheKey, readable);
          return readable;
        }

        if (data.display_name) {
          const firstParts = data.display_name.split(',').slice(0, 3).join(',').trim();
          geocodeCache.set(cacheKey, firstParts);
          return firstParts;
        }
      }
    }
  } catch (err) {
    // Network or abort error; return standard coordinate pin
    console.warn('Reverse geocoding network error:', err);
  }

  const fallback = `Current GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  geocodeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Accurately gets the device's real GPS coordinates from the browser Geolocation API
 */
export function getCurrentGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        let msg = 'Failed to retrieve current location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission denied. Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable from your device.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please check your GPS signal and retry.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Full flow: detect real GPS position and reverse-geocode to actual address
 */
export async function detectRealLocation(): Promise<GeoLocationResult> {
  const position = await getCurrentGpsPosition();
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const locationName = await reverseGeocode(latitude, longitude);

  return {
    latitude,
    longitude,
    locationName,
    accuracy
  };
}
