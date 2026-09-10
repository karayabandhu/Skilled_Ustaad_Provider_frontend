import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";
import { api } from "./api";

export async function requestNotificationPermission() {
    try {
        // console.log("=== NOTIFICATION PERMISSION REQUEST START ===");

        // Check if notifications are supported
        if (!("Notification" in window)) {
            console.warn("This browser does not support notifications");
            return;
        }
        // console.log("Notifications supported in this browser");

        // Check if already granted
        if (Notification.permission === "granted") {
            // console.log("✅ Notification permission already granted");
            await saveDeviceToken();
            return;
        }

        // Check if denied
        if (Notification.permission === "denied") {
            console.warn("Notification permission denied by user");
            console.warn("User needs to reset notification permission in browser settings");
            return;
        }

        // console.log("Requesting notification permission from user...");

        // Request permission
        const permission = await Notification.requestPermission();
        // console.log("Permission result:", permission);

        if (permission === "granted") {
            // console.log("Notification permission granted by user");
            await saveDeviceToken();
            // setupTokenTracking();
        } else {
            console.warn("Notification permission denied");
        }

        // console.log("=== NOTIFICATION PERMISSION REQUEST END ===");
    } catch (error) {
        console.error("Error requesting notification permission:", error);
        console.error("Error details:", error.message, error.code);
    }
}

async function saveDeviceToken() {
    try {
        // console.log("=== SAVING DEVICE TOKEN START ===");
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
            console.warn("FCM VAPID Key is missing. Notifications will not be available.");
            return;
        }

        // console.log("VAPID Key (first 20 chars):", vapidKey.substring(0, 20) + "...");

        // Wait for service worker to be ready (registered in App.jsx)
        const registration = await navigator.serviceWorker.ready;
        // console.log("Service Worker ready for FCM:", registration);

        if (!messaging) {
            console.warn("Firebase Messaging is NOT initialized. Cannot generate token.");
            return;
        }

        const token = await getToken(messaging, {
            serviceWorkerRegistration: registration,
            vapidKey: vapidKey
        });

        if (!token) {
            console.error("Failed to get FCM token - token is null/undefined");
            console.error("This usually means:");
            console.error("1. Notification permission not granted");
            console.error("2. VAPID key mismatch");
            console.error("3. Firebase project misconfiguration");
            return;
        }

        // console.log("FCM Token obtained");
        // console.log(`Full token: ${token}`);
        // console.log(`Length: ${token.length}`);
        // console.log(`First 30 chars: ${token.substring(0, 30)}...`);

        // Store token locally for debugging
        localStorage.setItem("fcmToken", token);
        // console.log("Token saved to localStorage");

        // console.log("Sending token to backend...");
        const response = await api.post("/provider/save-token", {
            deviceToken: token
        });

        // console.log(`Backend response: ${response.status} ${response.statusText}`);

        if (response.status !== 200 && response.status !== 201) {
            console.error(`HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // console.log("Device token saved to backend successfully");
        // console.log("=== SAVING DEVICE TOKEN END ===");
    } catch (error) {
        console.error("Error saving device token:", error);
        console.error("   Message:", error.message);
        console.error("   Stack:", error.stack);
    }
}

/**
 * Display a native system notification (top bar/lock screen)
 * @param {string} title - Notification title
 * @param {Object} options - Notification options (body, icon, etc.)
 */
export async function showSystemNotification(title, options = {}) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const defaultOptions = {
            icon: "/logo-main.png",
            badge: "/logo-main.png",
            vibrate: [200, 100, 200],
            requireInteraction: true,
            ...options
        };

        if (registration && registration.showNotification) {
            // Prefer showing via service worker for better system integration
            registration.showNotification(title, defaultOptions);
        } else {
            // Fallback to simple Notification API
            new Notification(title, defaultOptions);
        }
    } else if (Notification.permission !== "denied") {
        // Request permission if not yet denied or granted
        await requestNotificationPermission();
        if (Notification.permission === "granted") {
            showSystemNotification(title, options);
        }
    }
}