import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { soundManager } from "../utils/soundUtils";
import { getNotificationPreferences } from "../services/api";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children, isAuthenticated }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Helper to check if a specific notification type has sound/alert enabled
  const shouldPlayForType = (type) => {
    try {
      const cached = localStorage.getItem("providerNotificationPreferences");
      if (!cached) return true; // Default to true if not cached yet
      const prefs = JSON.parse(cached);
      return prefs[type] !== false; // Only block if explicitly set to false
    } catch (e) {
      return true;
    }
  };

  // Fetch preferences once authenticated to ensure localStorage cache is warm
  useEffect(() => {
    if (isAuthenticated) {
      getNotificationPreferences()
        .then((res) => {
          if (res.data) {
            localStorage.setItem("providerNotificationPreferences", JSON.stringify(res.data));
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch notification preferences for socket:", err.message);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("accessToken");
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        auth: { token },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        // console.log("Socket connected:", newSocket.id);
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        // console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      newSocket.on("notification", (data) => {
        if (data && data.type) {
          if (shouldPlayForType(data.type)) {
            playNotificationSound();
          }
        } else {
          playNotificationSound();
        }
      });

      newSocket.on("new_notification", () => {
        if (shouldPlayForType("booking_request")) {
          playNotificationSound();
        }
      });

      newSocket.on("new_booking", () => {
        if (shouldPlayForType("booking_request")) {
          playNotificationSound();
        }
      });

      newSocket.on("booking_status", () => {
        if (shouldPlayForType("booking_accepted")) {
          playNotificationSound();
        }
      });

      newSocket.on("payment_received", () => {
        if (shouldPlayForType("payment_received")) {
          playNotificationSound();
        }
      });

      newSocket.on("payment_method_selected", () => {
        if (shouldPlayForType("payment_pending")) {
          playNotificationSound();
        }
      });

      setSocket(newSocket);
      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated]);

  const playNotificationSound = () => {
    soundManager.playNotification();
  };


  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  const on = useCallback((event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => { };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on }}>
      {children}
    </SocketContext.Provider>
  );
};
