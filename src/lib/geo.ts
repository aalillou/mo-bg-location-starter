/** Pure geo helpers: distance, trail segmentation, GeoJSON builders. */
import type { TripFix, TrailSegments } from '../types';

/** A fix gap longer than this starts a new trail segment (kill window, tunnel…). */
export const SEGMENT_GAP_MS = 60_000;

const R = 6_371_000; // earth radius, m

export function haversineMeters(a: TripFix, b: TripFix): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sLat = Math.sin(dLat / 2);
  const sLng = Math.sin(dLng / 2);
  const h = sLat * sLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sLng * sLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Append a fix to the trail, starting a new segment when the time gap from the
 * previous fix exceeds `gapMs`. Mutates and returns `segments` (hot path — one
 * call per fix; callers own the array).
 */
export function appendFix(segments: TrailSegments, fix: TripFix, gapMs: number = SEGMENT_GAP_MS): TrailSegments {
  const last = segments[segments.length - 1];
  const prev = last?.[last.length - 1];
  if (!last || (prev && fix.ts - prev.ts > gapMs)) {
    segments.push([fix]);
  } else {
    last.push(fix);
  }
  return segments;
}

/** Keep one breadcrumb per ≥`minMeters` travelled (first fix always kept). */
export function downsampleCrumbs(segments: TrailSegments, minMeters = 25): TripFix[] {
  const crumbs: TripFix[] = [];
  for (const seg of segments) {
    let anchor: TripFix | undefined;
    for (const fix of seg) {
      if (!anchor || haversineMeters(anchor, fix) >= minMeters) {
        crumbs.push(fix);
        anchor = fix;
      }
    }
  }
  return crumbs;
}

/** Trail as one MultiLineString feature (single-fix segments are dropped). */
export function trailToGeoJSON(segments: TrailSegments): GeoJSON.Feature<GeoJSON.MultiLineString> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiLineString',
      coordinates: segments.filter((s) => s.length >= 2).map((s) => s.map((f) => [f.lng, f.lat])),
    },
  };
}

/** Breadcrumbs as one MultiPoint feature. */
export function crumbsToGeoJSON(crumbs: TripFix[]): GeoJSON.Feature<GeoJSON.MultiPoint> {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiPoint', coordinates: crumbs.map((f) => [f.lng, f.lat]) },
  };
}

export function pointGeoJSON(fix: TripFix): GeoJSON.Feature<GeoJSON.Point> {
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [fix.lng, fix.lat] },
  };
}

/** Bounds over every fix as [west, south, east, north]; undefined when empty. */
export function boundsOf(segments: TrailSegments): [number, number, number, number] | undefined {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const seg of segments) {
    for (const f of seg) {
      if (f.lng < w) w = f.lng;
      if (f.lng > e) e = f.lng;
      if (f.lat < s) s = f.lat;
      if (f.lat > n) n = f.lat;
    }
  }
  return w === Infinity ? undefined : [w, s, e, n];
}
