import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to monitor and provide feedback for network connectivity changes.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored! Restablishing sync...", {
         duration: 3000,
         className: "bg-emerald-500 text-white border-none"
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are currently offline. Some features may be restricted.", {
         duration: 6000,
         className: "bg-rose-500 text-white border-none",
         id: "offline-warning"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};
