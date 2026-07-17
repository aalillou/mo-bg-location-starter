/**
 * Battery level for the HUD chip. `null` until the first read resolves (or
 * when the platform reports none — expo-battery returns -1 there).
 */
import { useEffect, useState } from 'react';
import * as Battery from 'expo-battery';

export function useBattery(): number | null {
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Battery.getBatteryLevelAsync().then((l) => {
      if (mounted && l >= 0) setLevel(l);
    });
    const sub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      if (batteryLevel >= 0) setLevel(batteryLevel);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return level;
}

/** One-shot read for trip baselines (start/stop); null when unavailable. */
export async function readBatteryLevel(): Promise<number | null> {
  try {
    const l = await Battery.getBatteryLevelAsync();
    return l >= 0 ? l : null;
  } catch {
    return null;
  }
}
