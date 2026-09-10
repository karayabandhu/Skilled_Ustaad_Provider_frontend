import React, { useState, useEffect, useRef } from "react";
import { soundManager } from "./utils/soundUtils";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Loader2 } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ProviderChatbot from "./components/common/ProviderChatbot";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./components/ThemeProvider";
import { SocketProvider } from "./context/SocketContext";
import {
  requestNotificationPermission,
  showSystemNotification,
} from "./services/notification.service";
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase/firebase";
import { logger } from "./utils/logger";
import { initializeSecurity } from "./utils/security";
import { onLCP, onINP, onCLS } from "web-vitals";
import { Toaster, toast } from "sonner";
import { useSocket } from "./context/SocketContext";
import {
  getPopularProviders,
  getHighDemandServices,
  getProviderProfile,
} from "./services/api";
import { useNotificationBadge } from "./hooks/useNotificationBadge";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { Analytics } from "@vercel/analytics/react";

// Lazy-loaded components for scalability
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Logout = React.lazy(() => import("./pages/Logout"));
const Register = React.lazy(() => import("./pages/Register"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ProviderDashboard = React.lazy(() => import("./pages/ProviderDashboard"));
const ProfileJobs = React.lazy(() => import("./pages/ProfileBookingList"));
const ProfileEarnings = React.lazy(() => import("./pages/ProfileEarnings"));
const ProfileNotifications = React.lazy(
  () => import("./pages/ProfileNotifications"),
);
const ProfileDetailsPage = React.lazy(
  () => import("./pages/ProfileDetailsPage"),
);
const ProviderDetailsPage = React.lazy(
  () => import("./pages/ProviderDetailsPage"),
);
const ProfileChats = React.lazy(() => import("./pages/ProfileChats"));
const MyBids = React.lazy(() => import("./pages/MyBids"));
const Marketplace = React.lazy(() => import("./pages/Marketplace"));
const ProviderBidForm = React.lazy(() => import("./pages/ProviderBidForm"));
const About = React.lazy(() => import("./pages/About"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const HelpCenter = React.lazy(() => import("./pages/HelpCenter"));
const ContactSupport = React.lazy(() => import("./pages/ContactSupport"));

// Premium Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    <p className="text-gray-500 animate-pulse font-medium">
      Loading premium experience...
    </p>
  </div>
);

// Helper Components (Hoist to top)
function GlobalSocketListener() {
  const { isConnected, on } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, refreshCount } = useNotificationBadge(true); // Always true since this is inside Router/SocketProvider for providers

  useEffect(() => {
    if (!isConnected) return;

    const handleBookingRequest = (data) => {
      // console.log("Global Socket: booking_request received", data);
      const providerData = JSON.parse(
        localStorage.getItem("providerData") || "{}",
      );
      if (providerData?.status !== "Active") return; // Ignore if not verified by admin

      refreshCount(); // Update badge count immediately

      soundManager.playNotification();

      const isDashboard =
        location.pathname === "/profile" || location.pathname === "/profile/";
      if (!isDashboard) {
        toast.info("New Booking Request!", {
          description: `${data.serviceName || "New Job"} - Click to view dashboard`,
          action: {
            label: "View",
            onClick: () => navigate("/profile"),
          },
          duration: 10000,
          position: "top-center",
        });
      }
    };

    const handleGenericNotification = (data) => {
      // console.log("Global Socket: new_notification received", data);
      refreshCount();
      toast(data?.title || "Skilled Ustaad Alert", {
        description: data?.message || "You have a new update",
        action: {
          label: "View",
          onClick: () => navigate("/profile/notifications"),
        },
      });
    };

    const handlePaymentReceived = (data) => {
      refreshCount();
      toast.success("Payment Received! 💰", {
        description: `You received a payment for booking #${data?.bookingId || ""}`,
        duration: 8000,
      });
    };

    const handleBookingCancelled = (data) => {
      refreshCount();
      soundManager.playNotification();
      toast.error("Booking Cancelled", {
        description: `Booking #${data?.bookingId || data?._id?.slice(-6).toUpperCase() || ""} was cancelled.`,
        duration: 10000,
      });
    };

    const cleanups = [
      on("booking_request", handleBookingRequest),
      on("booking_cancelled", handleBookingCancelled),
      on("new_notification", handleGenericNotification),
      on("notification_count_update", () => refreshCount()),
      on("notification", () => refreshCount()),
      on("message_notification", () => refreshCount()),
      on("payment_received", handlePaymentReceived),
    ];

    return () => {
      cleanups.forEach(
        (cleanup) => cleanup && typeof cleanup === "function" && cleanup(),
      );
    };
  }, [on, isConnected, navigate, location.pathname, refreshCount]);

  return null;
}

function ChatbotWithLocation() {
  const { pathname } = useLocation();
  const hideOn = ["/login", "/register", "/logout"];
  if (hideOn.includes(pathname)) return null;
  return <ProviderChatbot />;
}

function FooterWithLocation() {
  const { pathname } = useLocation();
  const hideOn = ["/login", "/register", "/logout"];
  if (hideOn.includes(pathname) || pathname.startsWith("/profile")) return null;
  return <Footer />;
}

function App() {
  const [topProviders, setTopProviders] = useState([
    {
      name: "Himanshu",
      rating: 4.75,
      category: "Professional Electrician",
      img: "profilePhoto-1774347272415.jpeg",
    },
  ]);

  const [highDemandServices, setHighDemandServices] = useState([
    {
      img: "image-1774337198628.png",
      title: "Professional TV Installation",
      color: "indigo",
    },
    {
      img: "image-1774342573243.png",
      title: "Expert Fan Repair Services",
      color: "blue",
    },
  ]);

  const getVerifiedStatus = () => {
    try {
      const data = localStorage.getItem("providerData");
      if (!data) return false;
      const parsed = JSON.parse(data);
      const obj = parsed.provider || parsed;
      return obj?.status === "Active";
    } catch {
      return false;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("providerData"),
  );
  const [isVerified, setIsVerified] = useState(getVerifiedStatus);

  // Keep isVerified in sync whenever providerData changes in localStorage
  useEffect(() => {
    const syncVerified = () => setIsVerified(getVerifiedStatus());
    window.addEventListener("storage", syncVerified);
    return () => window.removeEventListener("storage", syncVerified);
  }, []);

  // Register service worker and request notification permission
  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const res = await getPopularProviders();
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setTopProviders(res.data.data);
        }
      } catch (err) {
        console.warn(
          "Failed to fetch popular providers, using fallbacks:",
          err,
        );
      }
    };

    const fetchHighDemand = async () => {
      try {
        const res = await getHighDemandServices();
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setHighDemandServices(res.data.data);
        }
      } catch (err) {
        console.warn(
          "Failed to fetch high-demand services, using fallbacks:",
          err,
        );
      }
    };

    fetchTopProviders();
    fetchHighDemand();

    // Sync notification preference
    if (isAuthenticated) {
      getProviderProfile()
        .then((res) => {
          const provider = res.provider || res;
          if (provider.notificationSound) {
            localStorage.setItem(
              "providerNotificationSound",
              provider.notificationSound,
            );
          }
        })
        .catch((err) => console.warn("Profile sync suspended:", err.message));
    }
  }, [isAuthenticated]);

  // Monitor connectivity globally
  const isOnline = useNetworkStatus();

  useEffect(() => {
    // A. Initialize Security & Monitoring
    initializeSecurity();
    try {
      onLCP((m) => logger.trackMetric("LCP", m.value, m.rating));
      onINP((m) => logger.trackMetric("INP", m.value, m.rating));
      onCLS((m) => logger.trackMetric("CLS", m.value, m.rating));
    } catch (e) {
      console.warn("Web Vitals init failed", e);
    }

    // B. Global Error Handling
    const handleGlobalError = (event) => {
      logger.error("Uncaught Runtime Error", {
        message: event.message,
        source: event.filename,
        line: event.lineno,
      });
    };
    window.addEventListener("error", handleGlobalError);

    const initializeNotifications = async () => {
      try {
        if (isAuthenticated) {
          await requestNotificationPermission();
          // console.log("Notification permission process initiated");
        }
      } catch (error) {
        console.error("Notification setup error:", error);
      }
    };

    initializeNotifications();

    // Re-fetch count to sync when user switches back to this tab/app
    const handleFocus = () => {
      window.dispatchEvent(new Event("refresh_unread_count"));
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated]);

  const isRedirectingRef = useRef(false);
  useEffect(() => {
    const handleUnauthorized = () => {
      if (isRedirectingRef.current) return;
      isRedirectingRef.current = true;

      console.warn(
        "Session expired: Terminating secure node and redirecting to login.",
      );

      localStorage.removeItem("accessToken");
      localStorage.removeItem("providerData");
      setIsAuthenticated(false);

      // Kill any active interval refreshes
      window.dispatchEvent(new Event("kill_refresh_timers"));

      if (window.location.pathname !== "/login") {
        window.location.href = "/login?session=expired";
      }
    };
    window.addEventListener("unauthorized_access", handleUnauthorized);

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("providerData"));
    };
    window.addEventListener("storage", handleStorageChange);

    let unsubscribeFCM;
    if (isAuthenticated && messaging) {
      try {
        unsubscribeFCM = onMessage(messaging, (payload) => {
          // console.log("Foreground notification received in App.jsx:", payload);

          // Toast feedback for foreground FCM
          toast(payload.notification?.title || "Update Received", {
            description:
              payload.notification?.body ||
              "Check your notifications for details",
          });

          // Update badge count via event trigger
          window.dispatchEvent(new Event("refresh_unread_count"));
          soundManager.playNotification();
        });
      } catch (err) {
        console.warn("FCM onMessage listener registration failed:", err);
      }
    }

    const primeAudio = () => {
      soundManager.prime();
      window.removeEventListener("click", primeAudio);
      window.removeEventListener("touchstart", primeAudio);
    };
    window.addEventListener("click", primeAudio);
    window.addEventListener("touchstart", primeAudio);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (unsubscribeFCM) unsubscribeFCM();
      window.removeEventListener("click", primeAudio);
      window.removeEventListener("touchstart", primeAudio);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("providerData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("providerId");
    localStorage.removeItem("providerPhone");
    setIsAuthenticated(false);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider defaultTheme="system" enableSystem attribute="class">
      <HelmetProvider>
        <Toaster position="top-center" richColors />
        <Analytics />
        <SocketProvider isAuthenticated={isAuthenticated}>
          <ErrorBoundary>
            <Router>
              <ScrollToTop />
              <ChatbotWithLocation />
              <Navbar
                isAuthenticated={isAuthenticated}
                isVerified={isVerified}
                handleLogout={handleLogout}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              />
              <GlobalSocketListener />
              <main className="flex-grow pt-16 flex flex-col">
                <React.Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Home
                          topProviders={topProviders}
                          highDemandServices={highDemandServices}
                          isAuthenticated={isAuthenticated}
                          setIsAuthenticated={setIsAuthenticated}
                          handleLogout={handleLogout}
                        />
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <Login setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <Register setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                    <Route path="/logout" element={<Logout />} />
                    <Route
                      path="/profile/*"
                      element={
                        !isAuthenticated ? (
                          <Navigate to="/" replace />
                        ) : !isVerified ? (
                          <Navigate to="/" replace />
                        ) : (
                          <ProfilePage
                            isSidebarOpen={isSidebarOpen}
                            setIsSidebarOpen={setIsSidebarOpen}
                          />
                        )
                      }
                    >
                      <Route index element={<ProviderDashboard />} />
                      <Route path="jobs" element={<ProfileJobs />} />
                      <Route path="earnings" element={<ProfileEarnings />} />
                      <Route
                        path="notifications"
                        element={<ProfileNotifications />}
                      />
                      <Route
                        path="profiledetails"
                        element={<ProfileDetailsPage />}
                      />
                      <Route path="chats" element={<ProfileChats />} />
                      <Route path="my-bids" element={<MyBids />} />
                      <Route path="marketplace" element={<Marketplace />} />
                      <Route
                        path="bid/:requestId"
                        element={<ProviderBidForm />}
                      />
                      <Route path="job/:id" element={<ProviderDetailsPage />} />
                    </Route>
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/support" element={<HelpCenter />} />
                    <Route path="/contact" element={<ContactSupport />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </React.Suspense>
              </main>
              <FooterWithLocation />
            </Router>
          </ErrorBoundary>
        </SocketProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
