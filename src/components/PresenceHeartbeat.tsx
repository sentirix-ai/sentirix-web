'use client';

import { useEffect } from 'react';
import { getSession, sendHeartbeat, sendBeaconLogout } from '../lib/auth';

/**
 * PresenceHeartbeat Component
 * Runs in the background of all pages:
 * 1. Pings the server every 20 seconds to keep the active session alive and track exact online duration.
 * 2. On window close (beforeunload), sends a beacon logout to notify the server immediately that the browser was closed.
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

    // 3. Browser close beacon logout
    const handleBeforeUnload = () => {
      const current = getSession();
      if (current?.id) {
        sendBeaconLogout(current.id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}
