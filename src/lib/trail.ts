import { useSyncExternalStore } from 'react';

const KEY = 'ah:trail-off';

let on = (() => {
  try { return localStorage.getItem(KEY) !== '1'; } catch { return true; }
})();

const listeners = new Set<() => void>();

export function isTrailOn() { return on; }

export function toggleTrail() {
  on = !on;
  try { localStorage.setItem(KEY, on ? '0' : '1'); } catch { /* no-op */ }
  listeners.forEach((fn) => fn());
}

export function useTrailOn(): boolean {
  return useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    () => on,
  );
}
