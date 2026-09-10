import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import AssignmentVerifyModal from "../components/AssignmentVerifyModal";
import BookingChat from "../components/common/BookingChat";
import BidDetailsModal from "../components/BidDetailsModal";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  DirectionsRenderer,
} from "@react-google-maps/api";
import {
  MapPin,
  Phone,
  User,
  Clock,
  Calendar,
  Navigation,
  IndianRupee,
  Activity,
  Inbox,
  Info,
  ChevronRight,
  CheckCircle,
  Loader2,
  Shield,
  Zap,
  Gavel,
} from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { api, getBookingById, getProviderBids } from "../services/api";
import { formatDate, formatCurrency } from "../utils/formatters";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "../utils/errors";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 22.5726, // Kolkata default
  lng: 88.3639,
};

const getFormattedEstimateTime = (timeStr, durationMinutes) => {
  if (!timeStr) return "--:--";
  
  const normalized = timeStr.trim().toLowerCase();
  if (normalized === "immediate") {
    return "--:--";
  }

  try {
    // Regex to match "10:00 AM", "10:00AM", "14:30", "2:30 PM", "10:00", etc.
    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);
    if (!match) {
      const parts = timeStr.split(":");
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m)) {
          const date = new Date();
          date.setHours(h, m + durationMinutes, 0, 0);
          if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
      }
      return "--:--";
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3];

    if (ampm) {
      const isPm = ampm.toLowerCase() === "pm";
      const isAm = ampm.toLowerCase() === "am";
      if (isPm && hours < 12) hours += 12;
      if (isAm && hours === 12) hours = 0;
    }

    if (isNaN(hours) || isNaN(minutes)) return "--:--";

    const date = new Date();
    date.setHours(hours, minutes + durationMinutes, 0, 0);
    
    if (isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    console.error("Error parsing estimate time:", e);
    return "--:--";
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ProviderBookingDetails() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToChat = location.state?.scrollToChat || false;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { socket, isConnected, emit, on } = useSocket();
  const [providerLoc, setProviderLoc] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
    libraries: ["places", "geometry", "drawing"],
  });

  // States for actions
  const [isPaymentReceived, setIsPaymentReceived] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isWorkDone, setIsWorkDone] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);
  const [showBidDetailsModal, setShowBidDetailsModal] = useState(false);
  const [fullBidData, setFullBidData] = useState(null);
  const [bidDetailsLoading, setBidDetailsLoading] = useState(false);
  const providerData = JSON.parse(localStorage.getItem("providerData") || "{}");

  const checkServiceCategoryHideMap = (cat) => {
    if (!cat) return false;
    const normalized = cat.trim().toLowerCase();
    return [
      "bidding services",
      "biding services",
      "digital services",
      "digital work",
      "digital works",
      "web development",
    ].includes(normalized);
  };

  const isBiddingProvider =
    checkServiceCategoryHideMap(providerData?.serviceCategory) ||
    checkServiceCategoryHideMap(providerData?.provider?.serviceCategory) ||
    checkServiceCategoryHideMap(booking?.provider?.serviceCategory) ||
    checkServiceCategoryHideMap(booking?.providerId?.serviceCategory);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // const res = await getBookingDetails(id);
      const res = await getBookingById(id);
      const data = res.data;
      const actualBooking = data.booking || data;

      let providerData = data.providerId || null;
      if (!providerData) {
        try {
          const localData = localStorage.getItem("providerData");
          if (localData) {
            providerData = JSON.parse(localData);
            if (providerData.provider) providerData = providerData.provider;
          }
        } catch (e) {
          console.error("Could not parse provider data from localStorage", e);
        }
      }

      const isFullyPaid = data.status === "completed" || data.status === "paid";

      // Prioritize actual payment summary from backend if available
      const actualPaymentSummary = data.paymentSummary
        ? {
            ...data.paymentSummary,
            paidAmount: data.paymentSummary.paidAmount !== undefined
              ? data.paymentSummary.paidAmount
              : (data.paymentSummary.tokenPaid || 0),
          }
        : {
            totalAmount: data.price || data.booking?.price || 0,
            paidAmount: data.paidAmount || 0,
            remainingAmount: isFullyPaid
              ? 0
              : Math.max(
                  0,
                  (data.price || data.booking?.price || 0) - (data.paidAmount || 0),
                ),
            settlementProgress: isFullyPaid
              ? 100
              : data.status === "settling"
                ? 85
                : 0,
            paymentStatus: isFullyPaid ? "completed" : "pending",
          };

      setBooking(
        data.booking
          ? { ...data, paymentSummary: actualPaymentSummary }
          : {
              booking: data,
              provider: providerData,
              paymentSummary: actualPaymentSummary,
            },
      );

      setIsWorkDone(
        actualBooking?.status === "completed" ||
          actualBooking?.status === "paid" ||
          actualBooking?.status === "settling",
      );
      setIsPaymentReceived(
        actualBooking?.status === "paid" ||
          actualBooking?.status === "completed",
      );
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError(
        err.response?.status === 404
          ? t("job_details.error", "Assignment details not found (404).")
          : t("job_details.error", "Failed to load booking details: ") +
              (err.response?.data?.message ||
                err.response?.data?.error ||
                "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  // 1. FETCH BOOKING DETAILS
  useEffect(() => {
    if (location.state?.updatedBooking) {
      const data = location.state.updatedBooking;
      const actualBooking = data.booking || data;

      setBooking(
        data.booking
          ? data
          : { booking: data, paymentSummary: data.paymentSummary },
      );
      setIsWorkDone(
        actualBooking?.status === "completed" ||
          actualBooking?.status === "paid" ||
          actualBooking?.status === "settling",
      );
      setIsPaymentReceived(
        actualBooking?.status === "paid" ||
          actualBooking?.status === "completed",
      );
      setLoading(false);

      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, updatedBooking: null },
      });

      if (location.state.refresh) {
        fetchDetails();
      }
    } else {
      fetchDetails();
    }
  }, [id, location.state]);

  // Handle auto-scroll to chat if requested
  useEffect(() => {
    if (!loading && scrollToChat && booking) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }, 500);
    }
  }, [loading, scrollToChat, booking]);

  // 2. REAL-TIME LOCATION TRACKING & SOCKET SYNC
  useEffect(() => {
    if (!id || !isConnected) return;

    emit("join_booking", id);

    const handleUpdate = () => {
      fetchDetails();
    };

    on("booking_update", handleUpdate);
    on("payment_received", handleUpdate); // Refresh when token/full payment received

    let watchId;
    if (!isBiddingProvider && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setProviderLoc(newPos);

          emit("update_provider_location", {
            bookingId: id,
            latitude: newPos.lat,
            longitude: newPos.lng,
          });
        },
        (err) => console.warn("Geolocation watch error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      emit("leave_booking", id);
    };
  }, [id, emit, on, isConnected, isBiddingProvider]);

  // CALCULATE DIRECTIONS (Live Road Updates)
  useEffect(() => {
    const getCustomerCoords = () => {
      if (!booking?.booking) return null;
      const b = booking.booking;

      if (b.latitude && b.longitude)
        return { lat: Number(b.latitude), lng: Number(b.longitude) };
      if (b.lat && b.lng) return { lat: Number(b.lat), lng: Number(b.lng) };
      if (b.location?.coordinates && b.location.coordinates.length >= 2) {
        return {
          lat: b.location.coordinates[1],
          lng: b.location.coordinates[0],
        };
      }
      return defaultCenter;
    };

    const customerCoords = getCustomerCoords();

    if (isLoaded && providerLoc && customerCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: providerLoc,
          destination: customerCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            setDistance(result.routes[0].legs[0].distance.text);
            setDuration(result.routes[0].legs[0].duration.text);
          } else {
            console.error(`Directions request failed: ${status}`);
          }
        },
      );
    }
  }, [isLoaded, providerLoc, booking]);

  const handleFinishWork = async () => {
    if (!booking) return;

    const previousBooking = { ...booking };
    const previousIsWorkDone = isWorkDone;

    try {
      const updatedBooking = JSON.parse(JSON.stringify(booking));
      if (updatedBooking.booking)
        updatedBooking.booking.status = "work-finished";
      else updatedBooking.status = "work-finished";

      setBooking(updatedBooking);
      setIsWorkDone(true);
      resetSlider();

      await api.post("/booking/finish-work", { bookingId: id });
      toast.success(
        t(
          "job_details.toast_finish_work",
          "Assignment session finished. Waiting for customer verification.",
        ),
      );

      fetchDetails();
    } catch (err) {
      setBooking(previousBooking);
      setIsWorkDone(previousIsWorkDone);
      resetSlider();
      toast.error(
        getFriendlyErrorMessage(
          err,
          t(
            "job_details.toast_finish_fail",
            "Failed to mark session as finished. Please try again.",
          ),
        ),
      );
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (!booking) return;

    const previousBooking = { ...booking };
    const { booking: b } = booking;

    try {
      const isStarting = b.status === "accepted" || b.status === "paid";
      const endpoint = isStarting
        ? "/booking/start-booking"
        : "/booking/complete-booking";

      const updatedBooking = JSON.parse(JSON.stringify(booking));
      const newStatus = isStarting ? "in-progress" : "settling";

      if (updatedBooking.booking) updatedBooking.booking.status = newStatus;
      else updatedBooking.status = newStatus;

      setBooking(updatedBooking);
      setShowOtpModal(false);
      resetSlider();

      await api.post(endpoint, { bookingId: id, otp });
      toast.success(
        isStarting
          ? t(
              "job_details.toast_start_success",
              "OTP Verified! Start your assignment now.",
            )
          : t(
              "job_details.toast_complete_success",
              "OTP Verified! Service officially completed.",
            ),
      );

      fetchDetails();
    } catch (err) {
      setBooking(previousBooking);
      setShowOtpModal(false);
      resetSlider();
      toast.error(
        getFriendlyErrorMessage(
          err,
          t(
            "job_details.toast_otp_fail",
            "OTP Verification failed. Please check the code and try again.",
          ),
        ),
      );
    }
  };

  const handleFinalSettlement = async () => {
    try {
      await api.post("/booking/settle-payment", { bookingId: id });
      fetchDetails();
      resetSlider();
    } catch (err) {
      toast.error(
        getFriendlyErrorMessage(
          err,
          t(
            "job_details.toast_settle_fail",
            "Payment settlement failed. Please try again in 1-2 minutes.",
          ),
        ),
      );
      resetSlider();
    }
  };

  const handleUpdateEstimate = async (mins) => {
    try {
      setLoading(true);
      await api.put("/provider/booking/estimate", {
        bookingId: id,
        duration: mins,
      });
      toast.success(
        t(
          "job_details.toast_estimate_success",
          "Schedule updated successfully!",
        ),
      );
      fetchDetails();
    } catch (err) {
      toast.error(
        getFriendlyErrorMessage(
          err,
          t("job_details.toast_estimate_fail", "Failed to update estimate."),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidDetails = async () => {
    try {
      setBidDetailsLoading(true);

      const response = await getProviderBids();
      const providerBids = response.data?.bids || response.bids || [];

      const acceptedBidId =
        acceptedBidData?._id ||
        acceptedBidData?.id ||
        b?.acceptedBidId?._id ||
        b?.acceptedBidId ||
        b?.bidId?._id ||
        b?.bidId;

      const matchedBid = providerBids.find((bid) => {
        const currentBidId = bid?._id || bid?.id;

        const currentRequestId =
          bid?.requestId?._id ||
          bid?.requestId ||
          bid?.biddingRequestId?._id ||
          bid?.biddingRequestId;

        return (
          (acceptedBidId &&
            currentBidId?.toString() === acceptedBidId?.toString()) ||
          (bidRequestId &&
            currentRequestId?.toString() === bidRequestId?.toString() &&
            bid.status === "accepted")
        );
      });

      if (matchedBid) {
        setFullBidData(matchedBid);
      } else {
        setFullBidData(modalBidData);
        toast.info("Complete bid proposal was not found.");
      }

      setShowBidDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch complete bid details:", error);

      setFullBidData(modalBidData);
      setShowBidDetailsModal(true);
    } finally {
      setBidDetailsLoading(false);
    }
  };

  const resetSlider = () => {
    setSliderPosition(0);
    setSliderKey((prev) => prev + 1);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 },
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
          <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">
            {t("job_details.fetching", "Fetching Assignment Details...")}
          </p>
        </div>
      </div>
    );

  if (error || !booking)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl w-fit mx-auto mb-4">
            <Info className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold dark:text-white mb-2">
            {t("job_details.error", "Error")}
          </h2>
          <p className="text-slate-500 mb-6">{error || "Booking not found"}</p>
          <button
            onClick={() => navigate("/profile/jobs")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold"
          >
            {t("job_details.go_back", "Go Back")}
          </button>
        </div>
      </div>
    );

  const { booking: b, provider: p, paymentSummary: pay } = booking;
  const customer = b.customer || b.userId || {};

  // Restrict access if booking is pending (not confirmed / payment not done)
  if (b.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-gray-950 p-4">
        <div className="text-center p-8 max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-3xl w-fit mx-auto mb-6">
            <Shield className="text-amber-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            {t("job_details.pending_title", "Action Required")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            {t("job_details.pending_desc", "This booking is currently pending. Details will be unlocked once the customer confirms the booking and completes the initial payment.")}
          </p>
          <button
            onClick={() => navigate("/profile/jobs")}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            {t("job_details.go_back_jobs", "Back to Jobs")}
          </button>
        </div>
      </div>
    );
  }


  const bidRequestId =
    b?.biddingRequest?._id ||
    b?.biddingRequest ||
    b?.biddingRequestId?._id ||
    b?.biddingRequestId ||
    b?.requestId?._id ||
    b?.requestId ||
    b?.service?.requestId?._id ||
    b?.service?.requestId ||
    booking?.biddingRequest?._id ||
    booking?.biddingRequest ||
    booking?.biddingRequestId?._id ||
    booking?.biddingRequestId ||
    booking?.requestId?._id ||
    booking?.requestId ||
    booking?.service?.requestId?._id ||
    booking?.service?.requestId ||
    location.state?.bidRequestId ||
    null;

  const acceptedBidData =
    b?.acceptedBid ||
    b?.selectedBid ||
    b?.bid ||
    booking?.acceptedBid ||
    booking?.selectedBid ||
    booking?.bid ||
    {};

  const biddingRequestData =
    typeof b?.biddingRequest === "object"
      ? b.biddingRequest
      : typeof b?.biddingRequestId === "object"
        ? b.biddingRequestId
        : typeof b?.requestId === "object"
          ? b.requestId
          : typeof b?.service?.requestId === "object"
            ? b.service.requestId
            : null;

  const modalBidData = {
    ...acceptedBidData,

    _id: acceptedBidData?._id || acceptedBidData?.id || b?._id,

    amount:
      acceptedBidData?.amount ||
      acceptedBidData?.bidAmount ||
      b?.bidAmount ||
      b?.price ||
      pay?.totalAmount ||
      0,

    proposal:
      acceptedBidData?.proposal ||
      acceptedBidData?.message ||
      b?.proposal ||
      b?.description ||
      "",

    message: acceptedBidData?.message || b?.message || "",

    estimatedDuration:
      acceptedBidData?.estimatedDuration || b?.estimatedDuration || "",

    status: acceptedBidData?.status || "accepted",

    requestId: biddingRequestData || {
      _id: bidRequestId,
      subService: b?.serviceType || "Expert Solution",
      category: b?.category || "Digital Work",
      description: b?.description || "",
      budget: b?.budget || b?.price || pay?.totalAmount || 0,
      deadline: b?.deadline || b?.date,
      createdAt: b?.createdAt,
    },
  };

  const customerLoc =
    b.latitude && b.longitude
      ? { lat: Number(b.latitude), lng: Number(b.longitude) }
      : b.lat && b.lng
        ? { lat: Number(b.lat), lng: Number(b.lng) }
        : b.location?.coordinates && b.location.coordinates.length >= 2
          ? { lat: b.location.coordinates[1], lng: b.location.coordinates[0] }
          : defaultCenter;

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900 ${
        isDark ? "bg-gray-950 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <motion.button
        whileHover={{ x: -4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/profile/jobs")}
        className={`group mb-3 flex items-center justify-center w-14 h-14 rounded-2xl border backdrop-blur-xl transition-all duration-300
  ${
    isDark
      ? "bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-indigo-500/30"
      : "bg-white/90 border-slate-200 text-slate-700 hover:bg-white hover:border-indigo-300"
  }
  shadow-xl shadow-black/5`}
      >
        <ArrowLeft
          size={20}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />
      </motion.button>

      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-10">
        <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="flex-grow pb-24 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto px-4 pt-1"
        >
          {/* ================= MAP SECTION ================= */}
          {(() => {
            if (isBiddingProvider) return null;

            return (
              <div className="w-full mb-8">
                <div
                  className={`rounded-[2rem] overflow-hidden shadow-2xl border ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-white bg-white"
                  } transition-shadow duration-500 hover:shadow-indigo-500/10`}
                >
                  <div className="h-[450px] relative bg-gray-100 dark:bg-gray-800">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={customerLoc}
                        zoom={13}
                        options={{
                          styles: isDark
                            ? [
                                {
                                  elementType: "geometry",
                                  stylers: [{ color: "#242f3e" }],
                                },
                                {
                                  elementType: "labels.text.stroke",
                                  stylers: [{ color: "#242f3e" }],
                                },
                                {
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#746855" }],
                                },
                                {
                                  featureType: "administrative.locality",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#d59563" }],
                                },
                                {
                                  featureType: "poi",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#d59563" }],
                                },
                                {
                                  featureType: "poi.park",
                                  elementType: "geometry",
                                  stylers: [{ color: "#263c3f" }],
                                },
                                {
                                  featureType: "poi.park",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#6b9a76" }],
                                },
                                {
                                  featureType: "road",
                                  elementType: "geometry",
                                  stylers: [{ color: "#38414e" }],
                                },
                                {
                                  featureType: "road",
                                  elementType: "geometry.stroke",
                                  stylers: [{ color: "#212a37" }],
                                },
                                {
                                  featureType: "road",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#9ca5b3" }],
                                },
                                {
                                  featureType: "road.highway",
                                  elementType: "geometry",
                                  stylers: [{ color: "#746855" }],
                                },
                                {
                                  featureType: "road.highway",
                                  elementType: "geometry.stroke",
                                  stylers: [{ color: "#1f2835" }],
                                },
                                {
                                  featureType: "road.highway",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#f3d19c" }],
                                },
                                {
                                  featureType: "transit",
                                  elementType: "geometry",
                                  stylers: [{ color: "#2f3948" }],
                                },
                                {
                                  featureType: "transit.station",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#d59563" }],
                                },
                                {
                                  featureType: "water",
                                  elementType: "geometry",
                                  stylers: [{ color: "#17263c" }],
                                },
                                {
                                  featureType: "water",
                                  elementType: "labels.text.fill",
                                  stylers: [{ color: "#515c6d" }],
                                },
                                {
                                  featureType: "water",
                                  elementType: "labels.text.stroke",
                                  stylers: [{ color: "#17263c" }],
                                },
                              ]
                            : [],
                          disableDefaultUI: false,
                          zoomControl: true,
                        }}
                      >
                        {/* Directions / Route */}
                        {directions && (
                          <DirectionsRenderer
                            directions={directions}
                            options={{
                              suppressMarkers: true,
                              polylineOptions: {
                                strokeColor: "#6366f1",
                                strokeWeight: 6,
                                strokeOpacity: 0.8,
                              },
                            }}
                          />
                        )}

                        {/* Customer Marker */}
                        <Marker
                          position={customerLoc}
                          title={t(
                            "job_details.customer_details",
                            "Customer Location",
                          )}
                          icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        />

                        {/* Provider Marker */}
                        {providerLoc && (
                          <Marker
                            position={providerLoc}
                            title="Your Location"
                            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-indigo-500" />
                      </div>
                    )}

                    {/* Floating Legend */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold uppercase tracking-tight dark:text-gray-300">
                          {t(
                            "job_details.customer_details",
                            "Customer Location",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-tight dark:text-gray-300">
                          {t("job_details.provider_info", "Your Location")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center p-6 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg">
                        {/* <Activity size={18} className="text-indigo-600" /> */}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-widest">
                          {t("job_details.live_status", "Live Status")}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
                          {b.status === "in-progress" ||
                          b.status === "work-finished" ||
                          b.status === "settling"
                            ? t(
                                "job_details.arrived_message",
                                "You have arrived at the customer's location.",
                              )
                            : duration && distance
                              ? `${distance} away • ETA: ${duration}`
                              : `${t("job_details.calculated_path", "Calculated path between you and")} ${customer.fullName || "Customer"}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${customerLoc.lat},${customerLoc.lng}`,
                          "_blank",
                        )
                      }
                      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-black/5 uppercase text-xs"
                    >
                      <Navigation size={18} />
                      {t("job_details.live_status", "Get Live Directions")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Details Section */}
          {isBiddingProvider ? (
            <motion.div
              variants={itemVariants}
              className={`mt-10 rounded-[3rem] p-8 sm:p-12 border transition-all relative overflow-hidden group ${
                isDark
                  ? "bg-slate-900 border-slate-800 shadow-2xl shadow-indigo-500/5"
                  : "bg-white border-slate-100 shadow-xl shadow-slate-200/40"
              }`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700" />

              {/* Top Action Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-5">
                  {/* <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
                    <Zap size={22} />
                  </div> */}
                  <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-tight italic">
                      {t("job_details.job_unified_view", "Job Unified View")}
                    </h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                      {t(
                        "job_details.intelligence",
                        "Provider & Customer Intelligence",
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={bidDetailsLoading}
                  onClick={() => {
                    if (!bidRequestId) {
                      toast.error("Bid details not found for this booking.");
                      return;
                    }

                    handleOpenBidDetails();
                  }}
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:active:scale-100 text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 border border-indigo-500/20"
                >
                  <Gavel size={18} />
                  {bidDetailsLoading
                    ? "Loading Bid..."
                    : t("job_details.go_to_bid", "Go to Bid Detail")}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
                {/* Left Column: Customer Details */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
                      {t("job_details.customer_identity", "Customer Identity")}
                    </h3>
                  </div>

                  <div className="space-y-8 flex flex-col h-full">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] uppercase font-black text-slate-400 mb-2 tracking-widest pl-1">
                        {t(
                          "job_details.primary_requester",
                          "Primary Requester",
                        )}
                      </p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight italic leading-none truncate">
                        {customer.fullName ||
                          t("chats.private_customer", "Private Customer")}
                      </p>
                    </div>

                    <div className="space-y-6 pt-4">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest pl-4">
                        {t(
                          "job_details.instant_communication",
                          "Instant Communication",
                        )}
                      </p>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (customer?.phoneNumber) {
                            window.location.href = `tel:${customer.phoneNumber}`;
                          } else {
                            toast.error(
                              "Contact information is currently unavailable.",
                            );
                          }
                        }}
                        className="w-full py-6 rounded-[1.8rem] font-black bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-4 transition-all active:scale-[0.98] uppercase text-sm shadow-2xl shadow-green-500/30 border border-green-400/20"
                      >
                        <Phone size={20} />{" "}
                        {t(
                          "job_details.call_customer",
                          "Call Customer Directly",
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Provider Assignment */}
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                      <Shield size={20} className="text-amber-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">
                      {t(
                        "job_details.assignment_protocol",
                        "Assignment Protocol",
                      )}
                    </h3>
                  </div>

                  <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 h-full">
                    <div className="grid grid-cols-2 gap-y-8 gap-x-6">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">
                          {t("job_details.assigned_expert", "Assigned Expert")}
                        </p>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight italic truncate">
                          {p?.fullName || p?.name || "Verified Expert"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">
                          {t("job_details.internal_id", "Internal ID")}
                        </p>
                        <p className="font-black text-indigo-600 text-[10px] tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg inline-block border border-indigo-100 dark:border-indigo-800/50">
                          #
                          {(b._id || b.id || "")
                            .toString()
                            .slice(-8)
                            .toUpperCase()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">
                          {t(
                            "job_details.deployment_stream",
                            "Deployment Stream",
                          )}
                        </p>
                        <p className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[11px] tracking-tight truncate max-w-[180px]" title={b.serviceType || "Expert Solution"}>
                          {b.serviceType || "Expert Solution"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">
                          {t("job_details.scheduled_for", "Scheduled For")}
                        </p>
                        <p className="font-black text-slate-700 dark:text-slate-200 text-sm tracking-tighter italic">
                          {formatDate(b.date, "full")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest">
                          {t("job_details.live_status", "Live Status")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${b.status === "completed" ? "bg-green-500" : "bg-blue-500 animate-pulse"}`}
                          />
                          <p className="font-black text-indigo-600 uppercase text-[11px] tracking-[0.1em]">
                            {b.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`mt-8 grid md:grid-cols-2 gap-8`}>
              {/* Customer Details */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`rounded-[2rem] p-8 border shadow-xl transition-all relative overflow-hidden group flex flex-col h-full ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200 shadow-slate-200/40"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                    <User size={22} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">
                    {t("job_details.customer_details", "Customer Details")}
                  </h2>
                </div>
                <div className="flex flex-col flex-1 space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                      {t("job_details.customer_name", "Customer Name")}
                    </p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {customer.fullName ||
                        t("chats.private_customer", "Private Customer")}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="text-slate-400" />
                      <p className="text-[10px] uppercase font-black text-slate-400">
                        {t("job_details.service_address", "Service Address")}
                      </p>
                    </div>
                    {(() => {
                      const addrStr = b.address || "Fetching address...";

                      let houseNo =
                        b.houseNo ||
                        customer?.address?.houseNo ||
                        "Not Specified";
                      let colony =
                        b.colony ||
                        customer?.address?.colony ||
                        "Not Specified";
                      let landmark =
                        b.landMark || customer?.address?.landMark || null;

                      let city = b.city || "Not Specified";
                      let state = b.state || "Not Specified";
                      let pincode =
                        b.pincode ||
                        customer?.address?.pincode ||
                        "Not Specified";

                      if (typeof addrStr === "object") {
                        houseNo =
                          addrStr.houseNumber ||
                          addrStr.houseNo ||
                          "Not Specified";
                        colony =
                          addrStr.colony || addrStr.street || "Not Specified";

                        city = addrStr.city || city;
                        state = addrStr.state || state;
                        pincode =
                          addrStr.pincode || addrStr.pinCode || "Not Specified";
                      } else if (
                        typeof addrStr === "string" &&
                        addrStr.trim() !== "" &&
                        addrStr !== "Fetching address..."
                      ) {
                        const parts = addrStr.split(",").map((s) => s.trim());

                        const firstPart = parts[0];
                        if (
                          firstPart &&
                          (/^\d+/.test(firstPart) ||
                            /^(house|h\.?no|block|apt|apartment)/i.test(
                              firstPart,
                            ))
                        ) {
                          houseNo = firstPart;
                          parts.shift();
                        }

                        if (parts.length >= 3) {
                          colony = parts
                            .slice(0, Math.max(1, parts.length - 3))
                            .join(", ");
                          const possibleCity = parts[parts.length - 3];
                          if (possibleCity && !b.city) city = possibleCity;

                          const statePin = parts[parts.length - 2];
                          if (statePin) {
                            const spMatch = statePin.match(
                              /^([a-zA-Z\s]+)\s*(\d+)$/,
                            );
                            if (spMatch) {
                              if (!b.state) state = spMatch[1].trim();
                              pincode = spMatch[2];
                            } else {
                              if (!b.state) state = statePin;
                              const anyPin = addrStr.match(/\b\d{6}\b/);
                              if (anyPin) pincode = anyPin[0];
                            }
                          } else {
                            const anyPin = addrStr.match(/\b\d{6}\b/);
                            if (anyPin) pincode = anyPin[0];
                          }
                        } else {
                          colony = parts.join(", ") || addrStr;
                          const anyPin = addrStr.match(/\b\d{6}\b/);
                          if (anyPin) pincode = anyPin[0];
                        }
                      }

                      return (
                        <div className="grid grid-cols-2 gap-4 mt-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          {!isBiddingProvider && (
                            <>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  {t(
                                    "job_details.house_no",
                                    "House No / Apartment",
                                  )}
                                </p>
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                                  {b.houseNo || houseNo || "Not Specified"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  {t("job_details.colony", "Colony / Street")}
                                </p>
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-2">
                                  {colony}
                                </p>
                              </div>
                              {landmark && (
                                <div className="col-span-2">
                                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                                    {t("job_details.landmark", "Landmark")}
                                  </p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-2">
                                    {landmark}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              {t("job_details.city", "City")}
                            </p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                              {city}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              {t("job_details.pincode", "Pincode")}
                            </p>
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                              {pincode}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-auto pt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-3 underline decoration-blue-500/30">
                    {t("job_details.immediate_action", "Immediate Action")}
                  </p>
                  <div className="flex gap-3">
                    <button
                      disabled={b.status === "completed" || b.status === "cancelled"}
                      onClick={(e) => {
                        e.preventDefault();
                        if (customer?.phoneNumber) {
                          window.location.href = `tel:${customer.phoneNumber}`;
                        } else {
                          toast.error(
                            "Customer phone contact is currently unavailable.",
                          );
                        }
                      }}
                      className={`flex-1 w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition uppercase text-xs shadow-lg ${
                        b.status === "completed" || b.status === "cancelled"
                          ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                          : "bg-green-500 hover:bg-green-600 text-white active:scale-95 shadow-green-500/20"
                      }`}
                    >
                      <Phone size={16} />{" "}
                      {t("job_details.contact_customer", "Contact Customer")}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Service & Provider Info */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`rounded-[2rem] p-8 border shadow-xl transition-all relative overflow-hidden group flex flex-col h-full ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-white border-slate-200 shadow-slate-200/40"
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800">
                    <Shield size={22} className="text-amber-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white">
                    {t("job_details.provider_info", "Provider Information")}
                  </h2>
                </div>
                <div className="flex flex-col flex-1 space-y-6">
                  <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/30 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                          {t("job_details.your_name", "Your Name")}
                        </p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {p?.fullName || p?.name || "Verified Professional"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                          {t("job_details.provider_id", "Provider ID")}
                        </p>
                        <p className="font-bold text-indigo-600 text-xs">
                          #
                          {(p?._id || "").toString().slice(-8).toUpperCase() ||
                            "ID-PENDING"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User size={12} className="text-slate-400" />
                        <p className="text-[10px] uppercase font-black text-slate-400">
                          {t("job_details.assignment_id", "Assignment ID")}
                        </p>
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">
                        #
                        {(b._id || b.id || "")
                          .toString()
                          .slice(-6)
                          .toUpperCase() || "PENDING"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Info size={12} className="text-slate-400" />
                        <p className="text-[10px] uppercase font-black text-slate-400">
                          {t("job_details.category", "Category")}
                        </p>
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tighter truncate">
                        {b.serviceType ||
                          t("chats.expert_service", "Expert Service")}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={12} className="text-slate-400" />
                        <p className="text-[10px] uppercase font-black text-slate-400">
                          {t("job_details.scheduled", "Scheduled")}
                        </p>
                      </div>
                      <p className="font-bold text-slate-700 dark:text-slate-200">
                        {formatDate(b.date, "full")}
                      </p>
                    </div>
                    {!isBiddingProvider && (
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock size={12} className="text-slate-400" />
                          <p className="text-[10px] uppercase font-black text-slate-400">
                            {t("job_details.time_slot", "Time Slot")}
                          </p>
                        </div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          {b.time || "Immediate"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SCHEDULING CARD */}
                  {(b.status === "accepted" ||
                    b.status === "in-progress" ||
                    b.status === "work-finished" ||
                    b.status === "completed") && (
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest flex items-center gap-1.5">
                          <Clock size={10} />{" "}
                          {t(
                            "job_details.session_scheduling",
                            "Session Scheduling",
                          )}
                        </h4>
                        {(b.status === "accepted" ||
                          b.status === "in-progress") && (
                          <button
                            onClick={() => {
                              const mins = prompt(
                                t(
                                  "job_details.estimate_prompt",
                                  "How many minutes do you estimate this job will take?",
                                ),
                                b.estimatedDuration || 60,
                              );
                              if (mins && !isNaN(mins)) {
                                handleUpdateEstimate(mins);
                              }
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            {t("job_details.edit_estimate", "Edit Estimate")}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                            {t("job_details.starting_at", "Starting At")}
                          </p>
                          <p className="text-sm font-black text-gray-800 dark:text-gray-100">
                            {b.time || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">
                            {t("job_details.est_finish", "Est. Finish")}
                          </p>
                          <p className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {getFormattedEstimateTime(b.time, Number(b.estimatedDuration || 60))}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-sm text-center border-dashed">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">
                            {t("job_details.buffer", "+20m Buffer")}
                          </p>
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-300">
                            {getFormattedEstimateTime(b.time, Number(b.estimatedDuration || 60) + 20)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">
                      {t("job_details.service_status", "Service Status")}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${b.status === "completed" ? "bg-green-500" : "bg-blue-500 animate-pulse"}`}
                      />
                      <p className="font-bold text-indigo-600 uppercase text-xs tracking-widest">
                        {b.status}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Payment Section */}
          <motion.div
            variants={itemVariants}
            className={`mt-10 rounded-[2rem] p-8 border transition-all relative overflow-hidden backdrop-blur-md ${
              isDark
                ? "bg-slate-900/80 border-slate-800 shadow-2xl"
                : "bg-white/80 border-slate-100 shadow-xl shadow-slate-200/40"
            }`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 tracking-tighter uppercase">
                  {t("job_details.payment_job_status", "Payment & Job Status")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-bold uppercase text-[10px] tracking-widest mt-4 mb-2">
                  {t("job_details.bill_breakdown", "Bill Breakdown")}
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs">
                    <span className="text-slate-400 font-bold uppercase truncate pr-2 max-w-[70%]" title={b.serviceType}>
                      {b.serviceType} (Base)
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                      {(() => {
                        const addonsTotal = (b.addOns || []).reduce(
                          (sum, a) => sum + (a.price || 0),
                          0,
                        );
                        // Use pay.totalAmount as fallback when b.price is not available (e.g. bidding)
                        const basePrice = b.price || pay.totalAmount || 0;
                        return formatCurrency(basePrice - addonsTotal);
                      })()}
                    </span>
                  </div>
                  {b.addOns &&
                    b.addOns.length > 0 &&
                    b.addOns.map((addon, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-400 font-bold uppercase">
                          {addon.name} (Add-on)
                        </span>
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {formatCurrency(addon.price || 0)}
                        </span>
                      </div>
                    ))}
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                    <span className="text-emerald-500 font-black uppercase tracking-tight">
                      {t("job_details.in_hand_earnings", "In Hand Earning (after 10% commission)")}
                    </span>
                    <span className="font-black text-emerald-500">
                      {formatCurrency(Math.round((b.price || 0) * 0.90))}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 ${
                  isPaymentReceived || pay.remainingAmount === 0
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isPaymentReceived || pay.remainingAmount === 0 ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`}
                />
                {isPaymentReceived || pay.remainingAmount === 0
                  ? t("job_details.fully_settled", "Fully Settled")
                  : t("job_details.awaiting_settlement", "Awaiting Settlement")}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 relative z-10 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 leading-tight">
                  {t("job_details.total_value", "Total Value")}
                  <span className="block text-[8px] font-medium text-slate-400 dark:text-slate-500 normal-case mt-0.5">
                    (Base + Platform Charge + GST)
                  </span>
                </p>
                <p className="text-xl font-black text-slate-800 dark:text-white">
                  {formatCurrency(pay.totalAmount)}
                </p>
              </div>
               <div>
                <p className="text-[10px] uppercase font-bold text-emerald-500 mb-1 underline decoration-emerald-200 ring-emerald-500 leading-tight">
                  {t("job_details.amount_paid", "Amount Paid")}
                  <span className="block text-[8px] font-medium text-emerald-500/80 dark:text-emerald-400/80 normal-case mt-0.5">
                    {isPaymentReceived || pay.remainingAmount === 0
                      ? t("job_details.full_payment_done", "(Full Payment Done)")
                      : t("job_details.token_payment_breakdown", "(30% Service + Platform Charge + GST)")}
                  </span>
                </p>
                <p className="text-xl font-black text-emerald-500">
                  {formatCurrency(pay.paidAmount !== undefined ? pay.paidAmount : (pay.tokenPaid || 0))}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">
                  {t("job_details.remaining_amount", "Remaining Amount")}
                </p>
                <p className="text-xl font-black text-blue-600">
                  {formatCurrency(pay.remainingAmount || 0)}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-8 md:gap-10">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] text-slate-400 font-bold uppercase">
                    {t("job_details.settlement_percentage", "Settlement %")}
                  </p>
                  <p className="text-[11px] text-blue-600 font-black uppercase tracking-widest">
                    {pay.settlementProgress}%
                  </p>
                </div>
                <div
                  className={`relative h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-slate-800/50" : "bg-slate-100"}`}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pay.settlementProgress}%` }}
                    className="h-full bg-blue-600"
                  />
                </div>
              </div>

              {/* ACTION SLIDER */}
              {b.status === "cancelled" ? (
                <div
                  className={`flex items-center justify-center w-full md:w-64 h-16 rounded-full border shadow-inner ${
                    isDark ? "bg-red-900/20 border-red-800/30 text-red-400" : "bg-red-50 border-red-200 text-red-500"
                  }`}
                >
                  <span className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                    {t("job_details.cancelled", "CANCELLED")}
                  </span>
                </div>
              ) : (
                <div
                  className={`relative flex items-center w-full md:w-64 h-16 rounded-full p-1.5 flex-shrink-0 overflow-hidden mx-auto md:mx-0 ${
                    isDark
                      ? "bg-slate-800 border-slate-700 shadow-inner"
                      : "bg-slate-100 border-slate-200 shadow-inner shadow-black/5"
                  }`}
                >
                  <motion.div
                    animate={{
                      width:
                        isPaymentReceived ||
                        b.status === "completed" ||
                        b.status === "paid"
                          ? "100%"
                          : sliderPosition > 0
                            ? sliderPosition + 56
                            : 0,
                    }}
                    className={`absolute left-0 top-0 bottom-0 rounded-full ${
                      isPaymentReceived ||
                      b.status === "completed" ||
                      b.status === "paid"
                        ? "bg-emerald-600"
                        : "bg-indigo-600"
                    }`}
                  />
                  <span
                    className={`absolute w-full text-center text-[10px] font-black uppercase tracking-[0.2em] pointer-events-none transition-colors ${
                      isPaymentReceived ||
                      b.status === "completed" ||
                      b.status === "paid"
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {b.status === "accepted" || b.status === "paid"
                      ? isBiddingProvider
                        ? t("job_details.verify_start", "Verify Start")
                        : t("job_details.verify_arrival", "Verify Arrival")
                      : b.status === "pending"
                        ? t("job_details.awaiting_token_payment", "Awaiting customer payment")
                        : b.status === "in-progress"
                          ? t("job_details.finish_work", "Finish Work")
                          : b.status === "work-finished"
                            ? t(
                                "job_details.verify_completion",
                                "Verify Completion",
                              )
                            : b.status === "settling"
                              ? t(
                                  "job_details.slide_payment_done",
                                  "Slide for Payment Done",
                                )
                              : t("job_details.job_finished", "Job Finished")}
                  </span>
                  {b.status === "completed" ? (
                    <button
                      onClick={() => navigate("/profile/jobs")}
                      className="z-10 w-full h-full rounded-full flex items-center justify-center bg-emerald-500 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors active:scale-95"
                    >
                      <CheckCircle size={16} />{" "}
                      {t("job_details.payment_success", "PAYMENT SUCCESS")}
                    </button>
                  ) : (
                    <motion.div
                      drag={b.status !== "pending" ? "x" : false}
                      key={sliderKey}
                      dragConstraints={{ left: 0, right: 192 }}
                      dragElastic={0}
                      onDrag={(e, info) => b.status !== "pending" && setSliderPosition(info.point.x)}
                      onDragEnd={(e, info) => {
                        if (b.status === "pending") return;
                        if (info.offset.x > 150) {
                          if (b.status === "accepted" || b.status === "paid") {
                            setShowOtpModal(true);
                          } else if (b.status === "in-progress") {
                            handleFinishWork();
                          } else if (b.status === "work-finished") {
                            setShowOtpModal(true);
                          } else if (b.status === "settling") {
                            handleFinalSettlement();
                          }
                        } else {
                          resetSlider();
                        }
                      }}
                      style={{ x: sliderPosition }}
                      className={`z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-xl border flex items-center justify-center transition-transform ${b.status === "pending" ? "border-gray-300 dark:border-gray-700 cursor-not-allowed opacity-50" : "border-indigo-500 cursor-pointer active:scale-90"}`}
                    >
                      <ChevronRight className={b.status === "pending" ? "text-gray-300 dark:text-gray-600" : "text-indigo-600"} />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* CHAT SECTION */}
          <motion.div variants={itemVariants} className="mt-10">
            <BookingChat
              bookingId={id}
              providerId={p?._id || p?.id}
              customerId={customer?._id || customer?.id}
              customerName={customer?.fullName || "Customer"}
              isDark={isDark}
              shouldScrollOnMount={scrollToChat}
            />
          </motion.div>
        </motion.div>
      </div>

      <AssignmentVerifyModal
        show={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          resetSlider();
        }}
        onVerify={handleVerifyOtp}
        darkMode={isDark}
        title={
          b.status === "accepted" || b.status === "paid"
            ? t("job_details.verify_arrival", "Verify Arrival")
            : t("job_details.complete_service", "Complete Service")
        }
        subtitle={
          b.status === "accepted" || b.status === "paid"
            ? t(
                "job_details.verify_arrival_subtitle",
                "Enter customer's 6-digit OTP to officially start the service",
              )
            : t(
                "job_details.complete_service_subtitle",
                "Enter the final completion OTP provided by the customer",
              )
        }
      />

      {showBidDetailsModal && fullBidData && (
        <BidDetailsModal
          bid={fullBidData}
          onClose={() => {
            setShowBidDetailsModal(false);
            setFullBidData(null);
          }}
        />
      )}
    </div>
  );
}
