import React, { useState, useEffect, useRef } from "react";
import { StarFill } from "react-bootstrap-icons";
import SEO from "../components/SEO";
import { useSocket } from "../context/SocketContext";
import BookingRequestModal from "../components/BookingRequestModal";
import {
  getProviderProfile,
  getProviderDashboard,
  toggleProviderAvailability,
  getNotifications,
  api,
} from "../services/api";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Clock,
  ChevronRight,
  Wallet,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Gavel,
  Hammer,
  Banknote,
  Send,
  RefreshCcw,
  Crown,
  Lock,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  isSubscriptionActive,
  getSubscriptionRemainingDays,
} from "../utils/subscriptionUtils";
import SubscriptionModal from "../components/SubscriptionModal";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

// Refactor Foundation Imports
import { useFetch } from "../hooks/useFetch";
import { usePagination } from "../hooks/usePagination";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  LoadingSkeleton,
  ErrorView,
  EmptyState,
} from "../components/common/StatusViews";
import { StatCard, StatsGrid } from "../components/common/DashboardStats";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileImage from "../components/profile/ProfileImage";

const ProviderDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { on } = useSocket();
  const profilePhotoInputRef = useRef();

  // Unified Data Fetching
  const {
    data: profile,
    loading: profileLoading,
    refresh: refreshProfile,
    setData: setProfileData,
  } = useFetch(getProviderProfile, [], {
    immediate: true,
    pollingInterval: 30000,
  });

  // Sync Profile to LocalStorage to ensure Sidebar and other components stay updated
  useEffect(() => {
    if (profile?.provider) {
      localStorage.setItem("providerData", JSON.stringify(profile.provider));
      localStorage.setItem(
        "providerId",
        profile.provider._id || profile.provider.id || "",
      );
      // Trigger storage event for other components (like Sidebar) to re-render if needed
      window.dispatchEvent(new Event("storage"));
    }
  }, [profile]);

  const {
    data: dashboard,
    loading: dashLoading,
    error: dashError,
    refresh: refreshDash,
  } = useFetch(getProviderDashboard, [], {
    immediate: true,
    pollingInterval: 30000,
  });
  const { data: notifications, refresh: refreshNotifications } = useFetch(
    getNotifications,
    [],
    { immediate: true, pollingInterval: 30000 },
  );
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isToggling, setIsToggling] = useState(false);
  // const provider = profile?.provider;
  const provider =
    profile?.provider || {};
  const stats = dashboard?.stats;

  // Manual filter for recent jobs to ensure they belong to this provider
  const recentJobs = (dashboard?.recentJobs || []).filter((job) => {
    const jobProviderId =
      job.providerId?._id ||
      job.providerId ||
      job.provider?._id ||
      job.provider;
    return jobProviderId === provider?._id || !jobProviderId; // Keep if matches or if backend didn't include ID (trusting dashboard API)
  });

  // Unified Pagination
  const {
    currentItems: currentJobs,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination(recentJobs, 3);

const refreshAll = async () => {
  await Promise.all([
    refreshProfile(),
    refreshDash(),
    refreshNotifications(),
  ]);
};

  const { isConnected } = useSocket();

  useEffect(() => {
    // console.log("Dashboard Socket Connected:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    const handleNewBooking = (data) => {
      // console.log("Dashboard level: New booking request modal triggered", data);
      if (provider?.status !== "Active") return; // Ignore if not verified by admin
      setSelectedBooking(data);
    };

    const handleBookingTaken = (data) => {
      // console.log("Booking taken by another provider:", data);
      setSelectedBooking((prev) => {
        if (!prev) return null;

        // Final ID resolution for current user
        const currentId = (
          provider?._id ||
          localStorage.getItem("providerId") ||
          ""
        ).toString();

        const prevId = (prev._id || prev.id || prev.bookingId || "").toString();
        const takenId = (
          data._id ||
          data.id ||
          data.bookingId ||
          ""
        ).toString();
        const takerId = (
          data.providerId?._id ||
          data.providerId ||
          ""
        ).toString();

        // 1. IDs match AND
        // 2. The job was taken by someone ELSE (not me)
        if (
          prevId === takenId &&
          currentId &&
          takerId !== currentId
        ) {
          // Keep the modal open but mark it as taken so the "Already Accepted" banner shows
          return { ...prev, status: "accepted", providerId: data.providerId || "someone_else" };
        }
        return prev;
      });
      refreshAll();
    };

    const cleanups = [
      on("booking_request", handleNewBooking),
      on("booking_taken", handleBookingTaken),
      on("booking_status_updated", refreshAll),
      on("booking_cancelled", refreshAll),
      on("bid_accepted", refreshAll),
      on("bid_assigned", refreshAll),
      on("bid_rejected", refreshAll),
      on("notification_received", refreshNotifications),
    ];

    return () => cleanups.forEach((c) => c && typeof c === "function" && c());
  }, [on, provider]);

  const handleToggleAvailability = async () => {
    if (isToggling || !provider) return;

    const previousStatus = provider.isAvailable;
    const newStatus = !previousStatus;

    setIsToggling(true);

    // Optimistic Update
    if (setProfileData) {
      setProfileData((prev) => ({
        ...prev,
        provider: { ...prev.provider, isAvailable: newStatus },
      }));
    }

    try {
      const res = await toggleProviderAvailability({ isAvailable: newStatus });
      const confirmedStatus = res.data?.isAvailable ?? res.data?.provider?.isAvailable ?? newStatus;
      
      if (setProfileData) {
        setProfileData((prev) => ({
          ...prev,
          provider: { ...prev.provider, isAvailable: confirmedStatus },
        }));
      }
    } catch (err) {
      // Revert on error
      if (setProfileData) {
        setProfileData((prev) => ({
          ...prev,
          provider: { ...prev.provider, isAvailable: previousStatus },
        }));
      }
      console.error("Availability toggle error:", err);
      const errMsg = err?.response?.data?.error || "Failed to update availability. Please try again.";
      toast.error(errMsg);
    } finally {
      setIsToggling(false);
    }
  };

  const handlePhotoEdit = () => profilePhotoInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      await api.patch("/provider/profile-photo", formData);
      refreshProfile();
    } catch (err) {
      console.error("Photo upload error:", err);
    }
  };

  const [showSubModal, setShowSubModal] = useState(false);
  const hasActiveSub = isSubscriptionActive(provider);
  const remainingDays = getSubscriptionRemainingDays(provider);

  // ONLY show skeleton if we have NO data.
  // Background refreshes should not hide the whole UI.
  if ((dashLoading || profileLoading) && !dashboard && !profile)
    return <LoadingSkeleton />;
  if (dashError && !dashboard)
    return <ErrorView message={dashError} onRetry={refreshAll} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title="Provider Dashboard | Skilled Ustaad"
        description="Manage your bookings, track earnings, and update your profile."
      />

      <ProfileHeader
        title={`${t("dashboard.welcome")} ${provider?.fullName || provider?.full_name || "Provider"}`}
        subtitle={t("dashboard.tagline")}
        onRefresh={refreshAll}
        loading={dashLoading}
      />

      {/* Subscription Alert Banner */}
      {provider?.status === "Active" && (
        <div className={`mb-6 p-5 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-all ${
          hasActiveSub
            ? "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-blue-700 text-white"
            : "bg-gradient-to-r from-blue-600 to-black border-blue-500 text-white shadow-lg shadow-blue-500/20"
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${hasActiveSub ? "bg-blue-500/20 border border-blue-400/30 text-amber-300" : "bg-white/20 text-white"}`}>
              <Crown size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-black text-lg tracking-tight uppercase">
                  {hasActiveSub ? "Active Partner Subscription Pass" : "Subscription Required / Expired"}
                </h4>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  hasActiveSub ? "bg-emerald-500/30 border border-emerald-400/40 text-emerald-300" : "bg-white text-blue-700"
                }`}>
                  {hasActiveSub ? `${remainingDays} Days Remaining` : "Action Needed"}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5 max-w-2xl">
                {hasActiveSub
                  ? `Your subscription (${provider?.subscription?.planName || "Partner Pass"}) is active. You are eligible to receive and accept customer bookings.`
                  : "You are verified by admin, but you need an active Subscription Plan to accept customer booking requests and earn revenue."}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSubModal(true)}
            className={`w-full md:w-auto px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shrink-0 flex items-center justify-center gap-2 shadow-lg ${
              hasActiveSub
                ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                : "bg-white text-blue-700 hover:bg-blue-50 shadow-white/20"
            }`}
          >
            <Zap size={16} className={hasActiveSub ? "text-amber-300 fill-amber-300" : "text-blue-600 fill-blue-600"} />
            <span>{hasActiveSub ? "Subscription Active" : "Subscribe Now (₹99)"}</span>
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <StatsGrid>
        <StatCard
          title={t("dashboard.total_earnings")}
          value={stats?.totalEarnings}
          isCurrency
          icon={Wallet}
          colorClass="text-green-600"
        />
        <StatCard
          title={t("dashboard.completed_jobs")}
          value={stats?.completedJobs}
          icon={CheckCircle}
          colorClass="text-blue-600"
        />
        <StatCard
          title={t("dashboard.avg_rating")}
          value={typeof stats?.averageRating === "number" ? stats.averageRating.toFixed(1) : "0.0"}
          icon={Star}
          colorClass="text-yellow-500"
        />
        <StatCard
          title={t("dashboard.today_bookings")}
          value={stats?.todayBookings}
          icon={Calendar}
          colorClass="text-purple-600"
        />
      </StatsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <ProfileImage
                src={provider?.profilePhoto}
                onEdit={handlePhotoEdit}
              />
              <input
                type="file"
                ref={profilePhotoInputRef}
                className="hidden"
                onChange={handlePhotoChange}
                accept="image/*"
              />
              {/* <h2 className="mt-4 text-xl font-bold dark:text-white">
                {provider?.name}
              </h2> */}
              <h2 className="mt-3 text-xl font-bold dark:text-white">
                {provider?.fullName || provider?.full_name || "Provider Name"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                {provider?.serviceCategory}{" "}
                {provider?.providerSubService &&
                  `• ${provider?.providerSubService}`}
              </p>

              {/* Status Badge */}
              <div className="mb-4">
                {provider?.status === "Active" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                    <ShieldCheck size={14} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t("dashboard.verified")}
                    </span>
                  </div>
                ) : provider?.status === "Suspended" ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 rounded-full border border-rose-100 dark:border-rose-800/50 shadow-sm">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Suspended
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-800/50 shadow-sm">
                    <Clock size={14} className="animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t("dashboard.verification_pending")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full mb-6">
                <StarFill className="text-yellow-400 w-4 h-4" />
                <span className="font-bold text-blue-700 dark:text-blue-400">
                  {stats?.averageRating?.toFixed(1) || "0.0"}{" "}
                  {t("dashboard.rating")}
                </span>
              </div>

              <div className="flex flex-col w-full gap-3">
                <Button
                  onClick={() => navigate("/profile/jobs")}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl py-6"
                >
                  {t("dashboard.view_jobs")}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleToggleAvailability}
                  disabled={isToggling}
                  className={`w-full rounded-xl py-6 transition-all shadow-lg font-black uppercase tracking-widest ${provider?.isAvailable ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30" : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30"}`}
                >
                  {isToggling
                    ? "Syncing..."
                    : provider?.isAvailable
                      ? t("dashboard.online")
                      : t("dashboard.offline")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {t("dashboard.recent_history")}
              </h3>
            </div>

            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {currentJobs.map((job) => (
                  <div
                    key={job._id}
                    className="group border border-gray-50 dark:border-gray-700 p-4 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer"
                    onClick={() => {
                      // console.log("Navigating to job details. Job Object:", job);
                      navigate(`/profile/job/${job._id || job.id}`);
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 min-w-0 flex-1">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors shrink-0">
                          <Briefcase className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold dark:text-white capitalize truncate">
                            {job.serviceName || "Service"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(job.bookingDate, "short")}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap">
                              <Clock className="w-3 h-3 mr-1" />
                              {job.bookingTime}
                            </span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center italic truncate max-w-[200px]">
                              <MapPin className="w-3 h-3 mr-1 shrink-0" />
                              {job.houseNo && `${job.houseNo}, `}
                              {job.colony || job.city || "Location"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                          {formatCurrency(job.totalAmount)}
                        </p>
                        <span
                          className={`text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md mt-1 ${
                            job.bookingStatus === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : job.bookingStatus === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : job.bookingStatus === "accepted"
                                  ? "bg-blue-600 text-white dark:bg-blue-500 shadow-sm"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {job.bookingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Simplified Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={prevPage}
                            className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm px-4 text-gray-500">
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
            ) : (
              <EmptyState
                title={t("dashboard.no_recent_jobs")}
                description={t("dashboard.no_recent_desc")}
                icon={Briefcase}
              />
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <BookingRequestModal
          isOpen={!!selectedBooking}
          onClose={() => {
            setSelectedBooking(null);
            refreshAll();
          }}
          booking={selectedBooking}
        />
      )}

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSubscriptionSuccess={refreshAll}
      />
    </div>
  );
};

export default ProviderDashboard;
