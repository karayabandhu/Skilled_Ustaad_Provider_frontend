import axios from "axios";
import axiosRetry from "axios-retry";
import { apiCache } from "../utils/cache";

/* ================================
   BASE URL SETUP
================================ */

const RAW_API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

export const API_BASE = (() => {
  if (!RAW_API_BASE) return "http://localhost:5000/api/v1";

  if (/^https?:\/\//i.test(RAW_API_BASE)) {
    const base = RAW_API_BASE.replace(/\/$/, "");
    return base.endsWith("/v1") ? base : `${base}/v1`;
  }

  if (RAW_API_BASE.startsWith("/")) {
    const base = window.location.origin + RAW_API_BASE.replace(/\/$/, "");
    return base.endsWith("/v1") ? base : `${base}/v1`;
  }

  if (RAW_API_BASE.startsWith(":")) {
    const base = window.location.protocol + "//" + window.location.hostname + RAW_API_BASE.replace(/\/$/, "");
    return base.endsWith("/v1") ? base : `${base}/v1`;
  }

  return RAW_API_BASE.endsWith("/v1") ? RAW_API_BASE : `${RAW_API_BASE}/v1`;
})();

export const BACKEND_ROOT = (() => {
  try {
    const url = new URL(API_BASE);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    return API_BASE.split("/api")[0];
  }
})();

/* ================================
   AXIOS INSTANCE
================================ */

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000, // 15s timeout for production stability
});

// Robust Auth State Management
let isRefreshing = false;
let failedQueue = [];
let isSessionTerminating = false;

// Configure automatic retries for idempotent requests and network errors
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           (error.response && error.response.status >= 500);
  },
});

/* ================================
   AUTH INTERCEPTOR
================================ */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ================================
   RESPONSE INTERCEPTOR (REFRESH TOKEN- 7 DAYS PERSISTENCE)
 ================================ */

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    isSessionTerminating = false;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh token logic if it's the refresh token call itself or if not 401
    if (error.response?.status !== 401 || originalRequest._retry || originalRequest.url.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_BASE}/provider/refresh-token`, {}, { withCredentials: true });
      const { accessToken } = data;

      localStorage.setItem("accessToken", accessToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      processQueue(null, accessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Terminal 401: Refresh failed. Clean up and signal logout.
      if (isSessionTerminating) return Promise.reject(refreshError);
      isSessionTerminating = true;
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("providerData");
      
      window.dispatchEvent(new Event("unauthorized_access"));
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

/* ================================
   AUTH APIs
================================ */

export const registerProvider = (data) =>
  api.post("/provider/register", data);

export const verifyOTP = (data) =>
  api.post("/provider/verify-otp", data);

export const loginProvider = (data) =>
  api.post("/provider/login", data);

export const logoutProvider = () =>
  api.post("/provider/logout");

export const forgotPasswordProvider = (data) =>
  api.post("/provider/forgot-password", data);

export const resetPasswordProvider = (data) =>
  api.post("/provider/reset-password", data);

/* ================================
   PROFILE APIs
================================ */

export const getProviderProfile = () =>
  api.get("/provider/profile");

export const updateProviderProfile = (data) =>
  api.post("/provider/update-provider-profile", data);

/* ================================
   SERVICE APIs
================================ */

export const saveServiceDetails = (data) =>
  api.post("/provider/service-details", data);

export const updateServiceDetails = (data) =>
  api.put("/provider/service-details-update", data);

export const getServiceHierarchy = () =>
  api.get("/services/hierarchy");

/* ================================
   DOCUMENT UPLOAD
================================ */
export const uploadDocuments = async (data) => {
  // If data is already FormData, send it directly
  if (data instanceof FormData) {
    return api.post("/provider/documents", data);
  }

  // Otherwise, if it's an object of files, wrap it
  const formData = new FormData();
  if (data?.profilePhoto) formData.append("profilePhoto", data.profilePhoto);
  if (data?.governmentIDProof) formData.append("governmentIDProof", data.governmentIDProof);
  if (data?.addressProof) formData.append("addressProof", data.addressProof);
  if (data?.skillCertificate) formData.append("skillCertificate", data.skillCertificate);

  return api.post("/provider/documents", formData);
};


/* ================================
   BANK APIs
================================ */

export const saveBankDetails = (data) =>
  api.post("/provider/bank-details", data);

export const updateBankDetails = (data) =>
  api.put("/provider/bank-details-update", data);

/* ================================
   DASHBOARD APIs
================================ */

export const getProviderDashboard = () =>
  cachedGet("/provider/dashboard", 30 * 1000); // 30s quick cache

export const toggleProviderAvailability = (data) =>
  api.patch("/provider/availability", data);

/* ================================
   JOB APIs (IMPORTANT 🔥)
================================ */

// GET ALL JOBS
export const getProviderJobs = () =>
  api.get("/provider/jobs");

// UPDATE JOB STATUS
export const updateProviderJobStatus = (id, status) =>
  api.patch(`/provider/jobs/${id}/status`, { status });

/* ================================
   BOOKING APIs
================================ */

export const getBookingById = (id) =>
  api.get(`/booking/${id}`);

export const getBookingDetails = (id) =>
  api.get(`/booking/${id}/details`);

export const handleBookingAction = (bookingId, action) =>
  api.post("/provider/booking/action", {
    bookingId,
    action
  });

export const getNotifications = () =>
  api.get("/provider/notifications");

export const getUnreadNotificationCount = () =>
  api.get("/provider/notifications/unread-count");


export const markNotificationRead = (id) =>
  api.patch(`/provider/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  api.patch(`/provider/notifications/read-all`);

export const deleteAllNotifications = () =>
  api.delete(`/provider/notifications`);

export const getNotificationPreferences = () =>
  api.get("/provider/notifications/preferences");

export const updateNotificationPreferences = (data) =>
  api.patch("/provider/notifications/preferences", data);

export const updateNotificationSound = (data) =>
  api.post("/provider/notification-sound", data);

/* ================================
   EARNINGS / PAYMENTS
================================ */

export const getEarningsDashboard = () => 
  api.get("/provider/earnings/dashboard");

export const getTransactionHistory = () => 
  api.get("/provider/earnings/transactions");

export const getEarningsPaymentMethods = () => 
  api.get("/provider/earnings/payment-methods");

export const addEarningsPaymentMethod = (data) => 
  api.post("/provider/earnings/payment-methods", data);

export const deleteEarningsPaymentMethod = (id) => 
  api.delete(`/provider/earnings/payment-methods/${id}`);

export const withdrawEarningsFunds = (data) => 
  api.post("/provider/earnings/withdraw", data);

export const getProviderTransactionsDirect = () =>
  api.get("/provider/earnings/transaction");

/**
 * Helper for cached GET requests
 */
const cachedGet = async (url, ttl) => {
  const cached = apiCache.get(url);
  if (cached) return { data: cached, fromCache: true };

  const response = await api.get(url);
  apiCache.set(url, response.data, ttl);
  return response;
};

export const getPopularProviders = async () => {
  return await api.get("/services/popular-providers");
};

export const getHighDemandServices = async () => {
  return await api.get("/services/high-demand");
};

/* ================================
   BIDDING APIs (MARKETPLACE)
================================ */

export const getOpenBiddingRequests = (category, city, subService) =>
  api.get("/bids/open-requests", { params: { category, city, subService } });

export const placeBid = (data) =>
  api.post("/bids/place-bid", data);

export const getProviderBids = () =>
  api.get("/bids/my-bids");

export const getBiddingRequestById = (requestId) =>
  api.get(`/bids/request/${requestId}`);

export const getGlobalStats = () =>
  api.get("/services/stats");

/* ================================
   SUBSCRIPTION APIs & RAZORPAY
================================ */

export const getSubscriptionStatus = () =>
  api.get("/provider/subscription/status");

export const createSubscriptionOrder = (planId) =>
  api.post("/provider/subscription/create-order", { planId });

export const verifySubscriptionPayment = (paymentData) =>
  api.post("/provider/subscription/verify-payment", paymentData);

export const getActiveSubscriptionPlans = () =>
  api.get("/subscription-plans/active");