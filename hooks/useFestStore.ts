'use client';

import { useState, useEffect } from 'react';
import { store } from '@/lib/store';

export function useFestStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Hydrate client data from MySQL
    store.initClient();

    // Re-render when store updates
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });

    // Auto-poll MySQL every 10 seconds to keep live scoreboards in sync
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        store.refreshFromDb();
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return store;
}
