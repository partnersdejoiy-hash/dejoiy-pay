'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[DejoiY Pay PWA] Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('[DejoiY Pay PWA] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
