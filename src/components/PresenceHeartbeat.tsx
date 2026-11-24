'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSession, logoutUser, sendHeartbeat, sendBeaconLogout } from '../lib/auth';
import { API_BASE_URL } from '../lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

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
    const targetId = session?.id || session?.username;
    if (!targetId) return;

    // 1. Initial ping
    sendHeartbeat(targetId);

    // 2. Periodic heartbeat every 15 seconds
    const interval = setInterval(() => {
      const current = getSession();
      const currentId = current?.id || current?.username;
      if (currentId) {
        sendHeartbeat(currentId);
      }
    }, 15000);

    // 3. Instant ping when tab becomes visible / focused again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const current = getSession();
        const currentId = current?.id || current?.username;
        if (currentId) {
          sendHeartbeat(currentId);
        }
      }
    };

    // 4. Instant Beacon Logout when browser tab or window is closed
    const handleUnload = () => {
      // Don't send browser closed if a manual logout was already triggered
      try {
        if (sessionStorage.getItem('is_manual_logout') === 'true') return;
      } catch {}
      const current = getSession();
      const currentId = current?.id || current?.username;
      if (currentId) {
        sendBeaconLogout(currentId);
      }
    };

    // 5. Instant force logout listener via WebSocket
    let socket: Socket | null = null;
    try {
      socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
      });

      socket.on(
        'auth:force_logout',
        (payload: { userId?: string; username?: string }) => {
          const current = getSession();
          if (!current) return;
          const matchesId = payload.userId && current.id === payload.userId;
          const matchesName =
            payload.username &&
            current.username?.toLowerCase() === payload.username.toLowerCase();

          if (matchesId || matchesName) {
            logoutUser(current.id);
            if (
              typeof window !== 'undefined' &&
              window.location.pathname !== '/' &&
              !window.location.pathname.startsWith('/join')
            ) {
              alert(
                'Your active session has been revoked by a Super Administrator under Zero-Trust security protocol. Please contact your administrator to receive a new access token.',
              );
              window.location.href = '/';
            }
          }
        },
      );
    } catch {}

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      try {
        socket?.disconnect();
      } catch {}
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return null;
}
