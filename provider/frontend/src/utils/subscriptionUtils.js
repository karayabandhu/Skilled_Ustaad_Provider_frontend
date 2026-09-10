/**
 * Subscription Plans & Razorpay Utility Helpers
 */

export const SUBSCRIPTION_PLANS = [
  {
    id: "monthly",
    name: "Monthly Pass",
    durationDays: 30,
    price: 99,
    originalPrice: 199,
    savings: "Save 50%",
    popular: false,
    badge: "1 Month Access",
    badgeColor: "blue",
    features: [
      "Receive customer booking requests",
      "View customer contact details",
      "Direct call & chat access",
      "Standard customer supportGet instant booking notifications",
      "Basic profile visibility",
      "Standard support",
    ],
  },
  {
    id: "yearly_1",
    name: "Annual Super Pass",
    durationDays: 365,
    price: 499,
    originalPrice: 1188,
    savings: "Save 58%",
    popular: true,
    badge: "Most Popular (1 Year)",
    badgeColor: "emerald",
    features: [
      "Everything in Monthly Pass",
      "Higher booking request access",
      "Priority request notifications",
      "Enhanced profile visibility",
      "Customer request history",
      "Performance insights",
      "Faster support assistance",
    ],
  },
  {
    id: "yearly_2",
    name: "2-Year Mega Ustaad Pass",
    durationDays: 730,
    price: 999,
    originalPrice: 2376,
    savings: "Best Value (Save 60%)",
    popular: false,
    badge: "Best Value (2 Years)",
    badgeColor: "purple",
    features: [
      "Everything in Annual Super Pass",
      "Valid for 2 Full Years (730 Days)",
      "Better profile placement opportunities",
      "Advanced performance insights",
      "Customer request tracking",
      "Profile verification badge",
      "Priority account assistance",
    ],
  },
];

/**
 * Dynamically loads the Razorpay JS Checkout SDK if not already present
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Checks if the provider currently has a valid, active, non-expired subscription.
 */
export const isSubscriptionActive = (providerData) => {
  let data = providerData;
  if (!data) {
    try {
      const raw = localStorage.getItem("providerData");
      if (!raw) return false;
      data = JSON.parse(raw);
    } catch (e) {
      return false;
    }
  }

  const provider = data.provider || data;

  // Must be verified by admin first
  if (provider.status !== "Active") {
    return false;
  }

  const sub = provider.subscription;
  if (!sub || !sub.expiryDate) {
    return false;
  }

  const isStatusActive = sub.status === "active";
  const isNotExpired = new Date(sub.expiryDate).getTime() > Date.now();

  return isStatusActive && isNotExpired;
};

/**
 * Get remaining days for current subscription
 */
export const getSubscriptionRemainingDays = (providerData) => {
  let data = providerData;
  if (!data) {
    try {
      const raw = localStorage.getItem("providerData");
      if (!raw) return 0;
      data = JSON.parse(raw);
    } catch {
      return 0;
    }
  }

  const provider = data.provider || data;
  const sub = provider?.subscription;
  if (!sub || !sub.expiryDate || sub.status !== "active") return 0;

  const expiry = new Date(sub.expiryDate).getTime();
  const diffMs = expiry - Date.now();
  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
