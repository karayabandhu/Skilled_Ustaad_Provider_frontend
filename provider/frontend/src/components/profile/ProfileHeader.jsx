import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useTranslation } from "react-i18next";

/**
 * ProfileHeader - Standard header for all profile-related pages
 */
const ProfileHeader = ({ title, subtitle, onRefresh, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, isConnected } = useSocket();

  const fetchUnreadCount = async () => {
    try {
      const { getUnreadNotificationCount } = await import("../../services/api");
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Listen for real-time notification updates
    const handleRefresh = () => fetchUnreadCount();

    if (socket && isConnected) {
      const handleUpdate = (data) => {
        if (data && typeof data.count === "number") {
          setUnreadCount(data.count);
        } else {
          fetchUnreadCount();
        }
      };

      socket.on("notification_count_update", handleUpdate);
      socket.on("new_notification", fetchUnreadCount);

      window.addEventListener("refresh_unread_count", handleRefresh);

      return () => {
        socket.off("notification_count_update", handleUpdate);
        socket.off("new_notification", fetchUnreadCount);
        window.removeEventListener("refresh_unread_count", handleRefresh);
      };
    }

    window.addEventListener("refresh_unread_count", handleRefresh);
    // Fallback polling (less frequent - 60s)
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh_unread_count", handleRefresh);
    };
  }, [socket, isConnected]);

  return (
    // <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-100 dark:border-gray-800 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>

<div className="flex items-center justify-end space-x-3 shrink-0">      {/* <div className="flex items-center justify-end space-x-3 w-full md:w-auto"> */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await onRefresh?.();
              await fetchUnreadCount();
            }}
            disabled={loading}
            className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">{t("dashboard.refresh")}</span>
          </Button>
        )}

        <div
          className="relative cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
          onClick={() => navigate("/profile/notifications")}
        >
          <Bell className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] flex items-center justify-center px-1 rounded-full border-2 border-white dark:border-gray-900">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
