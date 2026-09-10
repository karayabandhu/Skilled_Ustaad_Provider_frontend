import { useState, useEffect, useCallback } from 'react';
import { getUnreadNotificationCount } from '../services/api';
import { useSocket } from '../context/SocketContext';

/**
 * Hook to manage notification unread count and app icon badging (PWA)
 * 
 * This hook:
 * 1. Fetches initial unread count
 * 2. Listens for real-time updates via socket
 * 3. Listens for custom UI internal refresh events
 * 4. Manages the browser App Badging API (launcher icon badge)
 */
export const useNotificationBadge = (isAuthenticated) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useSocket();

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      // Avoid parallel fetch if already unauthenticated
      if (!isAuthenticated) return;
      
      const response = await getUnreadNotificationCount();
      const count = response.data?.count || 0;
      setUnreadCount(count);
      updateAppBadge(count);
    } catch (err) {
      console.warn("Failed to fetch notification count:", err);
    }
  }, [isAuthenticated]);

  const updateAppBadge = (count) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(e => console.warn("App Badging error:", e));
      } else {
        navigator.clearAppBadge().catch(e => console.warn("App Badging clear error:", e));
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(() => {});
      return;
    }

    fetchCount();

    const handleRefresh = () => fetchCount();

    // Socket events
    if (socket && isConnected) {
      const handleSync = () => fetchCount();

      const handleUpdate = (data) => {
        if (data && typeof data.count === 'number') {
          setUnreadCount(data.count);
          updateAppBadge(data.count);
        } else {
          fetchCount();
        }
      };

      socket.on("notification_count_update", handleUpdate);
      socket.on("new_notification", handleSync);
      socket.on("new_booking", handleSync);
      socket.on("message_notification", handleSync);
      socket.on("booking_status", handleSync);
      socket.on("payment_method_selected", handleSync);
      socket.on("payment_received", handleSync);

      socket.on("notification", (data) => {
        if (data && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
          updateAppBadge(data.unreadCount);
        } else {
          fetchCount();
        }
      });

      window.addEventListener('refresh_unread_count', handleRefresh);

      return () => {
        socket.off("notification_count_update", handleUpdate);
        socket.off("new_notification", handleSync);
        socket.off("new_booking", handleSync);
        socket.off("message_notification", handleSync);
        socket.off("booking_status", handleSync);
        socket.off("payment_method_selected", handleSync);
        socket.off("payment_received", handleSync);
        socket.off("notification");
        window.removeEventListener('refresh_unread_count', handleRefresh);
      };
    }

    // Custom UI events listener fallback
    window.addEventListener('refresh_unread_count', handleRefresh);
    
    // Polling fallback
    const interval = setInterval(fetchCount, 60000);

    return () => {
      window.removeEventListener('refresh_unread_count', handleRefresh);
      clearInterval(interval);
    };
  }, [isAuthenticated, socket, isConnected, fetchCount]);

  return { unreadCount, refreshCount: fetchCount };
};
