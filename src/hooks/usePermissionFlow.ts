/**
 * The documented one-shot permission ladder (SDK ≥ 0.1.3 on iOS):
 * `requestPermissions({ background: true, activity: true })` walks
 * While-Using → Always → Motion in one call. A second tap that improves
 * nothing falls back to `Linking.openSettings()` (the OS won't re-prompt).
 * Grants are also re-read whenever the app returns to the foreground, so a
 * Settings round-trip advances the flow without another tap.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { getPermissions, requestPermissions, type PermissionStatus } from '@aalillou/mo-bg-location';

export interface PermissionFlow {
  /** Latest known grants; null until the first read resolves. */
  perms: PermissionStatus | null;
  /** True once foreground + background are both granted. */
  granted: boolean;
  /** The perm-card button: one-shot ladder, Settings on a stuck re-tap. */
  request: () => Promise<PermissionStatus>;
}

function improved(next: PermissionStatus, prev: PermissionStatus): boolean {
  return (
    (next.foreground && !prev.foreground) ||
    (next.background && !prev.background) ||
    (next.activity && !prev.activity) ||
    (next.precise && !prev.precise)
  );
}

export function usePermissionFlow(): PermissionFlow {
  const [perms, setPerms] = useState<PermissionStatus | null>(null);
  const lastAsk = useRef<PermissionStatus | null>(null);

  // initial read + re-read on every return to foreground (Settings round-trip)
  useEffect(() => {
    let mounted = true;
    const refresh = () =>
      getPermissions().then((p) => {
        if (mounted) setPerms(p);
      });
    refresh();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const request = useCallback(async () => {
    const p = await requestPermissions({ background: true, activity: true });
    setPerms(p);
    if (p.foreground && p.background) {
      lastAsk.current = null;
      return p;
    }
    // unproductive re-tap: the OS won't prompt again — send them to Settings
    if (lastAsk.current && !improved(p, lastAsk.current)) {
      Linking.openSettings();
    }
    lastAsk.current = p;
    return p;
  }, []);

  return {
    perms,
    granted: !!perms && perms.foreground && perms.background,
    request,
  };
}
