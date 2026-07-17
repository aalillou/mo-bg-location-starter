/**
 * Full-bleed map + trail layer stack (mockup layer order: casing under route,
 * crumbs, origin ring, position dot on top). Colors swap per ColorArm:
 * live = blue dashed route · ended = blue solid + red arrival dot ·
 * off = grey ghost · setup = streets only.
 *
 * Camera-follow is gesture-aware: the first fix after entering follow mode
 * zooms to 16; afterwards only the center eases (a manual pinch-zoom
 * persists). Any user pan/zoom pauses following entirely, and it resumes —
 * at the user's zoom — once a new fix lands outside the visible map.
 */
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapLibreMap,
  Marker,
  type CameraRef,
  type MapRef,
} from '@maplibre/maplibre-react-native';
import { MAP_STYLE_URL } from '../sdkConfig';
import { boundsOf, crumbsToGeoJSON, downsampleCrumbs, pointGeoJSON, trailToGeoJSON } from '../lib/geo';
import { colors, fonts, radii, sizes } from '../theme';
import type { ColorArm, TrailSegments, TripFix } from '../types';
import { PositionMarker } from './PositionMarker';

export interface TrailMapProps {
  segments: TrailSegments;
  /** Latest known position; drives the marker and camera-follow. */
  lastFix?: TripFix;
  arm: ColorArm;
  /** 'follow' tracks lastFix at z16; 'fit' frames the whole trail (summary). */
  camera: 'follow' | 'fit';
  /** Extra bottom padding for 'fit' (space for the summary sheet). */
  fitBottomPadding?: number;
}

export function TrailMap({ segments, lastFix, arm, camera, fitBottomPadding = 0 }: TrailMapProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const mapRef = useRef<MapRef>(null);
  /** True after the user pans/zooms — follow pauses until the fix leaves the screen. */
  const userMovedMap = useRef(false);
  /** First follow fix zooms to 16; later ones ease center-only (keep user zoom). */
  const followStarted = useRef(false);

  const ghost = arm === 'off' || arm === 'setup';
  const routeColor = ghost ? colors.greyOff : colors.blue;
  const casingColor = ghost ? colors.ghostCasing : colors.routeCasing;
  const crumbColor = ghost ? colors.greyOff : colors.blue;

  const trail = useMemo(() => trailToGeoJSON(segments), [segments]);
  const crumbs = useMemo(() => crumbsToGeoJSON(downsampleCrumbs(segments)), [segments]);
  const origin = segments[0]?.[0];

  useEffect(() => {
    if (camera !== 'fit') return;
    // entering fit mode re-arms follow for the next live entry
    userMovedMap.current = false;
    followStarted.current = false;
    const bounds = boundsOf(segments);
    if (!bounds) return;
    cameraRef.current?.fitBounds(bounds, {
      padding: { top: 140 + insets.top, bottom: 60 + fitBottomPadding, left: 40, right: 40 },
      duration: 800,
    });
  }, [camera, segments, fitBottomPadding, insets.top]);

  // gesture-aware follow (imperative — declarative props would re-assert
  // center+zoom on every fix and fight the user's fingers)
  useEffect(() => {
    if (camera !== 'follow' || !lastFix) return;
    const center: [number, number] = [lastFix.lng, lastFix.lat];
    if (!followStarted.current) {
      followStarted.current = true;
      cameraRef.current?.easeTo({ center, zoom: 16, duration: 800 });
      return;
    }
    if (!userMovedMap.current) {
      cameraRef.current?.easeTo({ center, duration: 800 }); // same zoom level
      return;
    }
    // paused by a gesture: resume only when the fix walks off-screen
    let stale = false;
    mapRef.current
      ?.getBounds()
      .then(([w, s, e, n]) => {
        if (stale) return;
        const outside = lastFix.lng < w || lastFix.lng > e || lastFix.lat < s || lastFix.lat > n;
        if (outside) {
          userMovedMap.current = false;
          cameraRef.current?.easeTo({ center, duration: 800 });
        }
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [camera, lastFix]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapLibreMap
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE_URL}
        attribution={false}
        logo={false}
        compass={false}
        onRegionIsChanging={(e) => {
          if (e.nativeEvent.userInteraction) userMovedMap.current = true;
        }}
      >
        <Camera ref={cameraRef} />
        <GeoJSONSource id="trail" data={trail}>
          <Layer
            id="trail-casing"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': casingColor, 'line-width': 9 }}
          />
          <Layer
            id="trail-route"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{
              'line-color': routeColor,
              'line-width': 5,
              // live: static dash (mockup's marching ants animate; the pulse dot carries "alive")
              ...(arm === 'live' ? { 'line-dasharray': [2, 1.5] } : {}),
            }}
          />
        </GeoJSONSource>
        <GeoJSONSource id="crumbs" data={crumbs}>
          <Layer
            id="crumb-dots"
            type="circle"
            paint={{
              'circle-radius': 4,
              'circle-color': crumbColor,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 1.75,
            }}
          />
        </GeoJSONSource>
        {origin && (
          <GeoJSONSource id="origin" data={pointGeoJSON(origin)}>
            <Layer id="origin-ring" type="circle" paint={{ 'circle-radius': 10, 'circle-color': ghost ? colors.greyOff : colors.blue }} />
            <Layer id="origin-core" type="circle" paint={{ 'circle-radius': 5, 'circle-color': '#ffffff' }} />
          </GeoJSONSource>
        )}
        {lastFix && arm !== 'setup' && (
          <Marker id="position" lngLat={[lastFix.lng, lastFix.lat]}>
            <PositionMarker arm={arm} />
          </Marker>
        )}
      </MapLibreMap>
      {/* OSM attribution chip (we disable the native ornament and render our own, per mockup) */}
      <View style={[styles.osm, { top: insets.top + 8 }]} pointerEvents="none">
        <Text style={styles.osmText}>© OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  osm: {
    position: 'absolute',
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: radii.osm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  osmText: {
    fontFamily: fonts.mono,
    fontSize: sizes.osm,
    color: colors.muted,
  },
});
