"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Generic localStorage-backed state, used to model each "service" in the
 * Export Hub (integrations, schedules, history, share links) as an
 * independent unit — similar in spirit to separate tables/services in a
 * real backend, without needing one here.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Ignore malformed/unavailable storage and fall back to initialValue.
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable; fail silently for this demo app.
    }
  }, [key, value, isLoaded]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater));
  }, []);

  return [value, update, isLoaded] as const;
}
