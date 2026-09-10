import React, { useState, useEffect } from "react";
import {
  Briefcase,
  CheckCircle,
  Bell,
  Settings,
  BellOff,
  RefreshCcw,
  Trash2,
  AlertCircle,
  Music,
  Volume2,
  Play,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAllNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  getProviderProfile,
  getBookingById,
  updateNotificationSound,
} from "../services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import SEO from "../components/SEO";
import { useNavigate } from "react-router-dom";
import BookingRequestModal from "../components/BookingRequestModal";

import { motion, AnimatePresence } from "framer-motion";

// Refactor Foundation Imports
import { useFetch } from "../hooks/useFetch";
import { usePagination } from "../hooks/usePagination";
import ProfileHeader from "../components/profile/ProfileHeader";
import NotificationItem from "../components/profile/NotificationItem";
import PreferenceToggle from "../components/profile/PreferenceToggle";
import {
  LoadingSkeleton,
  ErrorView,
  EmptyState,
} from "../components/common/StatusViews";
import { useSocket } from "../context/SocketContext";

const ProfileNotifications = () => {
  const { t } = useTranslation();
  // Data Fetching
  const { data: profile, loading: profileLoading } =
    useFetch(getProviderProfile);
  const {
    data: rawNotifications,
    loading: notificationsLoading,
    error: notificationsError,
    refresh: refreshNotifications,
    setData: setNotifications,
  } = useFetch(getNotifications);
  const {
    data: preferencesData,
    loading: prefLoading,
    refresh: refreshPreferences,
    setData: setPreferences,
  } = useFetch(getNotificationPreferences);

  const [selectedSound, setSelectedSound] = useState("default");
  const [isUpdatingSound, setIsUpdatingSound] = useState(false);
  const [isSoundConfirmOpen, setIsSoundConfirmOpen] = useState(false);
  const [pendingSound, setPendingSound] = useState(null);
  const [isSoundSuccessOpen, setIsSoundSuccessOpen] = useState(false);

  const { on } = useSocket();

  useEffect(() => {
    if (profile?.provider?.notificationSound) {
      setSelectedSound(profile.provider.notificationSound);
    }
  }, [profile]);

  useEffect(() => {
    const handleBookingTaken = (data) => {
      refreshNotifications();
      setSelectedBooking((prev) => {
        if (!prev) return null;
        const prevId = (prev._id || prev.id || prev.bookingId || "").toString();
        const takenId = (
          data.bookingId ||
          data._id ||
          data.id ||
          ""
        ).toString();

        // If the open modal is for this booking and it was taken by someone else
        const currentId = (localStorage.getItem("providerId") || "").toString();
        const takerId = (
          data.providerId?._id ||
          data.providerId ||
          ""
        ).toString();

        if (prevId === takenId && takerId && takerId !== currentId) {
          // Update status in current modal to accepted so user sees warning
          return { ...prev, status: "accepted", providerId: takerId };
        }
        return prev;
      });
    };

    const cleanups = [
      on("booking_taken", handleBookingTaken),
      on("booking_status_updated", refreshNotifications),
      on("notification_received", refreshNotifications),
    ];

    return () => cleanups.forEach((c) => c && typeof c === "function" && c());
  }, [on, refreshNotifications]);

  const soundOptions = [
    {
      id: "default",
      label: t("notifications.sounds.default"),
      url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    },
    {
      id: "chime",
      label: t("notifications.sounds.chime"),
      url: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
    },
    {
      id: "digital",
      label: t("notifications.sounds.digital"),
      url: "https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3",
    },
    {
      id: "retro",
      label: t("notifications.sounds.retro"),
      url: "https://assets.mixkit.co/active_storage/sfx/1041/1041-preview.mp3",
    },
  ];

  const handleUpdateSound = async (soundId) => {
    try {
      setIsUpdatingSound(true);
      await updateNotificationSound({ sound: soundId });
      setSelectedSound(soundId);
      localStorage.setItem("providerNotificationSound", soundId); // Immediate sync
      // Play for preview
      previewSound(soundOptions.find((s) => s.id === soundId).url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingSound(false);
    }
  };

  const previewSound = (url) => {
    const audio = new Audio(url);
    audio.play().catch((e) => console.log("Audio play blocked"));
  };

  const notifications =
    rawNotifications?.notifications || rawNotifications || [];
  const preferences =
    preferencesData?.preferences ||
    (preferencesData && !preferencesData.notifications ? preferencesData : {});

  useEffect(() => {
    if (preferences && Object.keys(preferences).length > 0) {
      localStorage.setItem(
        "providerNotificationPreferences",
        JSON.stringify(preferences),
      );
    }
  }, [preferences]);

  const filteredNotifications = notifications.filter((n) => {
    // If we have a type and that type is explicitly disabled in preferences, hide it
    if (n.type && preferences[n.type] === false) return false;
    return true;
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const {
    currentItems: currentNotifications,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination(filteredNotifications, 6);

  const refreshAll = () => {
    refreshNotifications();
    refreshPreferences();
  };

  const handleTogglePreference = async (type) => {
    try {
      const newPrefs = { ...preferences, [type]: !preferences[type] };
      await updateNotificationPreferences(newPrefs);
      setPreferences({ preferences: newPrefs });
      refreshNotifications(); // Refresh list in case of filtering
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => {
        const list = prev?.notifications || prev || [];
        const newList = list.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );
        return Array.isArray(prev)
          ? newList
          : { ...prev, notifications: newList };
      });

      // Update global header count
      window.dispatchEvent(new Event("refresh_unread_count"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => {
        const list = prev?.notifications || prev || [];
        const newList = list.map((notif) => ({ ...notif, isRead: true }));
        const updated = Array.isArray(prev)
          ? newList
          : { ...prev, notifications: newList };
        return updated;
      });
      window.dispatchEvent(new Event("refresh_unread_count"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm(t("notifications.delete_confirm"))) {
      try {
        await deleteAllNotifications();
        setNotifications([]); // Clear local state
        window.dispatchEvent(new Event("refresh_unread_count"));
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    }
  };

  // const handleNotificationClick = async (notif) => {
  //   if (!notif.isRead) {
  //     handleMarkRead(notif._id);
  //   }

  //   // Handle Bidding Notifications (Navigate to bidding pages)
  //   if (notif.type === "bidding_request") {
  //     navigate("/profile/marketplace");
  //     return;
  //   }

  //   if (notif.type === "new_bid" || notif.type === "bid_accepted") {
  //     navigate("/profile/my-bids");
  //     return;
  //   }

  //   // Handle Standard Booking Requests (Show Modal)
  //   if (notif.type === "booking_request" && notif.bookingId) {
  //     try {
  //       const bId = notif.bookingId._id || notif.bookingId;
  //       const res = await getBookingById(bId);
  //       const bookingData = res.data?.booking || res.data;

  //       // Final safety check: if it's a bidding service, don't show the accept/pass modal
  //       if (bookingData?.service?.category === "Biding Services" || bookingData?.category === "Biding Services") {
  //         navigate("/profile/my-bids");
  //       } else {
  //         setSelectedBooking(bookingData);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching booking for modal:", err);
  //     }
  //   } else if (notif.bookingId) {
  //     const bId = notif.bookingId._id || notif.bookingId;
  //     navigate(`/profile/job/${bId}`);
  //   }
  // };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await handleMarkRead(notif._id);
    }

    const notificationType = String(
      notif.type ||
        notif.notificationType ||
        notif.data?.type ||
        notif.data?.notificationType ||
        notif.data?.event ||
        "",
    )
      .trim()
      .toLowerCase();

    const notificationTitle = String(notif.title || "")
      .trim()
      .toLowerCase();

    const bookingId =
      notif.bookingId?._id ||
      notif.bookingId ||
      notif.data?.bookingId?._id ||
      notif.data?.bookingId ||
      null;

    const isChatNotification =
      notificationType.includes("chat") ||
      notificationType.includes("message") ||
      notificationType === "new_message" ||
      notificationType === "message_notification" ||
      Boolean(
        notif.chatId ||
        notif.messageId ||
        notif.conversationId ||
        notif.data?.chatId ||
        notif.data?.messageId ||
        notif.data?.conversationId,
      ) ||
      notificationTitle.includes("message") ||
      notificationTitle.includes("chat");

    // Har service ki chat notification direct chat section par jayegi
    if (isChatNotification && bookingId) {
      navigate(`/profile/job/${bookingId}`, {
        state: { scrollToChat: true },
      });
      return;
    }

    if (notificationType === "bidding_request") {
      navigate("/profile/marketplace");
      return;
    }

    if (notificationType === "new_bid" || notificationType === "bid_accepted") {
      navigate("/profile/my-bids");
      return;
    }

    // Sirf real booking request par Accept/Pass modal
    if (notificationType === "booking_request" && bookingId) {
      try {
        const res = await getBookingById(bookingId);
        const bookingData = res.data?.booking || res.data;

        setSelectedBooking(bookingData);
      } catch (err) {
        console.error("Error fetching booking for modal:", err);
      }

      return;
    }

    if (bookingId) {
      navigate(`/profile/job/${bookingId}`);
    }
  };

  const prefLabels = {
    booking_request: t("notifications.prefs.booking_request"),
    booking_accepted: t("notifications.prefs.booking_accepted"),
    payment_received: t("notifications.prefs.payment_received"),
    profile_verification: t("notifications.prefs.profile_verification"),
    customer_rating: t("notifications.prefs.customer_rating"),
    job_reminder: t("notifications.prefs.job_reminder"),
    payment_pending: t("notifications.prefs.payment_pending"),
    // feature_update: t('notifications.prefs.feature_update'),
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking_request":
        return { icon: Briefcase, color: "text-blue-600" };
      case "bidding_request":
        return { icon: Briefcase, color: "text-indigo-600" };
      case "new_bid":
        return { icon: AlertCircle, color: "text-amber-500" };
      case "booking_accepted":
        return { icon: CheckCircle, color: "text-green-600" };
      case "bid_accepted":
        return { icon: CheckCircle, color: "text-emerald-500" };
      default:
        return { icon: Bell, color: "text-gray-400" };
    }
  };

  if ((notificationsLoading || profileLoading) && !rawNotifications && !profile)
    return <LoadingSkeleton />;
  if (notificationsError && !rawNotifications)
    return <ErrorView message={notificationsError} onRetry={refreshAll} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Notifications | Skilled Ustaad" />

      <ProfileHeader
        title={t("notifications.title")}
        subtitle={t("notifications.subtitle")}
        onRefresh={refreshAll}
        loading={notificationsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Preferences */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-black dark:text-white flex items-center gap-2 mb-6 uppercase tracking-widest text-[10px] text-gray-400">
              <Settings className="w-4 h-4 text-blue-500" />
              {t("notifications.pref_controls")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              {Object.keys(prefLabels).map((key) => (
                <PreferenceToggle
                  key={key}
                  label={prefLabels[key]}
                  isEnabled={preferences[key]}
                  onToggle={() => handleTogglePreference(key)}
                  loading={prefLoading}
                />
              ))}
            </div>
          </div>

          {/* Sound Settings Card */}
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-black dark:text-white flex items-center gap-2 mb-6 uppercase tracking-widest text-[10px] text-gray-400">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              {t("notifications.alert_exp")}
            </h3>
            <div className="space-y-2">
              {soundOptions.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    if (selectedSound === sound.id) return;
                    setPendingSound(sound);
                    setIsSoundConfirmOpen(true);
                  }}
                  disabled={isUpdatingSound}
                  className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${
                    selectedSound === sound.id
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                      : "bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800 hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${selectedSound === sound.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-400"}`}
                    >
                      <Music size={14} />
                    </div>
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider ${selectedSound === sound.id ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"}`}
                    >
                      {sound.label}
                    </span>
                  </div>
                  {selectedSound === sound.id ? (
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg animate-pulse">
                      <Volume2 size={12} />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        previewSound(sound.url);
                      }}
                      className="p-1.5 hover:bg-white dark:hover:bg-gray-800 text-gray-400 rounded-lg transition-colors"
                    >
                      <Play size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Notification List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-black dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
                <Bell className="w-5 h-5 text-blue-500" />
                {t("notifications.recent_alerts")}
              </h3>

              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                {filteredNotifications.some((n) => !n.isRead) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-blue-100 dark:border-blue-800 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {t("notifications.mark_read")}
                  </button>
                )}

                {filteredNotifications.length > 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="px-3 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/30 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t("notifications.delete_all")}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow">
              {filteredNotifications.length > 0 ? (
                <div className="space-y-2">
                  {currentNotifications.map((notif) => {
                    const { icon, color } = getIcon(notif.type);
                    return (
                      <NotificationItem
                        key={notif._id}
                        icon={icon}
                        iconColor={color}
                        title={notif.title}
                        description={notif.message}
                        time={
                          notif.createdAt
                            ? new Date(notif.createdAt).toLocaleDateString()
                            : "Recent"
                        }
                        isRead={notif.isRead}
                        onRead={() => handleNotificationClick(notif)}
                      />
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title={t("notifications.all_caught_up")}
                  description={t("notifications.no_notifs")}
                  icon={BellOff}
                />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={prevPage}
                        className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm px-4 text-gray-500 font-bold">
                        {currentPage} / {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={`cursor-pointer ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingRequestModal
          isOpen={!!selectedBooking}
          onClose={() => {
            setSelectedBooking(null);
            refreshNotifications();
          }}
          booking={selectedBooking}
        />
      )}

      {/* Sound Confirm Modal */}
      <AnimatePresence>
        {isSoundConfirmOpen && pendingSound && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSoundConfirmOpen(false)}
              className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[3rem] p-8 shadow-2xl text-center overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center mx-auto mb-6">
                <Music size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                Change Alert Sound?
              </h3>
              <p className="text-gray-500 text-sm font-medium mb-8">
                Do you want to set your notification sound to{" "}
                <strong className="text-indigo-500">
                  {pendingSound.label}
                </strong>
                ?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsSoundConfirmOpen(false)}
                  className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsSoundConfirmOpen(false);
                    await handleUpdateSound(pendingSound.id);
                    setIsSoundSuccessOpen(true);
                    setTimeout(() => setIsSoundSuccessOpen(false), 2000);
                  }}
                  className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Yes, Change
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sound Success Modal */}
      <AnimatePresence>
        {isSoundSuccessOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-2xl flex items-center gap-4 border border-green-100 dark:border-green-900/30"
            >
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="font-black text-gray-900 dark:text-white leading-none mb-1 text-left">
                  Sound Saved!
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Your alert experience has been updated.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileNotifications;
