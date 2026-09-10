import React, { useState } from "react";
import { MessageSquare, Search, Filter, MessageCircle, ArrowRight, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getProviderJobs } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { usePagination } from "../hooks/usePagination";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import ProfileHeader from "../components/profile/ProfileHeader";
import { LoadingSkeleton, ErrorView, EmptyState } from "../components/common/StatusViews";
import { formatDate } from "../utils/formatters";

const ProfileChats = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: bookingsData, loading, error, refresh } = useFetch(getProviderJobs);
    const bookings = bookingsData?.bookings || [];

    // Get current provider ID safely
    const currentProviderId = (() => {
        const directId = localStorage.getItem("providerId");
        if (directId && directId !== "undefined") return directId;

        const providerDataStr = localStorage.getItem("providerData");
        if (providerDataStr && providerDataStr !== "undefined") {
            try {
                let providerData = JSON.parse(providerDataStr);
                if (providerData.provider) providerData = providerData.provider;
                return providerData._id || providerData.id;
            } catch (e) { return null; }
        }
        return null;
    })();

    // Filter for jobs that can have chats (Owned by this provider & Accepted/Active status)
    const chatableBookings = (bookingsData?.bookings || []).filter(job => {
        // 1. Ownership check: Must belong to this provider
        const jobProviderId = job.providerId?._id || job.providerId || job.provider?._id || job.provider;

        // Use consistent comparison
        const isMine = jobProviderId && currentProviderId && jobProviderId.toString() === currentProviderId.toString();
        if (!isMine) return false;

        // 2. Status check: Only allow chat for accepted, in-progress, or finalized jobs
        const canChat = ["accepted", "accepted_by_provider", "in-progress", "completed", "paid"].includes(job.status || "");

        // 3. Search check: Filter by customer name or service type
        const matchesSearch = (job.userId?.fullName || job.serviceType || "").toLowerCase().includes(searchTerm.toLowerCase());

        return canChat && matchesSearch;
    });

    const {
        currentItems: currentChats,
        currentPage,
        totalPages,
        nextPage,
        prevPage
    } = usePagination(chatableBookings, 8);

    if (loading && !bookingsData) return <LoadingSkeleton />;
    if (error && !bookingsData) return <ErrorView message={error} onRetry={refresh} />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <SEO title={t("chats.title", "Conversations") + " | " + t("common.welcome", "Skilled Ustaad")} />

            <ProfileHeader
                title={t("chats.title", "Conversations")}
                subtitle={t("chats.subtitle", "Chat with your customers about active and past bookings.")}
                onRefresh={refresh}
                loading={loading}
            />

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t("chats.search_placeholder", "Search for a customer name...")}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Chat List */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chatableBookings.length > 0 ? (
                    currentChats.map(job => (
                        <div
                            key={job._id}
                            onClick={() => navigate(`/profile/job/${job._id}`, { state: { scrollToChat: true } })}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center font-bold text-blue-600">
                                        {job.userId?.fullName?.charAt(0) || <User className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white">{job.userId?.fullName || t("chats.private_customer", "Private Customer")}</h3>
                                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{job.serviceType || t("chats.expert_service", "Expert Service")}</p>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${job.status === "completed" ? "bg-green-500" : "bg-emerald-500 animate-pulse"}`} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                                    <span>Assignment #{(job._id || '').toString().slice(-6).toUpperCase()}</span>
                                    <span>{formatDate(job.date, 'short')}</span>
                                </div>

                                <button className="w-full py-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                    <MessageSquare size={16} /> {t("chats.open_chat", "Open Chat")}
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full">
                        <EmptyState
                            title={t("chats.no_active", "No active chats")}
                            description={t("chats.active_desc", "Active conversations about your bookings will appear here.")}
                            icon={MessageCircle}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileChats;
