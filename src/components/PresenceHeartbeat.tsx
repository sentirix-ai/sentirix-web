'use client';

import { useEffect } from 'react';
import { getSession, sendHeartbeat } from '../lib/auth';
import { API_BASE_URL } from '../lib/api';

/**
 * PresenceHeartbeat Component
 * Runs in the background of all pages:
 * 1. Pings the server every 20 seconds to keep the active session alive and track exact online duration.
 * 2. On visibility change (tab focus/return), immediately sends a heartbeat so status updates instantly.
 * 3. On pagehide/beforeunload (closing browser or tab), notifies server of BROWSER_CLOSED logout.
 * 4. Server marks user as Offline if no heartbeat is received within 75 seconds.
 */
export default function PresenceHeartbeat() {
  useEffect(() => {
    const session = getSession();
    if (!session?.id) return;

    // 1. Initial ping
    sendHeartbeat(session.id);

    // 2. Periodic heartbeat every 20 seconds
    const interval = setInterval(() => {
      const current = getSession();
      if (current?.id) {
        sendHeartbeat(current.id);
      }
    }, 20000);

    // 3. Instant ping when tab becomes visible / focused again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const current = getSession();
        if (current?.id) {
          sendHeartbeat(current.id);
        }
      }
    };

    // 4. Handle browser or tab close (Close Browser detection)
    const handleBrowserClose = () => {
      // If manual logout button was pressed, do not overwrite MANUAL_LOGOUT
      if (sessionStorage.getItem('is_manual_logout') === 'true') {
        return;
      }

      const current = getSession();
      if (!current?.id) return;

      const payload = JSON.stringify({ userId: current.id, reason: 'BROWSER_CLOSED' });

      // Reliable browser-close delivery via keepalive fetch
      try {
        fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
      } catch {}

      // Fallback via sendBeacon
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE_URL}/auth/logout`, blob);
          navigator.sendBeacon(`${API_BASE_URL}/auth/beacon-logout?userId=${encodeURIComponent(current.id)}`, new Blob([payload], { type: 'text/plain' }));
        }
      } catch {}
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('pagehide', handleBrowserClose);
    window.addEventListener('beforeunload', handleBrowserClose);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('pagehide', handleBrowserClose);
      window.removeEventListener('beforeunload', handleBrowserClose);
    };
  }, []);

  return null;
}
