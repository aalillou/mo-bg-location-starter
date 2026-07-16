import type { Config } from '@aalillou/mo-bg-location';

/**
 * OpenFreeMap Positron — keyless, registration-free, light greyscale.
 * Tiles are third-party network traffic (the SDK itself sends nothing);
 * offline the map backdrop goes blank but tracking keeps working.
 */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

/** The starter's SDK configuration — on-device only, no backend, no telemetry. */
export const SDK_CONFIG: Config = {
  desiredAccuracy: 'high',
  distanceFilter: 10,
  stopTimeout: 90, // seconds
  notificationTitle: 'Tracking on',
  notificationBody: 'bg·location starter is drawing your trail.',
  labelMode: 'residual',
  powerMode: 'liveUpdates', // iOS 17+; older iOS falls back automatically
  wakeOnTerminate: true, // the swipe-away demo: keep tracking after app kill
  nativeSync: false, // everything stays on this phone
};
