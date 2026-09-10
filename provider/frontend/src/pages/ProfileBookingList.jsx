import React, { useState } from "react";
import {
  Briefcase,
  Search,
  Filter,
  List,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getProviderJobs } from "../services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";

// Refactor Foundation Imports
import { useFetch } from "../hooks/useFetch";
import { usePagination } from "../hooks/usePagination";
import ProfileHeader from "../components/profile/ProfileHeader";
import JobCard from "../components/profile/JobCard";
import {
  LoadingSkeleton,
  ErrorView,
  EmptyState,
} from "../components/common/StatusViews";
import JobCalendar from "../components/profile/JobCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const ProfileBookingList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const currentProviderId = (() => {
    const directId = localStorage.getItem("providerId");
    if (directId && directId !== "undefined") return directId;

    // Fallback B: Extract from providerData object
    const providerDataStr = localStorage.getItem("providerData");
    if (providerDataStr && providerDataStr !== "undefined") {
      try {
        let providerData = JSON.parse(providerDataStr);
        if (providerData.provider) providerData = providerData.provider;
        return providerData._id || providerData.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  })();

  // Data Fetching
  const {
    data: bookingsData,
    loading,
    error,
    refresh,
  } = useFetch(getProviderJobs);

  // Get current provider ID safely
  // const currentProviderId = localStorage.getItem("providerId"); // Moved this line up

  const rawBookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.bookings || bookingsData?.data || []);
  const bookings = rawBookings.filter((job) => {
    // Ensure the job belongs to this provider
    const jobProviderId =
      job.providerId?._id ||
      job.providerId ||
      job.provider?._id ||
      job.provider;

    // If it equals current provider, show it
    if (
      jobProviderId &&
      currentProviderId &&
      jobProviderId.toString() === currentProviderId.toString()
    ) {
      return true;
    }

    // If the job is assigned to NO ONE but it's in the list (already filtered by backend for city/skill)
    // and we are on the "My Jobs" list, maybe we should show it if it's pending?
    // Optimization: The backend getProviderJobs already returns what's relevant.
    // Let's only filter out jobs assigned to OTHER people.
    // Simplify the manual filtering logic to be more inclusive:
    // If jobProviderId is null/undefined, it means it's not assigned to anyone yet,
    // but it's still a potential job for this provider if it came from getProviderJobs.
    // So, if it's not explicitly assigned to someone else, include it.
    if (!jobProviderId) return true;

    return false;
  });

  // Filtered Data (Search & Status)
  const filteredBookings = bookings.filter((job) => {
    const matchesSearch =
      (job.serviceType || job.service || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (job._id || "").toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "pending") {
      matchesStatus = job.status === "pending" || job.status === "accepted";
    } else if (statusFilter === "completed") {
      matchesStatus = job.status === "completed" || job.status === "paid";
    } else {
      matchesStatus = job.status === statusFilter;
    }
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    currentItems: currentJobs,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
  } = usePagination(filteredBookings, 5);

  if (loading && !bookingsData) return <LoadingSkeleton />;
  if (error && !bookingsData) return <ErrorView message={error} onRetry={refresh} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {" "}
      <SEO title="My Jobs | Skilled Ustaad" />
     <div
        className={`transition-all duration-300 ${
          viewMode === "calendar" ? "flex justify-start pl-12" : ""
        }`}
      >
        <ProfileHeader
          title={t("jobs.title")}
          subtitle={t("jobs.subtitle")}
          onRefresh={() => refresh()}
          loading={loading}
        />
      </div>
      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("jobs.search_placeholder")}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow sm:flex-none">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                className="w-full sm:w-auto pl-11 pr-8 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer dark:text-white sm:min-w-[160px] shadow-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t("jobs.all_status")}</option>
                <option value="pending">{t("jobs.status.accepted")}</option>
                <option value="in-progress">
                  {t("jobs.status.in_progress")}
                </option>
                <option value="completed">{t("jobs.status.completed")}</option>
                <option value="cancelled">{t("jobs.status.cancelled")}</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
            {/* View Toggle */}
            <div className="flex bg-gray-100/50 dark:bg-gray-700/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-full sm:w-fit shadow-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-[0.2em] ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
              >
                <List size={14} />
                <span>{t("jobs.list_view")}</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-[0.2em] ${viewMode === "calendar" ? "bg-white dark:bg-gray-600 shadow-md text-blue-600 dark:text-blue-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}`}
              >
                <CalendarIcon size={14} />
                <span>{t("jobs.calendar_view")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredBookings.length > 0 ? (
              <>
                {currentJobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    onClick={() => navigate(`/profile/job/${job._id}`)}
                  />
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={prevPage}
                            className={`cursor-pointer ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm px-4 text-gray-500 font-bold whitespace-nowrap">
                            {t("common.page")} {currentPage} {t("common.of")}{" "}
                            {totalPages}
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
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 transition-all">
                <EmptyState
                  title={
                    searchTerm || statusFilter !== "all"
                      ? t("jobs.no_matches")
                      : t("jobs.no_jobs")
                  }
                  description={
                    searchTerm || statusFilter !== "all"
                      ? t("jobs.no_matches_desc")
                      : t("jobs.no_jobs_desc")
                  }
                  icon={Briefcase}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mt-6">
              <JobCalendar
                bookings={filteredBookings}
                onJobClick={(job) => navigate(`/profile/job/${job._id}`)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileBookingList;
